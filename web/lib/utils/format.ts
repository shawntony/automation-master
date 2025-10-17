// Format file size in human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Format number with thousands separator
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR')
}

// Format currency (Korean Won)
export function formatCurrency(amount: number, currency: string = 'KRW'): string {
  if (currency === 'KRW' || currency === 'krw') {
    return `₩${formatNumber(amount)}`
  }

  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency
  }).format(amount)
}

// Format date in Korean format
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'time') {
    return d.toLocaleTimeString('ko-KR')
  }

  if (format === 'long') {
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return d.toLocaleDateString('ko-KR')
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return `${diffSec}초 전`
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}개월 전`
  return `${Math.floor(diffDay / 365)}년 전`
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Format as Korean phone number
  if (cleaned.length === 10) {
    // Mobile: 010-XXXX-XXXX
    return cleaned.replace(/(\d{3})(\d{4})(\d{3})/, '$1-$2-$3')
  } else if (cleaned.length === 11) {
    // Mobile: 010-XXXX-XXXX
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (cleaned.length === 9) {
    // Landline: 02-XXX-XXXX
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  return phone
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

// Format duration in human-readable format
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  }
  if (minutes > 0) {
    return `${minutes}분 ${secs}초`
  }
  return `${secs}초`
}

// Capitalize first letter
export function capitalizeFirst(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Convert to title case
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ')
}

// Format list with "and" or "or"
export function formatList(items: string[], conjunction: 'and' | 'or' = 'and'): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) {
    const joiner = conjunction === 'and' ? '와' : '또는'
    return `${items[0]} ${joiner} ${items[1]}`
  }

  const lastJoiner = conjunction === 'and' ? '및' : '또는'
  return items.slice(0, -1).join(', ') + ` ${lastJoiner} ` + items[items.length - 1]
}

// Generate initials from name
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('')
}

// Format JSON for display
export function formatJson(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent)
}

// Format file extension
export function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()
  return ext ? ext.toLowerCase() : ''
}

// Format filename without extension
export function getFilenameWithoutExtension(filename: string): string {
  return filename.substring(0, filename.lastIndexOf('.')) || filename
}

// Generate slug from text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Format code block for display
export function formatCodeBlock(code: string, language: string = ''): string {
  return `\`\`\`${language}\n${code}\n\`\`\``
}
