import { NextRequest, NextResponse } from 'next/server'
import type { RoadmapRequest, RoadmapResponse, DataCleaningRoadmap } from '@/types/roadmap'

/**
 * AI Agent를 사용한 데이터 정리 로드맵 생성 API
 * POST /api/ssa/roadmap
 *
 * 스프레드시트 분석 결과를 바탕으로 AI가 최적의 데이터 정리 순서와
 * 작업 계획을 생성합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body: RoadmapRequest = await request.json()
    const { analysisResult, userPriorities } = body

    if (!analysisResult) {
      return NextResponse.json(
        {
          success: false,
          error: '분석 결과가 필요합니다'
        } as RoadmapResponse,
        { status: 400 }
      )
    }

    console.log('[roadmap] Generating data cleaning roadmap...')
    console.log('[roadmap] Analysis summary:', {
      spreadsheetId: analysisResult.spreadsheetId,
      totalSheets: analysisResult.sheets?.length || 0,
      totalFormulas: analysisResult.totalFormulas || 0,
      complexity: analysisResult.complexity || 0
    })

    // AI Agent를 사용하여 로드맵 생성
    const roadmap = await generateRoadmapWithAI(analysisResult, userPriorities)

    console.log('[roadmap] Roadmap generated successfully')
    console.log('[roadmap] Total steps:', roadmap.steps.length)
    console.log('[roadmap] Estimated time:', roadmap.totalEstimatedMinutes, 'minutes')

    return NextResponse.json({
      success: true,
      roadmap
    } as RoadmapResponse)
  } catch (error: any) {
    console.error('[roadmap] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || '로드맵 생성 중 오류가 발생했습니다'
      } as RoadmapResponse,
      { status: 500 }
    )
  }
}

/**
 * AI Agent를 사용하여 데이터 정리 로드맵 생성
 */
async function generateRoadmapWithAI(
  analysisResult: any,
  userPriorities?: RoadmapRequest['userPriorities']
): Promise<DataCleaningRoadmap> {
  // AI 프롬프트 구성
  const prompt = buildRoadmapPrompt(analysisResult, userPriorities)

  // AI Agent 호출 (간단한 구현 - 실제로는 OpenAI API 등을 사용)
  const aiResponse = await callAIAgent(prompt, analysisResult)

  // AI 응답을 구조화된 로드맵으로 변환
  const roadmap = parseAIResponse(aiResponse, analysisResult)

  return roadmap
}

/**
 * AI Agent를 위한 프롬프트 구성
 */
function buildRoadmapPrompt(
  analysisResult: any,
  userPriorities?: RoadmapRequest['userPriorities']
): string {
  const { spreadsheetTitle, sheets, totalFormulas, formulaTypes, dependencies, complexity } =
    analysisResult

  let prompt = `당신은 Google Sheets 데이터 정리 전문가입니다. 다음 스프레드시트 분석 결과를 바탕으로 최적의 데이터 정리 로드맵을 생성해주세요.

## 스프레드시트 정보
- 제목: ${spreadsheetTitle}
- 총 시트 수: ${sheets?.length || 0}
- 총 수식 개수: ${totalFormulas || 0}
- 복잡도 점수: ${complexity || 0}/100

## 시트별 상세 정보
${sheets
  ?.map(
    (sheet: any) => `
### ${sheet.name}
- 행 수: ${sheet.rowCount}
- 열 수: ${sheet.columnCount}
- 수식 수: ${sheet.formulas?.length || 0}
- 주요 수식 타입: ${Object.keys(sheet.formulaTypes || {}).join(', ') || '없음'}
`
  )
  .join('\n')}

## 시트 간 의존성
${dependencies?.length > 0 ? dependencies.map((d: any) => `- ${d.from} → ${d.to}`).join('\n') : '의존성 없음'}

## 사용자 우선순위
${userPriorities?.focusAreas ? `- 집중 영역: ${userPriorities.focusAreas.join(', ')}` : ''}
${userPriorities?.targetSheets ? `- 대상 시트: ${userPriorities.targetSheets.join(', ')}` : ''}

## 요구사항
다음 항목들을 포함하여 데이터 정리 로드맵을 생성해주세요:

1. **전체 요약**: 이 스프레드시트의 주요 문제점과 개선 방향
2. **감지된 문제점**: 중복 데이터, 수식 오류, 데이터 불일치 등
3. **정리 단계**: 우선순위가 높은 순서대로 구체적인 작업 단계
   - 각 단계는 다음을 포함:
     * 제목 및 설명
     * 작업 유형 (data_cleaning, formula_conversion, automation, validation)
     * 우선순위 (critical, high, medium, low)
     * 예상 소요 시간 (분)
     * 영향받는 시트 목록
     * 의존성 (이전에 완료해야 할 단계)
     * 구체적인 작업 지침
     * 예상되는 결과
4. **전체 추천사항**: 장기적인 데이터 관리 개선 방안

JSON 형식으로 응답해주세요.`

  return prompt
}

