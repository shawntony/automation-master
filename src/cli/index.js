#!/usr/bin/env node

/**
 * Automation Master CLI
 * 단계별 자동화 툴 개발 가이드 시스템
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import Navigator from '../guide/navigator.js';
import Storage from '../utils/storage.js';
import EnvManager from '../env/manager.js';
import ProjectAnalyzer from '../analyzer/project-analyzer.js';
import PromptGenerator from '../generator/prompt-generator.js';
import AILeader from '../leader/ai-leader.js';
import InteractiveWorkflow from '../workflow/interactive-workflow.js';

const program = new Command();
const navigator = new Navigator();
const storage = new Storage();
const envManager = new EnvManager();
const analyzer = new ProjectAnalyzer();
const promptGen = new PromptGenerator();
const leader = new AILeader();

// CLI 설정
program
  .name('automaster')
  .description('단계별 자동화 툴 개발 가이드 시스템')
  .version('1.0.0');

/**
 * 초기화 명령어
 */
program
  .command('init')
  .description('새 프로젝트 초기화')
  .action(async () => {
    console.log(boxen(
      chalk.bold.cyan('🚀 Automation Master 프로젝트 초기화'),
      { padding: 1, borderColor: 'cyan', margin: 1 }
    ));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '프로젝트 이름:',
        validate: (input) => input.length > 0 || '프로젝트 이름을 입력해주세요.'
      },
      {
        type: 'confirm',
        name: 'reset',
        message: '기존 진행상황이 있다면 초기화할까요?',
        default: false
      }
    ]);

    const spinner = ora('프로젝트 초기화 중...').start();

    try {
      if (answers.reset) {
        await storage.reset();
      }

      await storage.setProjectName(answers.projectName);

      spinner.succeed('프로젝트 초기화 완료!');

      console.log('\n' + chalk.green('✓ 프로젝트가 성공적으로 초기화되었습니다.'));
      console.log(chalk.gray('다음 명령어로 가이드를 시작하세요:'));
      console.log(chalk.cyan('  npm run guide\n'));
    } catch (error) {
      spinner.fail('초기화 실패');
      console.error(chalk.red(error.message));
    }
  });

/**
 * 가이드 명령어
 */
program
  .command('guide')
  .description('단계별 가이드 시작')
  .option('-s, --step <number>', '특정 단계로 이동')
  .option('-a, --action <action>', '액션 (start|checklist|complete|next|prev)')
  .action(async (options) => {
    try {
      if (options.step) {
        await showStepGuide(parseInt(options.step), options.action);
      } else {
        await showInteractiveGuide();
      }
    } catch (error) {
      console.error(chalk.red('오류:', error.message));
    }
  });

/**
 * 상태 확인 명령어
 */
program
  .command('status')
  .description('프로젝트 진행 상태 확인')
  .action(async () => {
    try {
      const summary = await navigator.getRoadmapSummary();
      console.log(summary);

      console.log('\n' + chalk.bold('📌 다음 액션:'));
      const actions = await navigator.getNextActions();

      for (const action of actions) {
        console.log(chalk.cyan(`  • ${action.description}`));
        console.log(chalk.gray(`    ${action.command}`));
      }
    } catch (error) {
      console.error(chalk.red('오류:', error.message));
    }
  });

/**
 * 환경변수 관리 명령어
 */
program
  .command('env')
  .description('환경변수 설정 및 관리')
  .option('-p, --preset <preset>', '프리셋 선택 (frontend|backend|fullstack)')
  .option('-t, --target <path>', '생성할 경로')
  .option('-c, --check <path>', '프로젝트 환경변수 상태 확인')
  .action(async (options) => {
    try {
      if (options.check) {
        await checkEnvStatus(options.check);
      } else {
        await setupEnvironment(options);
      }
    } catch (error) {
      console.error(chalk.red('오류:', error.message));
    }
  });

/**
 * 체크리스트 명령어
 */
program
  .command('checklist')
  .description('체크리스트 관리')
  .option('-s, --step <number>', '단계 번호')
  .option('-i, --item <index>', '항목 인덱스')
  .option('-u, --uncheck', '체크 해제')
  .action(async (options) => {
    try {
      if (!options.step) {
        const progress = await storage.loadProgress();
        options.step = progress.currentStep;
      }

      await manageChecklist(parseInt(options.step), options);
    } catch (error) {
      console.error(chalk.red('오류:', error.message));
    }
  });

/**
 * 프로젝트 분석 명령어
 */
