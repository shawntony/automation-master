import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

interface WebVitalMetric {
  id: string
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType: string
}

// In-memory storage for development (use database in production)
const vitals: (WebVitalMetric & { timestamp: number })[] = []
const MAX_VITALS = 1000

/**
 * Web Vitals Analytics Endpoint
 * POST /api/analytics/vitals
 */
export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json()

    // Validate metric
    if (!metric.name || !metric.value) {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // Store metric with timestamp
    vitals.push({
      ...metric,
      timestamp: Date.now()
    })

    // Keep only last N metrics
    if (vitals.length > MAX_VITALS) {
      vitals.shift()
    }

    // Log poor metrics
    if (metric.rating === 'poor') {
      logger.warn('web-vitals', `Poor ${metric.name}: ${metric.value}`, {
        rating: metric.rating,
        navigationType: metric.navigationType
      })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: any) {
    logger.error('analytics', 'Failed to record web vital', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Get Web Vitals Statistics
 * GET /api/analytics/vitals
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metricName = searchParams.get('metric')
    const since = searchParams.get('since')

    let filtered = vitals

    // Filter by metric name
    if (metricName) {
      filtered = filtered.filter(v => v.name === metricName)
    }

    // Filter by time
    if (since) {
      const sinceTime = parseInt(since)
      filtered = filtered.filter(v => v.timestamp >= sinceTime)
    }

    // Calculate statistics by metric name
    const stats: Record<string, any> = {}

    const metricNames = ['CLS', 'FCP', 'FID', 'LCP', 'TTFB', 'INP']

    metricNames.forEach(name => {
      const metricData = filtered.filter(v => v.name === name)

      if (metricData.length === 0) {
        stats[name] = null
        return
      }

      const values = metricData.map(v => v.value).sort((a, b) => a - b)
      const ratings = metricData.reduce((acc, v) => {
        acc[v.rating] = (acc[v.rating] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      stats[name] = {
        count: metricData.length,
        avg: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length),
        min: values[0],
        max: values[values.length - 1],
        p50: values[Math.floor(values.length * 0.5)],
        p75: values[Math.floor(values.length * 0.75)],
        p95: values[Math.floor(values.length * 0.95)],
        ratings,
        latest: metricData[metricData.length - 1]
      }
    })

    return NextResponse.json({
      stats,
      totalMetrics: filtered.length,
      timeRange: {
        oldest: vitals.length > 0 ? vitals[0].timestamp : null,
        newest: vitals.length > 0 ? vitals[vitals.length - 1].timestamp : null
      }
    })
  } catch (error: any) {
    logger.error('analytics', 'Failed to get web vitals stats', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Clear Web Vitals data
 * DELETE /api/analytics/vitals
 */
export async function DELETE(request: NextRequest) {
  try {
    const count = vitals.length
    vitals.length = 0

    return NextResponse.json({
      success: true,
      cleared: count
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
