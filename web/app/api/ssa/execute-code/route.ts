import { NextRequest, NextResponse } from 'next/server'
import type {
  CodeExecutionRequest,
  CodeExecutionResponse,
  CodeExecutionResult
} from '@/types/roadmap'

/**
 * 코드 실행 API
 *
 * POST /api/ssa/execute-code
 *
 * 생성된 Apps Script 코드를 시뮬레이션하여 실행 결과를 미리보기합니다.
 * 실제 스프레드시트를 변경하지 않고, 예상 결과를 보여줍니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CodeExecutionRequest = await request.json()

    const { code, spreadsheetId, targetSheets, simulationMode = true } = body

    if (!code || !spreadsheetId || !targetSheets || targetSheets.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '코드, 스프레드시트 ID, 대상 시트가 필요합니다'
        } as CodeExecutionResponse,
        { status: 400 }
      )
    }

    // 실제 환경에서는 Google Apps Script API를 사용하여 코드를 실행하지만,
    // 여기서는 시뮬레이션 모드로 코드를 분석하여 예상 결과를 생성합니다.
    const result = await simulateCodeExecution(code, spreadsheetId, targetSheets)

    return NextResponse.json({
      success: true,
      result
    } as CodeExecutionResponse)
  } catch (error: any) {
    console.error('코드 실행 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '코드 실행 중 오류가 발생했습니다'
      } as CodeExecutionResponse,
      { status: 500 }
    )
  }
}

/**
 * 코드 실행 시뮬레이션
 */
async function simulateCodeExecution(
  code: string,
  spreadsheetId: string,
  targetSheets: string[]
): Promise<CodeExecutionResult> {
  const startTime = Date.now()
  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 코드 분석하여 어떤 작업을 수행하는지 파악
  const operation = detectOperation(code)

  const logs: string[] = []
  const changes: CodeExecutionResult['changes'] = []

  logs.push(`[${new Date().toISOString()}] 코드 실행 시작`)
  logs.push(`[${new Date().toISOString()}] 대상 시트: ${targetSheets.join(', ')}`)
  logs.push(`[${new Date().toISOString()}] 작업 유형: ${operation.type}`)

  // 각 시트에 대해 시뮬레이션 수행
  for (const sheetName of targetSheets) {
    logs.push(`[${new Date().toISOString()}] 시트 '${sheetName}' 처리 중...`)

    // 시뮬레이션 데이터 생성
    const sheetChange = generateSimulationData(sheetName, operation)
    changes.push(sheetChange)

    logs.push(
      `[${new Date().toISOString()}] 시트 '${sheetName}' 완료: ` +
      `${sheetChange.rowsAffected}행 변경, ` +
      `${sheetChange.rowsDeleted || 0}행 삭제`
    )
  }

  const executionTimeMs = Date.now() - startTime
  logs.push(`[${new Date().toISOString()}] 실행 완료 (${executionTimeMs}ms)`)

  return {
    success: true,
    executionId,
    executedAt: new Date().toISOString(),
    changes,
    logs,
    executionTimeMs
  }
}

/**
 * 코드에서 수행하는 작업 유형 감지
 */
function detectOperation(code: string): {
  type: string
  description: string
} {
  const codeLower = code.toLowerCase()

  if (codeLower.includes('중복') || codeLower.includes('duplicate')) {
    return {
      type: 'remove_duplicates',
      description: '중복된 행 제거'
    }
  }

  if (codeLower.includes('빈 행') || codeLower.includes('empty') && codeLower.includes('row')) {
    return {
      type: 'remove_empty_rows',
      description: '빈 행 제거'
    }
  }

  if (codeLower.includes('빈 열') || codeLower.includes('empty') && codeLower.includes('column')) {
    return {
      type: 'remove_empty_columns',
      description: '빈 열 제거'
    }
  }

  if (codeLower.includes('수식') || codeLower.includes('formula')) {
    return {
      type: 'convert_formulas',
      description: '수식을 값으로 변환'
    }
  }

  if (codeLower.includes('공백') || codeLower.includes('trim')) {
    return {
      type: 'trim_data',
      description: '데이터 공백 제거'
    }
  }

  if (codeLower.includes('검증') || codeLower.includes('validat')) {
    return {
      type: 'validate_data',
      description: '데이터 검증'
    }
  }

  return {
    type: 'unknown',
    description: '코드 분석 중...'
  }
}

/**
 * 작업 유형에 따른 시뮬레이션 데이터 생성
 */
