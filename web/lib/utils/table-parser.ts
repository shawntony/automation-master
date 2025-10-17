import { ParseMode, TableData, TableRow } from '../types/common'

export interface ParseOptions {
  mode: ParseMode
  separator: string
  dataDirection?: 'row' | 'column'
  useFirstRowAsHeader?: boolean
  columnSeparator?: string
}

// Auto-detect separator in a line of text
export function detectSeparator(line: string): string | RegExp {
  if (!line) return /\s+/

  // Check for tab
  if (line.includes('\t')) return '\t'

  // Check for multiple spaces (3 or more consecutive spaces)
  if (line.match(/\s{3,}/)) return /\s{3,}/

  // Check for 2 or more consecutive spaces
  if (line.match(/\s{2,}/)) return /\s{2,}/

  // Check for comma
  if (line.includes(',')) return ','

  // Check for pipe
  if (line.includes('|')) return '|'

  // Default: single space
  return /\s+/
}

// Parse simple text (line by line)
export function parseSimpleText(text: string): string[][] {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  return lines.map(line => [line])
}

// Parse key-value pairs
export function parseKeyValue(text: string, separator: string): TableData {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  const headers = ['Key', 'Value']
  const rows: TableRow[] = []

  const sepRegex = separator === 'auto' ? null : new RegExp(separator)

  lines.forEach(line => {
    let parts: string[]

    if (separator === 'auto') {
      // Auto-detect separator for this line
      const detectedSep = detectSeparator(line)
      parts = line.split(detectedSep).map(p => p.trim()).filter(p => p)
    } else if (sepRegex) {
      parts = line.split(sepRegex).map(p => p.trim()).filter(p => p)
    } else {
      parts = line.split(separator).map(p => p.trim()).filter(p => p)
    }

    if (parts.length >= 2) {
      rows.push({
        Key: parts[0],
        Value: parts.slice(1).join(' ')
      })
    } else if (parts.length === 1) {
      rows.push({
        Key: parts[0],
        Value: ''
      })
    }
  })

  return { headers, rows }
}

// Parse table structure with auto-detection
export function parseTable(
  text: string,
  options: Partial<ParseOptions> = {}
): TableData {
  const {
    dataDirection = 'row',
    useFirstRowAsHeader = true,
    columnSeparator = 'auto'
  } = options

  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  // Detect separator from first line
  const detectedSep = columnSeparator === 'auto'
    ? detectSeparator(lines[0])
    : columnSeparator

  // Parse all lines
  const parsedLines = lines.map(line => {
    const parts = typeof detectedSep === 'string'
      ? line.split(detectedSep)
      : line.split(detectedSep)

    return parts.map(p => p.trim()).filter(p => p.length > 0)
  })

  // Filter out empty lines
  const nonEmptyLines = parsedLines.filter(line => line.length > 0)

  if (nonEmptyLines.length === 0) {
    return { headers: [], rows: [] }
  }

  // Determine headers
  let headers: string[]
  let dataLines: string[][]

  if (useFirstRowAsHeader) {
    headers = nonEmptyLines[0]
    dataLines = nonEmptyLines.slice(1)
  } else {
    // Auto-generate headers
    const maxColumns = Math.max(...nonEmptyLines.map(line => line.length))
    headers = Array.from({ length: maxColumns }, (_, i) => `Column ${i + 1}`)
    dataLines = nonEmptyLines
  }

  // Convert to row objects
  const rows: TableRow[] = dataLines.map(line => {
    const row: TableRow = {}
    headers.forEach((header, index) => {
      row[header] = line[index] || ''
    })
    return row
  })

  // Handle column direction (transpose)
  if (dataDirection === 'column') {
    return transposeTable({ headers, rows })
  }

  return { headers, rows }
}

// Transpose table (swap rows and columns)
export function transposeTable(table: TableData): TableData {
  const { headers, rows } = table

  if (rows.length === 0) {
    return { headers: [], rows: [] }
  }

  // New headers are the first column values
  const newHeaders = rows.map(row => String(row[headers[0]] || ''))

  // New rows are the remaining columns
  const newRows: TableRow[] = headers.slice(1).map(header => {
    const row: TableRow = {}
    newHeaders.forEach((newHeader, index) => {
      row[newHeader] = rows[index][header]
    })
    return row
  })

  return { headers: newHeaders, rows: newRows }
}

// Validate table data
export function validateTable(table: TableData): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if headers exist
  if (!table.headers || table.headers.length === 0) {
    errors.push('No headers found')
  }

  // Check for duplicate headers
  const headerSet = new Set(table.headers)
  if (headerSet.size !== table.headers.length) {
    warnings.push('Duplicate headers detected')
  }

  // Check if rows exist
  if (!table.rows || table.rows.length === 0) {
    warnings.push('No data rows found')
  }

  // Check for inconsistent column counts
  if (table.rows.length > 0) {
    const columnCounts = table.rows.map(row => Object.keys(row).length)
    const maxColumns = Math.max(...columnCounts)
    const minColumns = Math.min(...columnCounts)

    if (maxColumns !== minColumns) {
      warnings.push(`Inconsistent column counts: ${minColumns}-${maxColumns}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Convert table to CSV string
export function tableToCSV(table: TableData): string {
  const { headers, rows } = table

  const csvLines: string[] = []

  // Add headers
  csvLines.push(headers.map(h => `"${h}"`).join(','))

  // Add rows
  rows.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      const stringValue = String(value ?? '')
      // Escape quotes
      return `"${stringValue.replace(/"/g, '""')}"`
    })
    csvLines.push(values.join(','))
  })

  return csvLines.join('\n')
}

// Parse with automatic mode detection
export function parseWithAutoDetection(text: string): TableData {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  // Try to detect if it's key-value format
  const firstLine = lines[0]
  const separator = detectSeparator(firstLine)
  const parts = typeof separator === 'string'
    ? firstLine.split(separator)
    : firstLine.split(separator)

  // If most lines have exactly 2 parts, it's likely key-value
  const twoPartLines = lines.filter(line => {
    const lineParts = typeof separator === 'string'
      ? line.split(separator)
      : line.split(separator)
    return lineParts.filter(p => p.trim()).length === 2
  })

  if (twoPartLines.length / lines.length > 0.7) {
    // Likely key-value format
    return parseKeyValue(text, 'auto')
  }

  // Otherwise, treat as table
  return parseTable(text, {
    columnSeparator: 'auto',
    useFirstRowAsHeader: true
  })
}
