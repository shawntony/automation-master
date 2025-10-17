// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Supabase URL validation
export function isValidSupabaseUrl(url: string): boolean {
  return isValidUrl(url) && url.includes('supabase.co')
}

// Spreadsheet ID validation
export function isValidSpreadsheetId(id: string): boolean {
  // Google Sheets IDs are typically 44 characters long
  return /^[a-zA-Z0-9_-]{20,}$/.test(id)
}

// Phone number validation (basic)
export function isValidPhoneNumber(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  // Check if it's all digits and has 10-15 characters
  return /^\d{10,15}$/.test(cleaned)
}

// File size validation
export function isValidFileSize(size: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size <= maxSizeBytes
}

// File extension validation
export function hasValidExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? allowedExtensions.includes(ext) : false
}

// Check if string is empty or whitespace
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0
}

// Check if all required fields are filled
export function areRequiredFieldsFilled(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => isEmpty(data[field]))

  return {
    valid: missingFields.length === 0,
    missingFields
  }
}

// Password strength validation
export interface PasswordStrength {
  score: number // 0-4
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong'
  feedback: string[]
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) score++
  else feedback.push('Password should be at least 8 characters')

  if (password.length >= 12) score++

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Include both uppercase and lowercase letters')
  }

  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('Include at least one number')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++
  } else {
    feedback.push('Include at least one special character')
  }

  // Normalize score to 0-4
  score = Math.min(score, 4)

  const strengthMap = {
    0: 'very-weak',
    1: 'weak',
    2: 'medium',
    3: 'strong',
    4: 'very-strong'
  } as const

  return {
    score,
    strength: strengthMap[score as keyof typeof strengthMap],
    feedback
  }
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

// Validate JSON string
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

// Validate date string
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

// Check if date is in the future
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  return date > now
}

// Check if date is in the past
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  return date < now
}
