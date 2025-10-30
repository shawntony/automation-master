/**
 * 대화 기록 시스템 타입 정의
 * AI 어시스턴트와의 대화 내용을 저장하고 관리
 */

/**
 * 대화 메시지
 */
export interface ConversationMessage {
  /** 메시지 역할 */
  role: 'user' | 'assistant'
  /** 메시지 내용 */
  content: string
  /** 메시지 생성 일시 */
  timestamp: Date
  /** 생성된 코드 (있는 경우) */
  generatedCode?: string
}

/**
 * 대화 기록
 * AI와의 전체 대화 세션을 저장
 */
export interface ConversationRecord {
  /** 대화 고유 ID */
  id: string
  /** 대화 제목 (자동 생성 또는 사용자 지정) */
  title?: string
  /** 대화 메시지 목록 */
  messages: ConversationMessage[]
  /** 최종 생성된 코드 (있는 경우) */
  generatedCode?: string
  /** 연결된 코드 메뉴 ID (자동 생성된 경우) */
  linkedMenuId?: string
  /** 대화 시작 일시 */
  createdAt: Date
  /** 마지막 업데이트 일시 */
  updatedAt: Date
  /** 수동 저장 여부 (true: 중요 대화로 수동 저장, false: 자동 저장) */
  isSaved: boolean
  /** 즐겨찾기 여부 */
  isFavorite: boolean
}

/**
 * 대화 필터 옵션
 */
export interface ConversationFilter {
  /** 검색어 (제목 또는 메시지 내용) */
  searchQuery?: string
  /** 코드 생성된 대화만 보기 */
  hasCode?: boolean
  /** 메뉴로 변환된 대화만 보기 */
  hasMenu?: boolean
  /** 수동 저장된 대화만 보기 */
  savedOnly?: boolean
  /** 즐겨찾기만 보기 */
  favoritesOnly?: boolean
  /** 날짜 범위 필터 */
  dateRange?: {
    from: Date
    to: Date
  }
}

/**
 * 대화 정렬 옵션
 */
export type ConversationSortBy = 'createdAt' | 'updatedAt' | 'title'
export type ConversationSortOrder = 'asc' | 'desc'

export interface ConversationSort {
  sortBy: ConversationSortBy
  order: ConversationSortOrder
}

/**
 * 대화 통계
 */
export interface ConversationStats {
  /** 전체 대화 수 */
  total: number
  /** 코드 생성된 대화 수 */
  withCode: number
  /** 메뉴로 변환된 대화 수 */
  withMenu: number
  /** 수동 저장된 대화 수 */
  saved: number
  /** 즐겨찾기 대화 수 */
  favorites: number
}
