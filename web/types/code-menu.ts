/**
 * 코드 메뉴 시스템 타입 정의
 * 메뉴 기반 코드 관리 및 버전 추적
 */

/**
 * 코드 버전 상태
 * - draft: 초안 (작업 중, 임시 저장)
 * - final: 완성 (검증 완료, 라이브러리 저장 가능)
 */
export type CodeStatus = 'draft' | 'final'

/**
 * 개별 코드 버전
 */
export interface CodeVersion {
  /** 버전 고유 ID */
  id: string
  /** 버전 이름 (예: v1, v2, "초안", "최종") */
  versionName: string
  /** Apps Script 코드 */
  code: string
  /** 코드 설명 (선택) */
  description?: string
  /** 상태: 초안 또는 완성 */
  status: CodeStatus
  /** 현재 활성 버전 여부 */
  isActive: boolean
  /** 생성 일시 */
  createdAt: Date
  /** 수정 일시 */
  updatedAt: Date
}

/**
 * 코드 메뉴 아이템
 * 메뉴명 당 여러 버전을 가질 수 있음
 */
export interface CodeMenuItem {
  /** 메뉴 고유 ID */
  id: string
  /** 메뉴명 (예: "데이터 정리", "월간 리포트 생성") */
  menuName: string
  /** 카테고리/폴더 (선택, 계층 구조 지원) */
  category?: string
  /** 기능 설명 (자연어로 작성) */
  description: string
  /** 코드 버전 목록 (1:N 관계) */
  versions: CodeVersion[]
  /** 즐겨찾기 여부 */
  isFavorite: boolean
  /** 생성 일시 */
  createdAt: Date
  /** 수정 일시 */
  updatedAt: Date
}

/**
 * 코드 메뉴 필터 옵션
 */
export interface CodeMenuFilter {
  /** 카테고리 필터 */
  category?: string
  /** 상태 필터 */
  status?: CodeStatus
  /** 검색어 (메뉴명 또는 설명) */
  searchQuery?: string
  /** 즐겨찾기만 보기 */
  favoritesOnly?: boolean
}

/**
 * 코드 메뉴 정렬 옵션
 */
export type CodeMenuSortBy = 'menuName' | 'createdAt' | 'updatedAt' | 'category'
export type SortOrder = 'asc' | 'desc'

export interface CodeMenuSort {
  sortBy: CodeMenuSortBy
  order: SortOrder
}

/**
 * 트리 뷰 노드 (카테고리 계층 구조)
 */
export interface CodeMenuTreeNode {
  /** 노드 ID */
  id: string
  /** 노드 타입 */
  type: 'category' | 'menu'
  /** 카테고리명 또는 메뉴명 */
  label: string
  /** 카테고리인 경우 하위 노드, 메뉴인 경우 버전 목록 */
  children?: CodeMenuTreeNode[]
  /** 메뉴인 경우 실제 데이터 참조 */
  menuData?: CodeMenuItem
  /** 확장 상태 */
  isExpanded: boolean
}
