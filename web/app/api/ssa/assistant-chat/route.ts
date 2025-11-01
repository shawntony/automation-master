import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  ChatMessage,
  IntentDetectionResult
} from '@/types/assistant'
import { AssistantContext } from '@/lib/assistant/context'
import { SuggestionEngine } from '@/lib/assistant/suggestion-engine'

// Anthropic Claude 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

/**
 * AI 어시스턴트 채팅 API
 *
 * POST /api/ssa/assistant-chat
 *
 * 사용자와 AI가 대화하며 코드 생성 방향을 논의하는 API
 */
export async function POST(request: NextRequest) {
  try {
    const body: AssistantChatRequest = await request.json()
    const {
      sessionId,
      userMessage,
      analysisResult,
      conversationHistory = [],
      additionalContext
    } = body

    if (!sessionId || !userMessage) {
      return NextResponse.json(
        {
          success: false,
          error: '세션 ID와 메시지가 필요합니다'
        } as AssistantChatResponse,
        { status: 400 }
      )
    }

    // 사용자 의도 파악
    const intent = AssistantContext.detectUserIntent(userMessage)

    // 전체 컨텍스트 생성
    const fullContext = AssistantContext.createFullContext(
      analysisResult,
      conversationHistory,
      additionalContext?.recentCode,
      additionalContext?.currentSheet
    )

    // AI 응답 생성 (실제 구현에서는 OpenAI API 또는 Anthropic API 호출)
    const aiResponse = await generateAIResponse(
      userMessage,
      fullContext,
      intent,
      analysisResult
    )

    // AI 메시지 객체 생성
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date().toISOString(),
      metadata: aiResponse.metadata
    }

    // 제안 생성
    const suggestions = aiResponse.suggestions || []

    // 실행할 액션 결정
    const action = aiResponse.action || { type: 'none' }

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      suggestions,
      action
    } as AssistantChatResponse)
  } catch (error: any) {
    console.error('AI 채팅 API 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '처리 중 오류가 발생했습니다'
      } as AssistantChatResponse,
      { status: 500 }
    )
  }
}

/**
 * AI 응답 생성 - Anthropic Claude API 사용
 */
async function generateAIResponse(
  userMessage: string,
  context: string,
  intent: ReturnType<typeof AssistantContext.detectUserIntent>,
  analysisResult: any
): Promise<{
  content: string
  metadata?: any
  suggestions?: any[]
  action?: { type: string; data?: any }
}> {
  try {
    // API 키 확인
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('ANTHROPIC_API_KEY가 설정되지 않았습니다. 패턴 매칭 모드로 폴백합니다.')
      return fallbackResponse(userMessage, analysisResult, intent)
    }

    // 시스템 프롬프트 구성
    const systemPrompt = `당신은 Google Sheets Apps Script 코드 생성을 도와주는 전문 AI 어시스턴트입니다.
사용자의 스프레드시트 분석 결과를 바탕으로 데이터 정리 작업에 필요한 코드 생성을 안내하고,
사용자와 대화하며 최적의 솔루션을 찾도록 도와줍니다.

응답 시 다음 사항을 준수하세요:
1. 명확하고 친절한 한국어로 답변합니다
2. 코드 생성이 필요한 경우 구체적인 작업 내용을 설명합니다
3. 여러 방법이 있다면 장단점을 설명하고 추천안을 제시합니다
4. 위험한 작업(대량 삭제 등)은 반드시 경고합니다
5. 분석 결과에서 발견된 문제를 해결하는 방향으로 안내합니다

${context}`

    // Claude API 호출
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    })

    // 응답 텍스트 추출
    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('\n')

    // 제안 생성 (의도에 따라)
    let suggestions: any[] = []
    if (intent.isCodeRequest) {
      suggestions = SuggestionEngine.generateIntentBasedSuggestions(userMessage, analysisResult)
    } else if (!intent.isModificationRequest && !intent.isQuestion) {
      suggestions = SuggestionEngine.generateSuggestions(analysisResult).slice(0, 3)
    }

    // 액션 결정
    let action: { type: string; data?: any } = { type: 'none' }
    if (intent.isCodeRequest) {
      action = {
        type: 'generate_code',
        data: {
          userRequest: userMessage,
          targetSheets: analysisResult?.sheets?.map((s: any) => s.name) || []
        }
      }
    } else if (intent.isModificationRequest) {
      action = {
        type: 'modify_code',
        data: { userRequest: userMessage }
      }
    }

    return {
      content: responseText,
      metadata: {
        action: intent.isQuestion
          ? 'question'
          : intent.isCodeRequest
          ? 'generate_code'
          : intent.isModificationRequest
          ? 'modify_code'
          : 'suggestion',
        model: 'claude-3-5-sonnet-20241022',
        tokens: message.usage.input_tokens + message.usage.output_tokens
      },
      suggestions,
      action
    }
  } catch (error: any) {
    console.error('Claude API 호출 오류:', error)
    // API 오류 시 패턴 매칭 모드로 폴백
    return fallbackResponse(userMessage, analysisResult, intent)
  }
}

