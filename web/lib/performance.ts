/**
 * Performance Monitoring Utilities
 *
 * Tracks API performance, identifies bottlenecks
 */

import { logger } from './logger'

interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics

  /**
   * Measure async operation performance
   */
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now()

    try {
      const result = await fn()
      const duration = Date.now() - startTime

      this.recordMetric({
        operation,
        duration,
        timestamp: startTime,
        metadata
      })

      // Log slow operations (>2s)
      if (duration > 2000) {
        logger.warn('performance', `Slow operation: ${operation} took ${duration}ms`, metadata)
      }

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('performance', `Failed operation: ${operation} after ${duration}ms`, error)
      throw error
    }
  }

  /**
   * Record performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }

  /**
   * Get performance statistics
   */
  getStats(operation?: string): {
    count: number
    avgDuration: number
    minDuration: number
    maxDuration: number
    p95Duration: number
  } {
    let metrics = this.metrics

    if (operation) {
      metrics = metrics.filter(m => m.operation === operation)
    }

    if (metrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p95Duration: 0
      }
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b)
    const sum = durations.reduce((acc, d) => acc + d, 0)
    const p95Index = Math.floor(durations.length * 0.95)

    return {
      count: metrics.length,
      avgDuration: Math.round(sum / durations.length),
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p95Duration: durations[p95Index]
    }
  }

  /**
   * Get all operations with stats
   */
  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const operations = new Set(this.metrics.map(m => m.operation))
    const stats: Record<string, ReturnType<typeof this.getStats>> = {}

    for (const operation of operations) {
      stats[operation] = this.getStats(operation)
    }

    return stats
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
  }
}

// Export singleton instance
export const perfMonitor = new PerformanceMonitor()

/**
 * Performance decorator for async functions
 */
export function measurePerformance(operation?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const operationName = operation || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      return perfMonitor.measure(
        operationName,
        () => originalMethod.apply(this, args),
        { args: args.length }
      )
    }

    return descriptor
  }
}
