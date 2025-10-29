/**
 * Centralized Logging Utility
 *
 * Replaces console.log statements with structured logging
 * Automatically disabled in production for performance
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  context: string
  message: string
  data?: any
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'
  private isServer = typeof window === 'undefined'

  private formatMessage(level: LogLevel, context: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${context}]`
    return `${prefix} ${args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ')}`
  }

  private log(level: LogLevel, context: string, ...args: any[]) {
    // Skip debug logs in production
    if (!this.isDev && level === 'debug') return

    const message = this.formatMessage(level, context, ...args)

    switch (level) {
      case 'error':
        console.error(message)
        // TODO: Send to error tracking service (e.g., Sentry)
        if (this.isServer) {
          // Server-side error tracking
        }
        break
      case 'warn':
        console.warn(message)
        break
      case 'info':
        if (this.isDev) console.info(message)
        break
      case 'debug':
        if (this.isDev) console.log(message)
        break
    }
  }

  /**
   * Debug level - verbose logging for development
   * Automatically disabled in production
   */
  debug = (context: string, ...args: any[]) => {
    this.log('debug', context, ...args)
  }

  /**
   * Info level - general informational messages
   * Shown only in development
   */
  info = (context: string, ...args: any[]) => {
    this.log('info', context, ...args)
  }

  /**
   * Warning level - potential issues
   * Shown in all environments
   */
  warn = (context: string, ...args: any[]) => {
    this.log('warn', context, ...args)
  }

  /**
   * Error level - errors and exceptions
   * Always shown and tracked
   */
  error = (context: string, ...args: any[]) => {
    this.log('error', context, ...args)
  }

  /**
   * Log API requests with timing
   */
  apiRequest = (method: string, endpoint: string, durationMs?: number) => {
    const message = durationMs
      ? `${method} ${endpoint} (${durationMs}ms)`
      : `${method} ${endpoint}`
    this.info('API', message)
  }

  /**
   * Log API errors
   */
  apiError = (method: string, endpoint: string, error: any) => {
    this.error('API', `${method} ${endpoint}`, error)
  }
}

export const logger = new Logger()

// Export type for external use
export type { LogLevel, LogEntry }
