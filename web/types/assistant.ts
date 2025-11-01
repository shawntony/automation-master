/**
 * AI Assistant Type Definitions
 *
 * 대화형 AI 어시스턴트를 위한 타입 정의
 */

/**
 * 채팅 메시지
 */
export interface ChatMessage {
  /** 메시지 고유 ID */
  id: string

  /** 역할 (사용자 또는 AI) */
  role: 'user' | 'assistant'

  /** 메시지 내용 */
  content: string

  /** 메시지 생성 시간 */
  timestamp: string

  /** 추가 메타데이터 */
  metadata?: {
    /** 액션 타입 */
    action?: 'question' | 'generate_code' | 'modify_code' | 'suggestion' | 'confirmation'
    /** 생성된 코드 ID */
    codeId?: string
    /** 제안 ID */
    suggestionId?: string
    /** 제안 수락 여부 */
    accepted?: boolean
  }
}

/**
 * 채팅 세션
 */
export interface ChatSession {
  /** 세션 고유 ID */
  sessionId: string

  /** 스프레드시트 ID */
  spreadsheetId: string

  /** 스프레드시트 제목 */
  spreadsheetTitle: string

  /** 분석 결과 (컨텍스트) */
  analysisResult: any

  /** 대화 메시지 목록 */
  messages: ChatMessage[]

  /** 세션 생성 시간 */
  createdAt: string

  /** 세션 마지막 업데이트 시간 */
  updatedAt: string

  /** 세션 요약 (선택사항) */
  summary?: string
}

/**
 * AI 제안
 */
export interface AISuggestion {
  /** 제안 고유 ID */
  id: string

  /** 제안 타입 */
  type: 'remove_duplicates' | 'remove_empty_rows' | 'remove_empty_columns' | 'format_dates' | 'convert_formulas' | 'data_validation' | 'custom'

  /** 제안 제목 */
  title: string

  /** 제안 설명 */
  description: string

  /** 우선순위 */
  priority: 'critical' | 'high' | 'medium' | 'low'

  /** 예상 효과 */
  estimatedImpact: {
    /** 영향받는 시트 */
    affectedSheets: string[]
    /** 제거될 행 수 */
    rowsToRemove?: number
    /** 제거될 열 수 */
    columnsToRemove?: number
    /** 변경될 셀 수 */
    cellsToModify?: number
    /** 예상 시간 절약 (분) */
    timeSaved?: number
  }

  /** 제안 수락 시 실행할 액션 */
  action: {
    /** 액션 타입 */
    type: 'generate_code' | 'apply_settings' | 'navigate'
    /** 액션 파라미터 */
    params?: Record<string, any>
  }

  /** 제안 생성 시간 */
  createdAt: string
}

/**
 * AI 채팅 요청
 */
export interface AssistantChatRequest {
  /** 세션 ID */
  sessionId: string

  /** 사용자 메시지 */
  userMessage: string

  /** 분석 결과 (컨텍스트) */
  analysisResult?: any

  /** 대화 히스토리 (최근 N개) */
  conversationHistory?: ChatMessage[]

  /** 추가 컨텍스트 */
  additionalContext?: {
    /** 현재 보고 있는 시트 */
    currentSheet?: string
    /** 최근 생성한 코드 */
    recentCode?: any
    /** 사용자 선호도 */
    preferences?: Record<string, any>
  }
}

/**
 * AI 채팅 응답
 */
export interface AssistantChatResponse {
  /** 성공 여부 */
  success: boolean

  /** AI 응답 메시지 */
  message?: ChatMessage

  /** 생성된 제안 목록 */
  suggestions?: AISuggestion[]

  /** 실행할 액션 */
  action?: {
    /** 액션 타입 */
    type: 'generate_code' | 'modify_code' | 'show_preview' | 'none'
    /** 액션 데이터 */
    data?: any
  }

  /** 에러 메시지 */
  error?: string
}

/**
 * 대화 내보내기 포맷
 */
export type ExportFormat = 'markdown' | 'text' | 'json'

/**
 * 대화 내보내기 옵션
 */
export interface ExportOptions {
  /** 포맷 */
  format: ExportFormat

  /** 분석 결과 포함 여부 */
  includeAnalysis?: boolean

  /** 타임스탬프 포함 여부 */
  includeTimestamps?: boolean

  /** 메타데이터 포함 여부 */
  includeMetadata?: boolean
}

/**
 * AI 의도 감지 결과
 */
export interface IntentDetectionResult {
  /** 주요 의도 */
  primaryIntent: 'question' | 'code_generation' | 'code_modification' | 'confirmation' | 'unclear'

  /** 신뢰도 (0-1) */
  confidence: number

  /** 추출된 파라미터 */
  parameters?: {
    /** 작업 타입 */
    taskType?: string
    /** 대상 시트 */
    targetSheets?: string[]
    /** 수정할 코드 ID */
    codeId?: string
    /** 추가 조건 */
    conditions?: string[]
  }

  /** 제안 가능한 후속 질문 */
  suggestedFollowUps?: string[]
}
