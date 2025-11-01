/**
 * PRD (Product Requirements Document) 타입 정의
 */

/** PRD 입력 방식 */
export type PrdInputMethod = 'file' | 'idea' | 'form' | 'skip'

/** AI 모델 선택 */
export type AiModel = 'claude' | 'gemini' | 'none'

/** PRD 파일 업로드 정보 */
export interface PrdFileUpload {
  file: File
  content?: string
}

/** PRD 아이디어 입력 */
export interface PrdIdeaInput {
  idea: string
  generatedPrd?: string
}

/** PRD 폼 데이터 */
export interface PrdFormData {
  /** 프로젝트 목적 */
  purpose: string
  /** 배경 및 문제 정의 */
  background?: string
  /** 주요 기능 목록 */
  features: string[]
  /** 타겟 사용자 */
  targetUsers: string
  /** 기술 스택 */
  techStack: string[]
  /** 성공 지표 */
  successMetrics?: string
  /** 제약사항 */
  constraints?: string
}

/** PRD 옵션 (프로젝트 생성 시 전달) */
export interface PrdOptions {
  method: PrdInputMethod
  aiModel?: AiModel
  fileUpload?: PrdFileUpload
  ideaInput?: PrdIdeaInput
  formData?: PrdFormData
}

/** PRD 문서 구조 */
export interface PrdDocument {
  /** 프로젝트명 */
  projectName: string
  /** 작성일 */
  createdAt: string
  /** 프로젝트 목적 */
  purpose: string
  /** 배경 및 문제 정의 */
  background: string
  /** 주요 기능 */
  features: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }[]
  /** 타겟 사용자 */
  targetUsers: {
    persona: string
    needs: string[]
  }[]
  /** 기술 스택 */
  techStack: {
    category: string
    technologies: string[]
  }[]
  /** 성공 지표 */
  successMetrics: string[]
  /** 제약사항 */
  constraints: string[]
  /** 일정 */
  timeline?: {
    phase: string
    duration: string
    deliverables: string[]
  }[]
}

/** PRD 생성 요청 */
export interface GeneratePrdRequest {
  projectName: string
  projectType: string
  idea: string
}

/** PRD 생성 응답 */
export interface GeneratePrdResponse {
  success: boolean
  prd?: string
  error?: string
}

/** PRD 파싱 결과 */
export interface ParsedPrd {
  success: boolean
  document?: PrdDocument
  rawContent?: string
  error?: string
}

/** AI PRD 생성 요청 */
export interface AiPrdGenerationRequest {
  model: AiModel
  projectName: string
  projectType: string
  input: string | PrdFormData
  inputType: 'idea' | 'form'
}

/** AI PRD 생성 응답 */
export interface AiPrdGenerationResponse {
  success: boolean
  prd?: string
  model: AiModel
  error?: string
  tokensUsed?: number
  fallbackToTemplate?: boolean
}
