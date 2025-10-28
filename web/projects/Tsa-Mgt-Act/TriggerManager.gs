/**
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
