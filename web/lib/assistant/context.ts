import type { ChatMessage } from '@/types/assistant'

/**
 * AI 어시스턴트 컨텍스트 생성
 *
 * 분석 결과와 대화 히스토리를 AI가 이해할 수 있는 컨텍스트로 변환
 */
export class AssistantContext {
  /**
   * 분석 결과를 AI 컨텍스트로 변환
   */
  static createAnalysisContext(analysisResult: any): string {
    if (!analysisResult) return ''

    const parts: string[] = []

    // 스프레드시트 기본 정보
    parts.push('=== 스프레드시트 정보 ===')
    parts.push(`제목: ${analysisResult.title || '제목 없음'}`)
    parts.push(`총 시트 수: ${analysisResult.sheets?.length || 0}개`)
    parts.push('')

    // 시트별 정보
    if (analysisResult.sheets && analysisResult.sheets.length > 0) {
      parts.push('=== 시트 목록 ===')
      analysisResult.sheets.forEach((sheet: any, idx: number) => {
        parts.push(`${idx + 1}. ${sheet.name}`)
        parts.push(`   - 행 수: ${sheet.rowCount || 0}`)
        parts.push(`   - 열 수: ${sheet.columnCount || 0}`)
        if (sheet.headers && sheet.headers.length > 0) {
          parts.push(`   - 헤더: ${sheet.headers.join(', ')}`)
        }
      })
      parts.push('')
    }

    // 발견된 문제점
    if (analysisResult.issues && analysisResult.issues.length > 0) {
      parts.push('=== 발견된 문제점 ===')
      const groupedIssues = this.groupIssuesByType(analysisResult.issues)

      Object.entries(groupedIssues).forEach(([type, issues]) => {
        parts.push(`\n[${this.translateIssueType(type)}]`)
        ;(issues as any[]).forEach((issue, idx) => {
          parts.push(
            `${idx + 1}. 시트: ${issue.sheetName} | ${issue.description} | 심각도: ${this.translateSeverity(issue.severity)}`
          )
        })
      })
      parts.push('')
    }

    // 통계 정보
    if (analysisResult.statistics) {
      parts.push('=== 데이터 통계 ===')
      const stats = analysisResult.statistics
      if (stats.totalRows) parts.push(`총 데이터 행: ${stats.totalRows}`)
      if (stats.totalCells) parts.push(`총 셀 수: ${stats.totalCells}`)
      if (stats.emptyRows) parts.push(`빈 행: ${stats.emptyRows}`)
      if (stats.emptyColumns) parts.push(`빈 열: ${stats.emptyColumns}`)
      if (stats.duplicates) parts.push(`중복 행: ${stats.duplicates}`)
      if (stats.formulaCells) parts.push(`수식 셀: ${stats.formulaCells}`)
      parts.push('')
    }

    return parts.join('\n')
  }

