#!/usr/bin/env node

/**
 * SSA 통합 테스트 스크립트
 *
 * AutomationMaster와 SSA의 통합을 테스트합니다.
 */

import chalk from 'chalk';
import { createSSAAdapter } from './src/integrations/ssa-adapter.js';
import { listGenerators, getGeneratorInfo } from './src/generators/index.js';

console.log(chalk.cyan.bold('\n🔬 SSA 통합 테스트 시작...\n'));

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: SSA 설치 확인
  console.log(chalk.blue('Test 1: SSA 설치 확인'));
  try {
    const adapter = createSSAAdapter();
    const isInstalled = await adapter.checkSSAInstalled();

    if (isInstalled) {
      console.log(chalk.green('✅ SSA가 올바르게 설치되어 있습니다.'));
      passed++;

      // SSA 버전 확인
      const version = await adapter.getSSAVersion();
      console.log(chalk.gray(`   버전: ${version}`));
    } else {
      console.log(chalk.red('❌ SSA가 설치되지 않았습니다.'));
      console.log(chalk.yellow('   ../ssa 디렉터리를 확인하세요.'));
      failed++;
    }
  } catch (error) {
    console.log(chalk.red(`❌ 오류: ${error.message}`));
    failed++;
  }

  console.log('');

  // Test 2: 생성기 목록 확인
  console.log(chalk.blue('Test 2: 생성기 목록 확인'));
  try {
    const generators = listGenerators();

    if (generators.length > 0) {
      console.log(chalk.green(`✅ ${generators.length}개의 생성기가 등록되어 있습니다.`));
      passed++;

      generators.forEach(gen => {
        console.log(chalk.gray(`   - ${gen.name}: ${gen.description}`));
      });
    } else {
      console.log(chalk.red('❌ 등록된 생성기가 없습니다.'));
      failed++;
    }
  } catch (error) {
    console.log(chalk.red(`❌ 오류: ${error.message}`));
    failed++;
  }

  console.log('');

  // Test 3: 어댑터 인스턴스 생성
  console.log(chalk.blue('Test 3: 어댑터 인스턴스 생성'));
  try {
    const adapter = createSSAAdapter({ verbose: false });

    if (adapter && typeof adapter.generateFullstack === 'function') {
      console.log(chalk.green('✅ SSA 어댑터가 올바르게 생성되었습니다.'));
      passed++;
    } else {
      console.log(chalk.red('❌ 어댑터 생성 실패'));
      failed++;
    }
  } catch (error) {
    console.log(chalk.red(`❌ 오류: ${error.message}`));
    failed++;
  }

  console.log('');

  // Test 4: 생성기 정보 조회
  console.log(chalk.blue('Test 4: 생성기 정보 조회'));
  try {
    const fullstackInfo = getGeneratorInfo('fullstack');

    if (fullstackInfo && fullstackInfo.name) {
      console.log(chalk.green('✅ 생성기 정보를 올바르게 조회했습니다.'));
      passed++;
      console.log(chalk.gray(`   ${fullstackInfo.name}`));
      console.log(chalk.gray(`   특징: ${fullstackInfo.features.length}개`));
    } else {
      console.log(chalk.red('❌ 생성기 정보 조회 실패'));
      failed++;
    }
  } catch (error) {
    console.log(chalk.red(`❌ 오류: ${error.message}`));
    failed++;
  }

  console.log('');

  // 결과 요약
  console.log(chalk.cyan.bold('📊 테스트 결과 요약\n'));
  console.log(chalk.green(`✅ 성공: ${passed}`));
  console.log(chalk.red(`❌ 실패: ${failed}`));
  console.log(chalk.gray(`총 테스트: ${passed + failed}`));

  console.log('');

  if (failed === 0) {
    console.log(chalk.green.bold('🎉 모든 테스트 통과! SSA 통합이 완료되었습니다.\n'));
    console.log(chalk.cyan('다음 단계:'));
    console.log(chalk.gray('1. npm run workflow - 워크플로우에서 SSA 생성기 사용'));
    console.log(chalk.gray('2. npm run ssa:fullstack - SSA 풀스택 생성기 직접 실행'));
    console.log(chalk.gray('3. npm run web:dev - 웹 UI에서 SSA 기능 사용\n'));
  } else {
    console.log(chalk.red.bold('⚠️  일부 테스트 실패. 문제를 해결하세요.\n'));
    console.log(chalk.yellow('문제 해결:'));
    console.log(chalk.gray('1. ../ssa 디렉터리가 존재하는지 확인'));
    console.log(chalk.gray('2. SSA 프로젝트가 올바르게 설치되었는지 확인'));
    console.log(chalk.gray('3. cd ../ssa && npm install 실행\n'));
  }

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(error => {
  console.error(chalk.red(`\n❌ 테스트 실행 중 오류 발생: ${error.message}\n`));
  process.exit(1);
});
