/**
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
