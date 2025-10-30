import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { analyzeSpreadsheetStructure } from '@/lib/agents/spreadsheet-analyst'
import { logger } from '@/lib/logger'
import { cache } from '@/lib/cache'
import { perfMonitor } from '@/lib/performance'

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
 * 시트 배치 처리 (병렬 처리 가능하도록 분리)
 */
async function processSheetBatch(
  sheets: any,
  sheetId: string,
  sheetName: string,
  startRow: number,
  endRow: number,
  maxCol: string
): Promise<{ formulas: any[], formulaTypes: Record<string, number> }> {
  const range = `${sheetName}!A${startRow + 1}:${maxCol}${endRow}`

  try {
    const batchData = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      ranges: [range],
      includeGridData: true,
      fields: 'sheets(data(rowData(values(userEnteredValue))))'
    })

    const rowData = batchData.data.sheets?.[0]?.data?.[0]?.rowData || []
    const formulas: any[] = []
    const formulaTypes: Record<string, number> = {}

    rowData.forEach((row, rowIndex) => {
      const values = row.values || []
      values.forEach((cell, colIndex) => {
        const formulaValue = cell.userEnteredValue?.formulaValue

        if (formulaValue) {
          const typeMatch = formulaValue.match(/^=([A-Z가-힣_]+)\s*\(/)
          const type = typeMatch ? typeMatch[1] : 'CUSTOM'

          formulas.push({
            type,
            location: { row: startRow + rowIndex, col: colIndex },
            formula: formulaValue,
            complexity: calculateFormulaComplexity(formulaValue)
          })

          formulaTypes[type] = (formulaTypes[type] || 0) + 1
        }
      })
    })

    return { formulas, formulaTypes }
  } catch (batchError: any) {
    if (batchError.code === 'ERR_STRING_TOO_LONG' || batchError.message?.includes('string longer than')) {
      logger.warn('analyze', `Sheet ${sheetName}: Memory overflow detected at batch ${startRow}-${endRow}`)
    } else {
      logger.error('analyze', `Error fetching batch ${startRow}-${endRow} for ${sheetName}:`, batchError.message)
    }
    return { formulas: [], formulaTypes: {} }
  }
}

/**
 * 시트 처리 (개별 시트 분석)
 */
async function processSheet(
  sheets: any,
  sheetId: string,
  sheet: any
): Promise<any> {
  const sheetName = sheet.properties?.title || 'Unnamed'
  const gridProperties = sheet.properties?.gridProperties || {}
  const rowCount = gridProperties.rowCount || 0
  const columnCount = gridProperties.columnCount || 0

  let allFormulas: any[] = []
  let allFormulaTypes: Record<string, number> = {}

  try {
    const batchSize = 10
    const maxRows = Math.min(rowCount, 200)
    const maxCol = 'M'
    const isSampling = rowCount > 200 || columnCount > 13

    if (isSampling) {
      logger.info('analyze', `Sheet ${sheetName}: Large sheet detected (${rowCount}x${columnCount}), using sampling strategy`)
    }

    // Process batches in parallel (3 concurrent batches max)
    const batchPromises: Promise<any>[] = []

    for (let startRow = 0; startRow < maxRows; startRow += batchSize) {
      const endRow = Math.min(startRow + batchSize, maxRows)

      batchPromises.push(
        processSheetBatch(sheets, sheetId, sheetName, startRow, endRow, maxCol)
      )

      // Process in groups of 3 to avoid overwhelming the API
      if (batchPromises.length >= 3) {
        const results = await Promise.all(batchPromises)

        results.forEach(result => {
          allFormulas.push(...result.formulas)
          Object.entries(result.formulaTypes).forEach(([type, count]) => {
            allFormulaTypes[type] = (allFormulaTypes[type] || 0) + (count as number)
          })
        })

        batchPromises.length = 0 // Clear array

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 150))
      }
    }

    // Process remaining batches
    if (batchPromises.length > 0) {
      const results = await Promise.all(batchPromises)

      results.forEach(result => {
        allFormulas.push(...result.formulas)
        Object.entries(result.formulaTypes).forEach(([type, count]) => {
          allFormulaTypes[type] = (allFormulaTypes[type] || 0) + (count as number)
        })
      })
    }
  } catch (error: any) {
    logger.error('analyze', `Error processing sheet ${sheetName}:`, error.message)
  }

  return {
    name: sheetName,
    formulas: allFormulas,
    formulaTypes: allFormulaTypes,
    dataRanges: [{
      start: 0,
      end: rowCount,
      columns: columnCount
    }],
    rowCount,
    columnCount
  }
}

/**
 * Google Sheets 분석 API (최적화됨)
 * POST /api/ssa/analyze
 */
