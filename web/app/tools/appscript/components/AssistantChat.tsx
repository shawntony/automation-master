'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, MessageCircle, Download, Trash2, Sparkles } from 'lucide-react'
import type {
  ChatSession,
  ChatMessage,
  AssistantChatResponse,
  AISuggestion
} from '@/types/assistant'
import { AssistantStorage } from '@/lib/assistant/storage'
import { SuggestionEngine } from '@/lib/assistant/suggestion-engine'

interface AssistantChatProps {
  /** 스프레드시트 ID */
  spreadsheetId: string
  /** 스프레드시트 제목 */
  spreadsheetTitle: string
  /** 분석 결과 (컨텍스트) */
  analysisResult: any
  /** 코드 생성 콜백 */
  onGenerateCode?: (params: any) => void
  /** 코드 수정 콜백 */
  onModifyCode?: (params: any) => void
}

/**
 * AI 어시스턴트 채팅 인터페이스
 *
 * 분석 결과를 바탕으로 AI와 대화하며 코드 생성 방향을 논의
 */
export function AssistantChat({
  spreadsheetId,
  spreadsheetTitle,
  analysisResult,
  onGenerateCode,
  onModifyCode
}: AssistantChatProps) {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 세션 초기화 또는 로드
  useEffect(() => {
    loadOrCreateSession()
  }, [spreadsheetId])

  // 메시지 변경 시 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [session?.messages])

  // 초기 제안 생성
  useEffect(() => {
    if (session && session.messages.length === 0) {
      const initialSuggestions = SuggestionEngine.generateSuggestions(analysisResult)
      setSuggestions(initialSuggestions)
    }
  }, [session, analysisResult])

  const loadOrCreateSession = () => {
    // 기존 세션 찾기
    const existingSessions = AssistantStorage.getSessionsBySpreadsheet(spreadsheetId)

    if (existingSessions.length > 0) {
      // 가장 최근 세션 로드
      setSession(existingSessions[0])
    } else {
      // 새 세션 생성
      const newSession = AssistantStorage.createSession(
        spreadsheetId,
        spreadsheetTitle,
        analysisResult
      )
      setSession(newSession)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 메시지 전송
  const handleSend = async () => {
    if (!userInput.trim() || !session) return

    setIsLoading(true)
    setSuggestions([]) // 기존 제안 초기화

    try {
      // 사용자 메시지 추가
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: userInput,
        timestamp: new Date().toISOString()
      }

      const updatedSession = AssistantStorage.addMessage(session.sessionId, userMessage)
      if (updatedSession) {
        setSession(updatedSession)
      }

      // 입력 초기화
      const currentInput = userInput
      setUserInput('')

      // API 호출
      const response = await fetch('/api/ssa/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          userMessage: currentInput,
          analysisResult,
          conversationHistory: AssistantStorage.getRecentMessages(session.sessionId)
        })
      })

      const data: AssistantChatResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'AI 응답을 받을 수 없습니다')
      }

      // AI 응답 추가
      if (data.message) {
        const finalSession = AssistantStorage.addMessage(session.sessionId, data.message)
        if (finalSession) {
          setSession(finalSession)

          // 세션 요약 업데이트
          const summary = AssistantStorage.generateSessionSummary(session.sessionId)
          AssistantStorage.updateSession(session.sessionId, { summary })
        }
      }

      // 제안 업데이트
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions)
      }

      // 액션 실행
      if (data.action) {
        handleAction(data.action)
      }
    } catch (err: any) {
      console.error('메시지 전송 오류:', err)
      // 에러 메시지를 채팅에 추가
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `죄송합니다. 오류가 발생했습니다: ${err.message}`,
        timestamp: new Date().toISOString()
      }
      const updatedSession = AssistantStorage.addMessage(session.sessionId, errorMessage)
      if (updatedSession) {
        setSession(updatedSession)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 액션 처리
  const handleAction = (action: { type: string; data?: any }) => {
    switch (action.type) {
      case 'generate_code':
        onGenerateCode?.(action.data)
        break
      case 'modify_code':
        onModifyCode?.(action.data)
        break
      case 'show_preview':
        // 미리보기 표시 (추후 구현)
        break
      default:
        break
    }
  }

  // 제안 수락
  const handleAcceptSuggestion = (suggestion: AISuggestion) => {
    if (suggestion.action.type === 'generate_code') {
      onGenerateCode?.(suggestion.action.params)
    }

    // 제안 수락 메시지 추가
    if (session) {
      const acceptMessage: ChatMessage = {
        id: `msg_${Date.now()}_accept`,
        role: 'user',
        content: `제안 수락: ${suggestion.title}`,
        timestamp: new Date().toISOString(),
        metadata: {
          action: 'confirmation',
          suggestionId: suggestion.id,
          accepted: true
        }
      }
      const updatedSession = AssistantStorage.addMessage(session.sessionId, acceptMessage)
      if (updatedSession) {
        setSession(updatedSession)
      }
    }

    // 제안 목록에서 제거
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
  }

  // 대화 내보내기
  const handleExport = () => {
    if (!session) return
    AssistantStorage.downloadSession(session.sessionId, {
      format: 'markdown',
      includeAnalysis: true,
      includeTimestamps: true,
      includeMetadata: false
    })
  }

  // 대화 초기화
  const handleClear = () => {
    if (!session) return
    if (confirm('대화 내용을 모두 삭제하시겠습니까?')) {
      AssistantStorage.deleteSession(session.sessionId)
      loadOrCreateSession()
      setSuggestions([])
    }
  }

  // 엔터키로 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!session) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>세션을 로드하는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col" style={{ height: '600px' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">AI 어시스턴트</h3>
            <p className="text-sm text-gray-600">{spreadsheetTitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="대화 내보내기"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="대화 초기화"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">AI와 대화를 시작하세요</p>
            <p className="text-sm">
              데이터 정리 작업에 대해 질문하거나 코드 생성을 요청할 수 있습니다.
            </p>
          </div>
        )}

        {session.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-line">{message.content}</div>
              <div
                className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 제안 영역 */}
      {suggestions.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-purple-50">
          <p className="text-sm font-semibold text-purple-900 mb-2">💡 추천 작업</p>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-white rounded-lg p-3 border border-purple-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{suggestion.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>우선순위: {suggestion.priority}</span>
                      {suggestion.estimatedImpact.timeSaved && (
                        <span>예상 절감: {suggestion.estimatedImpact.timeSaved}분</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="ml-3 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition"
                  >
                    수락
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AI에게 질문하거나 작업을 요청하세요..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !userInput.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Shift + Enter로 줄 바꿈, Enter로 전송
        </p>
      </div>
    </div>
  )
}