/**
 * AI Agent 호출 (실제 구현)
 */
async function callAIAgent(prompt: string, analysisResult: any): Promise<any> {
  // 여기서는 간단한 규칙 기반 로직으로 구현
  // 실제로는 OpenAI API, Anthropic Claude API 등을 호출

  const roadmap = {
    summary: generateSummary(analysisResult),
    detectedIssues: detectIssues(analysisResult),
    steps: generateSteps(analysisResult),
    recommendations: generateRecommendations(analysisResult)
  }

  return roadmap
}

/**
 * 전체 요약 생성
 */
function generateSummary(analysisResult: any): string {
  const { sheets, totalFormulas, complexity, dependencies } = analysisResult
  const sheetCount = sheets?.length || 0

  let summary = `이 스프레드시트는 총 ${sheetCount}개의 시트로 구성되어 있으며, ${totalFormulas}개의 수식을 포함하고 있습니다. `

  if (complexity > 70) {
    summary += '복잡도가 매우 높아 체계적인 정리가 필요합니다. '
  } else if (complexity > 40) {
    summary += '중간 정도의 복잡도를 가지고 있어 단계적 정리가 권장됩니다. '
  } else {
    summary += '비교적 단순한 구조로 빠른 정리가 가능합니다. '
  }

  if (dependencies?.length > 0) {
    summary += `${dependencies.length}개의 시트 간 참조가 있어 의존성 관리에 주의가 필요합니다.`
  }

  return summary
}

/**
 * 문제점 감지
 */
function detectIssues(analysisResult: any): DataCleaningRoadmap['detectedIssues'] {
  const issues: DataCleaningRoadmap['detectedIssues'] = []
  const { sheets, dependencies, complexity } = analysisResult

  // 복잡도가 높은 경우
  if (complexity > 70) {
    issues.push({
      category: '높은 복잡도',
      description: '스프레드시트의 복잡도가 매우 높아 유지보수가 어려울 수 있습니다',
      severity: 'high',
      affectedSheets: sheets?.map((s: any) => s.name) || []
    })
  }

  // 순환 참조 가능성 체크
  if (dependencies && dependencies.length > 5) {
    issues.push({
      category: '복잡한 의존성',
      description: '시트 간 참조가 많아 순환 참조나 오류 가능성이 있습니다',
      severity: 'medium',
      affectedSheets: Array.from(
        new Set(dependencies.flatMap((d: any) => [d.from, d.to]))
      )
    })
  }

  // 대용량 데이터
  sheets?.forEach((sheet: any) => {
    if (sheet.rowCount > 1000 || sheet.columnCount > 26) {
      issues.push({
        category: '대용량 데이터',
        description: `${sheet.name} 시트의 데이터 크기가 커서 성능 문제가 발생할 수 있습니다`,
        severity: sheet.rowCount > 5000 ? 'high' : 'medium',
        affectedSheets: [sheet.name]
      })
    }
  })

  return issues
}

/**
 * 정리 단계 생성
 */
