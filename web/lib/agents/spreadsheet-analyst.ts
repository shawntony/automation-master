/**
 * Spreadsheet Structure Analyst Agent
 *
 * 스프레드시트의 구조를 분석하고 시각적 다이어그램과 자연어 설명을 생성하는 전문 Agent
 */

export interface SheetStructure {
  name: string
  rowCount: number
  columnCount: number
  formulas: any[]
  formulaTypes: Record<string, number>
  dataRanges: any[]
}

export interface SpreadsheetAnalysis {
  spreadsheetId: string
  spreadsheetTitle: string
  sheets: SheetStructure[]
  totalFormulas: number
  formulaTypes: Record<string, number>
  dependencies: any[]
  complexity: number
}

export interface StructureAnalysisResult {
  // 시각적 다이어그램 (Mermaid 형식)
  diagram: {
    mermaid: string
    type: 'flowchart' | 'graph'
  }

  // 자연어 설명
  description: {
    overview: string // 전체 개요
    purpose: string // 스프레드시트의 목적
    creatorIntent: {
      mainGoal: string // 제작자의 주요 목표
      businessContext: string // 비즈니스 맥락
      workflowDesign: string // 워크플로우 설계 의도
      painPoints: string[] // 해결하려는 문제점들
    }
    dataFlow: string // 데이터 흐름 설명
    sheetDescriptions: Array<{
      sheetName: string
      role: string // 이 시트의 역할
      keyFeatures: string[] // 주요 특징
    }>
    complexity: {
      level: 'simple' | 'moderate' | 'complex' | 'very-complex'
      reasons: string[]
    }
    recommendations: string[] // 개선 제안
  }

  // 구조 분석
  structure: {
    sheetRelationships: Array<{
      from: string
      to: string
      type: 'data-reference' | 'formula-dependency' | 'lookup'
      description: string
    }>
    dataPatterns: Array<{
      pattern: string
      sheets: string[]
      description: string
    }>
    businessLogic: Array<{
      logic: string
      location: string
      description: string
    }>
  }
}

/**
 * 스프레드시트 구조 분석 Agent
 */
export async function analyzeSpreadsheetStructure(
  analysis: SpreadsheetAnalysis
): Promise<StructureAnalysisResult> {

  // 1. 시트 간 관계 분석
  const relationships = analyzeSheetRelationships(analysis)

  // 2. 데이터 패턴 감지
  const patterns = detectDataPatterns(analysis)

  // 3. 비즈니스 로직 추론
  const businessLogic = inferBusinessLogic(analysis)

  // 4. 제작자의 의도 추론 (새로 추가!)
  const creatorIntent = inferCreatorIntent(analysis, relationships, patterns, businessLogic)

  // 5. Mermaid 다이어그램 생성
  const diagram = generateMermaidDiagram(analysis, relationships)

  // 6. 자연어 설명 생성
  const description = generateNaturalLanguageDescription(
    analysis,
    relationships,
    patterns,
    businessLogic,
    creatorIntent
  )

  return {
    diagram,
    description,
    structure: {
      sheetRelationships: relationships,
      dataPatterns: patterns,
      businessLogic
    }
  }
}

/**
 * 시트 간 관계 분석
 */
function analyzeSheetRelationships(analysis: SpreadsheetAnalysis) {
  const relationships: Array<{
    from: string
    to: string
    type: 'data-reference' | 'formula-dependency' | 'lookup'
    description: string
  }> = []

  // dependencies에서 관계 추출
  analysis.dependencies.forEach(dep => {
    // 수식 타입에 따라 관계 유형 결정
    let type: 'data-reference' | 'formula-dependency' | 'lookup' = 'data-reference'
    let description = `'${dep.from}' 시트에서 '${dep.to}' 시트를 참조합니다`

    // 해당 시트의 수식 분석
    const fromSheet = analysis.sheets.find(s => s.name === dep.from)
    if (fromSheet) {
      const hasVlookup = fromSheet.formulaTypes['VLOOKUP'] ||
                        fromSheet.formulaTypes['HLOOKUP'] ||
                        fromSheet.formulaTypes['XLOOKUP']
      const hasIndex = fromSheet.formulaTypes['INDEX']
      const hasMatch = fromSheet.formulaTypes['MATCH']

      if (hasVlookup || (hasIndex && hasMatch)) {
        type = 'lookup'
        description = `'${dep.from}' 시트에서 '${dep.to}' 시트의 데이터를 검색합니다`
      } else {
        type = 'formula-dependency'
        description = `'${dep.from}' 시트의 수식이 '${dep.to}' 시트에 의존합니다`
      }
    }

    relationships.push({
      from: dep.from,
      to: dep.to,
      type,
      description
    })
  })

  return relationships
}

