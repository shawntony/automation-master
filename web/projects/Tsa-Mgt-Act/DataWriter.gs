/**
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
