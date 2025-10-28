import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { analyzeSpreadsheetStructure } from '@/lib/agents/spreadsheet-analyst'

/**
 * 수식 복잡도 계산
 */
function calculateFormulaComplexity(formula: string): number {
  let complexity = 1

  // 중첩된 함수 개수
  const nestedFunctions = (formula.match(/[A-Z]+\(/g) || []).length
  complexity += nestedFunctions * 2

  // 논리 연산자
  const logicalOps = (formula.match(/AND|OR|NOT|IF/g) || []).length
  complexity += logicalOps

  // 범위 참조
  const rangeRefs = (formula.match(/[A-Z]+[0-9]+:[A-Z]+[0-9]+/g) || []).length
  complexity += rangeRefs

  // 시트 간 참조
  const sheetRefs = (formula.match(/[A-Z가-힣\s]+!/g) || []).length
  complexity += sheetRefs * 2

  return Math.min(10, complexity)
}

/**
 * Google Sheets 분석 API
 * POST /api/ssa/analyze
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL이 필요합니다' },
        { status: 400 }
      )
    }

    // Google Sheets ID 추출
    const sheetIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (!sheetIdMatch) {
      return NextResponse.json(
        { error: '유효하지 않은 Google Sheets URL입니다' },
        { status: 400 }
      )
    }

    const sheetId = sheetIdMatch[1]

    // 환경 변수 확인
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Google Service Account 설정이 필요합니다. 환경 설정 페이지에서 설정해주세요.' },
        { status: 500 }
      )
    }

    // Google Sheets API 인증
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    )

    const sheets = google.sheets({ version: 'v4', auth })

    // 스프레드시트 메타데이터 가져오기 (데이터 제외)
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      includeGridData: false // 메모리 문제 방지
    })

    // 각 시트별로 수식만 추출 (한 시트씩 순차 처리)
    const analyzedSheets: any[] = []

    for (const sheet of (spreadsheet.data.sheets || [])) {
      const sheetName = sheet.properties?.title || 'Unnamed'
      const gridProperties = sheet.properties?.gridProperties || {}
      const rowCount = gridProperties.rowCount || 0
      const columnCount = gridProperties.columnCount || 0

      let formulas: any[] = []
      let formulaTypes: Record<string, number> = {}

      try {
        // 작은 범위로 나눠서 가져오기 (20행씩)
        const batchSize = 20
        const maxRows = Math.min(rowCount, 1000) // 최대 1000행까지 분석
        const maxCol = 'ZZ' // ZZ열까지 분석 (최대 702열)

        for (let startRow = 0; startRow < maxRows; startRow += batchSize) {
          const endRow = Math.min(startRow + batchSize, maxRows)
          const range = `${sheetName}!A${startRow + 1}:${maxCol}${endRow}`

          try {
            const batchData = await sheets.spreadsheets.get({
              spreadsheetId: sheetId, // 올바른 spreadsheet ID 사용
              ranges: [range],
              includeGridData: true,
              fields: 'sheets(data(rowData(values(userEnteredValue))))'
            })

            const rowData = batchData.data.sheets?.[0]?.data?.[0]?.rowData || []

            rowData.forEach((row, rowIndex) => {
              const values = row.values || []
              values.forEach((cell, colIndex) => {
                const formulaValue = cell.userEnteredValue?.formulaValue

                if (formulaValue) {
                  // 수식 함수명 추출 (셀 참조 제외)
                  // =SUM(...), =VLOOKUP(...) 형태만 매칭
                  const typeMatch = formulaValue.match(/^=([A-Z가-힣_]+)\s*\(/)
                  const type = typeMatch ? typeMatch[1] : 'CUSTOM'

                  formulas.push({
                    type,
                    location: { row: startRow + rowIndex, col: colIndex },
                    formula: formulaValue.substring(0, 100),
                    complexity: calculateFormulaComplexity(formulaValue)
                  })

                  formulaTypes[type] = (formulaTypes[type] || 0) + 1
                }
              })
            })

            // 작은 딜레이 추가 (API rate limit 방지)
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (batchError: any) {
            console.error(`Error fetching batch ${startRow}-${endRow} for ${sheetName}:`, batchError.message)
            break // 에러 발생 시 다음 시트로
          }
        }
      } catch (error: any) {
        console.error(`Error processing sheet ${sheetName}:`, error.message)
      }

      analyzedSheets.push({
        name: sheetName,
        formulas,
        formulaTypes,
        dataRanges: [{
          start: 0,
          end: rowCount,
          columns: columnCount
        }],
        rowCount,
        columnCount
      })
    }

    // 전체 통계 계산
    const totalFormulas = analyzedSheets.reduce((sum, sheet) => sum + sheet.formulas.length, 0)
    const allFormulaTypes: Record<string, number> = {}

    analyzedSheets.forEach(sheet => {
      Object.entries(sheet.formulaTypes).forEach(([type, count]) => {
        allFormulaTypes[type] = (allFormulaTypes[type] || 0) + count
      })
    })

    // 시트 간 참조 감지
    const dependencies: any[] = []
    const sheetNames = analyzedSheets.map(s => s.name)

    analyzedSheets.forEach(sheet => {
      sheet.formulas.forEach(formula => {
        // 시트 참조 패턴: '시트명'!A1 또는 시트명!A1
        const refMatches = formula.formula.matchAll(/(?:'([^']+)'|([A-Z가-힣0-9\s]+))!([A-Z]+[0-9]+(?::[A-Z]+[0-9]+)?)/g)

        for (const match of refMatches) {
          const targetSheet = match[1] || match[2] // 따옴표로 감싸진 이름 또는 일반 이름

          // 실제 존재하는 시트인지 확인
          if (targetSheet && sheetNames.includes(targetSheet.trim())) {
            if (!dependencies.find(d => d.from === sheet.name && d.to === targetSheet.trim())) {
              dependencies.push({
                from: sheet.name,
                to: targetSheet.trim(),
                reference: formula.location
              })
            }
          }
        }
      })
    })

    // 복잡도 점수 계산
    const complexity = Math.min(100, Math.round(
      totalFormulas * 0.5 +
      Object.keys(allFormulaTypes).length * 2 +
      dependencies.length * 5
    ))

    const analysis = {
      spreadsheetId: sheetId,
      spreadsheetTitle: spreadsheet.data.properties?.title || 'Untitled',
      sheets: analyzedSheets,
      totalFormulas,
      formulaTypes: allFormulaTypes,
      dependencies,
      complexity
    }

    // 🤖 AI Agent를 사용한 구조 분석 추가
    console.log('[analyze] Running structure analysis agent...')
    const structureAnalysis = await analyzeSpreadsheetStructure(analysis)
    console.log('[analyze] Structure analysis completed')

    return NextResponse.json({
      ...analysis,
      structureAnalysis // AI Agent의 분석 결과 추가
    })
  } catch (error: any) {
    console.error('분석 오류:', error)

    // 권한 오류 처리
    if (error.code === 403) {
      return NextResponse.json(
        {
          error: '스프레드시트에 접근할 수 없습니다. 서비스 계정에 스프레드시트 공유 권한을 부여해주세요.',
          serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          hint: '스프레드시트 공유 설정에서 이 이메일 주소를 뷰어로 추가해주세요.'
        },
        { status: 403 }
      )
    }

    // 인증 오류 처리
    if (error.code === 401) {
      return NextResponse.json(
        { error: 'Google Service Account 인증에 실패했습니다. 환경 설정을 확인해주세요.' },
        { status: 401 }
      )
    }

    // 일반 오류
    return NextResponse.json(
      {
        error: error.message || '스프레드시트 분석 중 오류가 발생했습니다',
        details: error.errors?.[0]?.message
      },
      { status: 500 }
    )
  }
}