program
  .command('analyze')
  .description('GitHub 프로젝트 폴더 분석')
  .argument('<path>', '프로젝트 경로')
  .option('-v, --verbose', '상세 정보 표시')
  .action(async (projectPath, options) => {
    try {
      await analyzeProject(projectPath, options);
    } catch (error) {
      console.error(chalk.red('오류:', error.message));
    }
  });

/**
 * 프롬프트 생성 명령어
 */
program
  .command('prompt')
  .description('단계별 MCP 프롬프트 생성')
  .option('-s, --step <number>', '단계 번호')
  .option('-i, --interactive', '인터랙티브 모드')
  .action(async (options) => {
    try {
      await generatePrompt(options);
    } catch (error) {
      console.error(chalk.red('오류:', error.message));
    }
  });

/**
 * AI 리더 명령어
 */
program
  .command('lead')
  .description('AI 프로젝트 리딩')
  .argument('<path>', '프로젝트 경로')
  .option('-i, --interactive', '인터랙티브 모드')
  .action(async (projectPath, options) => {
    try {
      await leadProject(projectPath, options);
    } catch (error) {
      console.error(chalk.red('오류:', error.message));
    }
  });

/**
 * 대화형 워크플로우 명령어
 */
program
  .command('workflow')
  .description('대화형 워크플로우 시작 (단계별 정보 입력 → 프롬프트 제공 → 결과 확인 → 승인)')
  .option('-s, --step <number>', '시작 단계')
  .action(async (options) => {
    try {
      const workflow = new InteractiveWorkflow();
      await workflow.start(options);
    } catch (error) {
      console.error(chalk.red('오류:', error.message));
    }
  });

/**
 * 프로젝트 생성 도우미 명령어
 */
program
  .command('create')
  .description('새 프로젝트 생성 (프로젝트 생성 도우미)')
  .action(async () => {
    try {
      const { createProject } = await import('./create-project.js');
      await createProject();
    } catch (error) {
      console.error(chalk.red('오류:', error.message));
    }
  });

/**
 * 단계 가이드 표시
 */
async function showStepGuide(stepId, action) {
  const stepWithProgress = await navigator.getStepWithProgress(stepId);

  if (!stepWithProgress) {
    console.error(chalk.red('단계를 찾을 수 없습니다.'));
    return;
  }

  const guide = navigator.formatStepGuide(stepId);
  console.log(guide);

  // 진행 상태
  const { progress } = stepWithProgress;
  console.log(chalk.bold('📊 진행 상태:'));
  console.log(`  상태: ${getStatusEmoji(progress.status)} ${progress.status}`);

  if (progress.startedAt) {
    console.log(`  시작일: ${new Date(progress.startedAt).toLocaleDateString()}`);
  }

  if (progress.completedAt) {
    console.log(`  완료일: ${new Date(progress.completedAt).toLocaleDateString()}`);
  }

  // 체크리스트 진행률
  const checklistProgress = navigator.calculateChecklistProgress(stepId, progress.checklist);
  console.log(`  체크리스트: ${checklistProgress.toFixed(0)}% 완료\n`);

  // 액션 처리
  if (action) {
    await handleAction(stepId, action);
  }
}

/**
 * 인터랙티브 가이드
 */
async function showInteractiveGuide() {
  const currentStep = await navigator.getCurrentStep();
  const progress = await storage.loadProgress();

  console.log(boxen(
    chalk.bold.green(`📚 단계 ${currentStep.id}: ${currentStep.title}`),
    { padding: 1, borderColor: 'green', margin: 1 }
  ));

  const guide = navigator.formatStepGuide(currentStep.id);
  console.log(guide);

  const choices = [
    { name: '단계 시작하기', value: 'start' },
    { name: '체크리스트 관리', value: 'checklist' },
    { name: '단계 완료 처리', value: 'complete' },
    { name: '다음 단계로', value: 'next' },
    { name: '이전 단계로', value: 'prev' },
    { name: '다른 단계로 이동', value: 'goto' },
    { name: '환경변수 설정', value: 'env' },
    { name: '전체 현황 보기', value: 'status' },
    { name: '종료', value: 'exit' }
  ];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '무엇을 하시겠습니까?',
      choices
    }
  ]);

  switch (answer.action) {
    case 'start':
      await handleAction(currentStep.id, 'start');
      break;
    case 'checklist':
      await manageChecklist(currentStep.id);
      break;
    case 'complete':
      await handleAction(currentStep.id, 'complete');
      break;
    case 'next':
      await navigator.nextStep();
      await showInteractiveGuide();
      break;
    case 'prev':
      await navigator.prevStep();
      await showInteractiveGuide();
      break;
    case 'goto':
      const gotoAnswer = await inquirer.prompt([
        {
          type: 'number',
          name: 'stepId',
          message: '이동할 단계 번호 (1-10):',
          validate: (input) => (input >= 1 && input <= 10) || '1에서 10 사이의 숫자를 입력하세요.'
        }
      ]);
      await navigator.goToStep(gotoAnswer.stepId);
      await showInteractiveGuide();
      break;
    case 'env':
      await setupEnvironment({});
      break;
    case 'status':
      const summary = await navigator.getRoadmapSummary();
      console.log(summary);
      await showInteractiveGuide();
      break;
    case 'exit':
      console.log(chalk.green('\n✨ 수고하셨습니다!\n'));
      break;
  }
}

