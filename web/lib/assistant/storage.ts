import type {
  ChatSession,
  ChatMessage,
  ExportOptions,
  ExportFormat
} from '@/types/assistant'

/**
 * AI 어시스턴트 대화 히스토리 관리
 *
 * localStorage 기반 대화 세션 저장 및 관리
 */
export class AssistantStorage {
  private static STORAGE_KEY = 'ssa_assistant_sessions'
  private static MAX_HISTORY_SIZE = 10 // API 전송 시 최근 N개만 전송

  /**
   * 모든 세션 가져오기
   */
  static getAllSessions(): ChatSession[] {
    if (typeof window === 'undefined') return []

    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('세션 로드 오류:', error)
      return []
    }
  }

  /**
   * 특정 세션 가져오기
   */
  static getSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllSessions()
    return sessions.find(s => s.sessionId === sessionId) || null
  }

  /**
   * 스프레드시트별 세션 목록 가져오기
   */
  static getSessionsBySpreadsheet(spreadsheetId: string): ChatSession[] {
    const sessions = this.getAllSessions()
    return sessions
      .filter(s => s.spreadsheetId === spreadsheetId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  /**
   * 새 세션 생성
   */
  static createSession(
    spreadsheetId: string,
    spreadsheetTitle: string,
    analysisResult: any
  ): ChatSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newSession: ChatSession = {
      sessionId,
      spreadsheetId,
      spreadsheetTitle,
      analysisResult,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const sessions = this.getAllSessions()
    sessions.push(newSession)
    this.saveAllSessions(sessions)

    return newSession
  }

  /**
   * 세션에 메시지 추가
   */
  static addMessage(sessionId: string, message: ChatMessage): ChatSession | null {
    const sessions = this.getAllSessions()
    const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId)

    if (sessionIndex === -1) return null

    sessions[sessionIndex].messages.push(message)
    sessions[sessionIndex].updatedAt = new Date().toISOString()

    this.saveAllSessions(sessions)
    return sessions[sessionIndex]
  }

  /**
   * 세션 업데이트
   */
  static updateSession(
    sessionId: string,
    updates: Partial<ChatSession>
  ): ChatSession | null {
    const sessions = this.getAllSessions()
    const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId)

    if (sessionIndex === -1) return null

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveAllSessions(sessions)
    return sessions[sessionIndex]
  }

  /**
   * 세션 삭제
   */
  static deleteSession(sessionId: string): boolean {
    const sessions = this.getAllSessions()
    const filteredSessions = sessions.filter(s => s.sessionId !== sessionId)

    if (filteredSessions.length === sessions.length) return false

    this.saveAllSessions(filteredSessions)
    return true
  }

  /**
   * 최근 대화 히스토리 가져오기 (API 전송용)
   */
  static getRecentMessages(sessionId: string, limit: number = this.MAX_HISTORY_SIZE): ChatMessage[] {
    const session = this.getSession(sessionId)
    if (!session) return []

    const messages = session.messages
    return messages.slice(-limit)
  }

  /**
   * 세션 요약 생성
   */
  static generateSessionSummary(sessionId: string): string {
    const session = this.getSession(sessionId)
    if (!session || session.messages.length === 0) return ''

    const userMessages = session.messages.filter(m => m.role === 'user')
    const topics = new Set<string>()

    // 사용자 메시지에서 주요 키워드 추출
    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase()
      if (content.includes('중복')) topics.add('중복 제거')
      if (content.includes('빈 행') || content.includes('빈 열')) topics.add('빈 데이터 정리')
      if (content.includes('수식')) topics.add('수식 관련')
      if (content.includes('날짜')) topics.add('날짜 형식')
      if (content.includes('데이터 검증') || content.includes('validation')) topics.add('데이터 검증')
    })

    if (topics.size === 0) {
      return `${session.spreadsheetTitle}에 대한 일반 대화`
    }

    return `${session.spreadsheetTitle}: ${Array.from(topics).join(', ')}`
  }

  /**
   * 대화 내보내기
   */
  static exportSession(sessionId: string, options: ExportOptions): string {
    const session = this.getSession(sessionId)
    if (!session) return ''

    const {
      format = 'markdown',
      includeAnalysis = false,
      includeTimestamps = false,
      includeMetadata = false
    } = options

    switch (format) {
      case 'markdown':
        return this.exportAsMarkdown(session, includeAnalysis, includeTimestamps, includeMetadata)
      case 'text':
        return this.exportAsText(session, includeAnalysis, includeTimestamps, includeMetadata)
      case 'json':
        return this.exportAsJSON(session, includeAnalysis)
      default:
        return ''
    }
  }

  /**
   * Markdown 형식으로 내보내기
   */
  private static exportAsMarkdown(
    session: ChatSession,
    includeAnalysis: boolean,
    includeTimestamps: boolean,
    includeMetadata: boolean
  ): string {
    let output = `# ${session.spreadsheetTitle} - AI 어시스턴트 대화\n\n`
    output += `**생성일**: ${new Date(session.createdAt).toLocaleString('ko-KR')}\n`
    output += `**마지막 업데이트**: ${new Date(session.updatedAt).toLocaleString('ko-KR')}\n\n`

    if (session.summary) {
      output += `**요약**: ${session.summary}\n\n`
    }

    if (includeAnalysis && session.analysisResult) {
      output += `## 분석 결과\n\n`
      output += `- **시트 수**: ${session.analysisResult.sheets?.length || 0}\n`
      output += `- **문제점**: ${session.analysisResult.issues?.length || 0}개\n\n`
    }

    output += `## 대화 내용\n\n`

    session.messages.forEach((msg, idx) => {
      const role = msg.role === 'user' ? '👤 사용자' : '🤖 AI 어시스턴트'
      output += `### ${role}\n\n`

      if (includeTimestamps) {
        output += `*${new Date(msg.timestamp).toLocaleString('ko-KR')}*\n\n`
      }

      output += `${msg.content}\n\n`

      if (includeMetadata && msg.metadata) {
        output += `*메타데이터*: ${JSON.stringify(msg.metadata, null, 2)}\n\n`
      }

      if (idx < session.messages.length - 1) {
        output += `---\n\n`
      }
    })

    return output
  }

  /**
   * 텍스트 형식으로 내보내기
   */
  private static exportAsText(
    session: ChatSession,
    includeAnalysis: boolean,
    includeTimestamps: boolean,
    includeMetadata: boolean
  ): string {
    let output = `${session.spreadsheetTitle} - AI 어시스턴트 대화\n`
    output += `${'='.repeat(60)}\n\n`
    output += `생성일: ${new Date(session.createdAt).toLocaleString('ko-KR')}\n`
    output += `마지막 업데이트: ${new Date(session.updatedAt).toLocaleString('ko-KR')}\n\n`

    if (session.summary) {
      output += `요약: ${session.summary}\n\n`
    }

    if (includeAnalysis && session.analysisResult) {
      output += `분석 결과\n`
      output += `${'-'.repeat(60)}\n`
      output += `시트 수: ${session.analysisResult.sheets?.length || 0}\n`
      output += `문제점: ${session.analysisResult.issues?.length || 0}개\n\n`
    }

    output += `대화 내용\n`
    output += `${'-'.repeat(60)}\n\n`

    session.messages.forEach((msg, idx) => {
      const role = msg.role === 'user' ? '[사용자]' : '[AI 어시스턴트]'
      output += `${role}\n`

      if (includeTimestamps) {
        output += `${new Date(msg.timestamp).toLocaleString('ko-KR')}\n`
      }

      output += `\n${msg.content}\n\n`

      if (includeMetadata && msg.metadata) {
        output += `메타데이터: ${JSON.stringify(msg.metadata)}\n\n`
      }

      if (idx < session.messages.length - 1) {
        output += `${'-'.repeat(60)}\n\n`
      }
    })

    return output
  }

  /**
   * JSON 형식으로 내보내기
   */
  private static exportAsJSON(session: ChatSession, includeAnalysis: boolean): string {
    const exportData: any = {
      sessionId: session.sessionId,
      spreadsheetId: session.spreadsheetId,
      spreadsheetTitle: session.spreadsheetTitle,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }

    if (session.summary) {
      exportData.summary = session.summary
    }

    if (includeAnalysis && session.analysisResult) {
      exportData.analysisResult = session.analysisResult
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 파일로 다운로드
   */
  static downloadSession(sessionId: string, options: ExportOptions): void {
    const content = this.exportSession(sessionId, options)
    if (!content) return

    const session = this.getSession(sessionId)
    if (!session) return

    const formatExtensions: Record<ExportFormat, string> = {
      markdown: 'md',
      text: 'txt',
      json: 'json'
    }

    const extension = formatExtensions[options.format]
    const filename = `${session.spreadsheetTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_conversation.${extension}`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * 통계 정보 가져오기
   */
  static getStats(): {
    totalSessions: number
    totalMessages: number
    bySpreadsheet: Record<string, number>
  } {
    const sessions = this.getAllSessions()

    const bySpreadsheet: Record<string, number> = {}
    let totalMessages = 0

    sessions.forEach(session => {
      totalMessages += session.messages.length
      bySpreadsheet[session.spreadsheetId] = (bySpreadsheet[session.spreadsheetId] || 0) + 1
    })

    return {
      totalSessions: sessions.length,
      totalMessages,
      bySpreadsheet
    }
  }

  /**
   * 모든 세션 저장
   */
  private static saveAllSessions(sessions: ChatSession[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions))
    } catch (error) {
      console.error('세션 저장 오류:', error)
    }
  }

  /**
   * 오래된 세션 정리
   */
  static cleanupOldSessions(daysToKeep: number = 30): number {
    const sessions = this.getAllSessions()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const filteredSessions = sessions.filter(session => {
      const updatedAt = new Date(session.updatedAt)
      return updatedAt >= cutoffDate
    })

    const removedCount = sessions.length - filteredSessions.length
    if (removedCount > 0) {
      this.saveAllSessions(filteredSessions)
    }

    return removedCount
  }
}
