/**
 * 백엔드 생성기 래퍼
 *
 * SSA의 backend-generator를 AutomationMaster 워크플로우에서 사용
 */

import { createSSAAdapter } from '../integrations/ssa-adapter.js';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 백엔드 코드 생성
 *
 * @param {Object} options - 생성 옵션
 * @returns {Promise<Object>} 생성 결과
 */
export async function generateBackend(options) {
  const spinner = ora('Supabase 백엔드 생성 중...').start();

  try {
    const adapter = createSSAAdapter({ verbose: options.verbose });

    // SSA 설치 확인
    const isInstalled = await adapter.checkSSAInstalled();
    if (!isInstalled) {
      throw new Error('SSA가 설치되지 않았습니다. ../ssa 디렉터리를 확인하세요.');
    }

    spinner.text = 'SSA 백엔드 생성기 실행 중...';

    const result = await adapter.generateBackend({
      codeFile: options.codeFile,
      projectName: options.projectName,
      securityLevel: options.securityLevel || 'standard',
      realtime: options.realtime || false,
      performance: options.performance || true
    });

    spinner.succeed(chalk.green('✅ Supabase 백엔드 생성 완료!'));

    return {
      success: true,
      result,
      message: 'Supabase 스키마, RLS 정책, TypeScript 타입이 생성되었습니다!'
    };
  } catch (error) {
    spinner.fail(chalk.red('❌ 백엔드 생성 실패'));
    throw error;
  }
}

export default {
  generateBackend
};
