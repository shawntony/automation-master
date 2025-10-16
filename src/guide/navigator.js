/**
 * 단계 네비게이션 및 가이드 표시
 */

import steps from './steps.js';
import Storage from '../utils/storage.js';

class Navigator {
  constructor() {
    this.storage = new Storage();
  }

  /**
   * 특정 단계 정보 가져오기
   */
  getStep(stepId) {
    return steps.find(s => s.id === stepId);
  }

  /**
   * 모든 단계 목록 가져오기
   */
  getAllSteps() {
    return steps;
  }

  /**
   * 다음 단계로 이동
   */
  async nextStep() {
    const progress = await this.storage.loadProgress();
    const currentStepId = progress.currentStep;

    if (currentStepId >= 10) {
      return null;
    }

    // 현재 단계가 완료되지 않았으면 경고
    const currentStep = progress.steps.find(s => s.stepId === currentStepId);
    if (currentStep && currentStep.status !== 'completed') {
      throw new Error('현재 단계를 먼저 완료해주세요.');
    }

    progress.currentStep = currentStepId + 1;
    await this.storage.saveProgress(progress);

    return this.getStep(currentStepId + 1);
  }

  /**
   * 이전 단계로 이동
   */
  async prevStep() {
    const progress = await this.storage.loadProgress();
    const currentStepId = progress.currentStep;

    if (currentStepId <= 1) {
      return null;
    }

    progress.currentStep = currentStepId - 1;
    await this.storage.saveProgress(progress);

    return this.getStep(currentStepId - 1);
  }

  /**
   * 특정 단계로 이동
   */
  async goToStep(stepId) {
    if (stepId < 1 || stepId > 10) {
      throw new Error('유효하지 않은 단계 번호입니다.');
    }

    const progress = await this.storage.loadProgress();
    progress.currentStep = stepId;
    await this.storage.saveProgress(progress);

    return this.getStep(stepId);
  }

  /**
   * 현재 단계 가져오기
   */
  async getCurrentStep() {
    const progress = await this.storage.loadProgress();
    return this.getStep(progress.currentStep);
  }

  /**
   * 단계 상세 정보 (진행상황 포함)
   */
  async getStepWithProgress(stepId) {
    const step = this.getStep(stepId);
    const progress = await this.storage.loadProgress();
    const stepProgress = progress.steps.find(s => s.stepId === stepId);

    return {
      ...step,
      progress: stepProgress
    };
  }

  /**
   * 체크리스트 완료율 계산
   */
  calculateChecklistProgress(stepId, checklist) {
    const step = this.getStep(stepId);
    if (!step || !step.checklist) {
      return 0;
    }

    const total = step.checklist.length;
    const checked = Object.values(checklist || {}).filter(item => item.checked).length;

    return total > 0 ? (checked / total) * 100 : 0;
  }

  /**
   * 단계별 가이드 텍스트 생성
   */
  formatStepGuide(stepId) {
    const step = this.getStep(stepId);
    if (!step) {
      return '단계를 찾을 수 없습니다.';
    }

    let guide = `
╔════════════════════════════════════════════════════════════════╗
║  단계 ${step.id}: ${step.title}
╚════════════════════════════════════════════════════════════════╝

📅 예상 소요 시간: ${step.duration}
📝 설명: ${step.description}

`;

    // 작업 목록
    if (step.tasks && step.tasks.length > 0) {
      guide += '📋 주요 작업:\n\n';
      for (const task of step.tasks) {
        guide += `  ${task.id}. ${task.title}\n`;
        for (const item of task.items) {
          guide += `     • ${item}\n`;
        }
        guide += '\n';
      }
    }

    // MCP 서버
    if (step.mcpServers && step.mcpServers.length > 0) {
      guide += '🔧 사용할 MCP 서버:\n';
      guide += `  ${step.mcpServers.join(', ')}\n\n`;
    }

    // 체크리스트
    if (step.checklist && step.checklist.length > 0) {
      guide += '✅ 체크리스트:\n';
      for (let i = 0; i < step.checklist.length; i++) {
        guide += `  [ ] ${step.checklist[i]}\n`;
      }
      guide += '\n';
    }

    // 산출물
    if (step.outputs && step.outputs.length > 0) {
      guide += '📄 산출물:\n';
      for (const output of step.outputs) {
        guide += `  • ${output}\n`;
      }
      guide += '\n';
    }

    // CLI 명령어
    if (step.cliCommands && step.cliCommands.length > 0) {
      guide += '💻 CLI 명령어 예시:\n';
      for (const cmd of step.cliCommands) {
        guide += `  • ${cmd}\n`;
      }
      guide += '\n';
    }

    return guide;
  }

  /**
   * 전체 로드맵 요약
   */
  async getRoadmapSummary() {
    const progress = await this.storage.loadProgress();
    const stats = await this.storage.getStats();

    let summary = `
╔════════════════════════════════════════════════════════════════╗
║  프로젝트 로드맵: ${progress.projectName || '(이름 없음)'}
╚════════════════════════════════════════════════════════════════╝

📊 전체 진행률: ${stats.percentage.toFixed(1)}%
✅ 완료: ${stats.completed}/10
🔄 진행 중: ${stats.inProgress}
⏳ 대기: ${stats.pending}
📅 시작일: ${new Date(progress.createdAt).toLocaleDateString()}

단계별 상태:
`;

    for (const step of steps) {
      const stepProgress = progress.steps.find(s => s.stepId === step.id);
      let status = '⏳';
      if (stepProgress.status === 'completed') {
        status = '✅';
      } else if (stepProgress.status === 'in_progress') {
        status = '🔄';
      }

      const current = step.id === progress.currentStep ? ' ← 현재' : '';
      summary += `  ${status} ${step.id}. ${step.title} (${step.duration})${current}\n`;
    }

    return summary;
  }

  /**
   * 다음 액션 추천
   */
  async getNextActions() {
    const progress = await this.storage.loadProgress();
    const currentStep = this.getStep(progress.currentStep);
    const stepProgress = progress.steps.find(s => s.stepId === progress.currentStep);

    const actions = [];

    if (stepProgress.status === 'pending') {
      actions.push({
        type: 'start',
        description: `단계 ${currentStep.id} 시작하기`,
        command: `npm run guide -- --step ${currentStep.id} --action start`
      });
    }

    if (stepProgress.status === 'in_progress') {
      actions.push({
        type: 'checklist',
        description: '체크리스트 확인 및 완료 표시',
        command: `npm run guide -- --step ${currentStep.id} --action checklist`
      });

      actions.push({
        type: 'complete',
        description: '단계 완료 처리',
        command: `npm run guide -- --step ${currentStep.id} --action complete`
      });
    }

    if (currentStep.envConfig) {
      actions.push({
        type: 'env',
        description: '환경변수 설정',
        command: 'npm run env'
      });
    }

    return actions;
  }
}

export default Navigator;