/**
 * 액션 처리
 */
async function handleAction(stepId, action) {
  const spinner = ora(`작업 처리 중...`).start();

  try {
    switch (action) {
      case 'start':
        await storage.startStep(stepId);
        spinner.succeed(`단계 ${stepId} 시작됨!`);
        console.log(chalk.green(`\n✓ 단계 ${stepId}이(가) 시작되었습니다.`));
        console.log(chalk.gray('체크리스트를 확인하며 진행해주세요.\n'));
        break;

      case 'complete':
        const progress = await storage.completeStep(stepId);
        spinner.succeed(`단계 ${stepId} 완료!`);
        console.log(chalk.green(`\n✓ 축하합니다! 단계 ${stepId}이(가) 완료되었습니다.`));

        if (stepId < 10) {
          console.log(chalk.cyan(`다음은 단계 ${stepId + 1}: ${navigator.getStep(stepId + 1).title}`));
        } else {
          console.log(chalk.bold.green('\n🎉 모든 단계를 완료했습니다! 프로젝트가 완성되었습니다!\n'));
        }
        break;

      default:
        spinner.fail('알 수 없는 액션');
    }
  } catch (error) {
    spinner.fail('작업 실패');
    console.error(chalk.red(error.message));
  }
}

/**
 * 체크리스트 관리
 */
async function manageChecklist(stepId, options = {}) {
  const step = navigator.getStep(stepId);
  const progress = await storage.loadProgress();
  const stepProgress = progress.steps.find(s => s.stepId === stepId);

  if (!step.checklist || step.checklist.length === 0) {
    console.log(chalk.yellow('이 단계에는 체크리스트가 없습니다.'));
    return;
  }

  console.log(chalk.bold(`\n📋 단계 ${stepId} 체크리스트:\n`));

  // 체크리스트 표시
  step.checklist.forEach((item, index) => {
    const checked = stepProgress.checklist?.[index]?.checked || false;
    const checkbox = checked ? chalk.green('☑') : chalk.gray('☐');
    console.log(`  ${checkbox} ${index + 1}. ${item}`);
  });

  // 인터랙티브 모드
  if (!options.item) {
    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'items',
        message: '완료한 항목을 선택하세요:',
        choices: step.checklist.map((item, index) => ({
          name: item,
          value: index,
          checked: stepProgress.checklist?.[index]?.checked || false
        }))
      }
    ]);

    // 모든 항목 업데이트
    for (let i = 0; i < step.checklist.length; i++) {
      await storage.checkItem(stepId, i, answer.items.includes(i));
    }

    console.log(chalk.green('\n✓ 체크리스트가 업데이트되었습니다.\n'));
  } else {
    // 특정 항목 토글
    const checked = !options.uncheck;
    await storage.checkItem(stepId, options.item, checked);
    console.log(chalk.green(`\n✓ 항목 ${options.item}이(가) ${checked ? '체크' : '체크 해제'}되었습니다.\n`));
  }
}

/**
 * 환경변수 설정
 */
