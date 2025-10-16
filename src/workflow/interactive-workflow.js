/**
 * 대화형 워크플로우 엔진
 * 각 단계별로 정보 입력 → 프롬프트 제공 → 결과 확인 → 승인/재작업 흐름 관리
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import PromptGenerator from '../generator/prompt-generator.js';
import Storage from '../utils/storage.js';
import { steps } from '../guide/steps.js';

class InteractiveWorkflow {
  constructor() {
    this.promptGenerator = new PromptGenerator();
    this.storage = new Storage();
    this.progress = null;
    this.projectName = '';
  }

  /**
   * 워크플로우 시작
   */
  async start(options = {}) {
    console.log(chalk.cyan.bold('\n🚀 Automation Master - 대화형 워크플로우\n'));

    // 프로젝트 초기화 또는 로드
    await this.initializeProject();

    // 시작 단계 결정
    const startStep = options.step || this.progress.currentStep || 1;

    console.log(boxen(
      chalk.white(`📍 현재 단계: ${startStep}/10\n`) +
      chalk.gray(`프로젝트: ${this.projectName}`),
      { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'cyan' }
    ));

    // 워크플로우 실행
    await this.runWorkflow(startStep);
  }

  /**
   * 프로젝트 초기화
   */
  async initializeProject() {
    try {
      this.progress = await this.storage.loadProgress();
      this.projectName = this.progress.projectName;

      if (this.projectName) {
        const { continueProject } = await inquirer.prompt([{
          type: 'confirm',
          name: 'continueProject',
          message: `기존 프로젝트 "${this.projectName}"를 계속하시겠습니까?`,
          default: true
        }]);

        if (!continueProject) {
          await this.createNewProject();
        }
      } else {
        await this.createNewProject();
      }
    } catch (error) {
      // 진행 상태 없음 - 새 프로젝트 생성
      await this.createNewProject();
    }
  }

  /**
   * 새 프로젝트 생성
   */
  async createNewProject() {
    const { projectName } = await inquirer.prompt([{
      type: 'input',
      name: 'projectName',
      message: '프로젝트 이름을 입력하세요:',
      validate: input => input.length > 0 || '프로젝트 이름은 필수입니다.'
    }]);

    this.projectName = projectName;
    await this.storage.setProjectName(projectName);
    this.progress = await this.storage.loadProgress();

    console.log(chalk.green(`✅ 프로젝트 "${projectName}" 생성 완료!\n`));
  }

  /**
   * 워크플로우 실행
   */
  async runWorkflow(startStep) {
    let currentStep = startStep;
    let retryCount = 0;
    const MAX_RETRIES = 10;

    while (currentStep <= 10) {
      console.log(chalk.cyan(`\n${'='.repeat(60)}`));
      console.log(chalk.cyan.bold(`  단계 ${currentStep}: ${steps[currentStep - 1].title}`));
      console.log(chalk.cyan(`${'='.repeat(60)}\n`));

      // 재시도 횟수 경고
      if (retryCount > 0) {
        console.log(chalk.yellow(`⚠️  재시도 횟수: ${retryCount}/${MAX_RETRIES}\n`));
      }

      // 최대 재시도 초과 확인
      if (retryCount >= MAX_RETRIES) {
        console.log(chalk.red.bold('\n⚠️  최대 재시도 횟수에 도달했습니다.'));
        const { forceContinue } = await inquirer.prompt([{
          type: 'list',
          name: 'forceContinue',
          message: '어떻게 하시겠습니까?',
          choices: [
            { name: '다음 단계로 강제 진행', value: 'next' },
            { name: '이전 단계로 돌아가기', value: 'prev' },
            { name: '워크플로우 종료', value: 'exit' }
          ]
        }]);

        if (forceContinue === 'next') {
          currentStep++;
          retryCount = 0;
          this.progress.currentStep = currentStep;
          await this.storage.saveProgress(this.progress);
          continue;
        } else if (forceContinue === 'prev') {
          if (currentStep > 1) {
            currentStep--;
            retryCount = 0;
            this.progress.currentStep = currentStep;
            await this.storage.saveProgress(this.progress);
          }
          continue;
        } else {
          console.log(chalk.yellow('\n👋 워크플로우를 종료합니다.'));
          console.log(chalk.gray(`현재 진행: 단계 ${currentStep}/10`));
          break;
        }
      }

      // 단계 실행
      const result = await this.executeStep(currentStep);

      if (result === 'next') {
        // 다음 단계로
        currentStep++;
        retryCount = 0;  // 재시도 카운터 리셋
        this.progress.currentStep = currentStep;
        await this.storage.saveProgress(this.progress);
      } else if (result === 'retry') {
        // 현재 단계 재시도
        retryCount++;
        console.log(chalk.yellow(`\n🔄 단계 ${currentStep}를 다시 진행합니다...\n`));
        continue;
      } else if (result === 'exit') {
        // 워크플로우 종료
        console.log(chalk.yellow('\n👋 워크플로우를 종료합니다.'));
        console.log(chalk.gray(`현재 진행: 단계 ${currentStep}/10`));
        console.log(chalk.cyan(`\n💡 나중에 "npm run workflow"로 다시 시작할 수 있습니다.`));
        break;
      } else if (result === 'prev') {
        // 이전 단계로
        if (currentStep > 1) {
          currentStep--;
          retryCount = 0;  // 재시도 카운터 리셋
          this.progress.currentStep = currentStep;
          await this.storage.saveProgress(this.progress);
        } else {
          console.log(chalk.yellow('⚠️  첫 번째 단계입니다.'));
        }
      }
    }

    if (currentStep > 10) {
      console.log(boxen(
        chalk.green.bold('🎉 축하합니다! 모든 단계를 완료했습니다!\n\n') +
        chalk.white(`프로젝트: ${this.projectName}\n`) +
        chalk.gray('이제 프로젝트를 배포하고 운영할 준비가 되었습니다.'),
        { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'green' }
      ));
    }
  }

  /**
   * 단계 실행
   */
  async executeStep(stepNumber) {
    const step = steps[stepNumber - 1];

    // 1. 단계 정보 표시
    this.displayStepInfo(step);

    // 2. 사용자 정보 수집
    const userInfo = await this.collectStepInfo(stepNumber);

    // 3. 프롬프트 생성 및 표시
    await this.showPrompt(stepNumber, userInfo);

    // 4. 작업 완료 대기 및 확인
    const result = await this.waitForCompletion(stepNumber);

    return result;
  }

  /**
   * 단계 정보 표시
   */
  displayStepInfo(step) {
    console.log(boxen(
      chalk.cyan.bold(`📋 ${step.title}\n\n`) +
      chalk.white(`예상 소요 시간: ${step.duration}\n`) +
      chalk.gray(`MCP 서버: ${step.mcpServers.join(', ')}`),
      { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'cyan' }
    ));

    console.log(chalk.white.bold('\n📝 주요 작업:\n'));
    step.tasks.slice(0, 5).forEach((task, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${task}`));
    });
    if (step.tasks.length > 5) {
      console.log(chalk.gray(`  ... 외 ${step.tasks.length - 5}개\n`));
    }
  }

  /**
   * 단계별 정보 수집
   */
  async collectStepInfo(stepNumber) {
    console.log(chalk.yellow('\n💡 이 단계에 필요한 정보를 입력해주세요.\n'));

    const questions = this.getStepQuestions(stepNumber);
    const answers = await inquirer.prompt(questions);

    return {
      projectName: this.projectName,
      ...answers
    };
  }

  /**
   * 단계별 질문 생성
   */
  getStepQuestions(stepNumber) {
    const baseQuestions = [
      {
        type: 'input',
        name: 'additionalInfo',
        message: '추가로 고려할 사항이 있다면 입력하세요 (선택):',
        default: ''
      }
    ];

    // 단계별 맞춤 질문
    const customQuestions = {
      1: [
        {
          type: 'input',
          name: 'problem',
          message: '해결하려는 문제가 무엇인가요?',
          validate: input => input.length > 0 || '문제 설명은 필수입니다.'
        },
        {
          type: 'input',
          name: 'targetUsers',
          message: '타겟 사용자는 누구인가요?',
          default: '일반 사용자'
        },
        {
          type: 'input',
          name: 'competitors',
          message: '경쟁 제품/서비스가 있다면 입력하세요:',
          default: '없음'
        }
      ],
      2: [
        {
          type: 'input',
          name: 'coreFeatures',
          message: '핵심 기능 3가지를 입력하세요 (쉼표로 구분):',
          validate: input => input.length > 0 || '핵심 기능은 필수입니다.'
        },
        {
          type: 'list',
          name: 'techStack',
          message: '기술 스택을 선택하세요:',
          choices: ['React + Supabase', 'Next.js + Supabase', 'Vue + Supabase', 'Custom']
        }
      ],
      3: [
        {
          type: 'input',
          name: 'tables',
          message: '필요한 데이터 테이블을 입력하세요 (쉼표로 구분):',
          validate: input => input.length > 0 || '테이블 정보는 필수입니다.'
        },
        {
          type: 'input',
          name: 'apiEndpoints',
          message: '주요 API 엔드포인트를 입력하세요:',
          default: '/api/users, /api/data'
        }
      ],
      4: [
        {
          type: 'input',
          name: 'designReference',
          message: '참고할 디자인 사이트 URL을 입력하세요:',
          default: 'linear.app, notion.so'
        },
        {
          type: 'list',
          name: 'designStyle',
          message: '디자인 스타일을 선택하세요:',
          choices: ['Modern', 'Minimalist', 'Professional', 'Creative']
        }
      ],
      5: [
        {
          type: 'confirm',
          name: 'useTypescript',
          message: 'TypeScript를 사용하시겠습니까?',
          default: true
        },
        {
          type: 'list',
          name: 'framework',
          message: '프레임워크를 선택하세요:',
          choices: ['Next.js 14', 'React + Vite', 'Vue 3']
        }
      ]
    };

    return [...(customQuestions[stepNumber] || []), ...baseQuestions];
  }

  /**
   * 프롬프트 생성 및 표시
   */
  async showPrompt(stepNumber, userInfo) {
    console.log(chalk.cyan('\n⏳ 프롬프트 생성 중...\n'));

    const spinner = ora('프롬프트 생성 중').start();
    await new Promise(resolve => setTimeout(resolve, 1000));

    const promptData = await this.promptGenerator.generatePrompt(stepNumber, userInfo);
    spinner.succeed('프롬프트 생성 완료!');

    console.log(boxen(
      chalk.green.bold('📋 Claude Code 실행 프롬프트\n\n') +
      chalk.white('아래 프롬프트를 Claude Code에 붙여넣어 실행하세요:'),
      { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'green' }
    ));

    console.log(chalk.gray('─'.repeat(80)));
    console.log(promptData.prompt);
    console.log(chalk.gray('─'.repeat(80)));

    // 프롬프트 파일로 저장
    const { saveToFile } = await inquirer.prompt([{
      type: 'confirm',
      name: 'saveToFile',
      message: '프롬프트를 파일로 저장하시겠습니까?',
      default: true
    }]);

    if (saveToFile) {
      const filename = `claudedocs/prompt-step-${stepNumber}.md`;
      const fs = await import('fs/promises');
      const path = await import('path');

      try {
        await fs.mkdir('claudedocs', { recursive: true });
        await fs.writeFile(filename, promptData.prompt, 'utf-8');
        console.log(chalk.green(`✅ 프롬프트가 저장되었습니다: ${filename}`));
      } catch (error) {
        console.log(chalk.red(`❌ 파일 저장 실패: ${error.message}`));
      }
    }
  }

  /**
   * 작업 완료 대기 및 확인
   */
  async waitForCompletion(stepNumber) {
    console.log(chalk.yellow('\n⏸️  Claude Code에서 작업을 완료한 후 계속하세요.\n'));
    console.log(chalk.gray('   💡 Tip: "retry"를 반복하면 같은 단계를 계속 반복합니다.\n'));

    const { completed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'completed',
      message: 'Claude Code 작업이 완료되었습니까?',
      default: false
    }]);

    if (!completed) {
      console.log(chalk.cyan('\n📌 작업이 아직 완료되지 않았습니다.'));

      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: '어떻게 하시겠습니까?',
        choices: [
          { name: '💾 저장하고 나중에 계속하기 (워크플로우 종료)', value: 'exit' },
          { name: '🔄 프롬프트 다시 보기 (이 단계 재시도)', value: 'retry' },
          { name: '⬅️  이전 단계로 돌아가기', value: 'prev' }
        ]
      }]);

      if (action === 'retry') {
        console.log(chalk.yellow('\n⚠️  주의: 같은 단계를 다시 진행합니다.'));
      } else if (action === 'exit') {
        console.log(chalk.green('\n💾 현재 진행 상태가 저장되었습니다.'));
      }

      return action;
    }

    // 결과 만족도 확인
    console.log(chalk.cyan('\n📊 작업 결과를 평가해주세요.'));

    const { satisfied } = await inquirer.prompt([{
      type: 'confirm',
      name: 'satisfied',
      message: '작업 결과가 만족스럽습니까?',
      default: true
    }]);

    if (!satisfied) {
      console.log(chalk.yellow('\n🔄 결과를 수정하거나 보완할 수 있습니다.\n'));

      const { feedback } = await inquirer.prompt([{
        type: 'input',
        name: 'feedback',
        message: '어떤 부분을 수정/보완하고 싶으신가요?',
        validate: input => input.length > 0 || '피드백을 입력해주세요.'
      }]);

      // 피드백 저장
      this.saveFeedback(stepNumber, feedback);

      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: '다음 단계:',
        choices: [
          { name: '🔄 수정/보완 후 다시 확인 (이 단계 재시도)', value: 'retry' },
          { name: '⏭️  이 단계는 이정도로 충분함 (다음 단계로)', value: 'next' },
          { name: '⬅️  이전 단계로 돌아가기', value: 'prev' },
          { name: '💾 워크플로우 종료', value: 'exit' }
        ]
      }]);

      if (action === 'retry') {
        console.log(chalk.yellow('\n⚠️  주의: 같은 단계를 다시 진행합니다. 변경사항을 Claude Code에 적용하세요.'));
      } else if (action === 'next') {
        console.log(chalk.cyan('\n⏭️  현재 상태로 다음 단계로 진행합니다.'));
        await this.markStepComplete(stepNumber);
      }

      return action;
    }

    // 만족 - 단계 완료 처리
    await this.markStepComplete(stepNumber);

    console.log(chalk.green(`\n✅ 단계 ${stepNumber} 완료!\n`));

    // 다음 단계 확인
    if (stepNumber < 10) {
      const { continueNext } = await inquirer.prompt([{
        type: 'confirm',
        name: 'continueNext',
        message: `다음 단계 ${stepNumber + 1}로 진행하시겠습니까?`,
        default: true
      }]);

      if (!continueNext) {
        console.log(chalk.cyan('\n💾 진행 상태가 저장되었습니다. 나중에 다시 시작할 수 있습니다.'));
      }

      return continueNext ? 'next' : 'exit';
    }

    return 'next';
  }

  /**
   * 피드백 저장
   */
  async saveFeedback(stepNumber, feedback) {
    const stepIndex = this.progress.steps.findIndex(s => s.stepId === stepNumber);
    if (stepIndex === -1) return;

    if (!this.progress.steps[stepIndex].notes) {
      this.progress.steps[stepIndex].notes = [];
    }

    this.progress.steps[stepIndex].notes.push({
      content: feedback,
      createdAt: new Date().toISOString()
    });

    await this.storage.saveProgress(this.progress);
  }

  /**
   * 단계 완료 표시
   */
  async markStepComplete(stepNumber) {
    await this.storage.completeStep(stepNumber);
    this.progress = await this.storage.loadProgress();

    // 체크리스트 자동 체크
    const step = steps[stepNumber - 1];
    if (step.checklist) {
      for (let i = 0; i < step.checklist.length; i++) {
        await this.storage.checkItem(stepNumber, i, true);
      }
    }

    this.progress = await this.storage.loadProgress();
  }
}

export default InteractiveWorkflow;
