import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AiPrdGenerationRequest, AiPrdGenerationResponse } from '@/types/prd'

/**
 * AI PRD 생성 API
 * Claude 또는 Gemini를 사용하여 PRD를 자동 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body: AiPrdGenerationRequest = await request.json()
    const { model, projectName, projectType, input, inputType } = body

    // Validation
    if (!model || !projectName || !input) {
      return NextResponse.json({
        success: false,
        model,
        error: '필수 파라미터가 누락되었습니다',
        fallbackToTemplate: true
      } as AiPrdGenerationResponse, { status: 400 })
    }

    if (model !== 'claude' && model !== 'gemini') {
      return NextResponse.json({
        success: false,
        model,
        error: '지원되지 않는 AI 모델입니다',
        fallbackToTemplate: true
      } as AiPrdGenerationResponse, { status: 400 })
    }

    // Generate PRD using selected model
    let prd: string
    let tokensUsed: number | undefined

    if (model === 'claude') {
      const result = await generateWithClaude(projectName, projectType, input, inputType)
      prd = result.prd
      tokensUsed = result.tokensUsed
    } else {
      const result = await generateWithGemini(projectName, projectType, input, inputType)
      prd = result.prd
      tokensUsed = result.tokensUsed
    }

    return NextResponse.json({
      success: true,
      prd,
      model,
      tokensUsed
    } as AiPrdGenerationResponse)

  } catch (error: any) {
    console.error('AI PRD 생성 오류:', error)

    return NextResponse.json({
      success: false,
      model: 'none',
      error: error.message || 'PRD 생성 중 오류가 발생했습니다',
      fallbackToTemplate: true
    } as AiPrdGenerationResponse, { status: 500 })
  }
}

/**
 * Claude를 사용한 PRD 생성
 */
async function generateWithClaude(
  projectName: string,
  projectType: string,
  input: string | any,
  inputType: 'idea' | 'form'
): Promise<{ prd: string; tokensUsed: number }> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다')
  }

  const anthropic = new Anthropic({ apiKey })

  // 프롬프트 생성
  const prompt = buildPrompt(projectName, projectType, input, inputType, 'claude')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const prd = response.content[0].type === 'text' ? response.content[0].text : ''
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

    return { prd, tokensUsed }
  } catch (error: any) {
    console.error('Claude API 오류:', error)
    throw new Error(`Claude API 호출 실패: ${error.message}`)
  }
}

/**
 * Gemini를 사용한 PRD 생성
 */
async function generateWithGemini(
  projectName: string,
  projectType: string,
  input: string | any,
  inputType: 'idea' | 'form'
): Promise<{ prd: string; tokensUsed?: number }> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

  // 프롬프트 생성
  const prompt = buildPrompt(projectName, projectType, input, inputType, 'gemini')

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const prd = response.text()

    // Gemini는 토큰 사용량을 직접 제공하지 않음
    return { prd, tokensUsed: undefined }
  } catch (error: any) {
    console.error('Gemini API 오류:', error)
    throw new Error(`Gemini API 호출 실패: ${error.message}`)
  }
}

/**
 * AI 모델에 따른 프롬프트 생성
 */
function buildPrompt(
  projectName: string,
  projectType: string,
  input: string | any,
  inputType: 'idea' | 'form',
  modelType: 'claude' | 'gemini'
): string {
  const modelName = modelType === 'claude' ? 'Claude' : 'Gemini'

  let inputDescription: string

  if (inputType === 'idea' && typeof input === 'string') {
    inputDescription = `아이디어: ${input}`
  } else if (inputType === 'form' && typeof input === 'object') {
    const formData = input
    inputDescription = `
프로젝트 목적: ${formData.purpose || ''}
배경: ${formData.background || ''}
주요 기능: ${formData.features?.join(', ') || ''}
타겟 사용자: ${formData.targetUsers || ''}
기술 스택: ${formData.techStack?.join(', ') || ''}
성공 지표: ${formData.successMetrics || ''}
제약사항: ${formData.constraints || ''}
    `.trim()
  } else {
    inputDescription = JSON.stringify(input)
  }

  // Claude는 상세한 분석과 깊이 있는 PRD를 생성
  // Gemini는 구조화된 실용적인 PRD를 생성
  const styleGuidance = modelType === 'claude'
    ? '상세하고 깊이 있는 분석을 포함하여, 비즈니스 맥락과 기술적 고려사항을 모두 다루는 포괄적인 PRD를 작성하세요.'
    : '명확하고 구조화된 형식으로, 실용적이고 실행 가능한 내용 중심의 PRD를 작성하세요.'

  return `당신은 전문 PRD(Product Requirements Document) 작성자입니다.

# 프로젝트 정보
- 프로젝트명: ${projectName}
- 프로젝트 타입: ${projectType}

# 입력 정보
${inputDescription}

# 작성 요구사항
${styleGuidance}

다음 구조로 한국어 PRD를 작성해주세요:

# ${projectName} - PRD (Product Requirements Document)

> 작성일: ${new Date().toISOString().split('T')[0]}
> AI 생성: ${modelName}

## 1. 프로젝트 개요
- 프로젝트 목적
- 배경 및 문제 정의
- 핵심 가치 제안

## 2. 주요 기능
각 기능별로:
- 기능명
- 상세 설명
- 우선순위 (높음/중간/낮음)
- 기술적 요구사항

## 3. 타겟 사용자
- 주요 사용자 페르소나
- 사용자 니즈
- 사용 시나리오

## 4. 기술 스택
- 프론트엔드
- 백엔드
- 데이터베이스
- 인프라
- 기타 도구

## 5. 성공 지표
- 주요 KPI
- 측정 방법
- 목표 수치

## 6. 제약사항 및 위험 요소
- 기술적 제약사항
- 비즈니스 제약사항
- 잠재적 위험 요소
- 완화 전략

## 7. 다음 단계
- 즉시 실행 항목
- 단기 계획 (1-2주)
- 중기 계획 (1-3개월)

위 구조를 따라 상세하고 실용적인 PRD를 작성해주세요. 마크다운 형식으로 작성하되, 각 섹션은 구체적이고 실행 가능한 내용으로 채워주세요.`
}