function generateSimulationData(
  sheetName: string,
  operation: { type: string; description: string }
): CodeExecutionResult['changes'][0] {
  // 샘플 데이터 생성 (실제로는 Google Sheets API로 가져와야 함)
  const sampleBefore = generateSampleData(operation.type, 'before')
  const sampleAfter = generateSampleData(operation.type, 'after')

  let rowsAffected = 0
  let columnsAffected = 0
  let rowsDeleted = 0
  let columnsDeleted = 0

  switch (operation.type) {
    case 'remove_duplicates':
      rowsAffected = sampleBefore.length
      rowsDeleted = Math.floor(sampleBefore.length * 0.15) // 15% 중복으로 가정
      break

    case 'remove_empty_rows':
      rowsAffected = sampleBefore.length
      rowsDeleted = Math.floor(sampleBefore.length * 0.1) // 10% 빈 행으로 가정
      break

    case 'remove_empty_columns':
      columnsAffected = sampleBefore[0]?.length || 0
      columnsDeleted = 1 // 1개 빈 열로 가정
      break

    case 'convert_formulas':
      rowsAffected = sampleBefore.length
      columnsAffected = sampleBefore[0]?.length || 0
      break

    case 'trim_data':
      rowsAffected = Math.floor(sampleBefore.length * 0.3) // 30%에 공백 있다고 가정
      columnsAffected = sampleBefore[0]?.length || 0
      break

    case 'validate_data':
      rowsAffected = sampleBefore.length
      columnsAffected = sampleBefore[0]?.length || 0
      break

    default:
      rowsAffected = sampleBefore.length
      columnsAffected = sampleBefore[0]?.length || 0
  }

  return {
    sheetName,
    before: sampleBefore,
    after: sampleAfter,
    rowsAffected,
    columnsAffected,
    rowsDeleted,
    columnsDeleted
  }
}

/**
 * 샘플 데이터 생성
 */
function generateSampleData(operationType: string, stage: 'before' | 'after'): any[][] {
  const headers = ['이름', '이메일', '전화번호', '주소']

  switch (operationType) {
    case 'remove_duplicates':
      if (stage === 'before') {
        return [
          headers,
          ['홍길동', 'hong@example.com', '010-1234-5678', '서울시 강남구'],
          ['김철수', 'kim@example.com', '010-2345-6789', '서울시 서초구'],
          ['홍길동', 'hong@example.com', '010-1234-5678', '서울시 강남구'], // 중복
          ['이영희', 'lee@example.com', '010-3456-7890', '서울시 송파구'],
          ['박민수', 'park@example.com', '010-4567-8901', '서울시 강동구']
        ]
      } else {
        return [
          headers,
          ['홍길동', 'hong@example.com', '010-1234-5678', '서울시 강남구'],
          ['김철수', 'kim@example.com', '010-2345-6789', '서울시 서초구'],
          ['이영희', 'lee@example.com', '010-3456-7890', '서울시 송파구'],
          ['박민수', 'park@example.com', '010-4567-8901', '서울시 강동구']
        ]
      }

    case 'remove_empty_rows':
      if (stage === 'before') {
        return [
          headers,
          ['홍길동', 'hong@example.com', '010-1234-5678', '서울시 강남구'],
          ['', '', '', ''], // 빈 행
          ['김철수', 'kim@example.com', '010-2345-6789', '서울시 서초구'],
          ['이영희', 'lee@example.com', '010-3456-7890', '서울시 송파구']
        ]
      } else {
        return [
          headers,
          ['홍길동', 'hong@example.com', '010-1234-5678', '서울시 강남구'],
          ['김철수', 'kim@example.com', '010-2345-6789', '서울시 서초구'],
          ['이영희', 'lee@example.com', '010-3456-7890', '서울시 송파구']
        ]
      }

    case 'remove_empty_columns':
      if (stage === 'before') {
        return [
          ['이름', '', '이메일', '전화번호'], // 빈 열
          ['홍길동', '', 'hong@example.com', '010-1234-5678'],
          ['김철수', '', 'kim@example.com', '010-2345-6789']
        ]
      } else {
        return [
          ['이름', '이메일', '전화번호'],
          ['홍길동', 'hong@example.com', '010-1234-5678'],
          ['김철수', 'kim@example.com', '010-2345-6789']
        ]
      }

    case 'convert_formulas':
      if (stage === 'before') {
        return [
          ['상품명', '수량', '단가', '합계'],
          ['노트북', 2, 1500000, '=B2*C2'],
          ['마우스', 5, 30000, '=B3*C3'],
          ['키보드', 3, 80000, '=B4*C4']
        ]
      } else {
        return [
          ['상품명', '수량', '단가', '합계'],
          ['노트북', 2, 1500000, 3000000],
          ['마우스', 5, 30000, 150000],
          ['키보드', 3, 80000, 240000]
        ]
      }

    case 'trim_data':
      if (stage === 'before') {
        return [
          headers,
          ['  홍길동  ', ' hong@example.com ', '010-1234-5678  ', '  서울시 강남구'],
          ['김철수', 'kim@example.com', '010-2345-6789', '서울시 서초구']
        ]
      } else {
        return [
          headers,
          ['홍길동', 'hong@example.com', '010-1234-5678', '서울시 강남구'],
          ['김철수', 'kim@example.com', '010-2345-6789', '서울시 서초구']
        ]
      }

    default:
      return [
        headers,
        ['홍길동', 'hong@example.com', '010-1234-5678', '서울시 강남구'],
        ['김철수', 'kim@example.com', '010-2345-6789', '서울시 서초구']
      ]
  }
}
