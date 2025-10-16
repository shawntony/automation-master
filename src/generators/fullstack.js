/**
 * 풀스택 생성기 래퍼
 *
 * SSA의 fullstack-generator를 AutomationMaster 워크플로우에서 사용
 */

import { createSSAAdapter } from '../integrations/ssa-adapter.js';
import ora from 'ora';
import chalk from 'chalk';

/**
 * 풀스택 애플리케이션 생성
 *
 * @param {Object} options - 생성 옵션
 * @returns {Promise<Object>} 생성 결과
 */
export async function generateFullstackApp(options) {
  const spinner = ora('풀스택 애플리케이션 생성 중...').start();

  try {
    const adapter = createSSAAdapter({ verbose: options.verbose });

    // SSA 설치 확인
    const isInstalled = await adapter.checkSSAInstalled();
    if (!isInstalled) {
      throw new Error('SSA가 설치되지 않았습니다. ../ssa 디렉터리를 확인하세요.');
    }

    spinner.text = 'SSA 풀스택 생성기 실행 중...';

    const result = await adapter.generateFullstack({
      schemaFile: options.schemaFile,
      projectName: options.projectName,
      autoSetup: options.autoSetup !== false,
      deploy: options.deploy || false,
      wizard: options.wizard || false
    });

    spinner.succeed(chalk.green('✅ 풀스택 애플리케이션 생성 완료!'));

    return {
      success: true,
      result,
      message: '5분 만에 완전한 Next.js 14 앱이 생성되었습니다!'
    };
  } catch (error) {
    spinner.fail(chalk.red('❌ 풀스택 생성 실패'));
    throw error;
  }
}

/**
 * 대화형 풀스택 생성 (마법사 모드)
 *
 * @returns {Promise<Object>} 생성 결과
 */
export async function generateFullstackWizard() {
  console.log(chalk.cyan('\n🧙‍♂️ 풀스택 생성 마법사를 시작합니다...\n'));

  return generateFullstackApp({ wizard: true });
}

export default {
  generateFullstackApp,
  generateFullstackWizard
};
