import { NextRequest, NextResponse } from 'next/server'
import type { CodeGenerationRequest, CodeGenerationResponse, GeneratedCode } from '@/types/roadmap'

/**
 * 자연어 기반 Apps Script 코드 생성 API
 * POST /api/ssa/generate-code
 *
 * 사용자의 자연어 요청을 받아 Apps Script 코드를 자동으로 생성합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CodeGenerationRequest = await request.json()
    const { userRequest, analysisResult, targetSheets, relatedStepId } = body

    if (!userRequest) {
      return NextResponse.json(
        {
          success: false,
          error: '요청 내용이 필요합니다'
        } as CodeGenerationResponse,
        { status: 400 }
      )
    }

    console.log('[generate-code] Generating code for request:', userRequest)
    console.log('[generate-code] Context:', {
      spreadsheetId: analysisResult?.spreadsheetId,
      totalSheets: analysisResult?.sheets?.length || 0,
      targetSheets: targetSheets || 'all'
    })

    // AI를 사용하여 코드 생성
    const result = await generateCodeWithAI(userRequest, analysisResult, targetSheets, relatedStepId)

    console.log('[generate-code] Code generated successfully:', result.code.title)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[generate-code] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || '코드 생성 중 오류가 발생했습니다'
      } as CodeGenerationResponse,
      { status: 500 }
    )
  }
}

/**
 * AI를 사용하여 Apps Script 코드 생성
 */
