'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, Plus, Edit, Trash2, Star, FolderPlus, ChevronRight, ChevronDown, Download, Upload } from 'lucide-react'
import type { CodeMenuItem, CodeMenuTreeNode } from '@/types/code-menu'
import {
  getCodeMenus,
  createCodeMenu,
  updateCodeMenu,
  deleteCodeMenu,
  buildCodeMenuTree,
  getCategories
} from '@/lib/code-menu-storage'
import { exportMenus, importMenus } from '@/lib/export-import'

interface CodeMenuManagerProps {
  /** 메뉴 선택 시 콜백 */
  onSelectMenu?: (menu: CodeMenuItem) => void
  /** 초기 선택된 메뉴 ID */
  selectedMenuId?: string
}

export function CodeMenuManager({ onSelectMenu, selectedMenuId }: CodeMenuManagerProps) {
  const [menus, setMenus] = useState<CodeMenuItem[]>([])
  const [treeData, setTreeData] = useState<CodeMenuTreeNode[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState<CodeMenuItem | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 폼 상태
  const [formData, setFormData] = useState({
    menuName: '',
    description: '',
    category: ''
  })

  useEffect(() => {
    loadMenus()
  }, [])

  const loadMenus = () => {
    const allMenus = getCodeMenus()
    setMenus(allMenus)
    setTreeData(buildCodeMenuTree(allMenus))
    setCategories(getCategories())
  }

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  const handleCreateMenu = () => {
    if (!formData.menuName.trim() || !formData.description.trim()) {
      alert('메뉴명과 기능 설명을 입력해주세요.')
      return
    }

    const newMenu = createCodeMenu(
      formData.menuName,
      formData.description,
      '', // 초기 코드는 비어있음
      {
        category: formData.category || undefined,
        status: 'draft',
        versionName: 'v1'
      }
    )

    loadMenus()
    setShowCreateForm(false)
    setFormData({ menuName: '', description: '', category: '' })
    onSelectMenu?.(newMenu)
  }

  const handleUpdateMenu = () => {
    if (!editingMenu) return
    if (!formData.menuName.trim() || !formData.description.trim()) {
      alert('메뉴명과 기능 설명을 입력해주세요.')
      return
    }

    updateCodeMenu(editingMenu.id, {
      menuName: formData.menuName,
      description: formData.description,
      category: formData.category || undefined
    })

    loadMenus()
    setEditingMenu(null)
    setFormData({ menuName: '', description: '', category: '' })
  }

  const handleDeleteMenu = (menu: CodeMenuItem) => {
    if (confirm(`"${menu.menuName}" 메뉴를 삭제하시겠습니까?`)) {
      deleteCodeMenu(menu.id)
      loadMenus()
    }
  }

  const handleToggleFavorite = (menu: CodeMenuItem) => {
    updateCodeMenu(menu.id, {
      isFavorite: !menu.isFavorite
    })
    loadMenus()
  }

  const startEdit = (menu: CodeMenuItem) => {
    setEditingMenu(menu)
    setFormData({
      menuName: menu.menuName,
      description: menu.description,
      category: menu.category || ''
    })
    setShowCreateForm(false)
  }

  const cancelForm = () => {
    setShowCreateForm(false)
    setEditingMenu(null)
    setFormData({ menuName: '', description: '', category: '' })
  }

  const handleExport = () => {
    exportMenus()
    alert('메뉴를 내보냈습니다!')
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const result = await importMenus(file)
    alert(result.message)
    if (result.success) {
      loadMenus()
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const renderTreeNode = (node: CodeMenuTreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = node.menuData?.id === selectedMenuId
    const paddingLeft = `${depth * 1.5}rem`

    if (node.type === 'category') {
      return (
        <div key={node.id}>
          {/* 카테고리 노드 */}
          <div
            className="flex items-center gap-2 py-2 px-3 hover:bg-gray-100 cursor-pointer rounded"
            style={{ paddingLeft }}
            onClick={() => toggleNode(node.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <Menu className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-gray-700">{node.label}</span>
            <span className="text-xs text-gray-500">({node.children?.length || 0})</span>
          </div>

          {/* 하위 메뉴들 */}
          {isExpanded && node.children?.map((child) => renderTreeNode(child, depth + 1))}
        </div>
      )
    }

    // 메뉴 노드
    const menu = node.menuData!
    const activeVersion = menu.versions.find((v) => v.isActive)

    return (
      <div
        key={node.id}
        className={`flex items-center justify-between py-2 px-3 hover:bg-gray-100 cursor-pointer rounded ${
          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
        }`}
        style={{ paddingLeft }}
        onClick={() => onSelectMenu?.(menu)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {menu.isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{menu.menuName}</div>
            <div className="text-xs text-gray-500 truncate">{menu.description}</div>
            {activeVersion && (
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    activeVersion.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {activeVersion.status === 'draft' ? '초안' : '완성'}
                </span>
                <span className="text-xs text-gray-500">{activeVersion.versionName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleToggleFavorite(menu)}
            className="p-1 hover:bg-gray-200 rounded"
            title="즐겨찾기"
          >
            <Star
              className={`h-3 w-3 ${
                menu.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
              }`}
            />
          </button>
          <button
            onClick={() => startEdit(menu)}
            className="p-1 hover:bg-blue-100 rounded"
            title="수정"
          >
            <Edit className="h-3 w-3 text-blue-500" />
          </button>
          <button
            onClick={() => handleDeleteMenu(menu)}
            className="p-1 hover:bg-red-100 rounded"
            title="삭제"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Menu className="h-5 w-5" />
          코드 메뉴
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
            title="메뉴 내보내기"
          >
            <Download className="h-4 w-4" />
            내보내기
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
            title="메뉴 가져오기"
          >
            <Upload className="h-4 w-4" />
            가져오기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => {
              setShowCreateForm(true)
              setEditingMenu(null)
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            새 메뉴
          </button>
        </div>
      </div>

      {/* 생성/수정 폼 */}
      {(showCreateForm || editingMenu) && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <h4 className="font-medium">{editingMenu ? '메뉴 수정' : '새 메뉴 만들기'}</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메뉴명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.menuName}
              onChange={(e) => setFormData({ ...formData, menuName: e.target.value })}
              placeholder="예: 데이터 정리, 월간 리포트 생성"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              기능 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="이 코드가 수행하는 기능을 자연어로 설명해주세요"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="예: 데이터 처리, 리포트, 자동화"
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                list="categories"
              />
              <datalist id="categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              취소
            </button>
            <button
              onClick={editingMenu ? handleUpdateMenu : handleCreateMenu}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {editingMenu ? '수정' : '생성'}
            </button>
          </div>
        </div>
      )}

      {/* 트리 뷰 */}
      <div className="border rounded-lg max-h-96 overflow-y-auto">
        {treeData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 생성된 메뉴가 없습니다.
            <br />
            <span className="text-sm">위의 "새 메뉴" 버튼을 클릭하여 시작하세요.</span>
          </div>
        ) : (
          <div className="p-2">{treeData.map((node) => renderTreeNode(node))}</div>
        )}
      </div>

      {/* 통계 */}
      <div className="text-xs text-gray-500 flex gap-4">
        <span>전체 메뉴: {menus.length}</span>
        <span>카테고리: {categories.length}</span>
        <span>
          버전: {menus.reduce((sum, menu) => sum + menu.versions.length, 0)}
        </span>
      </div>
    </div>
  )
}
