/**
 * 코드 실행 히스토리 타입 정의
 */

// 실행 결과 타입
export interface CodeExecutionResult {
  /** 실행 성공 여부 */
  success: boolean
  /** 실행 로그 */
  logs: Array<{
    timestamp: Date
    level: 'info' | 'warning' | 'error'
    message: string
  }>
  /** Before 데이터 (실행 전) */
  beforeData?: {
    sheetName: string
    data: any[][]
    description: string
  }
  /** After 데이터 (실행 후) */
  afterData?: {
    sheetName: string
    data: any[][]
    description: string
  }
  /** 에러 정보 */
  error?: {
    message: string
    line?: number
    column?: number
  }
  /** 실행 시간 (밀리초) */
  executionTime: number
  /** 실행 일시 */
  executedAt: Date
}

// 실행 히스토리 레코드
export interface ExecutionHistoryRecord {
  /** 고유 ID */
  id: string
  /** 연결된 코드 메뉴 ID */
  menuId?: string
  /** 연결된 코드 버전 ID */
  versionId?: string
  /** 버전 이름 */
  versionName: string
  /** 실행된 코드 (참조용) */
  code: string
  /** 실행 결과 */
  result: CodeExecutionResult
  /** 스프레드시트 ID */
  spreadsheetId?: string
  /** 스프레드시트 제목 */
  spreadsheetTitle?: string
  /** 저장 일시 */
  savedAt: Date
  /** 메모 (사용자 노트) */
  note?: string
  /** 즐겨찾기 여부 */
  isFavorite: boolean
}

// 필터 옵션
export interface ExecutionHistoryFilter {
  /** 메뉴 ID 필터 */
  menuId?: string
  /** 버전 ID 필터 */
  versionId?: string
  /** 성공 여부 필터 */
  success?: boolean
  /** 날짜 범위 필터 (시작) */
  dateFrom?: Date
  /** 날짜 범위 필터 (종료) */
  dateTo?: Date
  /** 즐겨찾기만 표시 */
  favoritesOnly?: boolean
  /** 검색어 (버전 이름, 메모) */
  searchTerm?: string
}

// 정렬 옵션
export type ExecutionHistorySortBy = 'savedAt' | 'executionTime' | 'versionName'
export type ExecutionHistorySortOrder = 'asc' | 'desc'

export interface ExecutionHistorySortOptions {
  sortBy: ExecutionHistorySortBy
  sortOrder: ExecutionHistorySortOrder
}

// 통계 정보
export interface ExecutionHistoryStats {
  /** 총 실행 횟수 */
  totalExecutions: number
  /** 성공한 실행 */
  successfulExecutions: number
  /** 실패한 실행 */
  failedExecutions: number
  /** 평균 실행 시간 (밀리초) */
  avgExecutionTime: number
  /** 최근 실행 일시 */
  lastExecutedAt?: Date
  /** 가장 많이 실행된 버전 */
  mostExecutedVersion?: {
    versionId: string
    versionName: string
    count: number
  }
}
