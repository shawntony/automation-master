/**
 * Migration System Types
 * 점진적 스프레드시트 변환 시스템의 타입 정의
 */

// ============================================
// 변환 모드
// ============================================

export type MigrationUIMode = 'wizard' | 'checklist' | 'dashboard'

export type MigrationErrorHandling = 'partial-rollback' | 'full-rollback' | 'manual-retry' | 'skip'

// ============================================
// 시트 상태
// ============================================

export type SheetMigrationStatus =
  | 'pending'        // 대기 중
  | 'preprocessing'  // 전처리 중
  | 'copying'        // 복사 중
  | 'transforming'   // 변환 중
  | 'validating'     // 검증 중
  | 'completed'      // 완료
  | 'failed'         // 실패
  | 'skipped'        // 건너뜀

export interface SheetMigrationState {
  sheetName: string
  status: SheetMigrationStatus
  progress: number // 0-100
  error?: {
    message: string
    code: string
    stack?: string
  }
  startTime?: number
  endTime?: number
  checkpointId?: string // 롤백용 체크포인트 ID
}

// ============================================
// 전처리 옵션
// ============================================

export interface PreprocessOptions {
  convertFormulasToValues: boolean  // 수식을 값으로 변환
  validateData: boolean              // 데이터 검증 및 정제
  standardizeNaming: boolean         // 명명 규칙 표준화
  remapReferences: boolean           // 참조 관계 재매핑
  removeEmptyRows: boolean           // 빈 행 제거
  removeEmptyColumns: boolean        // 빈 열 제거
  removeDuplicates: boolean          // 중복 제거
}

// ============================================
// 마이그레이션 설정
// ============================================

export interface MigrationConfig {
  sourceSpreadsheetId: string
  sourceSpreadsheetUrl: string
  targetSpreadsheetId?: string      // 생성 후 할당
  targetSpreadsheetUrl?: string     // 생성 후 할당

  uiMode: MigrationUIMode
  errorHandling: MigrationErrorHandling[]

  preprocessOptions: PreprocessOptions

  // 변환할 시트 선택 (null이면 전체)
  selectedSheets?: string[]

  // 의존성 순서 자동 결정 여부
  autoResolveDependencies: boolean
}

// ============================================
// 마이그레이션 상태
// ============================================

export interface MigrationState {
  id: string  // 마이그레이션 세션 ID
  config: MigrationConfig

  // 전체 진행 상황
  totalSheets: number
  completedSheets: number
  failedSheets: number
  skippedSheets: number

  // 시트별 상태
  sheets: Record<string, SheetMigrationState>

  // 의존성 그래프 (데이터 제공 방향)
  dependencyGraph: {
    nodes: string[]  // 시트 이름들
    edges: Array<{
      from: string  // 데이터 제공자
      to: string    // 데이터 사용자
    }>
  }

  // 변환 순서 (의존성 기반)
  migrationOrder: string[]

  // 체크포인트 (롤백용)
  checkpoints: Array<{
    id: string
    sheetName: string
    timestamp: number
    state: string  // 직렬화된 상태
  }>

  // 전체 상태
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'
  startTime?: number
  endTime?: number

  // 에러 로그
  errors: Array<{
    sheetName: string
    timestamp: number
    error: {
      message: string
      code: string
      stack?: string
    }
  }>
}

// ============================================
// API 요청/응답 타입
// ============================================

export interface CreateSheetRequest {
  title: string
  sourceSpreadsheetId: string
}

export interface CreateSheetResponse {
  spreadsheetId: string
  spreadsheetUrl: string
  success: boolean
  error?: string
}

export interface CopySheetRequest {
  sourceSpreadsheetId: string
  targetSpreadsheetId: string
  sheetName: string
  preprocessOptions: PreprocessOptions
}

export interface CopySheetResponse {
  success: boolean
  sheetName: string
  rowsCopied: number
  columnsCopied: number
  checkpointId: string
  error?: string
}

export interface ValidateSheetRequest {
  sourceSpreadsheetId: string
  targetSpreadsheetId: string
  sheetName: string
}

export interface ValidateSheetResponse {
  success: boolean
  sheetName: string
  dataMatches: boolean
  formulaMatches: boolean
  issues: Array<{
    type: 'data-mismatch' | 'formula-mismatch' | 'format-issue'
    location: string
    description: string
  }>
}

export interface RollbackRequest {
  migrationId: string
  type: 'partial' | 'full'
  sheetName?: string  // partial인 경우 필요
  checkpointId?: string
}

export interface RollbackResponse {
  success: boolean
  rolledBackSheets: string[]
  error?: string
}

// ============================================
// UI 컴포넌트 Props
// ============================================

export interface MigrationWizardProps {
  analysisResult: any  // 기존 분석 결과
  onComplete: (result: MigrationState) => void
  onCancel: () => void
}

export interface MigrationProgressProps {
  migrationState: MigrationState
  onPause: () => void
  onResume: () => void
  onCancel: () => void
}

export interface SheetListItemProps {
  sheet: SheetMigrationState
  onClick: () => void
  onRetry?: () => void
  onSkip?: () => void
}
