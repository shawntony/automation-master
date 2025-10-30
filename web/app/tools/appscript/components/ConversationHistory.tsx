'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Star, Code, Menu, Trash2, Search, Calendar } from 'lucide-react'
import type { ConversationRecord, ConversationFilter } from '@/types/conversation'
import {
  getConversations,
  filterConversations,
  sortConversations,
  deleteConversation,
  updateConversation,
  getConversationStats
} from '@/lib/conversation-storage'

interface ConversationHistoryProps {
  /** 대화 선택 시 콜백 */
  onSelectConversation?: (conversation: ConversationRecord) => void
  /** 메뉴로 변환 요청 시 콜백 */
  onConvertToMenu?: (conversation: ConversationRecord) => void
}

export function ConversationHistory({
  onSelectConversation,
  onConvertToMenu
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<ConversationRecord[]>([])
  const [filteredConversations, setFilteredConversations] = useState<ConversationRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'code' | 'menu' | 'saved'>('all')
  const [stats, setStats] = useState({
    total: 0,
    withCode: 0,
    withMenu: 0,
    saved: 0
  })

  // 대화 목록 로드
  useEffect(() => {
    loadConversations()
  }, [])

  // 필터링 및 검색
  useEffect(() => {
    applyFilters()
  }, [conversations, searchQuery, filterType])

  const loadConversations = () => {
    const allConversations = getConversations()
    const sorted = sortConversations(allConversations, {
      sortBy: 'updatedAt',
      order: 'desc'
    })
    setConversations(sorted)
    setStats(getConversationStats())
  }

  const applyFilters = () => {
    const filter: ConversationFilter = {
      searchQuery: searchQuery || undefined
    }

    switch (filterType) {
      case 'code':
        filter.hasCode = true
        break
      case 'menu':
        filter.hasMenu = true
        break
      case 'saved':
        filter.savedOnly = true
        break
    }

    const filtered = filterConversations(filter)
    const sorted = sortConversations(filtered, {
      sortBy: 'updatedAt',
      order: 'desc'
    })
    setFilteredConversations(sorted)
  }

  const handleDelete = (conversationId: string) => {
    if (confirm('이 대화를 삭제하시겠습니까?')) {
      deleteConversation(conversationId)
      loadConversations()
    }
  }

  const handleToggleFavorite = (conversation: ConversationRecord) => {
    updateConversation(conversation.id, {
      isFavorite: !conversation.isFavorite
    })
    loadConversations()
  }

  const handleToggleSaved = (conversation: ConversationRecord) => {
    updateConversation(conversation.id, {
      isSaved: !conversation.isSaved
    })
    loadConversations()
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* 헤더 및 통계 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          대화 내역
        </h3>
        <div className="flex gap-2 text-sm text-gray-600">
          <span>전체 {stats.total}</span>
          <span>·</span>
          <span>코드 {stats.withCode}</span>
          <span>·</span>
          <span>메뉴 {stats.withMenu}</span>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="대화 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체</option>
          <option value="code">코드 생성됨</option>
          <option value="menu">메뉴로 변환됨</option>
          <option value="saved">저장됨</option>
        </select>
      </div>

      {/* 대화 목록 */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery || filterType !== 'all'
              ? '검색 결과가 없습니다.'
              : '대화 내역이 없습니다.'}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              {/* 대화 헤더 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium line-clamp-1">
                      {conversation.title || '제목 없음'}
                    </h4>
                    {conversation.isFavorite && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                    {conversation.generatedCode && (
                      <Code className="h-4 w-4 text-blue-500" />
                    )}
                    {conversation.linkedMenuId && (
                      <Menu className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(conversation.updatedAt)}
                    <span className="mx-1">·</span>
                    {conversation.messages.length}개 메시지
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleFavorite(conversation)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title={conversation.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        conversation.isFavorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(conversation.id)}
                    className="p-1 hover:bg-red-100 rounded"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* 첫 번째 메시지 미리보기 */}
              {conversation.messages.length > 0 && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {conversation.messages[0].content}
                </p>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectConversation?.(conversation)}
                  className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                >
                  대화 보기
                </button>
                {conversation.generatedCode && !conversation.linkedMenuId && (
                  <button
                    onClick={() => onConvertToMenu?.(conversation)}
                    className="flex-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                  >
                    메뉴로 변환
                  </button>
                )}
                {conversation.linkedMenuId && (
                  <span className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded text-center">
                    메뉴로 변환됨
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
