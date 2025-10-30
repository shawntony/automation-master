/**
 * 코드 메뉴 저장소
 * LocalStorage를 사용한 코드 메뉴 및 버전 관리
 */

import type {
  CodeMenuItem,
  CodeVersion,
  CodeStatus,
  CodeMenuFilter,
  CodeMenuSort,
  CodeMenuTreeNode
} from '@/types/code-menu'

const STORAGE_KEY = 'ssa_code_menus'

/**
 * 모든 코드 메뉴 가져오기
 */
export function getCodeMenus(): CodeMenuItem[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []

    const menus = JSON.parse(data)
    // Date 객체 복원
    return menus.map((menu: any) => ({
      ...menu,
      createdAt: new Date(menu.createdAt),
      updatedAt: new Date(menu.updatedAt),
      versions: menu.versions.map((ver: any) => ({
        ...ver,
        createdAt: new Date(ver.createdAt),
        updatedAt: new Date(ver.updatedAt)
      }))
    }))
  } catch (error) {
    console.error('Failed to load code menus:', error)
    return []
  }
}

/**
 * 코드 메뉴 저장
 */
export function saveCodeMenus(menus: CodeMenuItem[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus))
  } catch (error) {
    console.error('Failed to save code menus:', error)
    throw new Error('코드 메뉴 저장에 실패했습니다.')
  }
}

/**
 * 새 코드 메뉴 생성
 */
export function createCodeMenu(
  menuName: string,
  description: string,
  initialCode?: string,
  options: {
    category?: string
    status?: CodeStatus
    versionName?: string
  } = {}
): CodeMenuItem {
  const now = new Date()
  const menuId = `menu_${now.getTime()}_${Math.random().toString(36).substring(2, 9)}`

  // 초기 버전 생성
  const initialVersion: CodeVersion = {
    id: `ver_${now.getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    versionName: options.versionName || 'v1',
    code: initialCode || '',
    status: options.status || 'draft',
    isActive: true,
    createdAt: now,
    updatedAt: now
  }

  const menu: CodeMenuItem = {
    id: menuId,
    menuName,
    category: options.category,
    description,
    versions: [initialVersion],
    isFavorite: false,
    createdAt: now,
    updatedAt: now
  }

  const menus = getCodeMenus()
  menus.unshift(menu) // 최신순으로 추가
  saveCodeMenus(menus)

  return menu
}

/**
 * 코드 메뉴 업데이트
 */
export function updateCodeMenu(
  menuId: string,
  updates: Partial<Omit<CodeMenuItem, 'id' | 'versions' | 'createdAt'>>
): CodeMenuItem | null {
  const menus = getCodeMenus()
  const index = menus.findIndex(m => m.id === menuId)

  if (index === -1) {
    console.error('Code menu not found:', menuId)
    return null
  }

  menus[index] = {
    ...menus[index],
    ...updates,
    updatedAt: new Date()
  }

  saveCodeMenus(menus)
  return menus[index]
}

/**
 * 코드 메뉴 삭제
 */
export function deleteCodeMenu(menuId: string): boolean {
  const menus = getCodeMenus()
  const filtered = menus.filter(m => m.id !== menuId)

  if (filtered.length === menus.length) {
    console.error('Code menu not found:', menuId)
    return false
  }

  saveCodeMenus(filtered)
  return true
}

/**
 * 코드 메뉴 ID로 조회
 */
export function getCodeMenuById(menuId: string): CodeMenuItem | null {
  const menus = getCodeMenus()
  return menus.find(m => m.id === menuId) || null
}

/**
 * 새 코드 버전 추가
 */
export function addCodeVersion(
  menuId: string,
  code: string,
  options: {
    versionName?: string
    description?: string
    status?: CodeStatus
    setAsActive?: boolean
  } = {}
): CodeVersion | null {
  const menus = getCodeMenus()
  const menu = menus.find(m => m.id === menuId)

  if (!menu) {
    console.error('Code menu not found:', menuId)
    return null
  }

  const now = new Date()
  const versionNumber = menu.versions.length + 1

  const newVersion: CodeVersion = {
    id: `ver_${now.getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    versionName: options.versionName || `v${versionNumber}`,
    code,
    description: options.description,
    status: options.status || 'draft',
    isActive: options.setAsActive ?? false,
    createdAt: now,
    updatedAt: now
  }

  // 새 버전을 활성화하는 경우 기존 활성 버전 비활성화
  if (newVersion.isActive) {
    menu.versions.forEach(v => v.isActive = false)
  }

  menu.versions.unshift(newVersion) // 최신순으로 추가
  menu.updatedAt = now

  saveCodeMenus(menus)
  return newVersion
}

/**
 * 코드 버전 업데이트
 */
export function updateCodeVersion(
  menuId: string,
  versionId: string,
  updates: Partial<Omit<CodeVersion, 'id' | 'createdAt'>>
): CodeVersion | null {
  const menus = getCodeMenus()
  const menu = menus.find(m => m.id === menuId)

  if (!menu) {
    console.error('Code menu not found:', menuId)
    return null
  }

  const version = menu.versions.find(v => v.id === versionId)
  if (!version) {
    console.error('Code version not found:', versionId)
    return null
  }

  // 활성 버전 변경 시 기존 활성 버전 비활성화
  if (updates.isActive === true) {
    menu.versions.forEach(v => v.isActive = false)
  }

  Object.assign(version, updates, { updatedAt: new Date() })
  menu.updatedAt = new Date()

  saveCodeMenus(menus)
  return version
}

/**
 * 코드 버전 삭제
 */
export function deleteCodeVersion(menuId: string, versionId: string): boolean {
  const menus = getCodeMenus()
  const menu = menus.find(m => m.id === menuId)

  if (!menu) {
    console.error('Code menu not found:', menuId)
    return false
  }

  const initialLength = menu.versions.length
  menu.versions = menu.versions.filter(v => v.id !== versionId)

  if (menu.versions.length === initialLength) {
    console.error('Code version not found:', versionId)
    return false
  }

  // 삭제된 버전이 활성 버전이었고 다른 버전이 남아있는 경우
  if (menu.versions.length > 0 && !menu.versions.some(v => v.isActive)) {
    menu.versions[0].isActive = true // 최신 버전을 활성화
  }

  menu.updatedAt = new Date()
  saveCodeMenus(menus)
  return true
}

/**
 * 활성 코드 버전 변경
 */
export function setActiveVersion(menuId: string, versionId: string): boolean {
  const menus = getCodeMenus()
  const menu = menus.find(m => m.id === menuId)

  if (!menu) {
    console.error('Code menu not found:', menuId)
    return false
  }

  const version = menu.versions.find(v => v.id === versionId)
  if (!version) {
    console.error('Code version not found:', versionId)
    return false
  }

  menu.versions.forEach(v => v.isActive = v.id === versionId)
  menu.updatedAt = new Date()

  saveCodeMenus(menus)
  return true
}

/**
 * 활성 버전 가져오기
 */
export function getActiveVersion(menuId: string): CodeVersion | null {
  const menu = getCodeMenuById(menuId)
  if (!menu) return null

  return menu.versions.find(v => v.isActive) || null
}

/**
 * 코드 메뉴 필터링
 */
export function filterCodeMenus(filter: CodeMenuFilter): CodeMenuItem[] {
  let menus = getCodeMenus()

  // 카테고리 필터
  if (filter.category) {
    menus = menus.filter(m => m.category === filter.category)
  }

  // 상태 필터
  if (filter.status) {
    menus = menus.filter(m =>
      m.versions.some(v => v.status === filter.status)
    )
  }

  // 검색어 필터
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase()
    menus = menus.filter(m =>
      m.menuName.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query)
    )
  }

  // 즐겨찾기 필터
  if (filter.favoritesOnly) {
    menus = menus.filter(m => m.isFavorite)
  }

  return menus
}

