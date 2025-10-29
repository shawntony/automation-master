import { NextRequest, NextResponse } from 'next/server'
import { perfMonitor } from '@/lib/performance'
import { cache } from '@/lib/cache'

/**
 * Performance Metrics API
 * GET /api/performance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')

    if (operation) {
      // Get stats for specific operation
      const stats = perfMonitor.getStats(operation)
      return NextResponse.json({ operation, stats })
    }

    // Get all operation stats
    const allStats = perfMonitor.getAllStats()
    const cacheStats = cache.getStats()

    return NextResponse.json({
      performance: allStats,
      cache: cacheStats,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Clear performance metrics or cache
 * DELETE /api/performance?type=metrics|cache|all
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'metrics'

    if (type === 'metrics' || type === 'all') {
      perfMonitor.clear()
    }

    if (type === 'cache' || type === 'all') {
      cache.clear()
    }

    return NextResponse.json({
      success: true,
      cleared: type,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
