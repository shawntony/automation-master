/**
 * Unified Workflow Type Definitions
 *
 * Combines project creation (steps 1-3) with development workflow (steps 4-13)
 * for a seamless 13-step project creation and development experience.
 */

import type { PrdOptions } from './prd'

/**
 * Project types supported by the unified workflow
 */
export type ProjectType = 'fullstack' | 'frontend' | 'backend' | 'automation'

/**
 * PRD input methods
 */
export type PrdMethod = 'file' | 'idea' | 'form' | 'skip'

/**
 * Step status tracking
 */
export type StepStatus = 'completed' | 'in-progress' | 'pending' | 'skipped'

/**
 * Main state interface for the unified 13-step workflow
 */
export interface UnifiedWorkflowState {
  // ========== Project Creation (Steps 1-3) ==========

  /** Step 1: Project name */
  projectName: string

  /** Step 1: Project type selection */
  projectType: ProjectType

  /** Step 2: PRD method selection */
  prdMethod: PrdMethod

  /** Step 2: PRD options based on selected method */
  prdOptions: PrdOptions

  // ========== Creation Results ==========

  /** Project path after creation: C:\Users\gram\myautomation\{projectName} */
  projectPath?: string

  /** PRD file path if created */
  prdPath?: string

  /** Timestamp of project creation */
  createdAt?: string

  /** Files generated during creation */
  generatedFiles?: string[]

  // ========== Workflow (Steps 4-13) ==========

  /** Current step in the 13-step workflow (1-13) */
  currentStep: number

  /** Data collected for each step */
  stepData: Record<number, StepData>

  /** Generated Claude Code prompts for each step */
  prompts: Record<number, string>

  /** Step completion status */
  stepStatus: Record<number, StepStatusInfo>
}

/**
 * Information about each step's status
 */
export interface StepStatusInfo {
  /** Current status of this step */
  status: StepStatus

  /** When the step was started */
  startedAt?: string

  /** When the step was completed */
  completedAt?: string

  /** Optional notes or errors */
  notes?: string
}

/**
 * Data structure for workflow steps (steps 4-13)
 */
export interface StepData {
  /** Step 4: 아이디어 발굴 및 정의 */
  ideaDefinition?: {
    problem: string
    solution: string
    targetUsers: string
    keyFeatures: string[]
  }

  /** Step 5: PRD 작성 (if not done in step 2) */
  prdCreation?: {
    purpose: string
    background: string
    features: string[]
    techStack: string[]
  }

  /** Step 6: 시스템 기획서 작성 */
  systemDesign?: {
    architecture: string
    components: string[]
    dataFlow: string
    apiDesign: string
  }

  /** Step 7: Supabase 스키마 설계 */
  supabaseSchema?: {
    tables: string[]
    relationships: string
    rlsPolicies: string
    indexes: string
  }

  /** Step 8: 프론트엔드 설계 */
  frontendDesign?: {
    pages: string[]
    components: string[]
    routing: string
    stateManagement: string
  }

  /** Step 9: 백엔드 API 설계 */
  backendApi?: {
    endpoints: string[]
    authentication: string
    middleware: string
    errorHandling: string
  }

  /** Step 10: 데이터 플로우 설계 */
  dataFlow?: {
    clientToServer: string
    serverToDatabase: string
    realtime: string
    caching: string
  }

  /** Step 11: 보안 및 인증 */
  security?: {
    authMethod: string
    roleBasedAccess: string
    dataEncryption: string
    apiSecurity: string
  }

  /** Step 12: 테스트 전략 */
  testing?: {
    unitTests: string
    integrationTests: string
    e2eTests: string
    testCoverage: string
  }

  /** Step 13: 배포 및 모니터링 */
  deployment?: {
    platform: string
    cicd: string
    monitoring: string
    logging: string
  }
}

/**
 * Extended progress.json schema for unified workflow
 *
 * This is the structure that gets saved to config/progress.json
 */
export interface ProgressJson {
  // ========== Project Metadata ==========

  /** Project name */
  projectName: string

  /** Project type */
  projectType: ProjectType

  /** Absolute project path */
  projectPath: string

  /** PRD method used */
  prdMethod: PrdMethod

  /** PRD file path if created */
  prdPath?: string

  /** Path to agents guide */
  agentsGuide: string

  /** Path to global agents directory */
  globalAgents: string

  /** Project creation timestamp */
  createdAt: string

  /** Last updated timestamp */
  updatedAt: string

  // ========== Workflow Progress ==========

  /** Current step (1-13) */
  currentStep: number

  /** Status of all steps */
  steps: Record<number, StepStatusInfo>

