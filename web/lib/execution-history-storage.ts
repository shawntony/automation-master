/**
 * 코드 실행 히스토리 저장소
 * localStorage를 사용하여 실행 결과를 저장하고 관리합니다.
 */

import type {
  ExecutionHistoryRecord,
  CodeExecutionResult,
  ExecutionHistoryFilter,
  ExecutionHistorySortOptions,
  ExecutionHistoryStats
} from '@/types/execution-history'

const STORAGE_KEY = 'execution_history'
const MAX_HISTORY_SIZE = 100 // 최대 100개 히스토리 유지

/**
 * 히스토리 목록 로드
 */
export function getExecutionHistory(): ExecutionHistoryRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []

    const history = JSON.parse(data, dateReviver) as ExecutionHistoryRecord[]
    return Array.isArray(history) ? history : []
  } catch (error) {
    console.error('Failed to load execution history:', error)
    return []
  }
}

/**
 * 날짜 객체 복원을 위한 reviver 함수
 */
function dateReviver(key: string, value: any): any {
  if (typeof value === 'string') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    if (dateRegex.test(value)) {
      return new Date(value)
    }
  }
  return value
}

/**
 * 히스토리 목록 저장
 */
function saveExecutionHistory(history: ExecutionHistoryRecord[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save execution history:', error)
  }
}

/**
 * 새 실행 결과 추가
 */
export function addExecutionHistory(
  result: CodeExecutionResult,
  options: {
    menuId?: string
    versionId?: string
    versionName: string
    code: string
    spreadsheetId?: string
    spreadsheetTitle?: string
    note?: string
  }
): ExecutionHistoryRecord {
  const history = getExecutionHistory()

  const newRecord: ExecutionHistoryRecord = {
    id: generateId(),
    menuId: options.menuId,
    versionId: options.versionId,
    versionName: options.versionName,
    code: options.code,
    result,
    spreadsheetId: options.spreadsheetId,
    spreadsheetTitle: options.spreadsheetTitle,
    savedAt: new Date(),
    note: options.note,
    isFavorite: false
  }

  // 최신 항목을 맨 앞에 추가
  history.unshift(newRecord)

  // 최대 크기 초과 시 오래된 항목 삭제
  if (history.length > MAX_HISTORY_SIZE) {
    history.splice(MAX_HISTORY_SIZE)
  }

  saveExecutionHistory(history)
  return newRecord
}

/**
 * 히스토리 업데이트
 */
export function updateExecutionHistory(
  id: string,
  updates: Partial<Pick<ExecutionHistoryRecord, 'note' | 'isFavorite'>>
): void {
  const history = getExecutionHistory()
  const index = history.findIndex(h => h.id === id)

  if (index !== -1) {
    history[index] = {
      ...history[index],
      ...updates
    }
    saveExecutionHistory(history)
  }
}

/**
 * 히스토리 삭제
 */
export function deleteExecutionHistory(id: string): void {
  const history = getExecutionHistory()
  const filtered = history.filter(h => h.id !== id)
  saveExecutionHistory(filtered)
}

/**
 * 여러 히스토리 삭제
 */
export function deleteMultipleExecutionHistory(ids: string[]): void {
  const history = getExecutionHistory()
  const filtered = history.filter(h => !ids.includes(h.id))
  saveExecutionHistory(filtered)
}

/**
 * 모든 히스토리 삭제
 */
export function clearExecutionHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * 특정 메뉴의 히스토리만 삭제
 */
export function clearMenuExecutionHistory(menuId: string): void {
  const history = getExecutionHistory()
  const filtered = history.filter(h => h.menuId !== menuId)
  saveExecutionHistory(filtered)
}

/**
 * 즐겨찾기 토글
 */
export function toggleExecutionHistoryFavorite(id: string): void {
  const history = getExecutionHistory()
  const index = history.findIndex(h => h.id === id)

  if (index !== -1) {
    history[index].isFavorite = !history[index].isFavorite
    saveExecutionHistory(history)
  }
}

/**
 * 필터링 및 정렬된 히스토리 조회
 */