async function setupEnvironment(options) {
  console.log(boxen(
    chalk.bold.blue('🔧 환경변수 설정'),
    { padding: 1, borderColor: 'blue', margin: 1 }
  ));

  // 프리셋 선택
  let preset = options.preset;
  if (!preset) {
    const presets = await envManager.getPresets();
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: '프로젝트 타입을 선택하세요:',
        choices: Object.keys(presets).map(key => ({
          name: `${key} (${presets[key].join(', ')})`,
          value: key
        }))
      }
    ]);
    preset = answer.preset;
  }

  // 변수 입력
  const variables = await envManager.getPresetVariables(preset);
  const values = {};

  console.log(chalk.cyan(`\n"${preset}" 프리셋의 환경변수를 입력해주세요:\n`));

  for (const [key, varData] of Object.entries(variables)) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: `${key} (${varData.description}):`,
        default: varData.example,
        validate: (input) => {
          if (varData.required && !input) {
            return '필수 항목입니다.';
          }
          if (varData.options && input && !varData.options.includes(input)) {
            return `다음 중 하나를 선택하세요: ${varData.options.join(', ')}`;
          }
          return true;
        }
      }
    ]);
    values[key] = answer.value;
  }

  // 설정 저장
  const config = { preset, values };
  await envManager.saveConfig(config);
  await storage.saveEnvConfig(config);

  // 검증
  const validation = await envManager.validateConfig(config);
  if (!validation.valid) {
    console.log(chalk.yellow('\n⚠️  검증 경고:'));
    validation.errors.forEach(err => console.log(chalk.yellow(`  • ${err}`)));
  }

  // .env 파일 생성
  const targetPath = options.target || process.cwd();
  const spinner = ora('.env 파일 생성 중...').start();

  try {
    const results = await envManager.generateMultipleEnvFiles(targetPath, config);
    spinner.succeed('.env 파일 생성 완료!');

    console.log(chalk.green('\n✓ 다음 파일들이 생성되었습니다:'));
    for (const [env, path] of Object.entries(results)) {
      console.log(chalk.gray(`  • ${path}`));
    }
    console.log();
  } catch (error) {
    spinner.fail('파일 생성 실패');
    console.error(chalk.red(error.message));
  }
}

/**
 * 환경변수 상태 확인
 */
async function checkEnvStatus(projectPath) {
  console.log(boxen(
    chalk.bold.cyan('🔍 환경변수 상태 확인'),
    { padding: 1, borderColor: 'cyan', margin: 1 }
  ));

  const spinner = ora('환경변수 파일 확인 중...').start();

  try {
    const status = await envManager.checkProjectEnv(projectPath);
    spinner.succeed('확인 완료');

    console.log();
    for (const [file, info] of Object.entries(status)) {
      if (info.exists) {
        console.log(chalk.green(`✓ ${file}`));
        console.log(chalk.gray(`  변수 개수: ${info.variableCount}`));
        console.log(chalk.gray(`  변수 목록: ${info.values.join(', ')}`));
      } else {
        console.log(chalk.red(`✗ ${file} (없음)`));
      }
      console.log();
    }
  } catch (error) {
    spinner.fail('확인 실패');
    console.error(chalk.red(error.message));
  }
}

/**
 * 상태 이모지
 */
function getStatusEmoji(status) {
  switch (status) {
    case 'pending': return '⏳';
    case 'in_progress': return '🔄';
    case 'completed': return '✅';
    default: return '❓';
  }
}

/**
 * 프로젝트 분석
 */
async function analyzeProject(projectPath, options) {
  console.log(boxen(
    chalk.bold.magenta('🔍 프로젝트 분석'),
    { padding: 1, borderColor: 'magenta', margin: 1 }
  ));

  const spinner = ora('프로젝트 분석 중...').start();

  try {
    const analysis = await analyzer.analyzeProject(projectPath);
    spinner.succeed('분석 완료!');

    const formatted = analyzer.formatAnalysis(analysis);
    console.log(formatted);

    if (options.verbose && analysis.recommendations.length > 0) {
      console.log(chalk.bold('📝 상세 추천 사항:\n'));
      for (const rec of analysis.recommendations) {
        console.log(chalk.cyan(`${rec.message}`));
        if (rec.action) {
          console.log(chalk.gray(`  실행: ${rec.action}\n`));
        }
      }
    }

    // 다음 액션 제안
    console.log(chalk.bold('\n💡 다음 액션:\n'));
    console.log(chalk.cyan('  • AI 리더 실행: ') + chalk.gray(`npm run lead -- ${projectPath}`));
    console.log(chalk.cyan('  • 프롬프트 생성: ') + chalk.gray(`npm run prompt -- --step ${analysis.currentStep}\n`));
  } catch (error) {
    spinner.fail('분석 실패');
    console.error(chalk.red(error.message));
  }
}

/**
 * 프롬프트 생성
 */