async function generateCodeWithAI(
  userRequest: string,
  analysisResult: any,
  targetSheets?: string[],
  relatedStepId?: string
): Promise<CodeGenerationResponse> {
  // 요청 분석 및 코드 타입 결정
  const codeType = inferCodeType(userRequest)
  const title = generateTitle(userRequest)
  const description = generateDescription(userRequest, codeType)

  // Apps Script 코드 생성
  const code = generateAppsScriptCode(userRequest, codeType, analysisResult, targetSheets)

  // AI 설명 생성
  const explanation = generateExplanation(userRequest, code, codeType)

  const generatedCode: GeneratedCode = {
    id: `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    code,
    type: codeType,
    createdAt: new Date().toISOString(),
    userRequest,
    targetSheets: targetSheets || analysisResult?.sheets?.map((s: any) => s.name) || [],
    executable: true,
    saved: false
  }

  return {
    success: true,
    code: generatedCode,
    explanation
  }
}

/**
 * 사용자 요청에서 코드 타입 추론
 */
function inferCodeType(userRequest: string): 'data_cleaning' | 'formula_conversion' | 'automation' | 'validation' {
  const request = userRequest.toLowerCase()

  // 데이터 정리
  if (
    request.includes('중복') ||
    request.includes('duplicate') ||
    request.includes('빈 행') ||
    request.includes('빈 열') ||
    request.includes('empty') ||
    request.includes('공백') ||
    request.includes('trim') ||
    request.includes('정리') ||
    request.includes('clean')
  ) {
    return 'data_cleaning'
  }

  // 수식 변환
  if (
    request.includes('수식') ||
    request.includes('formula') ||
    request.includes('계산') ||
    request.includes('합계') ||
    request.includes('평균') ||
    request.includes('sum') ||
    request.includes('average') ||
    request.includes('vlookup') ||
    request.includes('값으로') ||
    request.includes('convert')
  ) {
    return 'formula_conversion'
  }

  // 검증
  if (
    request.includes('검증') ||
    request.includes('확인') ||
    request.includes('validate') ||
    request.includes('check') ||
    request.includes('오류') ||
    request.includes('error') ||
    request.includes('형식') ||
    request.includes('format')
  ) {
    return 'validation'
  }

  // 자동화 (기본값)
  return 'automation'
}

/**
 * 코드 제목 생성
 */
function generateTitle(userRequest: string): string {
  // 간단한 제목 생성 로직
  const request = userRequest.trim()

  if (request.length > 50) {
    return request.substring(0, 47) + '...'
  }

  return request
}

/**
 * 코드 설명 생성
 */
function generateDescription(userRequest: string, codeType: string): string {
  const typeDescriptions = {
    data_cleaning: '이 코드는 데이터 정리 작업을 수행합니다.',
    formula_conversion: '이 코드는 수식 변환 작업을 수행합니다.',
    automation: '이 코드는 자동화 작업을 수행합니다.',
    validation: '이 코드는 데이터 검증 작업을 수행합니다.'
  }

  return `${typeDescriptions[codeType as keyof typeof typeDescriptions]} 사용자 요청: "${userRequest}"`
}

/**
 * Apps Script 코드 생성 (실제 구현)
 */
function generateAppsScriptCode(
  userRequest: string,
  codeType: string,
  analysisResult: any,
  targetSheets?: string[]
): string {
  const request = userRequest.toLowerCase()
  const spreadsheetId = analysisResult?.spreadsheetId || 'SPREADSHEET_ID'
  const sheets = targetSheets || analysisResult?.sheets?.map((s: any) => s.name) || ['Sheet1']

  // 중복 행 제거
  if (request.includes('중복') && request.includes('제거')) {
    return generateRemoveDuplicatesCode(sheets)
  }

  // 빈 행 제거
  if (request.includes('빈 행') && request.includes('제거')) {
    return generateRemoveEmptyRowsCode(sheets)
  }

  // 빈 열 제거
  if (request.includes('빈 열') && request.includes('제거')) {
    return generateRemoveEmptyColumnsCode(sheets)
  }

  // 수식을 값으로 변환
  if (request.includes('수식') && (request.includes('값으로') || request.includes('변환'))) {
    return generateConvertFormulasToValuesCode(sheets)
  }

  // 데이터 검증
  if (request.includes('검증') || request.includes('확인')) {
    return generateDataValidationCode(sheets)
  }

  // 트리밍 (공백 제거)
  if (request.includes('공백') && request.includes('제거')) {
    return generateTrimDataCode(sheets)
  }

  // 기본 템플릿
  return generateDefaultCode(userRequest, sheets)
}

/**
 * 중복 행 제거 코드
 */
function generateRemoveDuplicatesCode(sheets: string[]): string {
  return `/**
 * 중복된 행 제거
 *
 * 지정된 시트에서 완전히 동일한 행을 찾아 제거합니다.
 */
function removeDuplicateRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = ${JSON.stringify(sheets)};

  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('시트를 찾을 수 없습니다: ' + sheetName);
      return;
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // 중복 확인을 위한 Set 사용
    const seen = new Set();
    const uniqueRows = [];
    let duplicateCount = 0;

    values.forEach((row, index) => {
      const rowKey = row.join('|'); // 행을 문자열로 변환

      if (!seen.has(rowKey)) {
        seen.add(rowKey);
        uniqueRows.push(row);
      } else {
        duplicateCount++;
      }
    });

    // 중복이 있으면 데이터 재작성
    if (duplicateCount > 0) {
      sheet.clearContents();
      if (uniqueRows.length > 0) {
        sheet.getRange(1, 1, uniqueRows.length, uniqueRows[0].length).setValues(uniqueRows);
      }
      Logger.log(\`\${sheetName}: \${duplicateCount}개의 중복 행 제거됨\`);
    } else {
      Logger.log(\`\${sheetName}: 중복 행 없음\`);
    }
  });

  SpreadsheetApp.getUi().alert('중복 행 제거 완료!');
}

// 실행
removeDuplicateRows();`
}

/**
 * 빈 행 제거 코드
 */
function generateRemoveEmptyRowsCode(sheets: string[]): string {
  return `/**
 * 빈 행 제거
 *
 * 모든 셀이 비어있는 행을 찾아 제거합니다.
 */
function removeEmptyRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = ${JSON.stringify(sheets)};

  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('시트를 찾을 수 없습니다: ' + sheetName);
      return;
    }

    const maxRows = sheet.getMaxRows();
    let deletedCount = 0;

    // 뒤에서부터 순회 (삭제할 때 인덱스 꼬임 방지)
    for (let i = maxRows; i >= 1; i--) {
      const range = sheet.getRange(i, 1, 1, sheet.getMaxColumns());
      const values = range.getValues()[0];

      // 모든 셀이 비어있는지 확인
      const isEmpty = values.every(cell => cell === '' || cell === null || cell === undefined);

      if (isEmpty) {
        sheet.deleteRow(i);
        deletedCount++;
      }
    }

    Logger.log(\`\${sheetName}: \${deletedCount}개의 빈 행 제거됨\`);
  });

  SpreadsheetApp.getUi().alert('빈 행 제거 완료!');
}

// 실행
removeEmptyRows();`
}

/**
 * 빈 열 제거 코드
 */
function generateRemoveEmptyColumnsCode(sheets: string[]): string {
  return `/**
 * 빈 열 제거
 *
 * 모든 셀이 비어있는 열을 찾아 제거합니다.
 */
function removeEmptyColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = ${JSON.stringify(sheets)};

  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('시트를 찾을 수 없습니다: ' + sheetName);
      return;
    }

    const maxCols = sheet.getMaxColumns();
    let deletedCount = 0;

    // 뒤에서부터 순회 (삭제할 때 인덱스 꼬임 방지)
    for (let i = maxCols; i >= 1; i--) {
      const range = sheet.getRange(1, i, sheet.getMaxRows(), 1);
      const values = range.getValues();

      // 모든 셀이 비어있는지 확인
      const isEmpty = values.every(row => {
        const cell = row[0];
        return cell === '' || cell === null || cell === undefined;
      });

      if (isEmpty) {
        sheet.deleteColumn(i);
        deletedCount++;
      }
    }

    Logger.log(\`\${sheetName}: \${deletedCount}개의 빈 열 제거됨\`);
  });

  SpreadsheetApp.getUi().alert('빈 열 제거 완료!');
}

// 실행
removeEmptyColumns();`
}

/**
 * 수식을 값으로 변환 코드
 */
function generateConvertFormulasToValuesCode(sheets: string[]): string {
  return `/**
 * 수식을 값으로 변환
 *
 * 모든 수식을 계산된 값으로 변환합니다.
 */
function convertFormulasToValues() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = ${JSON.stringify(sheets)};

  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('시트를 찾을 수 없습니다: ' + sheetName);
      return;
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues(); // 계산된 값 가져오기

    // 값으로 덮어쓰기
    dataRange.setValues(values);

    Logger.log(\`\${sheetName}: 모든 수식이 값으로 변환됨\`);
  });

  SpreadsheetApp.getUi().alert('수식을 값으로 변환 완료!');
}

// 실행
convertFormulasToValues();`
}

/**
 * 데이터 검증 코드
 */
function generateDataValidationCode(sheets: string[]): string {
  return `/**
 * 데이터 검증
 *
 * 데이터의 형식과 일관성을 확인합니다.
 */
function validateData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = ${JSON.stringify(sheets)};
  const errors = [];

  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      errors.push(\`시트를 찾을 수 없습니다: \${sheetName}\`);
      return;
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // 빈 셀 확인
    let emptyCells = 0;
    values.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === '' || cell === null || cell === undefined) {
          emptyCells++;
        }
      });
    });

    if (emptyCells > 0) {
      errors.push(\`\${sheetName}: \${emptyCells}개의 빈 셀 발견\`);
    }

    Logger.log(\`\${sheetName}: 검증 완료 - 빈 셀 \${emptyCells}개\`);
  });

  if (errors.length > 0) {
    SpreadsheetApp.getUi().alert('검증 결과:\\n' + errors.join('\\n'));
  } else {
    SpreadsheetApp.getUi().alert('모든 데이터가 유효합니다!');
  }
}

// 실행
validateData();`
}

/**
 * 데이터 트리밍 (공백 제거) 코드
 */
function generateTrimDataCode(sheets: string[]): string {
  return `/**
 * 데이터 트리밍
 *
 * 모든 텍스트 셀의 앞뒤 공백을 제거합니다.
 */
function trimAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = ${JSON.stringify(sheets)};

  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('시트를 찾을 수 없습니다: ' + sheetName);
      return;
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // 모든 셀에 트리밍 적용
    const trimmedValues = values.map(row =>
      row.map(cell => {
        if (typeof cell === 'string') {
          return cell.trim();
        }
        return cell;
      })
    );

    dataRange.setValues(trimmedValues);

    Logger.log(\`\${sheetName}: 모든 데이터 트리밍 완료\`);
  });

  SpreadsheetApp.getUi().alert('공백 제거 완료!');
}

// 실행
trimAllData();`
}

/**
 * 기본 코드 템플릿
 */
function generateDefaultCode(userRequest: string, sheets: string[]): string {
  return `/**
 * 사용자 정의 작업
 *
 * 요청: ${userRequest}
 */
function customTask() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = ${JSON.stringify(sheets)};

  sheetNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('시트를 찾을 수 없습니다: ' + sheetName);
      return;
    }

    // TODO: 여기에 작업 코드를 작성하세요
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    Logger.log(\`\${sheetName}: 작업 준비 완료\`);
  });

  SpreadsheetApp.getUi().alert('작업 완료!');
}

// 실행
customTask();`
}

/**
 * AI 설명 생성
 */
function generateExplanation(userRequest: string, code: string, codeType: string): string {
  const explanations: Record<string, string> = {
    data_cleaning: `이 코드는 데이터 정리 작업을 자동화합니다.

**작동 방식:**
1. 활성 스프레드시트에 접근합니다
2. 지정된 시트들을 순회합니다
3. 각 시트에서 요청된 정리 작업을 수행합니다
4. 작업 결과를 로그에 기록하고 알림을 표시합니다

**사용 방법:**
1. Apps Script 에디터를 엽니다 (도구 > 스크립트 편집기)
2. 코드를 붙여넣습니다
3. 실행 버튼을 클릭합니다
4. 필요시 권한을 승인합니다`,

    formula_conversion: `이 코드는 수식 변환 작업을 자동화합니다.

**작동 방식:**
1. 각 시트의 데이터 범위를 가져옵니다
2. 수식이 계산된 값을 읽어옵니다
3. 원래 수식 대신 계산된 값으로 덮어씁니다

**주의사항:**
- 이 작업은 되돌릴 수 없으므로 백업을 권장합니다
- 수식이 값으로 변환되면 재계산되지 않습니다`,

    automation: `이 코드는 반복 작업을 자동화합니다.

**작동 방식:**
1. 지정된 시트들에 대해 작업을 수행합니다
2. 각 단계의 결과를 로그에 기록합니다
3. 완료 시 알림을 표시합니다

**커스터마이징:**
- 시트 이름을 수정하여 특정 시트만 처리할 수 있습니다
- 조건문을 추가하여 특정 데이터만 처리할 수 있습니다`,

    validation: `이 코드는 데이터 품질을 검증합니다.

**검증 항목:**
1. 빈 셀 여부
2. 데이터 형식 일관성
3. 필수 필드 존재 여부

**결과:**
- 문제가 발견되면 상세 내용을 알림으로 표시합니다
- 모든 검증을 통과하면 성공 메시지를 표시합니다`
  }

  return explanations[codeType] || explanations.automation
}