  /** Generated prompts for each step */
  prompts: Record<number, string>

  /** Collected data for each step */
  stepData: Record<number, any>

  // ========== Statistics ==========

  /** Total steps completed */
  completedSteps: number

  /** Progress percentage (0-100) */
  progressPercentage: number

  /** Workflow completion status */
  workflowCompleted: boolean
}

/**
 * Workflow step definition
 */
export interface WorkflowStep {
  /** Step number (1-13) */
  id: number

  /** Step title */
  title: string

  /** Step category (creation | workflow) */
  category: 'creation' | 'workflow'

  /** Estimated duration */
  duration: string

  /** Step description */
  description: string

  /** Required fields for this step */
  requiredFields?: string[]

  /** Optional: MCP tools needed */
  mcpTools?: string[]

  /** Optional: Related agents */
  relatedAgents?: string[]
}

/**
 * Complete workflow definition (13 steps)
 */
export const UNIFIED_WORKFLOW_STEPS: WorkflowStep[] = [
  // ========== Creation Steps (1-3) ==========
  {
    id: 1,
    title: '프로젝트 기본 정보',
    category: 'creation',
    duration: '5분',
    description: '프로젝트 이름과 타입을 선택합니다',
    requiredFields: ['projectName', 'projectType']
  },
  {
    id: 2,
    title: 'PRD 입력 방식 선택',
    category: 'creation',
    duration: '10-30분',
    description: 'PRD 문서를 생성하거나 업로드합니다 (4가지 방법)',
    requiredFields: ['prdMethod', 'prdOptions']
  },
  {
    id: 3,
    title: '프로젝트 생성 확인',
    category: 'creation',
    duration: '1분',
    description: '설정을 확인하고 프로젝트를 생성합니다',
    requiredFields: ['projectName', 'projectType', 'prdOptions']
  },

  // ========== Workflow Steps (4-13) ==========
  {
    id: 4,
    title: '아이디어 발굴 및 정의',
    category: 'workflow',
    duration: '1-2주',
    description: '문제 정의, 해결 방안, 타겟 사용자 명확화',
    relatedAgents: ['task-decomposition-expert']
  },
  {
    id: 5,
    title: 'PRD 작성',
    category: 'workflow',
    duration: '3-5일',
    description: '상세 요구사항 문서 작성 (Step 2에서 완료했다면 스킵)',
  },
  {
    id: 6,
    title: '시스템 기획서 작성',
    category: 'workflow',
    duration: '1주',
    description: '아키텍처, 컴포넌트, 데이터 플로우 설계',
    relatedAgents: ['task-decomposition-expert']
  },
  {
    id: 7,
    title: 'Supabase 스키마 설계',
    category: 'workflow',
    duration: '3-5일',
    description: '데이터베이스 테이블, 관계, RLS 정책 설계',
    relatedAgents: ['supabase-schema-architect'],
    mcpTools: ['supabase']
  },
  {
    id: 8,
    title: '프론트엔드 설계',
    category: 'workflow',
    duration: '1주',
    description: '페이지 구조, 컴포넌트, 라우팅, 상태 관리',
    mcpTools: ['context7', 'magic']
  },
  {
    id: 9,
    title: '백엔드 API 설계',
    category: 'workflow',
    duration: '1주',
    description: 'API 엔드포인트, 인증, 미들웨어 설계',
    mcpTools: ['context7']
  },
  {
    id: 10,
    title: '데이터 플로우 설계',
    category: 'workflow',
    duration: '3-5일',
    description: '클라이언트-서버-DB 간 데이터 흐름 정의',
  },
  {
    id: 11,
    title: '보안 및 인증',
    category: 'workflow',
    duration: '1주',
    description: '인증 방식, 권한 관리, 데이터 암호화',
    relatedAgents: ['supabase-schema-architect']
  },
  {
    id: 12,
    title: '테스트 전략',
    category: 'workflow',
    duration: '1주',
    description: '단위/통합/E2E 테스트 계획',
    mcpTools: ['playwright']
  },
  {
    id: 13,
    title: '배포 및 모니터링',
    category: 'workflow',
    duration: '3-5일',
    description: '배포 플랫폼, CI/CD, 모니터링 설정',
  }
]

/**
 * API request/response types
 */

export interface CreateProjectResponse {
  success: boolean
  projectPath?: string
  prdPath?: string
  structurePath?: string
  filesCreated?: number
  message?: string
}

export interface UpdateProgressRequest {
  projectPath: string
  currentStep: number
  stepStatus: StepStatusInfo
  stepData?: any
  prompt?: string
}

export interface UpdateProgressResponse {
  success: boolean
  progressData?: ProgressJson
  message?: string
}
