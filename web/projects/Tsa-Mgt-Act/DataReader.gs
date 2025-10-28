/**
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