async function generatePrompt(options) {
  console.log(boxen(
    chalk.bold.yellow('📝 MCP 프롬프트 생성'),
    { padding: 1, borderColor: 'yellow', margin: 1 }
  ));

  let stepId = options.step;
  let userInfo = {};

  // 단계 선택
  if (!stepId || options.interactive) {
    const progress = await storage.loadProgress();

    if (!stepId) {
      const answer = await inquirer.prompt([
        {
          type: 'number',
          name: 'stepId',
          message: '프롬프트를 생성할 단계 (1-10):',
          default: progress.currentStep,
          validate: (input) => (input >= 1 && input <= 10) || '1에서 10 사이의 숫자를 입력하세요.'
        }
      ]);
      stepId = answer.stepId;
    }

    // 사용자 정보 입력
    const infoAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '프로젝트명:',
        default: progress.projectName
      },
      {
        type: 'input',
        name: 'description',
        message: '간단한 설명 (옵션):',
        default: ''
      }
    ]);

    userInfo = infoAnswer;
  }

  const spinner = ora('프롬프트 생성 중...').start();

  try {
    const promptData = await promptGen.generatePrompt(stepId, userInfo);
    spinner.succeed('프롬프트 생성 완료!');

    const formatted = promptGen.formatPrompt(promptData);
    console.log(formatted);

    // 클립보드 복사 옵션
    const copyAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'copy',
        message: '프롬프트를 파일로 저장할까요?',
        default: true
      }
    ]);

    if (copyAnswer.copy) {
      const fs = await import('fs/promises');
      const path = await import('path');
      const filename = `prompt-step-${stepId}.md`;
      const filepath = path.join(process.cwd(), 'claudedocs', filename);

      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, promptData.prompt);

      console.log(chalk.green(`\n✓ 프롬프트가 저장되었습니다: ${filename}\n`));
    }
  } catch (error) {
    spinner.fail('프롬프트 생성 실패');
    console.error(chalk.red(error.message));
  }
}

/**
 * AI 프로젝트 리딩
 */
async function leadProject(projectPath, options) {
  console.log(boxen(
    chalk.bold.green('🤖 AI 프로젝트 리더'),
    { padding: 1, borderColor: 'green', margin: 1 }
  ));

  const spinner = ora('프로젝트 분석 및 리딩 중...').start();

  try {
    // 사용자 정보 수집 (인터랙티브 모드)
    let userInfo = {};
    if (options.interactive) {
      spinner.stop();

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '프로젝트명:'
        },
        {
          type: 'input',
          name: 'coreFeatures',
          message: '핵심 기능 (쉼표로 구분):'
        },
        {
          type: 'input',
          name: 'techStack',
          message: '선호하는 기술 스택 (옵션):'
        }
      ]);

      userInfo = answers;
      spinner.start('리딩 재시작...');
    }

    const result = await leader.leadProject(projectPath, userInfo);
    spinner.succeed('리딩 완료!');

    // 리포트 출력
    console.log(result.report);

    // 인터랙티브 모드: 액션 선택
    if (options.interactive && result.actions.length > 0) {
      const actionAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '다음 액션을 선택하세요:',
          choices: [
            ...result.actions.slice(0, 5).map((action, index) => ({
              name: `${index + 1}. ${action.title}`,
              value: action
            })),
            { name: '나중에 하기', value: null }
          ]
        }
      ]);

      if (actionAnswer.action) {
        const action = actionAnswer.action;

        // 액션 타입에 따른 처리
        if (action.prompt) {
          console.log('\n' + chalk.bold('📝 생성된 프롬프트:\n'));
          console.log(action.prompt);

          // 파일 저장 옵션
          const saveAnswer = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'save',
              message: '프롬프트를 파일로 저장할까요?',
              default: true
            }
          ]);

          if (saveAnswer.save) {
            const fs = await import('fs/promises');
            const path = await import('path');
            const filename = `prompt-step-${action.step}.md`;
            const filepath = path.join(process.cwd(), 'claudedocs', filename);

            await fs.mkdir(path.dirname(filepath), { recursive: true });
            await fs.writeFile(filepath, action.prompt);

            console.log(chalk.green(`\n✓ 프롬프트가 저장되었습니다: ${filename}\n`));
          }
        } else if (action.solution) {
          console.log('\n' + chalk.cyan('💡 해결 방법:\n'));
          console.log(chalk.gray(action.solution) + '\n');
        }
      }
    }
  } catch (error) {
    spinner.fail('리딩 실패');
    console.error(chalk.red(error.message));
  }
}

// CLI 실행
program.parse();