/**
 * 데이터 패턴 감지
 */
function detectDataPatterns(analysis: SpreadsheetAnalysis) {
  const patterns: Array<{
    pattern: string
    sheets: string[]
    description: string
  }> = []

  // 1. 마스터 데이터 시트 감지 (다른 시트들이 참조하는 시트)
  const referenceCounts: Record<string, number> = {}
  analysis.dependencies.forEach(dep => {
    referenceCounts[dep.to] = (referenceCounts[dep.to] || 0) + 1
  })

  const masterSheets = Object.entries(referenceCounts)
    .filter(([_, count]) => count >= 2)
    .map(([sheet, _]) => sheet)

  if (masterSheets.length > 0) {
    patterns.push({
      pattern: 'master-data',
      sheets: masterSheets,
      description: '여러 시트에서 참조되는 마스터 데이터를 포함합니다'
    })
  }

  // 2. 계산 시트 감지 (수식이 많고 참조를 많이 하는 시트)
  const calculationSheets = analysis.sheets
    .filter(sheet => {
      const formulaCount = sheet.formulas.length
      const totalCells = sheet.rowCount * sheet.columnCount
      const formulaRatio = totalCells > 0 ? formulaCount / totalCells : 0
      return formulaRatio > 0.3 && formulaCount > 10
    })
    .map(s => s.name)

  if (calculationSheets.length > 0) {
    patterns.push({
      pattern: 'calculation-sheet',
      sheets: calculationSheets,
      description: '복잡한 계산과 수식을 수행하는 시트입니다'
    })
  }

  // 3. 집계 시트 감지 (SUM, AVERAGE, COUNT 등이 많은 시트)
  const aggregationSheets = analysis.sheets
    .filter(sheet => {
      const aggFunctions = ['SUM', 'SUMIF', 'SUMIFS', 'AVERAGE', 'AVERAGEIF', 'COUNT', 'COUNTIF']
      const aggCount = aggFunctions.reduce((sum, func) =>
        sum + (sheet.formulaTypes[func] || 0), 0
      )
      return aggCount > 5
    })
    .map(s => s.name)

  if (aggregationSheets.length > 0) {
    patterns.push({
      pattern: 'aggregation-sheet',
      sheets: aggregationSheets,
      description: '데이터를 집계하고 요약하는 시트입니다'
    })
  }

  // 4. 조회 시트 감지 (VLOOKUP, INDEX/MATCH가 많은 시트)
  const lookupSheets = analysis.sheets
    .filter(sheet => {
      const lookupCount = (sheet.formulaTypes['VLOOKUP'] || 0) +
                         (sheet.formulaTypes['HLOOKUP'] || 0) +
                         (sheet.formulaTypes['XLOOKUP'] || 0) +
                         (sheet.formulaTypes['INDEX'] || 0)
      return lookupCount > 3
    })
    .map(s => s.name)

  if (lookupSheets.length > 0) {
    patterns.push({
      pattern: 'lookup-sheet',
      sheets: lookupSheets,
      description: '다른 시트에서 데이터를 조회하고 가져오는 시트입니다'
    })
  }

  return patterns
}

/**
 * 제작자의 의도 추론
 * 스프레드시트 구조와 패턴을 보고 제작자가 무엇을 하려고 했는지 깊이 있게 분석
 */
