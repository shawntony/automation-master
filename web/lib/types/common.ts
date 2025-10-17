// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Parse Mode Types
export type ParseMode = 'simple' | 'keyvalue' | 'table'

export interface ParseTemplate {
  name: string
  parseMode: ParseMode
  separator: string
  dataDirection: 'row' | 'column'
  useFirstRowAsHeader: boolean
  columnSeparator: string
}

// Google Sheets Types
export interface GoogleSheetsConfig {
  spreadsheetId?: string
  sheetName: string
  data: any[]
  action?: 'create' | 'append'
  createIfNotExists?: boolean
}

export interface GoogleSheetsResponse {
  success: boolean
  spreadsheetId?: string
  spreadsheetUrl?: string
  rowCount?: number
  error?: string
}

// Supabase Types
export interface SupabaseConfig {
  url?: string
  anonKey?: string
  serviceKey?: string
}

// Environment Config Types
export interface EnvironmentConfig {
  googleServiceAccountEmail?: string
  googleServiceAccountPrivateKey?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
  supabaseServiceKey?: string
}

// Service Status Types
export interface ServiceStatus {
  googleSheets: boolean
  supabase: boolean
  overall: boolean
}

// File Upload Types
export interface FileUploadResult {
  success: boolean
  fileName?: string
  fileSize?: number
  extractedText?: string
  error?: string
}

// Table Data Types
export interface TableRow {
  [key: string]: string | number | boolean
}

export interface TableData {
  headers: string[]
  rows: TableRow[]
}

// Toast Notification Types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  type: ToastType
  title: string
  message: string
  duration?: number
}
