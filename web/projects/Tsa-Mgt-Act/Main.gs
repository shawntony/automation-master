/**
 * 메인 실행 함수
 */
function main() {
  try {
    Logger.log('자동화 실행 시작');

    // 데이터 수집
    const sourceData = DataReader.getSheetData('비용세부내역', 'A1:Z1000');

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
