/**
 * 코드 템플릿 타입 정의
 */

export interface CodeTemplate {
  id: string
  name: string
  description: string
  category: string
  code: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  usageCount: number
  isFavorite: boolean
}

export interface TemplateCategory {
  name: string
  description: string
  count: number
}

export type TemplateSortBy = 'name' | 'createdAt' | 'usageCount' | 'updatedAt'
export type SortOrder = 'asc' | 'desc'

export interface TemplateFilter {
  category?: string
  tags?: string[]
  searchQuery?: string
  favoriteOnly?: boolean
}

export interface TemplateSortOptions {
  sortBy: TemplateSortBy
  order: SortOrder
}