export function getFilteredExecutionHistory(
  filter?: ExecutionHistoryFilter,
  sort?: ExecutionHistorySortOptions
): ExecutionHistoryRecord[] {
  let history = getExecutionHistory()

  // 필터 적용
  if (filter) {
    if (filter.menuId) {
      history = history.filter(h => h.menuId === filter.menuId)
    }
    if (filter.versionId) {
      history = history.filter(h => h.versionId === filter.versionId)
    }
    if (filter.success !== undefined) {
      history = history.filter(h => h.result.success === filter.success)
    }
    if (filter.dateFrom) {
      history = history.filter(h => h.savedAt >= filter.dateFrom!)
    }
    if (filter.dateTo) {
      history = history.filter(h => h.savedAt <= filter.dateTo!)
    }
    if (filter.favoritesOnly) {
      history = history.filter(h => h.isFavorite)
    }
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase()
      history = history.filter(
        h =>
          h.versionName.toLowerCase().includes(term) ||
          h.note?.toLowerCase().includes(term) ||
          h.spreadsheetTitle?.toLowerCase().includes(term)
      )
    }
  }

  // 정렬
  if (sort) {
    history.sort((a, b) => {
      let compareValue = 0

      switch (sort.sortBy) {
        case 'savedAt':
          compareValue = a.savedAt.getTime() - b.savedAt.getTime()
          break
        case 'executionTime':
          compareValue = a.result.executionTime - b.result.executionTime
          break
        case 'versionName':
          compareValue = a.versionName.localeCompare(b.versionName)
          break
      }

      return sort.sortOrder === 'asc' ? compareValue : -compareValue
    })
  }

  return history
}

/**
 * 특정 버전의 최근 실행 결과 조회
 */
export function getLatestExecutionForVersion(versionId: string): ExecutionHistoryRecord | null {
  const history = getExecutionHistory()
  return history.find(h => h.versionId === versionId) || null
}

/**
 * 히스토리 통계 계산
 */
export function getExecutionHistoryStats(filter?: ExecutionHistoryFilter): ExecutionHistoryStats {
  const history = getFilteredExecutionHistory(filter)

  if (history.length === 0) {
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      avgExecutionTime: 0
    }
  }

  const successfulExecutions = history.filter(h => h.result.success).length
  const totalExecutionTime = history.reduce((sum, h) => sum + h.result.executionTime, 0)

  // 가장 많이 실행된 버전 찾기
  const versionCounts = history.reduce((acc, h) => {
    if (h.versionId) {
      acc[h.versionId] = (acc[h.versionId] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const mostExecutedVersionId = Object.entries(versionCounts).reduce(
    (max, [versionId, count]) => (count > (max.count || 0) ? { versionId, count } : max),
    { versionId: '', count: 0 }
  )

  const mostExecutedRecord = history.find(h => h.versionId === mostExecutedVersionId.versionId)

  return {
    totalExecutions: history.length,
    successfulExecutions,
    failedExecutions: history.length - successfulExecutions,
    avgExecutionTime: Math.round(totalExecutionTime / history.length),
    lastExecutedAt: history[0]?.savedAt,
    mostExecutedVersion: mostExecutedRecord
      ? {
          versionId: mostExecutedVersionId.versionId,
          versionName: mostExecutedRecord.versionName,
          count: mostExecutedVersionId.count
        }
      : undefined
  }
}

/**
 * ID 생성 함수
 */
function generateId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 히스토리 내보내기 (JSON)
 */
export function exportExecutionHistory(filter?: ExecutionHistoryFilter): string {
  const history = getFilteredExecutionHistory(filter)
  return JSON.stringify(history, null, 2)
}

/**
 * 히스토리 가져오기 (JSON)
 */
export function importExecutionHistory(jsonData: string): { success: boolean; count: number; error?: string } {
  try {
    const imported = JSON.parse(jsonData, dateReviver) as ExecutionHistoryRecord[]

    if (!Array.isArray(imported)) {
      return { success: false, count: 0, error: '잘못된 데이터 형식입니다.' }
    }

    const existing = getExecutionHistory()
    const merged = [...imported, ...existing]

    // 중복 제거 (ID 기준)
    const unique = merged.filter(
      (record, index, self) => index === self.findIndex(r => r.id === record.id)
    )

    // 최대 크기 제한
    if (unique.length > MAX_HISTORY_SIZE) {
      unique.splice(MAX_HISTORY_SIZE)
    }

    saveExecutionHistory(unique)

    return { success: true, count: imported.length }
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }
  }
}