  /**
   * 대화 히스토리를 AI 컨텍스트로 변환
   */
  static createConversationContext(messages: ChatMessage[]): string {
    if (!messages || messages.length === 0) {
      return '이번이 첫 대화입니다.'
    }

    const parts: string[] = ['=== 이전 대화 요약 ===']

    messages.forEach((msg, idx) => {
      const role = msg.role === 'user' ? '사용자' : 'AI'
      const timestamp = new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })

      parts.push(`[${timestamp}] ${role}: ${msg.content}`)

      // 메타데이터가 있으면 추가
      if (msg.metadata) {
        if (msg.metadata.action) {
          parts.push(`   액션: ${msg.metadata.action}`)
        }
        if (msg.metadata.codeId) {
          parts.push(`   코드 ID: ${msg.metadata.codeId}`)
        }
      }

      // 대화 사이에 구분선 추가
      if (idx < messages.length - 1) {
        parts.push('---')
      }
    })

    return parts.join('\n')
  }

  /**
   * 최근 생성한 코드 정보를 컨텍스트로 변환
   */
  static createCodeContext(recentCode: any): string {
    if (!recentCode) return ''

    const parts: string[] = ['=== 최근 생성한 코드 ===']
    parts.push(`제목: ${recentCode.title}`)
    parts.push(`타입: ${this.translateCodeType(recentCode.type)}`)
    parts.push(`설명: ${recentCode.description}`)

    if (recentCode.targetSheets && recentCode.targetSheets.length > 0) {
      parts.push(`대상 시트: ${recentCode.targetSheets.join(', ')}`)
    }

    if (recentCode.estimatedImpact) {
      parts.push('\n예상 효과:')
      const impact = recentCode.estimatedImpact
      if (impact.rowsAffected) parts.push(`- 영향받는 행: ${impact.rowsAffected}`)
      if (impact.rowsToDelete) parts.push(`- 삭제될 행: ${impact.rowsToDelete}`)
      if (impact.cellsToModify) parts.push(`- 수정될 셀: ${impact.cellsToModify}`)
    }

    // 코드는 너무 길 수 있으므로 일부만 포함
    if (recentCode.code) {
      const codePreview = recentCode.code.split('\n').slice(0, 5).join('\n')
      parts.push('\n코드 일부:')
      parts.push('```javascript')
      parts.push(codePreview)
      parts.push('...')
      parts.push('```')
    }

    return parts.join('\n')
  }

  /**
   * 전체 컨텍스트 생성 (AI API 요청용)
   */
  static createFullContext(
    analysisResult: any,
    conversationHistory: ChatMessage[],
    recentCode?: any,
    currentSheet?: string
  ): string {
    const parts: string[] = []

    // 시스템 프롬프트
    parts.push('당신은 Google Sheets Apps Script 코드 생성을 도와주는 AI 어시스턴트입니다.')
    parts.push('사용자의 스프레드시트 분석 결과를 바탕으로 데이터 정리 작업에 필요한 코드를 생성하고,')
    parts.push('사용자와 대화하며 최적의 솔루션을 찾도록 도와줍니다.')
    parts.push('')

    // 분석 결과 컨텍스트
    const analysisContext = this.createAnalysisContext(analysisResult)
    if (analysisContext) {
      parts.push(analysisContext)
      parts.push('')
    }

    // 현재 보고 있는 시트
    if (currentSheet) {
      parts.push(`=== 현재 시트 ===`)
      parts.push(`사용자가 현재 보고 있는 시트: ${currentSheet}`)
      parts.push('')
    }

    // 최근 코드 컨텍스트
    if (recentCode) {
      const codeContext = this.createCodeContext(recentCode)
      if (codeContext) {
        parts.push(codeContext)
        parts.push('')
      }
    }

    // 대화 히스토리 컨텍스트
    const conversationContext = this.createConversationContext(conversationHistory)
    if (conversationContext) {
      parts.push(conversationContext)
      parts.push('')
    }

    // 응답 가이드라인
    parts.push('=== 응답 가이드라인 ===')
    parts.push('1. 사용자의 질문에 명확하고 친절하게 답변하세요.')
    parts.push('2. 코드 생성이 필요한 경우 구체적인 작업 내용을 설명하세요.')
    parts.push('3. 여러 방법이 있다면 장단점을 설명하고 추천안을 제시하세요.')
    parts.push('4. 위험한 작업(대량 삭제 등)은 반드시 경고하세요.')
    parts.push('5. 분석 결과에서 발견된 문제를 해결하는 방향으로 안내하세요.')
    parts.push('')

    return parts.join('\n')
  }

  /**
   * 문제 타입별로 그룹화
   */
  private static groupIssuesByType(issues: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {}

    issues.forEach(issue => {
      const type = issue.type || 'other'
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(issue)
    })

    return grouped
  }

  /**
   * 문제 타입 한글 변환
   */
  private static translateIssueType(type: string): string {
    const translations: Record<string, string> = {
      duplicate_rows: '중복 행',
      empty_rows: '빈 행',
      empty_columns: '빈 열',
      inconsistent_data: '일관성 없는 데이터',
      invalid_formula: '잘못된 수식',
      formatting: '서식 문제',
      data_validation: '데이터 검증 문제',
      other: '기타'
    }

    return translations[type] || type
  }

  /**
   * 심각도 한글 변환
   */
  private static translateSeverity(severity: string): string {
    const translations: Record<string, string> = {
      critical: '심각',
      high: '높음',
      medium: '보통',
      low: '낮음'
    }

    return translations[severity] || severity
  }

  /**
   * 코드 타입 한글 변환
   */
  private static translateCodeType(type: string): string {
    const translations: Record<string, string> = {
      remove_duplicates: '중복 제거',
      remove_empty_rows: '빈 행 제거',
      remove_empty_columns: '빈 열 제거',
      format_dates: '날짜 형식 변경',
      convert_formulas: '수식 값으로 변환',
      data_validation: '데이터 검증',
      trim_whitespace: '공백 제거',
      custom: '사용자 정의'
    }

    return translations[type] || type
  }

  /**
   * 사용자 의도 파악을 위한 키워드 분석
   */
  static detectUserIntent(userMessage: string): {
    isQuestion: boolean
    isCodeRequest: boolean
    isModificationRequest: boolean
    keywords: string[]
  } {
    const messageLower = userMessage.toLowerCase()

    // 질문 감지
    const questionMarkers = ['?', '뭐', '어떻게', '무엇', '어디', '왜', '언제', 'how', 'what', 'where', 'why', 'when']
    const isQuestion = questionMarkers.some(marker => messageLower.includes(marker))

    // 코드 생성 요청 감지
    const codeRequestMarkers = [
      '코드',
      '만들어',
      '생성',
      '작성',
      '제거',
      '삭제',
      '정리',
      '변환',
      'remove',
      'delete',
      'clean',
      'convert',
      'generate'
    ]
    const isCodeRequest = codeRequestMarkers.some(marker => messageLower.includes(marker))

    // 수정 요청 감지
    const modificationMarkers = [
      '수정',
      '변경',
      '바꿔',
      '고쳐',
      '개선',
      'modify',
      'change',
      'fix',
      'improve',
      'update'
    ]
    const isModificationRequest = modificationMarkers.some(marker => messageLower.includes(marker))

    // 키워드 추출
    const keywords: string[] = []
    const keywordPatterns = [
      { pattern: /중복/gi, keyword: '중복' },
      { pattern: /빈\s*(행|열|셀)/gi, keyword: '빈 데이터' },
      { pattern: /수식/gi, keyword: '수식' },
      { pattern: /날짜/gi, keyword: '날짜' },
      { pattern: /공백/gi, keyword: '공백' },
      { pattern: /데이터\s*검증/gi, keyword: '데이터 검증' },
      { pattern: /정렬/gi, keyword: '정렬' },
      { pattern: /필터/gi, keyword: '필터' }
    ]

    keywordPatterns.forEach(({ pattern, keyword }) => {
      if (pattern.test(userMessage)) {
        keywords.push(keyword)
      }
    })

    return {
      isQuestion,
      isCodeRequest,
      isModificationRequest,
      keywords
    }
  }

  /**
   * 추천 후속 질문 생성
   */
  static generateFollowUpQuestions(
    analysisResult: any,
    conversationHistory: ChatMessage[]
  ): string[] {
    const questions: string[] = []

    // 분석 결과 기반 질문
    if (analysisResult?.issues) {
      const issueTypes = new Set(analysisResult.issues.map((issue: any) => issue.type))

      if (issueTypes.has('duplicate_rows')) {
        questions.push('중복된 행을 어떻게 처리할까요?')
      }
      if (issueTypes.has('empty_rows') || issueTypes.has('empty_columns')) {
        questions.push('빈 행과 빈 열을 제거하시겠습니까?')
      }
      if (issueTypes.has('invalid_formula')) {
        questions.push('수식을 값으로 변환하시겠습니까?')
      }
    }

    // 대화 히스토리 기반 질문
    if (conversationHistory.length === 0) {
      questions.push('어떤 작업을 도와드릴까요?')
      questions.push('데이터 정리 작업이 필요하신가요?')
    } else {
      const lastUserMessage = conversationHistory
        .filter(m => m.role === 'user')
        .pop()

      if (lastUserMessage) {
        const intent = this.detectUserIntent(lastUserMessage.content)

        if (intent.isCodeRequest && !intent.isModificationRequest) {
          questions.push('생성된 코드를 수정하시겠습니까?')
          questions.push('다른 시트에도 동일한 작업을 적용할까요?')
        }
      }
    }

    // 일반적인 질문
    if (questions.length < 3) {
      questions.push('데이터를 어떻게 정리하고 싶으신가요?')
      questions.push('특정 시트에 작업을 적용하시겠습니까?')
    }

    return questions.slice(0, 3) // 최대 3개까지
  }
}
