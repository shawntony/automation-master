/**
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
