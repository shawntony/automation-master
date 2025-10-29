import { NextRequest, NextResponse } from 'next/server'
import { errorTracker } from '@/lib/error-tracking'

/**
 * Error Analytics Endpoint
 * GET /api/analytics/errors
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const context = searchParams.get('context')
    const severity = searchParams.get('severity') as any
    const since = searchParams.get('since')

    const filter: any = {}

    if (context) filter.context = context
    if (severity) filter.severity = severity
    if (since) filter.since = parseInt(since)

    const errors = errorTracker.getErrors(filter)
    const stats = errorTracker.getStats()

    return NextResponse.json({
      errors,
      stats,
      filters: filter
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Clear error tracking data
 * DELETE /api/analytics/errors
 */
export async function DELETE(request: NextRequest) {
  try {
    errorTracker.clear()

    return NextResponse.json({
      success: true,
      message: 'Error tracking data cleared'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