function generateSteps(analysisResult: any): DataCleaningRoadmap['steps'] {
  const steps: DataCleaningRoadmap['steps'] = []
  const { sheets, dependencies, complexity } = analysisResult

  let stepId = 1

  // Step 1: 데이터 백업 (항상 첫 단계)
  steps.push({
    id: `step-${stepId++}`,
    title: '데이터 백업',
    description: '작업 시작 전 현재 스프레드시트의 복사본을 생성합니다',
    type: 'data_cleaning',
    priority: 'critical',
    status: 'pending',
    estimatedMinutes: 5,
    affectedSheets: sheets?.map((s: any) => s.name) || [],
    dependencies: [],
    actionInstructions: [
      '스프레드시트 전체를 복사하여 백업 생성',
      '백업 파일 이름에 날짜 추가 (예: 원본파일명_백업_2024-01-15)'
    ],
    expectedOutcome: '안전한 백업 파일 생성 완료',
    warnings: ['이 단계를 건너뛰면 데이터 손실 위험이 있습니다']
  })

  // Step 2: 빈 행/열 제거
  if (sheets && sheets.length > 0) {
    steps.push({
      id: `step-${stepId++}`,
      title: '빈 행과 열 제거',
      description: '사용하지 않는 빈 행과 열을 제거하여 데이터 범위를 최적화합니다',
      type: 'data_cleaning',
      priority: 'high',
      status: 'pending',
      estimatedMinutes: 10,
      affectedSheets: sheets.map((s: any) => s.name),
      dependencies: ['step-1'],
      actionInstructions: [
        '각 시트에서 완전히 비어있는 행 찾기',
        '완전히 비어있는 열 찾기',
        '빈 행/열 삭제 (데이터 범위 축소)'
      ],
      expectedOutcome: '불필요한 공백 제거로 파일 크기 감소',
      codeGenerationHint: 'Apps Script로 빈 행/열 자동 제거 코드 생성 가능'
    })
  }

  // Step 3: 중복 데이터 확인
  steps.push({
    id: `step-${stepId++}`,
    title: '중복 데이터 확인 및 제거',
    description: '동일한 데이터가 중복되어 있는지 확인하고 제거합니다',
    type: 'data_cleaning',
    priority: 'medium',
    status: 'pending',
    estimatedMinutes: 15,
    affectedSheets: sheets?.map((s: any) => s.name) || [],
    dependencies: ['step-2'],
    actionInstructions: [
      '각 시트에서 중복된 행 찾기',
      '중복 기준 컬럼 정의 (예: ID, 이메일 등)',
      '중복 데이터 검토 후 제거 또는 병합'
    ],
    expectedOutcome: '데이터 정합성 향상 및 중복 제거',
    warnings: ['중요한 데이터가 포함될 수 있으니 신중하게 검토하세요'],
    codeGenerationHint: 'Apps Script로 중복 행 탐지 및 제거 코드 생성 가능'
  })

  // Step 4: 수식 검증 (수식이 많은 경우)
  if (analysisResult.totalFormulas > 50) {
    steps.push({
      id: `step-${stepId++}`,
      title: '수식 오류 검증',
      description: '모든 수식이 올바르게 작동하는지 확인하고 오류를 수정합니다',
      type: 'validation',
      priority: 'high',
      status: 'pending',
      estimatedMinutes: 20,
      affectedSheets: sheets?.filter((s: any) => (s.formulas?.length || 0) > 0).map((s: any) => s.name) || [],
      dependencies: ['step-3'],
      actionInstructions: [
        '#REF!, #VALUE!, #DIV/0! 등 수식 오류 찾기',
        '깨진 참조 수정',
        '순환 참조 확인 및 해결'
      ],
      expectedOutcome: '모든 수식이 정상 작동',
      warnings: ['수식 수정 시 다른 시트에 영향을 줄 수 있습니다']
    })
  }

  // Step 5: 의존성 정리 (의존성이 복잡한 경우)
  if (dependencies && dependencies.length > 3) {
    steps.push({
      id: `step-${stepId++}`,
      title: '시트 간 참조 정리',
      description: '시트 간 참조를 검토하고 불필요한 의존성을 제거합니다',
      type: 'formula_conversion',
      priority: 'medium',
      status: 'pending',
      estimatedMinutes: 25,
      affectedSheets: Array.from(
        new Set(dependencies.flatMap((d: any) => [d.from, d.to]))
      ),
      dependencies: ['step-3'],
      actionInstructions: [
        '시트 간 참조 관계 다이어그램 검토',
        '순환 참조 여부 확인',
        '불필요한 참조는 값으로 변환 고려',
        '참조가 꼭 필요한 경우 명확한 이름 사용'
      ],
      expectedOutcome: '명확하고 관리하기 쉬운 참조 구조',
      codeGenerationHint: 'Apps Script로 외부 참조를 값으로 변환하는 코드 생성 가능'
    })
  }

  // Step 6: 데이터 형식 통일
  steps.push({
    id: `step-${stepId++}`,
    title: '데이터 형식 표준화',
    description: '날짜, 숫자, 텍스트 형식을 일관되게 통일합니다',
    type: 'data_cleaning',
    priority: 'medium',
    status: 'pending',
    estimatedMinutes: 15,
    affectedSheets: sheets?.map((s: any) => s.name) || [],
    dependencies: ['step-3'],
    actionInstructions: [
      '날짜 형식 통일 (예: YYYY-MM-DD)',
      '숫자 천 단위 구분 기호 통일',
      '텍스트 트리밍 (앞뒤 공백 제거)',
      '대소문자 통일 (필요시)'
    ],
    expectedOutcome: '일관된 데이터 형식으로 분석 및 처리 용이',
    codeGenerationHint: 'Apps Script로 형식 변환 자동화 코드 생성 가능'
  })

  // Step 7: 최종 검증
  steps.push({
    id: `step-${stepId++}`,
    title: '최종 데이터 검증',
    description: '모든 정리 작업이 완료된 후 데이터 무결성을 최종 확인합니다',
    type: 'validation',
    priority: 'critical',
    status: 'pending',
    estimatedMinutes: 10,
    affectedSheets: sheets?.map((s: any) => s.name) || [],
    dependencies: steps.map((s) => s.id),
    actionInstructions: [
      '각 시트의 행/열 개수 확인',
      '수식 오류 재확인',
      '데이터 샘플링 검토',
      '원본과 비교하여 데이터 손실 여부 확인'
    ],
    expectedOutcome: '데이터 정리 완료 및 품질 보증',
    warnings: ['문제가 발견되면 백업에서 복원 후 재작업하세요']
  })

  return steps
}