export async function POST(request: NextRequest) {
  return perfMonitor.measure('ssa-analyze', async () => {
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

      // Check cache first (5 minute TTL)
      const cacheKey = `sheet-analysis:${sheetId}`
      const cached = cache.get(cacheKey)
      if (cached) {
        logger.info('analyze', `Cache hit for sheet ${sheetId}`)
        return NextResponse.json(cached)
      }

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

      // 스프레드시트 메타데이터 가져오기
      const spreadsheet = await perfMonitor.measure('fetch-metadata', async () => {
        return sheets.spreadsheets.get({
          spreadsheetId: sheetId,
          includeGridData: false
        })
      })

      // 각 시트를 병렬로 처리 (최대 2개 동시 처리)
      const allSheets = spreadsheet.data.sheets || []
      const analyzedSheets: any[] = []

      logger.info('analyze', `Processing ${allSheets.length} sheets in parallel (2 at a time)`)

      for (let i = 0; i < allSheets.length; i += 2) {
        const batch = allSheets.slice(i, i + 2)
        const results = await Promise.all(
          batch.map(sheet => processSheet(sheets, sheetId, sheet))
        )
        analyzedSheets.push(...results)
      }

      // 전체 통계 계산
      const totalFormulas = analyzedSheets.reduce((sum, sheet) => sum + sheet.formulas.length, 0)
      const allFormulaTypes: Record<string, number> = {}

      analyzedSheets.forEach(sheet => {
        Object.entries(sheet.formulaTypes).forEach(([type, count]) => {
          allFormulaTypes[type] = (allFormulaTypes[type] || 0) + (count as number)
        })
      })

      // 시트 간 참조 감지
      const dependencies: any[] = []
      const sheetNames = analyzedSheets.map(s => s.name)

      analyzedSheets.forEach(sheet => {
        sheet.formulas.forEach(formula => {
          const lookupSheets = new Set<string>()
          const formulaSheets = new Set<string>()

          // 시트 참조 패턴: 따옴표 있는 경우와 없는 경우 모두 감지
          // 예: '시트 이름'!A1 또는 시트이름!A1
          const quotedSheetPattern = /'([^']+)'!/g
          const unquotedSheetPattern = /([A-Za-z0-9가-힣_\-.]+)!/g

          const quotedMatches = formula.formula.matchAll(quotedSheetPattern)
          const unquotedMatches = formula.formula.matchAll(unquotedSheetPattern)

          const matches = [...quotedMatches, ...unquotedMatches]
          const isLookupFormula = /^=(?:VLOOKUP|HLOOKUP|XLOOKUP|INDEX|MATCH)\s*\(/i.test(formula.formula)

          for (const match of matches) {
            const targetSheet = match[1]?.trim()
            if (targetSheet && sheetNames.includes(targetSheet)) {
              if (isLookupFormula) {
                lookupSheets.add(targetSheet)
              } else {
                formulaSheets.add(targetSheet)
              }
            }
          }

          lookupSheets.forEach(targetSheet => {
            if (!dependencies.find(d => d.from === sheet.name && d.to === targetSheet)) {
              dependencies.push({
                from: sheet.name,
                to: targetSheet,
                type: 'lookup',
                reference: formula.location
              })
            }
          })

          formulaSheets.forEach(targetSheet => {
            if (!dependencies.find(d => d.from === sheet.name && d.to === targetSheet)) {
              dependencies.push({
                from: sheet.name,
                to: targetSheet,
                type: 'formula-dependency',
                reference: formula.location
              })
            }
          })
        })
      })

      // 복잡도 점수 계산
      const complexity = Math.min(100, Math.round(
        totalFormulas * 0.5 +
        Object.keys(allFormulaTypes).length * 2 +
        dependencies.length * 5
      ))

      // 샘플링 여부 확인
      const usedSampling = analyzedSheets.some(sheet =>
        sheet.rowCount > 200 || sheet.columnCount > 13
      )

      const analysis = {
        spreadsheetId: sheetId,
        spreadsheetTitle: spreadsheet.data.properties?.title || 'Untitled',
        sheets: analyzedSheets,
        totalFormulas,
        formulaTypes: allFormulaTypes,
        dependencies,
        complexity,
        samplingInfo: usedSampling ? {
          used: true,
          reason: '대용량 스프레드시트로 인해 샘플링 분석을 수행했습니다',
          limits: {
            maxRows: 200,
            maxColumns: 13
          }
        } : undefined
      }

      // 🤖 AI Agent를 사용한 구조 분석 추가
      logger.info('analyze', 'Running structure analysis agent')
      const structureAnalysis = await perfMonitor.measure('structure-analysis', async () => {
        return analyzeSpreadsheetStructure(analysis)
      })
      logger.info('analyze', 'Structure analysis completed')

      const result = {
        ...analysis,
        structureAnalysis
      }

      // Cache the result (5 minutes)
      cache.set(cacheKey, result, 300)

      return NextResponse.json(result)
    } catch (error: any) {
      logger.error('analyze', 'Analysis error:', error)

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

      if (error.code === 401) {
        return NextResponse.json(
          { error: 'Google Service Account 인증에 실패했습니다. 환경 설정을 확인해주세요.' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        {
          error: error.message || '스프레드시트 분석 중 오류가 발생했습니다',
          details: error.errors?.[0]?.message
        },
        { status: 500 }
      )
    }
  })
}
