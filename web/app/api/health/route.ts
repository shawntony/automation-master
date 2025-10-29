import { NextRequest, NextResponse } from 'next/server'
import { perfMonitor } from '@/lib/performance'
import { cache } from '@/lib/cache'

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Returns system health status and metrics
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Check various system components
    const checks = await Promise.allSettled([
      checkDatabase(),
      checkCache(),
      checkEnvironment()
    ])

    const [dbCheck, cacheCheck, envCheck] = checks

    // Calculate overall health
    const allHealthy = checks.every(check => check.status === 'fulfilled' && check.value.healthy)

    const responseTime = Date.now() - startTime
    const perfStats = perfMonitor.getAllStats()
    const cacheStats = cache.getStats()

    // Determine status code
    const statusCode = allHealthy ? 200 : 503

    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime,
      checks: {
        database: dbCheck.status === 'fulfilled' ? dbCheck.value : { healthy: false, error: 'Check failed' },
        cache: cacheCheck.status === 'fulfilled' ? cacheCheck.value : { healthy: false, error: 'Check failed' },
        environment: envCheck.status === 'fulfilled' ? envCheck.value : { healthy: false, error: 'Check failed' }
      },
      metrics: {
        performance: Object.keys(perfStats).length > 0 ? {
          operations: Object.keys(perfStats).length,
          totalCalls: Object.values(perfStats).reduce((sum, stat) => sum + stat.count, 0),
          avgResponseTime: Math.round(
            Object.values(perfStats).reduce((sum, stat) => sum + stat.avgDuration, 0) /
            Object.keys(perfStats).length
          )
        } : null,
        cache: {
          size: cacheStats.size,
          hitRate: calculateCacheHitRate()
        }
      },
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV || 'unknown'
    }, { status: statusCode })

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: Date.now() - startTime
    }, { status: 503 })
  }
}

/**
 * Check database connectivity (Google Sheets API)
 */
async function checkDatabase(): Promise<{ healthy: boolean; message?: string }> {
  try {
    // Check if credentials are configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      return {
        healthy: false,
        message: 'Google Service Account not configured'
      }
    }

    return {
      healthy: true,
      message: 'Google Sheets API configured'
    }
  } catch (error: any) {
    return {
      healthy: false,
      message: error.message
    }
  }
}

/**
 * Check cache functionality
 */
async function checkCache(): Promise<{ healthy: boolean; message?: string }> {
  try {
    const testKey = 'health-check-test'
    const testValue = Date.now()

    // Test write
    cache.set(testKey, testValue, 1)

    // Test read
    const retrieved = cache.get(testKey)

    // Test delete
    cache.delete(testKey)

    if (retrieved === testValue) {
      return {
        healthy: true,
        message: 'Cache operational'
      }
    }

    return {
      healthy: false,
      message: 'Cache read/write mismatch'
    }
  } catch (error: any) {
    return {
      healthy: false,
      message: error.message
    }
  }
}

/**
 * Check environment configuration
 */
async function checkEnvironment(): Promise<{ healthy: boolean; message?: string }> {
  const requiredEnvVars = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'
  ]

  const missing = requiredEnvVars.filter(varName => !process.env[varName])

  if (missing.length > 0) {
    return {
      healthy: false,
      message: `Missing environment variables: ${missing.join(', ')}`
    }
  }

  return {
    healthy: true,
    message: 'All required environment variables configured'
  }
}

/**
 * Calculate cache hit rate (placeholder - needs actual tracking)
 */
function calculateCacheHitRate(): number {
  // TODO: Implement actual cache hit rate tracking
  return 0
}