/**
 * 코드 메뉴 정렬
 */
export function sortCodeMenus(
  menus: CodeMenuItem[],
  sort: CodeMenuSort
): CodeMenuItem[] {
  const sorted = [...menus]

  sorted.sort((a, b) => {
    let compareValue = 0

    switch (sort.sortBy) {
      case 'menuName':
        compareValue = a.menuName.localeCompare(b.menuName)
        break
      case 'createdAt':
        compareValue = a.createdAt.getTime() - b.createdAt.getTime()
        break
      case 'updatedAt':
        compareValue = a.updatedAt.getTime() - b.updatedAt.getTime()
        break
      case 'category':
        compareValue = (a.category || '').localeCompare(b.category || '')
        break
    }

    return sort.order === 'asc' ? compareValue : -compareValue
  })

  return sorted
}

/**
 * 트리 뷰 데이터 생성
 */
export function buildCodeMenuTree(menus: CodeMenuItem[]): CodeMenuTreeNode[] {
  const tree: CodeMenuTreeNode[] = []
  const categoryMap = new Map<string, CodeMenuTreeNode>()

  // 카테고리별로 그룹화
  menus.forEach(menu => {
    const categoryName = menu.category || '미분류'

    // 카테고리 노드가 없으면 생성
    if (!categoryMap.has(categoryName)) {
      const categoryNode: CodeMenuTreeNode = {
        id: `cat_${categoryName}`,
        type: 'category',
        label: categoryName,
        children: [],
        isExpanded: false
      }
      categoryMap.set(categoryName, categoryNode)
      tree.push(categoryNode)
    }

    // 메뉴 노드 생성
    const menuNode: CodeMenuTreeNode = {
      id: menu.id,
      type: 'menu',
      label: menu.menuName,
      menuData: menu,
      isExpanded: false
    }

    categoryMap.get(categoryName)!.children!.push(menuNode)
  })

  // 카테고리를 알파벳순으로 정렬
  tree.sort((a, b) => a.label.localeCompare(b.label))

  // 각 카테고리 내의 메뉴도 정렬
  tree.forEach(categoryNode => {
    categoryNode.children?.sort((a, b) => a.label.localeCompare(b.label))
  })

  return tree
}

/**
 * 카테고리 목록 가져오기
 */
export function getCategories(): string[] {
  const menus = getCodeMenus()
  const categories = new Set<string>()

  menus.forEach(menu => {
    if (menu.category) {
      categories.add(menu.category)
    }
  })

  return Array.from(categories).sort()
}

/**
 * 코드 상태 변경 (draft ↔ final)
 */
export function toggleCodeStatus(
  menuId: string,
  versionId: string
): CodeVersion | null {
  const menu = getCodeMenuById(menuId)
  if (!menu) return null

  const version = menu.versions.find(v => v.id === versionId)
  if (!version) return null

  const newStatus: CodeStatus = version.status === 'draft' ? 'final' : 'draft'

  return updateCodeVersion(menuId, versionId, { status: newStatus })
}

/**
 * 통계 정보
 */
export function getCodeMenuStats() {
  const menus = getCodeMenus()

  return {
    totalMenus: menus.length,
    totalVersions: menus.reduce((sum, menu) => sum + menu.versions.length, 0),
    draftVersions: menus.reduce(
      (sum, menu) => sum + menu.versions.filter(v => v.status === 'draft').length,
      0
    ),
    finalVersions: menus.reduce(
      (sum, menu) => sum + menu.versions.filter(v => v.status === 'final').length,
      0
    ),
    favoriteMenus: menus.filter(m => m.isFavorite).length,
    categories: getCategories().length
  }
}
