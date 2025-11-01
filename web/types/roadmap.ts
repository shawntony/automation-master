/**
 * Data Cleaning Roadmap Type Definitions
 *
 * 데이터 정리 로드맵 및 위자드를 위한 타입 정의
 */

/**
 * 로드맵 단계의 상태
 */
export type RoadmapStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

/**
 * 로드맵 단계의 우선순위
 */
export type RoadmapPriority = 'critical' | 'high' | 'medium' | 'low'

/**
 * 로드맵 단계 유형
 */
export type RoadmapStepType =
  | 'data_cleaning'      // 데이터 정리
  | 'formula_conversion' // 수식 변환
  | 'automation'         // 자동화
  | 'validation'         // 데이터 검증

/**
 * 개별 로드맵 단계
 */
export interface RoadmapStep {
  /** 단계 고유 ID */
  id: string

  /** 단계 제목 */
  title: string

  /** 단계 설명 */
  description: string

  /** 단계 유형 */
  type: RoadmapStepType

  /** 우선순위 */
  priority: RoadmapPriority

  /** 현재 상태 */
  status: RoadmapStepStatus

  /** 예상 소요 시간 (분) */
  estimatedMinutes: number

  /** 이 단계의 영향을 받는 시트 목록 */
  affectedSheets: string[]

  /** 이 단계 전에 완료해야 하는 단계 ID 목록 */
  dependencies: string[]

  /** AI가 생성한 구체적인 작업 지침 */
  actionInstructions: string[]

  /** 예상되는 결과 */
  expectedOutcome: string

  /** 주의사항 */
  warnings?: string[]

  /** 이 단계를 위해 생성할 수 있는 코드 타입 */
  codeGenerationHint?: string
}

/**
 * 전체 데이터 정리 로드맵
 */
export interface DataCleaningRoadmap {
  /** 로드맵 생성 시간 */
  createdAt: string

  /** 분석한 스프레드시트 ID */
  spreadsheetId: string

  /** 스프레드시트 제목 */
  spreadsheetTitle: string

  /** AI가 생성한 전체 요약 */
  summary: string

  /** 전체 예상 소요 시간 (분) */
  totalEstimatedMinutes: number

  /** 로드맵 단계들 */
  steps: RoadmapStep[]

  /** 감지된 주요 문제점 */
  detectedIssues: {
    /** 문제 카테고리 */
    category: string
    /** 문제 설명 */
    description: string
    /** 영향도 */
    severity: 'critical' | 'high' | 'medium' | 'low'
    /** 영향받는 시트 */
    affectedSheets: string[]
  }[]

  /** 전체적인 추천사항 */
  recommendations: string[]
}

/**
 * 로드맵 생성 API 요청
 */
export interface RoadmapRequest {
  /** 분석 결과 (analyze API의 응답) */
  analysisResult: any // TODO: 더 구체적인 타입으로 개선 가능

  /** 사용자가 지정한 우선순위 (선택사항) */
  userPriorities?: {
    /** 중요하게 생각하는 작업 유형 */
    focusAreas?: RoadmapStepType[]
    /** 특정 시트에만 집중 */
    targetSheets?: string[]
  }
}

/**
 * 로드맵 생성 API 응답
 */
export interface RoadmapResponse {
  /** 성공 여부 */
  success: boolean

  /** 생성된 로드맵 */
  roadmap?: DataCleaningRoadmap

  /** 에러 메시지 */
  error?: string
}

/**
 * 위자드 진행 상태
 */
export interface WizardState {
  /** 현재 진행 중인 단계 ID */
  currentStepId: string | null

  /** 완료된 단계 ID 목록 */
  completedSteps: string[]

  /** 건너뛴 단계 ID 목록 */
  skippedSteps: string[]

  /** 위자드 시작 시간 */
  startedAt?: string

  /** 위자드 완료 시간 */
  completedAt?: string

  /** 각 단계별 노트 */
  stepNotes: Record<string, string>
}

/**
 * 위자드 단계 완료 요청
 */
export interface CompleteStepRequest {
  /** 완료할 단계 ID */
  stepId: string

  /** 사용자 노트 */
  notes?: string

  /** 실제 소요 시간 (분) */
  actualMinutes?: number

  /** 단계 상태 (completed 또는 skipped) */
  status: 'completed' | 'skipped'
}

/**
 * 생성된 코드 정보
 */
export interface GeneratedCode {
  /** 코드 고유 ID */
  id: string

  /** 코드 제목 */
  title: string

  /** 코드 설명 */
  description: string

  /** 생성된 Apps Script 코드 */
  code: string

  /** 코드 타입 */
  type: RoadmapStepType

  /** 생성 시간 */
  createdAt: string

