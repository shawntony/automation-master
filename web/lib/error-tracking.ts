/**
 * Error Tracking Utility
 *
 * Centralized error tracking and reporting
 */

import { logger } from './logger'

export interface ErrorReport {
  message: string
  stack?: string
  context: string
  timestamp: number
  userAgent?: string
  url?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, any>
}

class ErrorTracker {
  private errors: ErrorReport[] = []
  private maxErrors = 100

  /**
   * Track an error
   */
  track(
    error: Error | string,
    context: string,
    severity: ErrorReport['severity'] = 'medium',
    metadata?: Record<string, any>
  ): void {
    const errorReport: ErrorReport = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      context,
      timestamp: Date.now(),
      severity,
      metadata,
      ...(typeof window !== 'undefined' && {
        userAgent: window.navigator.userAgent,
        url: window.location.href
      })
    }

    this.errors.push(errorReport)

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Log based on severity
    if (severity === 'critical' || severity === 'high') {
      logger.error(context, errorReport.message, { stack: errorReport.stack, metadata })
    } else {
      logger.warn(context, errorReport.message, { metadata })
    }

    // Send to error tracking service (e.g., Sentry)
    this.sendToService(errorReport)
  }

  /**
   * Track API error
   */
  trackAPIError(
    endpoint: string,
    error: any,
    severity: ErrorReport['severity'] = 'high'
  ): void {
    this.track(
      error,
      'API',
      severity,
      {
        endpoint,
        status: error.status,
        statusText: error.statusText
      }
    )
  }

  /**
   * Track client error
   */
  trackClientError(
    component: string,
    error: Error,
    severity: ErrorReport['severity'] = 'medium'
  ): void {
    this.track(
      error,
      `Client:${component}`,
      severity,
      {
        componentStack: (error as any).componentStack
      }
    )
  }

  /**
   * Get all tracked errors
   */
  getErrors(filter?: {
    context?: string
    severity?: ErrorReport['severity']
    since?: number
  }): ErrorReport[] {
    let filtered = this.errors

    if (filter?.context) {
      filtered = filtered.filter(e => e.context.includes(filter.context!))
    }

    if (filter?.severity) {
      filtered = filtered.filter(e => e.severity === filter.severity)
    }

    if (filter?.since) {
      filtered = filtered.filter(e => e.timestamp >= filter.since!)
    }

    return filtered
  }

  /**
   * Get error statistics
   */
  getStats(): {
    total: number
    bySeverity: Record<string, number>
    byContext: Record<string, number>
    recent: ErrorReport[]
  } {
    const bySeverity: Record<string, number> = {}
    const byContext: Record<string, number> = {}

    this.errors.forEach(error => {
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
      byContext[error.context] = (byContext[error.context] || 0) + 1
    })

    return {
      total: this.errors.length,
      bySeverity,
      byContext,
      recent: this.errors.slice(-10).reverse()
    }
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = []
  }

  /**
   * Send to error tracking service
   */
  private sendToService(error: ErrorReport): void {
    // In production, send to error tracking service (Sentry, Rollbar, etc.)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service
      // Example: Sentry.captureException(error)
    }
  }
}

// Export singleton
export const errorTracker = new ErrorTracker()

/**
 * Global error handler (client-side)
 */
export function initGlobalErrorHandler() {
  if (typeof window === 'undefined') return

  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    errorTracker.track(
      event.error || event.message,
      'Global',
      'high',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    )
  })

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.track(
      event.reason,
      'Promise',
      'high',
      {
        promise: event.promise
      }
    )
  })
}