/**
 * 추천사항 생성
 */
function generateRecommendations(analysisResult: any): string[] {
  const recommendations: string[] = []
  const { complexity, totalFormulas } = analysisResult

  recommendations.push(
    '정기적인 데이터 정리 루틴을 수립하여 스프레드시트를 항상 최적 상태로 유지하세요'
  )

  if (complexity > 50) {
    recommendations.push(
      '복잡한 수식은 별도 시트로 분리하거나 Apps Script로 자동화를 고려하세요'
    )
  }

  if (totalFormulas > 100) {
    recommendations.push(
      '수식이 많은 경우 성능 저하가 발생할 수 있으니 일부를 값으로 변환하는 것을 고려하세요'
    )
  }

  recommendations.push(
    '중요한 작업 전에는 항상 백업을 생성하는 습관을 들이세요'
  )

  recommendations.push(
    '데이터 입력 시 일관된 형식을 사용하도록 데이터 검증 규칙을 설정하세요'
  )

  return recommendations
}

/**
 * AI 응답을 구조화된 로드맵으로 변환
 */
function parseAIResponse(
  aiResponse: any,
  analysisResult: any
): DataCleaningRoadmap {
  const totalEstimatedMinutes = aiResponse.steps.reduce(
    (sum: number, step: any) => sum + step.estimatedMinutes,
    0
  )

  const roadmap: DataCleaningRoadmap = {
    createdAt: new Date().toISOString(),
    spreadsheetId: analysisResult.spreadsheetId,
    spreadsheetTitle: analysisResult.spreadsheetTitle,
    summary: aiResponse.summary,
    totalEstimatedMinutes,
    steps: aiResponse.steps,
    detectedIssues: aiResponse.detectedIssues,
    recommendations: aiResponse.recommendations
  }

  return roadmap
}
