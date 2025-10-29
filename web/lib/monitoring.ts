/**
 * Client-side Web Vitals Monitoring
 *
 * Tracks Core Web Vitals: LCP, FID, CLS, FCP, TTFB
 */

export interface WebVitalMetric {
  id: string
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType: string
}

/**
 * Send metric to analytics endpoint
 */
export function sendToAnalytics(metric: WebVitalMetric) {
  // In development, just log
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric)
    return
  }

  // Send to analytics endpoint
  const body = JSON.stringify(metric)

  if ('sendBeacon' in navigator) {
    navigator.sendBeacon('/api/analytics/vitals', body)
  } else {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' }
    }).catch(console.error)
  }
}

/**
 * Get rating based on thresholds
 */
export function getVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    // Largest Contentful Paint (seconds)
    LCP: { good: 2.5, poor: 4.0 },
    // First Input Delay (milliseconds)
    FID: { good: 100, poor: 300 },
    // Cumulative Layout Shift
    CLS: { good: 0.1, poor: 0.25 },
    // First Contentful Paint (seconds)
    FCP: { good: 1.8, poor: 3.0 },
    // Time to First Byte (milliseconds)
    TTFB: { good: 800, poor: 1800 },
    // Interaction to Next Paint (milliseconds)
    INP: { good: 200, poor: 500 }
  }

  const threshold = thresholds[name as keyof typeof thresholds]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Initialize Web Vitals reporting
 * Import this in _app.tsx or layout.tsx
 */
export async function initWebVitals() {
  if (typeof window === 'undefined') return

  try {
    const { onCLS, onFCP, onFID, onLCP, onTTFB, onINP } = await import('web-vitals')

    const handleVital = (metric: any) => {
      const vital: WebVitalMetric = {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: getVitalRating(metric.name, metric.value),
        delta: metric.delta,
        navigationType: metric.navigationType || 'unknown'
      }

      sendToAnalytics(vital)
    }

    onCLS(handleVital)
    onFCP(handleVital)
    onFID(handleVital)
    onLCP(handleVital)
    onTTFB(handleVital)
    onINP(handleVital)
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error)
  }
}