/**
 * 폴백 응답 (패턴 매칭 기반)
 * API 키가 없거나 API 호출 실패 시 사용
 */
function fallbackResponse(
  userMessage: string,
  analysisResult: any,
  intent: ReturnType<typeof AssistantContext.detectUserIntent>
): {
  content: string
  metadata?: any
  suggestions?: any[]
  action?: { type: string; data?: any }
} {
  // 질문 응답
  if (intent.isQuestion) {
    return handleQuestion(userMessage, analysisResult, intent)
  }

  // 코드 생성 요청
  if (intent.isCodeRequest) {
    return handleCodeRequest(userMessage, analysisResult, intent)
  }

  // 코드 수정 요청
  if (intent.isModificationRequest) {
    return handleModificationRequest(userMessage, analysisResult, intent)
  }

  // 일반 대화
  return handleGeneralConversation(userMessage, analysisResult, intent)
}

/**
 * 질문 처리
 */
function handleQuestion(
  userMessage: string,
  analysisResult: any,
  intent: any
): any {
  const messageLower = userMessage.toLowerCase()

  // 중복 관련 질문
  if (messageLower.includes('중복')) {
    const duplicateIssues = analysisResult?.issues?.filter(
      (issue: any) => issue.type === 'duplicate_rows'
    ) || []

    let response = '중복 데이터에 대해 설명드리겠습니다.\n\n'

    if (duplicateIssues.length > 0) {
      response += `현재 ${duplicateIssues.length}개 시트에서 중복 행이 발견되었습니다:\n`
      duplicateIssues.forEach((issue: any) => {
        response += `- ${issue.sheetName}: 약 ${issue.count}개 중복 행\n`
      })
      response += '\n중복 행을 제거하는 코드를 생성해드릴까요?'
    } else {
      response += '현재 분석 결과에서는 중복 행이 발견되지 않았습니다.'
    }

    return {
      content: response,
      metadata: { action: 'question' },
      suggestions: duplicateIssues.length > 0
        ? SuggestionEngine.generateIntentBasedSuggestions('중복 제거', analysisResult)
        : []
    }
  }

  // 빈 데이터 관련 질문
  if (messageLower.includes('빈')) {
    const emptyRowIssues = analysisResult?.issues?.filter(
      (issue: any) => issue.type === 'empty_rows'
    ) || []
    const emptyColIssues = analysisResult?.issues?.filter(
      (issue: any) => issue.type === 'empty_columns'
    ) || []

    let response = '빈 데이터에 대해 설명드리겠습니다.\n\n'

    if (emptyRowIssues.length > 0 || emptyColIssues.length > 0) {
      if (emptyRowIssues.length > 0) {
        response += `빈 행: ${emptyRowIssues.reduce((sum, issue) => sum + (issue.count || 0), 0)}개\n`
      }
      if (emptyColIssues.length > 0) {
        response += `빈 열: ${emptyColIssues.reduce((sum, issue) => sum + (issue.count || 0), 0)}개\n`
      }
      response += '\n빈 데이터를 정리하는 코드를 생성해드릴까요?'
    } else {
      response += '현재 분석 결과에서는 빈 행이나 빈 열이 발견되지 않았습니다.'
    }

    return {
      content: response,
      metadata: { action: 'question' }
    }
  }

  // 일반 질문
  const followUpQuestions = AssistantContext.generateFollowUpQuestions(
    analysisResult,
    []
  )

  return {
    content: `${userMessage}에 대한 답변입니다.\n\n분석 결과를 바탕으로 다음과 같은 작업을 도와드릴 수 있습니다:\n\n${followUpQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
    metadata: { action: 'question' }
  }
}

/**
 * 코드 생성 요청 처리
 */
function handleCodeRequest(
  userMessage: string,
  analysisResult: any,
  intent: any
): any {
  const messageLower = userMessage.toLowerCase()

  let response = '네, 코드를 생성해드리겠습니다.\n\n'

  // 작업 내용 확인
  const keywords = intent.keywords || []
  if (keywords.length > 0) {
    response += `다음 작업을 수행하는 코드를 생성합니다:\n`
    keywords.forEach((keyword: string) => {
      response += `- ${keyword} 관련 작업\n`
    })
    response += '\n'
  }

  // 대상 시트 확인
  const sheets = analysisResult?.sheets || []
  if (sheets.length > 1) {
    response += `모든 시트(${sheets.length}개)에 적용할까요, 아니면 특정 시트만 선택하시겠습니까?`
  } else if (sheets.length === 1) {
    response += `"${sheets[0].name}" 시트에 코드를 적용합니다.`
  }

  // 제안 생성
  const suggestions = SuggestionEngine.generateIntentBasedSuggestions(
    userMessage,
    analysisResult
  )

  return {
    content: response,
    metadata: { action: 'generate_code' },
    suggestions,
    action: {
      type: 'generate_code',
      data: {
        userRequest: userMessage,
        targetSheets: sheets.map((s: any) => s.name)
      }
    }
  }
}

/**
 * 코드 수정 요청 처리
 */
function handleModificationRequest(
  userMessage: string,
  analysisResult: any,
  intent: any
): any {
  return {
    content: '어떤 부분을 수정하시겠습니까?\n\n예를 들어:\n- 대상 시트 변경\n- 조건 추가/제거\n- 실행 옵션 변경',
    metadata: { action: 'modify_code' },
    action: {
      type: 'modify_code',
      data: {
        userRequest: userMessage
      }
    }
  }
}

/**
 * 일반 대화 처리
 */
function handleGeneralConversation(
  userMessage: string,
  analysisResult: any,
  intent: any
): any {
  const suggestions = SuggestionEngine.generateSuggestions(analysisResult)

  let response = '안녕하세요! 스프레드시트 데이터 정리를 도와드리겠습니다.\n\n'

  if (suggestions.length > 0) {
    response += '분석 결과를 바탕으로 다음과 같은 작업을 추천드립니다:\n\n'
    suggestions.slice(0, 3).forEach((suggestion, idx) => {
      response += `${idx + 1}. ${suggestion.title}: ${suggestion.description}\n`
    })
    response += '\n어떤 작업부터 시작하시겠습니까?'
  } else {
    response += '어떤 작업을 도와드릴까요?'
  }

  return {
    content: response,
    metadata: { action: 'suggestion' },
    suggestions: suggestions.slice(0, 3)
  }
}

/**
 * GET 요청 처리 (선택사항)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'AI 어시스턴트 채팅 API가 작동 중입니다'
  })
}