function inferCreatorIntent(
  analysis: SpreadsheetAnalysis,
  relationships: any[],
  patterns: any[],
  businessLogic: any[]
) {
  let mainGoal = ''
  let businessContext = ''
  let workflowDesign = ''
  const painPoints: string[] = []

  // 1. 주요 목표 추론
  const hasMasterData = patterns.some(p => p.pattern === 'master-data')
  const hasAggregation = patterns.some(p => p.pattern === 'aggregation-sheet')
  const hasLookup = patterns.some(p => p.pattern === 'lookup-sheet')
  const hasCalculation = patterns.some(p => p.pattern === 'calculation-sheet')

  if (hasMasterData && hasLookup && hasAggregation) {
    mainGoal = '여러 데이터 소스를 통합하고 분석하여 인사이트를 도출하려는 목표'
    businessContext = '분산된 데이터를 중앙화하고, 실시간으로 집계 분석이 필요한 업무 환경으로 보입니다. 아마도 정기적인 보고서 작성이나 의사결정을 위한 데이터 분석이 주 목적일 것입니다.'
    workflowDesign = '마스터 데이터 → 조회/참조 → 집계/분석 순서로 데이터가 흐르도록 설계했습니다. 이는 데이터 무결성을 유지하면서도 다양한 관점에서 분석할 수 있도록 한 체계적인 접근입니다.'
    painPoints.push('수동으로 데이터를 여러 곳에서 복사하는 번거로움')
    painPoints.push('데이터가 변경될 때마다 여러 시트를 업데이트해야 하는 불편함')
    painPoints.push('집계 결과의 정확성을 보장하기 어려운 문제')
  } else if (hasCalculation && analysis.complexity > 50) {
    mainGoal = '복잡한 비즈니스 로직을 자동화하여 반복 작업을 줄이려는 목표'
    businessContext = '정형화된 프로세스가 있지만 매번 수동으로 계산하기에는 시간이 많이 걸리는 업무로 보입니다. 아마도 견적서 작성, 급여 계산, 재고 관리 등의 업무일 가능성이 높습니다.'
    workflowDesign = '입력 데이터를 받아 정해진 규칙에 따라 자동으로 계산하고 결과를 산출하는 워크플로우를 구축했습니다. 조건부 로직을 많이 사용한 것으로 보아 다양한 케이스를 처리하려는 의도가 보입니다.'
    painPoints.push('같은 계산을 반복적으로 수행하는 시간 낭비')
    painPoints.push('수동 계산 시 실수로 인한 오류 발생')
    painPoints.push('규칙이 복잡해질수록 관리가 어려워지는 문제')
  } else if (hasLookup && relationships.length > 3) {
    mainGoal = '분산된 정보를 효율적으로 조회하고 통합하려는 목표'
    businessContext = '여러 곳에 흩어진 데이터를 빠르게 찾아서 연결해야 하는 업무로 보입니다. 고객 정보 조회, 재고 확인, 가격 책정 등의 업무에서 자주 보이는 패턴입니다.'
    workflowDesign = '각 시트가 특정 정보를 담당하고, 필요할 때 다른 시트에서 관련 정보를 자동으로 가져오도록 설계했습니다. 이는 데이터 중복을 최소화하면서도 필요한 정보를 빠르게 조회할 수 있게 합니다.'
    painPoints.push('필요한 정보를 찾기 위해 여러 시트를 오가는 번거로움')
    painPoints.push('데이터를 수동으로 복사하면서 발생하는 동기화 문제')
    painPoints.push('정보가 업데이트되어도 참조하는 곳에 반영되지 않는 문제')
  } else if (hasAggregation && !hasMasterData) {
    mainGoal = '데이터를 효과적으로 요약하고 시각화하려는 목표'
    businessContext = '상세 데이터를 다양한 기준으로 집계하여 전체 현황을 파악해야 하는 업무로 보입니다. 판매 실적 분석, 프로젝트 진행 현황 파악 등의 목적일 것입니다.'
    workflowDesign = '원본 데이터를 유지하면서 다양한 관점(시간별, 카테고리별, 담당자별 등)으로 집계하는 구조를 만들었습니다. 이를 통해 같은 데이터에서 여러 인사이트를 도출할 수 있습니다.'
    painPoints.push('데이터가 많아질수록 전체 현황을 파악하기 어려운 문제')
    painPoints.push('다양한 기준으로 집계하기 위해 매번 수작업하는 불편함')
    painPoints.push('집계 기준이 바뀔 때마다 처음부터 다시 작업해야 하는 비효율')
  } else {
    mainGoal = '업무 데이터를 체계적으로 관리하고 활용하려는 목표'
    businessContext = '일상적인 업무에서 발생하는 데이터를 정리하고 필요할 때 쉽게 찾아 활용하기 위한 시스템으로 보입니다.'
    workflowDesign = '각 시트가 명확한 목적을 가지고 서로 보완적인 역할을 하도록 구성했습니다. 단순하지만 실용적인 접근입니다.'
    painPoints.push('데이터가 흩어져 있어 찾기 어려운 문제')
    painPoints.push('필요한 정보를 빠르게 확인하기 어려운 불편함')
  }

  // 2. 추가적인 의도 단서들

  // 조건부 로직이 많으면 예외 상황 처리 의도
  const hasConditionalLogic = businessLogic.some(l => l.logic === 'conditional-logic')
  if (hasConditionalLogic) {
    painPoints.push('다양한 예외 상황을 일일이 처리하기 어려운 문제')
  }

  // 데이터 검증이 있으면 품질 관리 의도
  const hasValidation = businessLogic.some(l => l.logic === 'data-validation')
  if (hasValidation) {
    painPoints.push('잘못된 데이터 입력으로 인한 오류를 방지하려는 필요')
  }

  // 날짜 처리가 있으면 시간 기반 분석 의도
  const hasDateProcessing = businessLogic.some(l => l.logic === 'date-time-processing')
  if (hasDateProcessing) {
    if (!painPoints.includes('시간 흐름에 따른 변화를 추적하기 어려운 문제')) {
      painPoints.push('시간 흐름에 따른 변화를 추적하기 어려운 문제')
    }
  }

  // 텍스트 처리가 많으면 데이터 정제/통합 의도
  const hasTextProcessing = businessLogic.some(l => l.logic === 'text-processing')
  if (hasTextProcessing) {
    painPoints.push('비정형 텍스트 데이터를 표준화하고 분석하기 어려운 문제')
  }

  // 3. 워크플로우 설계 의도 보완
  if (relationships.length > 5) {
    workflowDesign += ' 여러 시트가 긴밀하게 연결되어 있는 것으로 보아, 하나의 통합된 시스템으로 운영하려는 의도가 강합니다.'
  }

  if (analysis.sheets.length > 5) {
    workflowDesign += ' 각 업무 영역을 분리하여 관리하면서도 필요할 때 통합할 수 있도록 모듈화한 접근입니다.'
  }

  return {
    mainGoal,
    businessContext,
    workflowDesign,
    painPoints
  }
}