  /** 사용자의 자연어 요청 */
  userRequest: string

  /** 관련 시트 */
  targetSheets: string[]

  /** 실행 가능 여부 */
  executable: boolean

  /** 저장 여부 */
  saved: boolean
}

/**
 * 코드 생성 요청
 */
export interface CodeGenerationRequest {
  /** 사용자의 자연어 요청 (예: "중복된 행 제거해줘") */
  userRequest: string

  /** 스프레드시트 분석 결과 (컨텍스트 제공) */
  analysisResult: any

  /** 대상 시트 (선택사항) */
  targetSheets?: string[]

  /** 관련 로드맵 단계 (선택사항) */
  relatedStepId?: string
}

/**
 * 코드 생성 응답
 */
export interface CodeGenerationResponse {
  /** 성공 여부 */
  success: boolean

  /** 생성된 코드 */
  code?: GeneratedCode

  /** 에러 메시지 */
  error?: string

  /** AI의 추가 설명 */
  explanation?: string
}

/**
 * 코드 라이브러리 아이템
 */
export interface CodeLibraryItem {
  /** 아이템 ID */
  id: string

  /** 코드 정보 */
  code: GeneratedCode

  /** 카테고리 */
  category: string

  /** 태그 */
  tags: string[]

  /** 사용 횟수 */
  usageCount: number

  /** 마지막 사용 시간 */
  lastUsedAt?: string

  /** 즐겨찾기 여부 */
  favorite: boolean
}

/**
 * 코드 실행 요청
 */
export interface CodeExecutionRequest {
  /** 실행할 코드 */
  code: string

  /** 코드 ID (선택사항) */
  codeId?: string

  /** 대상 스프레드시트 ID */
  spreadsheetId: string

  /** 대상 시트 이름들 */
  targetSheets: string[]

  /** 시뮬레이션 모드 (실제로 변경하지 않고 미리보기만) */
  simulationMode?: boolean
}

/**
 * 코드 실행 결과
 */
export interface CodeExecutionResult {
  /** 성공 여부 */
  success: boolean

  /** 실행 ID */
  executionId: string

  /** 실행 시간 */
  executedAt: string

  /** 영향받은 시트별 변경 사항 */
  changes: {
    /** 시트 이름 */
    sheetName: string

    /** 변경 전 데이터 (샘플) */
    before: any[][]

    /** 변경 후 데이터 (샘플) */
    after: any[][]

    /** 변경된 행 수 */
    rowsAffected: number

    /** 변경된 열 수 */
    columnsAffected: number

    /** 삭제된 행 수 */
    rowsDeleted?: number

    /** 삭제된 열 수 */
    columnsDeleted?: number
  }[]

  /** 실행 로그 */
  logs: string[]

  /** 에러 메시지 */
  error?: string

  /** 실행 시간 (밀리초) */
  executionTimeMs: number
}

/**
 * 코드 실행 응답
 */
export interface CodeExecutionResponse {
  /** 성공 여부 */
  success: boolean

  /** 실행 결과 */
  result?: CodeExecutionResult

  /** 에러 메시지 */
  error?: string
}

/**
 * 코드 라이브러리 필터 옵션
 */
export interface CodeLibraryFilter {
  /** 카테고리 필터 */
  category?: string

  /** 태그 필터 */
  tags?: string[]

  /** 코드 타입 필터 */
  type?: RoadmapStepType

  /** 즐겨찾기만 보기 */
  favoriteOnly?: boolean

  /** 검색 키워드 */
  searchQuery?: string

  /** 정렬 기준 */
  sortBy?: 'createdAt' | 'usageCount' | 'lastUsedAt' | 'title'

  /** 정렬 방향 */
  sortOrder?: 'asc' | 'desc'
}

/**
 * 코드 라이브러리 API 요청
 */
export interface CodeLibraryRequest {
  /** 액션 타입 */
  action: 'list' | 'get' | 'save' | 'update' | 'delete'

  /** 코드 ID (get, update, delete에 필요) */
  id?: string

  /** 저장할 코드 (save에 필요) */
  code?: GeneratedCode

  /** 업데이트할 필드 (update에 필요) */
  updates?: Partial<CodeLibraryItem>

  /** 필터 옵션 (list에 필요) */
  filter?: CodeLibraryFilter
}

/**
 * 코드 라이브러리 API 응답
 */
export interface CodeLibraryResponse {
  /** 성공 여부 */
  success: boolean

  /** 단일 아이템 (get, save, update) */
  item?: CodeLibraryItem

  /** 아이템 목록 (list) */
  items?: CodeLibraryItem[]

  /** 전체 개수 */
  total?: number

  /** 에러 메시지 */
  error?: string
}
