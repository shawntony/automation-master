/**
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
      '이 스프레드시트는 Apps Script로 자동화되었습니다.\n\n' +
      '총 4168개의 수식이 변환되었습니다.',
      ui.ButtonSet.OK
    );
  }
};