/**
 * 비즈니스 로직 추론
 */
function inferBusinessLogic(analysis: SpreadsheetAnalysis) {
  const logic: Array<{
    logic: string
    location: string
    description: string
  }> = []

  // 1. 조건부 로직 감지
  const ifSheets = analysis.sheets.filter(s =>
    (s.formulaTypes['IF'] || 0) > 3
  )

  ifSheets.forEach(sheet => {
    logic.push({
      logic: 'conditional-logic',
      location: sheet.name,
      description: `조건에 따라 다른 값을 계산하는 로직이 포함되어 있습니다 (IF 함수 ${sheet.formulaTypes['IF']}개)`
    })
  })

  // 2. 데이터 검증 로직
  const validationSheets = analysis.sheets.filter(s =>
    (s.formulaTypes['ISERROR'] || 0) > 0 ||
    (s.formulaTypes['IFERROR'] || 0) > 0 ||
    (s.formulaTypes['ISBLANK'] || 0) > 0
  )

  validationSheets.forEach(sheet => {
    logic.push({
      logic: 'data-validation',
      location: sheet.name,
      description: '데이터 유효성을 검사하고 오류를 처리하는 로직이 있습니다'
    })
  })

  // 3. 날짜/시간 처리
  const dateSheets = analysis.sheets.filter(s =>
    (s.formulaTypes['DATE'] || 0) > 0 ||
    (s.formulaTypes['TODAY'] || 0) > 0 ||
    (s.formulaTypes['NOW'] || 0) > 0 ||
    (s.formulaTypes['YEAR'] || 0) > 0 ||
    (s.formulaTypes['MONTH'] || 0) > 0
  )

  dateSheets.forEach(sheet => {
    logic.push({
      logic: 'date-time-processing',
      location: sheet.name,
      description: '날짜와 시간을 처리하는 로직이 포함되어 있습니다'
    })
  })

  // 4. 텍스트 처리
  const textSheets = analysis.sheets.filter(s =>
    (s.formulaTypes['CONCATENATE'] || 0) > 0 ||
    (s.formulaTypes['LEFT'] || 0) > 0 ||
    (s.formulaTypes['RIGHT'] || 0) > 0 ||
    (s.formulaTypes['MID'] || 0) > 0 ||
    (s.formulaTypes['TRIM'] || 0) > 0
  )

  textSheets.forEach(sheet => {
    logic.push({
      logic: 'text-processing',
      location: sheet.name,
      description: '텍스트를 조작하고 가공하는 로직이 있습니다'
    })
  })

  return logic
}

/**
 * Mermaid 다이어그램 생성
 */
