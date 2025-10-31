'use client'

import { useState, useEffect } from 'react'
import {
  FileCode,
  Star,
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  Copy,
  TrendingUp,
  Calendar,
  Filter,
  ArrowRight
} from 'lucide-react'
import type { CodeTemplate, TemplateFilter, TemplateSortOptions } from '@/types/code-template'
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementUsage,
  toggleFavorite,
  filterTemplates,
  sortTemplates,
  getCategories,
  getAllTags,
  getTemplateStats
} from '@/lib/template-storage'

interface TemplateBrowserProps {
  onSelectTemplate?: (template: CodeTemplate) => void
  onUseTemplate?: (code: string) => void
  onFillGenerator?: (template: CodeTemplate) => void
}

export function TemplateBrowser({ onSelectTemplate, onUseTemplate, onFillGenerator }: TemplateBrowserProps) {
  const [templates, setTemplates] = useState<CodeTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<CodeTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CodeTemplate | null>(null)

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [sortBy, setSortBy] = useState<TemplateSortOptions>({
    sortBy: 'usageCount',
    order: 'desc'
  })

  // 카테고리 및 태그
  const [categories, setCategories] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    code: '',
    tags: ''
  })

  useEffect(() => {
    loadTemplates()
    loadMetadata()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [templates, searchQuery, selectedCategory, selectedTags, favoriteOnly, sortBy])

  const loadTemplates = () => {
    const allTemplates = getTemplates()
    setTemplates(allTemplates)
  }

  const loadMetadata = () => {
    const cats = getCategories()
    setCategories(cats.map((c) => c.name))
    setAllTags(getAllTags())
  }

  const applyFiltersAndSort = () => {
    const filter: TemplateFilter = {
      category: selectedCategory || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      searchQuery: searchQuery || undefined,
      favoriteOnly
    }

    let filtered = filterTemplates(filter)
    filtered = sortTemplates(filtered, sortBy)
    setFilteredTemplates(filtered)
  }

  const handleCreateTemplate = () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('템플릿 이름과 코드를 입력해주세요.')
      return
    }

    const newTemplate = createTemplate(formData.name, formData.description, formData.code, {
      category: formData.category || '기타',
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : []
    })

    loadTemplates()
    loadMetadata()
    setShowCreateForm(false)
    setFormData({ name: '', description: '', category: '', code: '', tags: '' })
    setSelectedTemplate(newTemplate)
  }

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('템플릿 이름과 코드를 입력해주세요.')
      return
    }

    updateTemplate(editingTemplate.id, {
      name: formData.name,
      description: formData.description,
      category: formData.category || '기타',
      code: formData.code,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : []
    })

    loadTemplates()
    loadMetadata()
    setEditingTemplate(null)
    setFormData({ name: '', description: '', category: '', code: '', tags: '' })
  }

  const handleDeleteTemplate = (template: CodeTemplate) => {
    if (confirm(`"${template.name}" 템플릿을 삭제하시겠습니까?`)) {
      deleteTemplate(template.id)
      loadTemplates()
      loadMetadata()
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null)
      }
    }
  }

  const handleToggleFavorite = (template: CodeTemplate) => {
    toggleFavorite(template.id)
    loadTemplates()
  }

  const handleUseTemplate = (template: CodeTemplate) => {
    incrementUsage(template.id)
    loadTemplates()
    onUseTemplate?.(template.code)
    alert(`"${template.name}" 템플릿을 사용합니다!`)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('코드가 클립보드에 복사되었습니다!')
  }

  const startEdit = (template: CodeTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      code: template.code,
      tags: template.tags.join(', ')
    })
    setShowCreateForm(false)
  }

  const cancelForm = () => {
    setShowCreateForm(false)
    setEditingTemplate(null)
    setFormData({ name: '', description: '', category: '', code: '', tags: '' })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const stats = getTemplateStats()

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            코드 템플릿 라이브러리
          </h3>
          <div className="flex gap-4 text-xs text-gray-500 mt-1">
            <span>전체 {stats.total}개</span>
            <span>·</span>
            <span>즐겨찾기 {stats.favorites}개</span>
            <span>·</span>
            <span>카테고리 {stats.categories}개</span>
          </div>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true)
            setEditingTemplate(null)
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          새 템플릿
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="space-y-3">
        {/* 검색 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="템플릿 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 카테고리</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={`${sortBy.sortBy}-${sortBy.order}`}
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split('-')
              setSortBy({ sortBy: sortBy as any, order: order as any })
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="usageCount-desc">많이 사용됨</option>
            <option value="updatedAt-desc">최근 수정</option>
            <option value="createdAt-desc">최근 생성</option>
            <option value="name-asc">이름 (가나다)</option>
          </select>
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              favoriteOnly ? 'bg-yellow-50 border-yellow-300' : 'hover:bg-gray-50'
            }`}
            title="즐겨찾기만 보기"
          >
            <Star
              className={`h-4 w-4 ${
                favoriteOnly ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* 태그 필터 */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Tag className="h-3 w-3 inline mr-1" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 생성/수정 폼 */}
      {(showCreateForm || editingTemplate) && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <h4 className="font-medium">
            {editingTemplate ? '템플릿 수정' : '새 템플릿 만들기'}
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                템플릿 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 데이터 읽기"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="예: 데이터 처리"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                list="template-categories"
              />
              <datalist id="template-categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="이 템플릿이 무엇을 하는지 설명해주세요"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="예: 읽기, 시트, 기본"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              코드 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Apps Script 코드를 입력하세요"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={12}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              취소
            </button>
            <button
              onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {editingTemplate ? '수정' : '생성'}
            </button>
          </div>
        </div>
      )}

      {/* 템플릿 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchQuery || selectedCategory || selectedTags.length > 0
              ? '검색 결과가 없습니다.'
              : '아직 템플릿이 없습니다. 새 템플릿을 만들어보세요!'}
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer ${
                selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'bg-white'
              }`}
              onClick={() => {
                setSelectedTemplate(template)
                onSelectTemplate?.(template)
              }}
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{template.name}</h5>
                    {template.isFavorite && (
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{template.category}</span>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleFavorite(template)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="즐겨찾기"
                  >
                    <Star
                      className={`h-3 w-3 ${
                        template.isFavorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => startEdit(template)}
                    className="p-1 hover:bg-blue-100 rounded"
                    title="수정"
                  >
                    <Edit className="h-3 w-3 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template)}
                    className="p-1 hover:bg-red-100 rounded"
                    title="삭제"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </button>
                </div>
              </div>

              {/* 설명 */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

              {/* 태그 */}
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 메타 정보 */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  사용 {template.usageCount}회
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {template.updatedAt.toLocaleDateString('ko-KR')}
                </span>
              </div>

              {/* 액션 버튼 */}
               <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                  >
                    사용
                  </button>
                  {onFillGenerator && (
                    <button
                      onClick={() => onFillGenerator(template)}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                      title="코드 생성기에 채우기"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyCode(template.code)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                  title="코드 복사"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 선택된 템플릿 미리보기 */}
      {selectedTemplate && (
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-medium mb-2">코드 미리보기</h4>
          <div className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto">
            <pre className="text-sm">
              <code>{selectedTemplate.code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
