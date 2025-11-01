'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Star,
  Trash2,
  Copy,
  Download,
  Eye,
  Filter,
  BookOpen,
  Tag
} from 'lucide-react'
import type { CodeLibraryItem, CodeLibraryFilter } from '@/types/roadmap'
import { CodeLibraryStorage } from '@/lib/assistant/code-library-storage'

interface CodeLibraryBrowserProps {
  /** 코드 선택 콜백 */
  onSelectCode?: (item: CodeLibraryItem) => void
}

/**
 * 코드 라이브러리 브라우저
 *
 * 저장된 코드를 검색, 필터링, 관리할 수 있는 UI
 */
export function CodeLibraryBrowser({ onSelectCode }: CodeLibraryBrowserProps) {
  const [items, setItems] = useState<CodeLibraryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'createdAt' | 'usageCount' | 'title'>('createdAt')
  const [stats, setStats] = useState<any>(null)

  // 데이터 로드
  useEffect(() => {
    loadData()
  }, [searchQuery, selectedCategory, showFavoriteOnly, sortBy])

  const loadData = () => {
    const filter: CodeLibraryFilter = {
      searchQuery: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      favoriteOnly: showFavoriteOnly,
      sortBy,
      sortOrder: 'desc'
    }

    const results = CodeLibraryStorage.search(filter)
    setItems(results)
    setStats(CodeLibraryStorage.getStats())
  }

  // 즐겨찾기 토글
  const handleToggleFavorite = (id: string) => {
    CodeLibraryStorage.toggleFavorite(id)
    loadData()
  }

  // 코드 삭제
  const handleDelete = (id: string) => {
    if (confirm('이 코드를 삭제하시겠습니까?')) {
      CodeLibraryStorage.delete(id)
      loadData()
    }
  }

  // 코드 복사
  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      alert('코드가 복사되었습니다!')
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  // 코드 다운로드
  const handleDownload = (item: CodeLibraryItem) => {
    const blob = new Blob([item.code.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.code.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gs`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const categories = stats?.categories || []
  const totalCount = stats?.total || 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">코드 라이브러리</h3>
            <p className="text-sm text-gray-600">저장된 코드: {totalCount}개</p>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="space-y-4 mb-6">
        {/* 검색 바 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="코드 제목, 설명, 태그로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* 필터 옵션 */}
        <div className="flex flex-wrap gap-3">
          {/* 카테고리 필터 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">모든 카테고리</option>
            {categories.map((cat: any) => (
              <option key={cat.name} value={cat.name}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>

          {/* 정렬 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="createdAt">최신순</option>
            <option value="usageCount">사용 많은 순</option>
            <option value="title">이름순</option>
          </select>

          {/* 즐겨찾기만 보기 */}
          <button
            onClick={() => setShowFavoriteOnly(!showFavoriteOnly)}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              showFavoriteOnly
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <Star className={`h-4 w-4 ${showFavoriteOnly ? 'fill-yellow-500' : ''}`} />
            즐겨찾기만
          </button>
        </div>
      </div>

      {/* 코드 목록 */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">저장된 코드가 없습니다</p>
          <p className="text-sm text-gray-400">코드 생성기에서 코드를 생성하고 저장해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* 코드 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{item.code.title}</h4>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded font-medium">
                      {item.category}
                    </span>
                    {item.favorite && (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{item.code.description}</p>
                </div>

                <button
                  onClick={() => handleToggleFavorite(item.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={item.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                >
                  <Star className={`h-5 w-5 ${item.favorite ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* 태그 */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 메타 정보 */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span>사용: {item.usageCount}회</span>
                <span>
                  생성: {new Date(item.code.createdAt).toLocaleDateString('ko-KR')}
                </span>
                {item.lastUsedAt && (
                  <span>
                    마지막 사용: {new Date(item.lastUsedAt).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectCode?.(item)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  보기
                </button>
                <button
                  onClick={() => handleCopy(item.code.code)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2"
                  title="복사"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(item)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2"
                  title="다운로드"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-2"
                  title="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