function generateMermaidDiagram(
  analysis: SpreadsheetAnalysis,
  relationships: any[]
) {
  const lines: string[] = []

  // 그래프 시작
  lines.push('graph TB')
  lines.push('')

  // 노드 정의 (시트들)
  analysis.sheets.forEach(sheet => {
    const nodeId = sanitizeNodeId(sheet.name)
    const formulaCount = sheet.formulas.length
    const label = `${sheet.name}<br/>${formulaCount}개 수식`

    // 시트 타입에 따라 스타일 다르게
    if (formulaCount === 0) {
      // 데이터 시트 (수식 없음)
      lines.push(`  ${nodeId}["${label}"]`)
      lines.push(`  style ${nodeId} fill:#e3f2fd,stroke:#1976d2`)
    } else if (formulaCount > 20) {
      // 복잡한 계산 시트
      lines.push(`  ${nodeId}{"${label}"}`)
      lines.push(`  style ${nodeId} fill:#fff3e0,stroke:#f57c00`)
    } else {
      // 일반 시트
      lines.push(`  ${nodeId}["${label}"]`)
      lines.push(`  style ${nodeId} fill:#f3e5f5,stroke:#7b1fa2`)
    }
  })

  lines.push('')

  // 관계 정의
  relationships.forEach(rel => {
    const fromId = sanitizeNodeId(rel.from)
    const toId = sanitizeNodeId(rel.to)

    let arrow = '-->'
    let label = ''

    switch (rel.type) {
      case 'lookup':
        arrow = '-.조회.->'
        label = '조회'
        break
      case 'formula-dependency':
        arrow = '-->|참조|'
        label = '참조'
        break
      case 'data-reference':
        arrow = '-->|데이터|'
        label = '데이터'
        break
    }

    lines.push(`  ${fromId} ${arrow} ${toId}`)
  })

  return {
    mermaid: lines.join('\n'),
    type: 'flowchart' as const
  }
}

/**
 * Mermaid 노드 ID 정리 (특수문자 제거)
 */
function sanitizeNodeId(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9가-힣]/g, '_')
    .replace(/^[0-9]/, 'S$&') // 숫자로 시작하면 S 붙이기
}

/**
 * 자연어 설명 생성
 */
