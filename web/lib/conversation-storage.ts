/**
 * 대화 기록 저장소
 * LocalStorage를 사용한 대화 내역 관리
 */

import type {
  ConversationRecord,
  ConversationMessage,
  ConversationFilter,
  ConversationSort,
  ConversationStats
} from '@/types/conversation'

const STORAGE_KEY = 'ssa_conversations'

/**
 * 모든 대화 기록 가져오기
 */
export function getConversations(): ConversationRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []

    const conversations = JSON.parse(data)
    // Date 객체 복원
    return conversations.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }))
  } catch (error) {
    console.error('Failed to load conversations:', error)
    return []
  }
}

/**
 * 대화 기록 저장
 */
export function saveConversations(conversations: ConversationRecord[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch (error) {
    console.error('Failed to save conversations:', error)
    throw new Error('대화 기록 저장에 실패했습니다.')
  }
}

/**
 * 새 대화 생성
 */
export function createConversation(
  messages: ConversationMessage[] = [],
  options: {
    title?: string
    generatedCode?: string
    linkedMenuId?: string
    isSaved?: boolean
  } = {}
): ConversationRecord {
  const now = new Date()
  const conversation: ConversationRecord = {
    id: `conv_${now.getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    title: options.title,
    messages,
    generatedCode: options.generatedCode,
    linkedMenuId: options.linkedMenuId,
    createdAt: now,
    updatedAt: now,
    isSaved: options.isSaved ?? false,
    isFavorite: false
  }

  const conversations = getConversations()
  conversations.unshift(conversation) // 최신순으로 추가
  saveConversations(conversations)

  return conversation
}

/**
 * 대화에 메시지 추가
 */
export function addMessage(
  conversationId: string,
  message: Omit<ConversationMessage, 'timestamp'>
): ConversationRecord | null {
  const conversations = getConversations()
  const conversation = conversations.find(c => c.id === conversationId)

  if (!conversation) {
    console.error('Conversation not found:', conversationId)
    return null
  }

  const newMessage: ConversationMessage = {
    ...message,
    timestamp: new Date()
  }

  conversation.messages.push(newMessage)
  conversation.updatedAt = new Date()

  // 코드가 생성된 경우 저장
  if (message.generatedCode) {
    conversation.generatedCode = message.generatedCode
  }

  saveConversations(conversations)
  return conversation
}

/**
 * 대화 기록 업데이트
 */
export function updateConversation(
  conversationId: string,
  updates: Partial<Omit<ConversationRecord, 'id' | 'createdAt'>>
): ConversationRecord | null {
  const conversations = getConversations()
  const index = conversations.findIndex(c => c.id === conversationId)

  if (index === -1) {
    console.error('Conversation not found:', conversationId)
    return null
  }

  conversations[index] = {
    ...conversations[index],
    ...updates,
    updatedAt: new Date()
  }

  saveConversations(conversations)
  return conversations[index]
}

/**
 * 대화 기록 삭제
 */
export function deleteConversation(conversationId: string): boolean {
  const conversations = getConversations()
  const filtered = conversations.filter(c => c.id !== conversationId)

  if (filtered.length === conversations.length) {
    console.error('Conversation not found:', conversationId)
    return false
  }

  saveConversations(filtered)
  return true
}

/**
 * 대화 기록 ID로 조회
 */
export function getConversationById(conversationId: string): ConversationRecord | null {
  const conversations = getConversations()
  return conversations.find(c => c.id === conversationId) || null
}

/**
 * 대화 기록 필터링
 */
export function filterConversations(
  filter: ConversationFilter
): ConversationRecord[] {
  let conversations = getConversations()

  // 검색어 필터
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase()
    conversations = conversations.filter(conv => {
      const titleMatch = conv.title?.toLowerCase().includes(query)
      const messageMatch = conv.messages.some(msg =>
        msg.content.toLowerCase().includes(query)
      )
      return titleMatch || messageMatch
    })
  }

  // 코드 생성 필터
  if (filter.hasCode !== undefined) {
    conversations = conversations.filter(conv =>
      filter.hasCode ? !!conv.generatedCode : !conv.generatedCode
    )
  }

  // 메뉴 변환 필터
  if (filter.hasMenu !== undefined) {
    conversations = conversations.filter(conv =>
      filter.hasMenu ? !!conv.linkedMenuId : !conv.linkedMenuId
    )
  }

  // 수동 저장 필터
  if (filter.savedOnly) {
    conversations = conversations.filter(conv => conv.isSaved)
  }

  // 즐겨찾기 필터
  if (filter.favoritesOnly) {
    conversations = conversations.filter(conv => conv.isFavorite)
  }

  // 날짜 범위 필터
  if (filter.dateRange) {
    conversations = conversations.filter(conv =>
      conv.createdAt >= filter.dateRange!.from &&
      conv.createdAt <= filter.dateRange!.to
    )
  }

  return conversations
}

/**
 * 대화 기록 정렬
 */
export function sortConversations(
  conversations: ConversationRecord[],
  sort: ConversationSort
): ConversationRecord[] {
  const sorted = [...conversations]

  sorted.sort((a, b) => {
    let compareValue = 0

    switch (sort.sortBy) {
      case 'createdAt':
        compareValue = a.createdAt.getTime() - b.createdAt.getTime()
        break
      case 'updatedAt':
        compareValue = a.updatedAt.getTime() - b.updatedAt.getTime()
        break
      case 'title':
        compareValue = (a.title || '').localeCompare(b.title || '')
        break
    }

    return sort.order === 'asc' ? compareValue : -compareValue
  })

  return sorted
}

/**
 * 대화 통계 계산
 */
export function getConversationStats(): ConversationStats {
  const conversations = getConversations()

  return {
    total: conversations.length,
    withCode: conversations.filter(c => !!c.generatedCode).length,
    withMenu: conversations.filter(c => !!c.linkedMenuId).length,
    saved: conversations.filter(c => c.isSaved).length,
    favorites: conversations.filter(c => c.isFavorite).length
  }
}

/**
 * 대화를 메뉴로 변환 (linkedMenuId 연결)
 */
export function linkConversationToMenu(
  conversationId: string,
  menuId: string
): ConversationRecord | null {
  return updateConversation(conversationId, {
    linkedMenuId: menuId,
    isSaved: true // 메뉴로 변환되면 자동으로 저장됨
  })
}

/**
 * 대화 제목 자동 생성
 * 첫 번째 사용자 메시지를 기반으로 제목 생성
 */
export function generateConversationTitle(
  messages: ConversationMessage[]
): string {
  const firstUserMessage = messages.find(msg => msg.role === 'user')
  if (!firstUserMessage) return '새 대화'

  // 첫 50자만 사용
  const title = firstUserMessage.content.substring(0, 50)
  return title.length < firstUserMessage.content.length
    ? `${title}...`
    : title
}

/**
 * 오래된 자동 저장 대화 정리 (30일 이상)
 */
export function cleanupOldConversations(daysToKeep: number = 30): number {
  const conversations = getConversations()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const filtered = conversations.filter(conv => {
    // 수동 저장되거나 즐겨찾기는 유지
    if (conv.isSaved || conv.isFavorite) return true
    // 최근 대화는 유지
    return conv.updatedAt >= cutoffDate
  })

  const deletedCount = conversations.length - filtered.length
  if (deletedCount > 0) {
    saveConversations(filtered)
  }

  return deletedCount
}
