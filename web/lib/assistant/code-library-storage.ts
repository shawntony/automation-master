import type { CodeLibraryItem, GeneratedCode, CodeLibraryFilter } from '@/types/roadmap'

const STORAGE_KEY = 'ssa_code_library'

/**
 * 코드 라이브러리 로컬 스토리지 유틸리티
 */
export class CodeLibraryStorage {
  /**
   * 모든 코드 아이템 가져오기
   */
  static getAll(): CodeLibraryItem[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('코드 라이브러리 로드 오류:', error)
      return []
    }
  }

  /**
   * 모든 코드 아이템 저장
   */
  private static saveAll(items: CodeLibraryItem[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('코드 라이브러리 저장 오류:', error)
    }
  }

  /**
   * 코드 저장
   */
  static save(code: GeneratedCode): CodeLibraryItem {
    const items = this.getAll()

    // 카테고리 자동 감지
    const category = this.detectCategory(code.type)

    // 태그 자동 생성
    const tags = this.generateTags(code)

    const newItem: CodeLibraryItem = {
      id: `lib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code: {
        ...code,
        saved: true
      },
      category,
      tags,
      usageCount: 0,
      favorite: false
    }

    items.push(newItem)
    this.saveAll(items)

    return newItem
  }

  /**
   * 코드 가져오기 (ID로)
   */
  static get(id: string): CodeLibraryItem | null {
    const items = this.getAll()
    return items.find(item => item.id === id) || null
  }

  /**
   * 코드 업데이트
   */
  static update(id: string, updates: Partial<CodeLibraryItem>): CodeLibraryItem | null {
    const items = this.getAll()
    const index = items.findIndex(item => item.id === id)

    if (index === -1) return null

    items[index] = {
      ...items[index],
      ...updates
    }

    this.saveAll(items)
    return items[index]
  }

  /**
   * 코드 삭제
   */
  static delete(id: string): boolean {
    const items = this.getAll()
    const filtered = items.filter(item => item.id !== id)

    if (filtered.length === items.length) return false

    this.saveAll(filtered)
    return true
  }

  /**
   * 코드 검색 및 필터링
   */
  static search(filter: CodeLibraryFilter = {}): CodeLibraryItem[] {
    let items = this.getAll()

    // 카테고리 필터
    if (filter.category) {
      items = items.filter(item => item.category === filter.category)
    }

    // 태그 필터
    if (filter.tags && filter.tags.length > 0) {
      items = items.filter(item =>
        filter.tags!.some(tag => item.tags.includes(tag))
      )
    }

    // 코드 타입 필터
    if (filter.type) {
      items = items.filter(item => item.code.type === filter.type)
    }

    // 즐겨찾기 필터
    if (filter.favoriteOnly) {
      items = items.filter(item => item.favorite)
    }

    // 검색어 필터
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      items = items.filter(item =>
        item.code.title.toLowerCase().includes(query) ||
        item.code.description.toLowerCase().includes(query) ||
        item.code.userRequest.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 정렬
    const sortBy = filter.sortBy || 'createdAt'
    const sortOrder = filter.sortOrder || 'desc'

    items.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.code.createdAt).getTime()
          bValue = new Date(b.code.createdAt).getTime()
          break
        case 'usageCount':
          aValue = a.usageCount
          bValue = b.usageCount
          break
        case 'lastUsedAt':
          aValue = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0
          bValue = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0
          break
        case 'title':
          aValue = a.code.title
          bValue = b.code.title
          break
        default:
          aValue = new Date(a.code.createdAt).getTime()
          bValue = new Date(b.code.createdAt).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return items
  }

  /**
   * 사용 횟수 증가
   */
  static incrementUsage(id: string): void {
    const item = this.get(id)
    if (!item) return

    this.update(id, {
      usageCount: item.usageCount + 1,
      lastUsedAt: new Date().toISOString()
    })
  }

  /**
   * 즐겨찾기 토글
   */
  static toggleFavorite(id: string): boolean {
    const item = this.get(id)
    if (!item) return false

    const newFavorite = !item.favorite
    this.update(id, { favorite: newFavorite })
    return newFavorite
  }

  /**
   * 통계 정보 가져오기
   */
  static getStats() {
    const items = this.getAll()

    const categories = new Map<string, number>()
    const tags = new Map<string, number>()

    items.forEach(item => {
      // 카테고리 통계
      categories.set(item.category, (categories.get(item.category) || 0) + 1)

      // 태그 통계
      item.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1)
      })
    })

    return {
      total: items.length,
      favorites: items.filter(item => item.favorite).length,
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      tags: Array.from(tags.entries()).map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // 상위 10개 태그
    }
  }

  /**
   * 카테고리 자동 감지
   */
  private static detectCategory(type: string): string {
    const categoryMap: Record<string, string> = {
      data_cleaning: '데이터 정리',
      formula_conversion: '수식 변환',
      automation: '자동화',
      validation: '데이터 검증'
    }

    return categoryMap[type] || '기타'
  }

  /**
   * 태그 자동 생성
   */
  private static generateTags(code: GeneratedCode): string[] {
    const tags: string[] = []

    // 코드 타입 기반 태그
    tags.push(code.type.replace('_', ' '))

    // 제목/설명에서 키워드 추출
    const text = `${code.title} ${code.description} ${code.userRequest}`.toLowerCase()

    if (text.includes('중복') || text.includes('duplicate')) tags.push('중복제거')
    if (text.includes('빈') || text.includes('empty')) tags.push('빈셀처리')
    if (text.includes('공백') || text.includes('trim')) tags.push('공백제거')
    if (text.includes('수식') || text.includes('formula')) tags.push('수식변환')
    if (text.includes('검증') || text.includes('validat')) tags.push('데이터검증')
    if (text.includes('정렬') || text.includes('sort')) tags.push('정렬')
    if (text.includes('필터') || text.includes('filter')) tags.push('필터링')

    // 대상 시트 개수 기반 태그
    if (code.targetSheets.length > 1) {
      tags.push('다중시트')
    }

    return [...new Set(tags)] // 중복 제거
  }
}