function generateNaturalLanguageDescription(
  analysis: SpreadsheetAnalysis,
  relationships: any[],
  patterns: any[],
  businessLogic: any[],
  creatorIntent: any
) {
  // 1. 전체 개요
  const overview = `이 스프레드시트는 총 ${analysis.sheets.length}개의 시트로 구성되어 있으며, ${analysis.totalFormulas}개의 수식을 포함하고 있습니다.`

  // 2. 스프레드시트의 목적 추론
  let purpose = ''

  if (patterns.some(p => p.pattern === 'aggregation-sheet')) {
    purpose = '데이터를 집계하고 분석하는 용도로 사용되고 있습니다.'
  } else if (patterns.some(p => p.pattern === 'calculation-sheet')) {
    purpose = '복잡한 계산과 데이터 처리를 수행하는 용도입니다.'
  } else if (patterns.some(p => p.pattern === 'lookup-sheet')) {
    purpose = '여러 소스에서 데이터를 조회하고 통합하는 용도입니다.'
  } else {
    purpose = '다양한 데이터를 관리하고 처리하는 종합 워크시트입니다.'
  }

  // 3. 데이터 흐름 설명
  let dataFlow = ''

  if (relationships.length === 0) {
    dataFlow = '각 시트가 독립적으로 작동하며, 시트 간 참조가 없습니다.'
  } else {
    const masterSheets = patterns.find(p => p.pattern === 'master-data')?.sheets || []

    if (masterSheets.length > 0) {
      dataFlow = `'${masterSheets.join("', '")}' 시트가 마스터 데이터 역할을 하며, 다른 시트들이 이를 참조합니다. `
    }

    const lookupSheets = patterns.find(p => p.pattern === 'lookup-sheet')?.sheets || []
    if (lookupSheets.length > 0) {
      dataFlow += `'${lookupSheets.join("', '")}' 시트에서 데이터 조회가 이루어집니다.`
    }
  }

  // 4. 각 시트 설명
  const sheetDescriptions = analysis.sheets.map(sheet => {
    const role = inferSheetRole(sheet, patterns, relationships)
    const keyFeatures = extractKeyFeatures(sheet)

    return {
      sheetName: sheet.name,
      role,
      keyFeatures
    }
  })

  // 5. 복잡도 평가
  let complexityLevel: 'simple' | 'moderate' | 'complex' | 'very-complex' = 'simple'
  const complexityReasons: string[] = []

  if (analysis.complexity < 20) {
    complexityLevel = 'simple'
    complexityReasons.push('수식의 개수가 적고 구조가 단순합니다')
  } else if (analysis.complexity < 50) {
    complexityLevel = 'moderate'
    complexityReasons.push('적당한 수의 수식과 시트 간 참조가 있습니다')
  } else if (analysis.complexity < 80) {
    complexityLevel = 'complex'
    complexityReasons.push('많은 수식과 복잡한 시트 간 관계가 있습니다')
  } else {
    complexityLevel = 'very-complex'
    complexityReasons.push('매우 많은 수식과 복잡한 의존성 구조를 가지고 있습니다')
  }

  if (relationships.length > 5) {
    complexityReasons.push(`${relationships.length}개의 시트 간 참조가 있습니다`)
  }

  if (Object.keys(analysis.formulaTypes).length > 10) {
    complexityReasons.push(`${Object.keys(analysis.formulaTypes).length}가지 종류의 수식을 사용합니다`)
  }

  // 6. 개선 제안
  const recommendations: string[] = []

  if (analysis.complexity > 60) {
    recommendations.push('복잡도가 높습니다. Apps Script로 변환하면 유지보수가 더 쉬워집니다.')
  }

  if (relationships.length > 5) {
    recommendations.push('시트 간 참조가 많습니다. 모듈화된 함수로 구조를 개선할 수 있습니다.')
  }

  const heavyFormulas = ['VLOOKUP', 'SUMIFS', 'COUNTIFS', 'AVERAGEIFS']
  const hasHeavyFormulas = heavyFormulas.some(f => (analysis.formulaTypes[f] || 0) > 10)

  if (hasHeavyFormulas) {
    recommendations.push('성능이 느린 수식이 많습니다. Apps Script로 최적화하면 속도가 개선됩니다.')
  }

  if (businessLogic.length > 5) {
    recommendations.push('복잡한 비즈니스 로직이 있습니다. 코드로 변환하면 로직을 명확하게 문서화할 수 있습니다.')
  }

  if (recommendations.length === 0) {
    recommendations.push('전체적으로 잘 구조화되어 있습니다.')
  }

  return {
    overview,
    purpose,
    creatorIntent, // 제작자 의도 추가!
    dataFlow,
    sheetDescriptions,
    complexity: {
      level: complexityLevel,
      reasons: complexityReasons
    },
    recommendations
  }
}

/**
 * 시트의 역할 추론
 */
function inferSheetRole(
  sheet: SheetStructure,
  patterns: any[],
  relationships: any[]
): string {
  // 마스터 데이터 시트인가?
  const isMaster = patterns.some(p =>
    p.pattern === 'master-data' && p.sheets.includes(sheet.name)
  )
  if (isMaster) return '마스터 데이터 저장소'

  // 계산 시트인가?
  const isCalculation = patterns.some(p =>
    p.pattern === 'calculation-sheet' && p.sheets.includes(sheet.name)
  )
  if (isCalculation) return '데이터 계산 및 처리'

  // 집계 시트인가?
  const isAggregation = patterns.some(p =>
    p.pattern === 'aggregation-sheet' && p.sheets.includes(sheet.name)
  )
  if (isAggregation) return '데이터 집계 및 요약'

  // 조회 시트인가?
  const isLookup = patterns.some(p =>
    p.pattern === 'lookup-sheet' && p.sheets.includes(sheet.name)
  )
  if (isLookup) return '데이터 조회 및 검색'

  // 수식이 없으면 데이터 입력 시트
  if (sheet.formulas.length === 0) return '데이터 입력 및 저장'

  // 기본
  return '데이터 처리'
}

/**
 * 시트의 주요 특징 추출
 */
function extractKeyFeatures(sheet: SheetStructure): string[] {
  const features: string[] = []

  // 크기
  features.push(`${sheet.rowCount}행 × ${sheet.columnCount}열`)

  // 수식 개수
  if (sheet.formulas.length > 0) {
    features.push(`${sheet.formulas.length}개 수식`)
  } else {
    features.push('수식 없음 (데이터 시트)')
  }

  // 주요 수식 타입
  const topFormulas = Object.entries(sheet.formulaTypes)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([type, _]) => type)

  if (topFormulas.length > 0) {
    features.push(`주요 수식: ${topFormulas.join(', ')}`)
  }

  return features
}
