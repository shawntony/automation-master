/**
 * 프론트엔드 생성기 래퍼
 *
 * SSA의 frontend-generator를 AutomationMaster 워크플로우에서 사용
 */

import { createSSAAdapter } from '../integrations/ssa-adapter.js';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 프론트엔드 코드 생성
 *
 * @param {Object} options - 생성 옵션
 * @returns {Promise<Object>} 생성 결과
 */
export async function generateFrontend(options) {
  const spinner = ora('React/Next.js 프론트엔드 생성 중...').start();

  try {
    const adapter = createSSAAdapter({ verbose: options.verbose });

    // SSA 설치 확인
    const isInstalled = await adapter.checkSSAInstalled();
    if (!isInstalled) {
      throw new Error('SSA가 설치되지 않았습니다. ../ssa 디렉터리를 확인하세요.');
    }

    spinner.text = 'SSA 프론트엔드 생성기 실행 중...';

    const result = await adapter.generateFrontend({
      schemaFile: options.schemaFile,
      projectName: options.projectName,
      uiLibrary: options.uiLibrary || 'shadcn',
      realtime: options.realtime || false,
      autoSetup: options.autoSetup !== false
    });

    spinner.succeed(chalk.green('✅ 프론트엔드 생성 완료!'));

    return {
      success: true,
      result,
      message: 'React/Next.js 애플리케이션이 생성되었습니다!'
    };
  } catch (error) {
    spinner.fail(chalk.red('❌ 프론트엔드 생성 실패'));
    throw error;
  }
}

export default {
  generateFrontend
};
