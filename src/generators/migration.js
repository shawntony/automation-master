/**
 * 마이그레이션 래퍼
 *
 * SSA의 migration 시스템을 AutomationMaster 워크플로우에서 사용
 */

import { createSSAAdapter } from '../integrations/ssa-adapter.js';
import ora from 'ora';
import chalk from 'chalk';

/**
 * Google Sheets 마이그레이션
 *
 * @param {Object} options - 마이그레이션 옵션
 * @returns {Promise<Object>} 마이그레이션 결과
 */
export async function migrateGoogleSheets(options) {
  const spinner = ora('Google Sheets 마이그레이션 중...').start();

  try {
    const adapter = createSSAAdapter({ verbose: options.verbose });

    // SSA 설치 확인
    const isInstalled = await adapter.checkSSAInstalled();
    if (!isInstalled) {
      throw new Error('SSA가 설치되지 않았습니다. ../ssa 디렉터리를 확인하세요.');
    }

    spinner.text = 'Google Sheets 구조 분석 중...';

    const result = await adapter.migrateGoogleSheets({
      sheetId: options.sheetId,
      analyze: true,
      migrate: options.migrate !== false
    });

    spinner.succeed(chalk.green('✅ Google Sheets 마이그레이션 완료!'));

    return {
      success: true,
      result,
      message: 'Google Sheets가 Supabase PostgreSQL로 성공적으로 마이그레이션되었습니다!'
    };
  } catch (error) {
    spinner.fail(chalk.red('❌ 마이그레이션 실패'));
    throw error;
  }
}

export default {
  migrateGoogleSheets
};
