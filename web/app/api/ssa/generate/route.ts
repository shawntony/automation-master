import { NextRequest, NextResponse } from 'next/server'

/**
 * Apps Script 코드 생성 API
 * POST /api/ssa/generate
 */
export async function POST(request: NextRequest) {
  try {
    const { analysis } = await request.json()

    if (!analysis) {
      return NextResponse.json(
        { error: '분석 결과가 필요합니다' },
        { status: 400 }
      )
    }

    // Apps Script 코드 생성
    const generatedCode = generateAppsScriptCode(analysis)

    return NextResponse.json(generatedCode)
  } catch (error) {
    console.error('코드 생성 오류:', error)
    return NextResponse.json(
      { error: 'Apps Script 코드 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

function generateAppsScriptCode(analysis: any) {
  const files: Record<string, string> = {}

  // Main.gs
  files['Core/Main.gs'] = `/**
 * 메인 실행 함수
 */
function main() {
  try {
    Logger.log('자동화 실행 시작');

    // 데이터 수집
    const sourceData = DataReader.getSheetData('${analysis.sheets[0]?.name || '데이터'}', 'A1:Z1000');

    // 데이터 처리
    const processed = BusinessLogic.processData(sourceData);

    // 결과 저장
    DataWriter.writeToSheet('결과', 'A1', processed);

    Logger.log('자동화 실행 완료');
    return { success: true };
  } catch (error) {
    ErrorHandler.handleError(error, 'main');
    return { success: false, error: error.toString() };
  }
}

function onOpen() {
  CustomMenu.createMenu();
}
`

  // Config.gs
  files['Core/Config.gs'] = `/**
 * 전역 설정
 */
const CONFIG = {
  SPREADSHEET_ID: '${analysis.spreadsheetId || 'YOUR_SPREADSHEET_ID'}',
  SHEET_NAMES: {
${analysis.sheets.map((sheet: any, i: number) => `    SHEET${i + 1}: '${sheet.name}'`).join(',\n')}
  },
  EMAIL_RECIPIENTS: ['admin@example.com'],
  CACHE_DURATION: 3600 // 1 hour
};
`

  // DataReader.gs
  files['DataLayer/DataReader.gs'] = `/**
 * 데이터 읽기 전용 함수
 */
const DataReader = {
  /**
   * 시트에서 데이터 읽기
   */
  getSheetData: function(sheetName, range) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);

      if (!sheet) {
        throw new Error('시트를 찾을 수 없습니다: ' + sheetName);
      }

      return sheet.getRange(range).getValues();
    } catch (error) {
      Logger.log('데이터 읽기 오류: ' + error);
      throw error;
    }
  },

  /**
   * 마지막 행 번호 가져오기
   */
  getLastRow: function(sheetName) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    return sheet.getLastRow();
  }
};
`

  // DataWriter.gs
  files['DataLayer/DataWriter.gs'] = `/**
 * 데이터 쓰기 전용 함수
 */
const DataWriter = {
  /**
   * 데이터 쓰기
   */
  writeToSheet: function(sheetName, startCell, data) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);

      if (!sheet) {
        throw new Error('시트를 찾을 수 없습니다: ' + sheetName);
      }

      const range = sheet.getRange(startCell);
      range.offset(0, 0, data.length, data[0].length).setValues(data);

      Logger.log('데이터 쓰기 완료: ' + sheetName);
    } catch (error) {
      Logger.log('데이터 쓰기 오류: ' + error);
      throw error;
    }
  },

  /**
   * 데이터 추가
   */
  appendToSheet: function(sheetName, data) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    sheet.appendRow(data);
  }
};
`

  // Generate business logic based on formula types
  const formulaTypes = Object.keys(analysis.formulaTypes || {})

  if (formulaTypes.includes('VLOOKUP') || formulaTypes.includes('LOOKUP')) {
    files['BusinessLogic/LookupFunctions.gs'] = `/**
 * 조회 함수 (VLOOKUP 대체)
 */
const LookupFunctions = {
  /**
   * VLOOKUP 대체 함수
   */
  vlookupReplace: function(searchKey, range, columnIndex, exactMatch) {
    const data = range.getValues ? range.getValues() : range;

    for (let i = 0; i < data.length; i++) {
      if (exactMatch) {
        if (data[i][0] === searchKey) {
          return data[i][columnIndex - 1];
        }
      } else {
        if (String(data[i][0]).toLowerCase().includes(String(searchKey).toLowerCase())) {
          return data[i][columnIndex - 1];
        }
      }
    }

    return "Not Found";
  }
};
`
  }

  if (formulaTypes.includes('SUMIF') || formulaTypes.includes('CONDITIONAL_AGGREGATION')) {
    files['BusinessLogic/Calculator.gs'] = `/**
 * 계산 함수 (SUMIF, COUNTIF 등 대체)
 */
const Calculator = {
  /**
   * SUMIF 대체 함수
   */
  sumIf: function(range, criteria, sumRange) {
    const criteriaData = range.getValues ? range.getValues() : range;
    const sumData = sumRange.getValues ? sumRange.getValues() : sumRange;
    let total = 0;

    for (let i = 0; i < criteriaData.length; i++) {
      if (this.matchesCriteria(criteriaData[i][0], criteria)) {
        total += Number(sumData[i][0]) || 0;
      }
    }

    return total;
  },

  /**
   * 조건 매칭
   */
  matchesCriteria: function(value, criteria) {
    if (typeof criteria === 'function') {
      return criteria(value);
    }
    return value === criteria;
  }
};
`
  }

  if (formulaTypes.includes('IF') || formulaTypes.includes('CONDITIONAL')) {
    files['BusinessLogic/ConditionalLogic.gs'] = `/**
 * 조건부 로직 (IF, IFS 대체)
 */
const ConditionalLogic = {
  /**
   * 다중 조건 처리
   */
  processConditions: function(value, conditions) {
    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i].test(value)) {
        return conditions[i].result;
      }
    }
    return conditions[conditions.length - 1].result; // default
  },

  /**
   * 값 분류
   */
  categorize: function(value, thresholds) {
    for (let i = 0; i < thresholds.length; i++) {
      if (value > thresholds[i].min && value <= thresholds[i].max) {
        return thresholds[i].category;
      }
    }
    return '기타';
  }
};
`
  }

  // Logger.gs
  files['Infrastructure/Logger.gs'] = `/**
 * 로깅 시스템
 */
const CustomLogger = {
  /**
   * 정보 로그
   */
  logInfo: function(message) {
    Logger.log('[INFO] ' + new Date().toISOString() + ' - ' + message);
  },

  /**
   * 에러 로그
   */
  logError: function(error, context) {
    const message = '[ERROR] ' + new Date().toISOString() + ' - ' + context + ': ' + error;
    Logger.log(message);

    // 이메일 알림 (선택사항)
    if (CONFIG.EMAIL_RECIPIENTS && CONFIG.EMAIL_RECIPIENTS.length > 0) {
      this.sendErrorEmail(message);
    }
  },

  /**
   * 에러 이메일 발송
   */
  sendErrorEmail: function(message) {
    try {
      MailApp.sendEmail({
        to: CONFIG.EMAIL_RECIPIENTS.join(','),
        subject: 'Apps Script 실행 오류',
        body: message
      });
    } catch (e) {
      Logger.log('이메일 발송 실패: ' + e);
    }
  }
};
`

  // ErrorHandler.gs
  files['Infrastructure/ErrorHandler.gs'] = `/**
 * 에러 처리
 */
const ErrorHandler = {
  /**
   * 에러 처리 및 복구
   */
  handleError: function(error, context) {
    CustomLogger.logError(error, context);

    // 에러 유형별 처리
    if (error.message && error.message.includes('권한')) {
      throw new Error('권한이 없습니다. 스크립트 권한을 확인하세요.');
    }

    if (error.message && error.message.includes('할당량')) {
      throw new Error('할당량이 초과되었습니다. 나중에 다시 시도하세요.');
    }

    throw error;
  },

  /**
   * 재시도 로직
   */
  retry: function(func, maxAttempts, delayMs) {
    maxAttempts = maxAttempts || 3;
    delayMs = delayMs || 1000;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        return func();
      } catch (error) {
        if (i === maxAttempts - 1) {
          throw error;
        }
        Utilities.sleep(delayMs * (i + 1));
      }
    }
  }
};
`

  // CustomMenu.gs
  files['UI/CustomMenu.gs'] = `/**
 * 커스텀 메뉴
 */
const CustomMenu = {
  /**
   * 메뉴 생성
   */
  createMenu: function() {
    const ui = SpreadsheetApp.getUi();

    ui.createMenu('🤖 자동화')
      .addItem('▶️ 전체 실행', 'main')
      .addSeparator()
      .addItem('⚙️ 트리거 설정', 'TriggerManager.setupTriggers')
      .addItem('🗑️ 트리거 삭제', 'TriggerManager.deleteAllTriggers')
      .addSeparator()
      .addItem('ℹ️ 정보', 'CustomMenu.showInfo')
      .addToUi();
  },

  /**
   * 정보 표시
   */
  showInfo: function() {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      '자동화 시스템',
      '이 스프레드시트는 Apps Script로 자동화되었습니다.\\n\\n' +
      '총 ${analysis.totalFormulas}개의 수식이 변환되었습니다.',
      ui.ButtonSet.OK
    );
  }
};
`

  // TriggerManager.gs
  files['Automation/TriggerManager.gs'] = `/**
 * 트리거 관리
 */
const TriggerManager = {
  /**
   * 트리거 설정
   */
  setupTriggers: function() {
    // 기존 트리거 삭제
    this.deleteAllTriggers();

    // 일일 트리거 생성 (매일 자정)
    ScriptApp.newTrigger('main')
      .timeBased()
      .atHour(0)
      .everyDays(1)
      .create();

    Logger.log('트리거 설정 완료');
    SpreadsheetApp.getUi().alert('트리거가 설정되었습니다.');
  },

  /**
   * 모든 트리거 삭제
   */
  deleteAllTriggers: function() {
    const triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
    Logger.log('모든 트리거 삭제 완료');
  },

  /**
   * 트리거 목록 조회
   */
  listTriggers: function() {
    const triggers = ScriptApp.getProjectTriggers();
    Logger.log('트리거 개수: ' + triggers.length);
    return triggers;
  }
};
`

  return {
    success: true,
    files,
    metadata: {
      totalFiles: Object.keys(files).length,
      generatedAt: new Date().toISOString(),
      analysis: {
        totalFormulas: analysis.totalFormulas,
        complexity: analysis.complexity,
        sheets: analysis.sheets.length
      }
    }
  }
}
