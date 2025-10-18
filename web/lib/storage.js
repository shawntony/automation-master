/**
 * 진행상황 저장 및 로드
 */

const fs = require('fs/promises');
const path = require('path');

class Storage {
  constructor() {
    this.progressPath = path.join(process.cwd(), 'config', 'progress.json');
  }

  /**
   * 진행상황 로드
   */
  async loadProgress() {
    try {
      const data = await fs.readFile(this.progressPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return this.getDefaultProgress();
      }
      throw error;
    }
  }

  /**
   * 진행상황 저장
   */
  async saveProgress(progress) {
    await fs.mkdir(path.dirname(this.progressPath), { recursive: true });
    await fs.writeFile(this.progressPath, JSON.stringify(progress, null, 2));
  }

  /**
   * 기본 진행상황 구조
   */
  getDefaultProgress() {
    return {
      projectName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStep: 1,
      steps: Array.from({ length: 10 }, (_, i) => ({
        stepId: i + 1,
        status: 'pending', // pending, in_progress, completed
        startedAt: null,
        completedAt: null,
        checklist: {},
        notes: []
      })),
      envConfig: null
    };
  }

  /**
   * 특정 단계 업데이트
   */
  async updateStep(stepId, updates) {
    const progress = await this.loadProgress();
    const stepIndex = progress.steps.findIndex(s => s.stepId === stepId);

    if (stepIndex === -1) {
      throw new Error(`Step ${stepId} not found`);
    }

    progress.steps[stepIndex] = {
      ...progress.steps[stepIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    progress.updatedAt = new Date().toISOString();
    await this.saveProgress(progress);

    return progress.steps[stepIndex];
  }

  /**
   * 단계 시작
   */
  async startStep(stepId) {
    return this.updateStep(stepId, {
      status: 'in_progress',
      startedAt: new Date().toISOString()
    });
  }

  /**
   * 단계 완료
   */
  async completeStep(stepId) {
    const progress = await this.loadProgress();
    await this.updateStep(stepId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    // 다음 단계로 이동
    if (stepId < 10) {
      progress.currentStep = stepId + 1;
      await this.saveProgress(progress);
    }

    return progress;
  }

  /**
   * 체크리스트 항목 체크
   */
  async checkItem(stepId, itemIndex, checked = true) {
    const progress = await this.loadProgress();
    const stepIndex = progress.steps.findIndex(s => s.stepId === stepId);

    if (stepIndex === -1) {
      throw new Error(`Step ${stepId} not found`);
    }

    if (!progress.steps[stepIndex].checklist) {
      progress.steps[stepIndex].checklist = {};
    }

    progress.steps[stepIndex].checklist[itemIndex] = {
      checked,
      checkedAt: checked ? new Date().toISOString() : null
    };

    progress.updatedAt = new Date().toISOString();
    await this.saveProgress(progress);

    return progress.steps[stepIndex];
  }

  /**
   * 노트 추가
   */
  async addNote(stepId, note) {
    const progress = await this.loadProgress();
    const stepIndex = progress.steps.findIndex(s => s.stepId === stepId);

    if (stepIndex === -1) {
      throw new Error(`Step ${stepId} not found`);
    }

    if (!progress.steps[stepIndex].notes) {
      progress.steps[stepIndex].notes = [];
    }

    progress.steps[stepIndex].notes.push({
      content: note,
      createdAt: new Date().toISOString()
    });

    progress.updatedAt = new Date().toISOString();
    await this.saveProgress(progress);

    return progress.steps[stepIndex];
  }

  /**
   * 프로젝트 이름 설정
   */
  async setProjectName(name) {
    const progress = await this.loadProgress();
    progress.projectName = name;
    progress.updatedAt = new Date().toISOString();
    await this.saveProgress(progress);
    return progress;
  }

  /**
   * 환경변수 설정 저장
   */
  async saveEnvConfig(config) {
    const progress = await this.loadProgress();
    progress.envConfig = config;
    progress.updatedAt = new Date().toISOString();
    await this.saveProgress(progress);
    return progress;
  }

  /**
   * 진행 통계
   */
  async getStats() {
    const progress = await this.loadProgress();
    const completed = progress.steps.filter(s => s.status === 'completed').length;
    const inProgress = progress.steps.filter(s => s.status === 'in_progress').length;
    const pending = progress.steps.filter(s => s.status === 'pending').length;

    return {
      total: 10,
      completed,
      inProgress,
      pending,
      percentage: (completed / 10) * 100,
      currentStep: progress.currentStep
    };
  }

  /**
   * 진행상황 초기화
   */
  async reset() {
    const defaultProgress = this.getDefaultProgress();
    await this.saveProgress(defaultProgress);
    return defaultProgress;
  }
}

module.exports = Storage;
module.exports.default = Storage;
