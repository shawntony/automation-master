/**
 * AI 리더
 * 프로젝트 분석 결과를 바탕으로 다음 액션을 추천하고 프로젝트를 리딩
 */

import Navigator from '../guide/navigator.js';
import ProjectAnalyzer from '../analyzer/project-analyzer.js';
import PromptGenerator from '../generator/prompt-generator.js';

class AILeader {
  constructor() {
    this.navigator = new Navigator();
    this.analyzer = new ProjectAnalyzer();
    this.promptGenerator = new PromptGenerator();
  }

  /**
   * 프로젝트 리딩
   */
  async leadProject(projectPath, userInfo = {}) {
    // 1. 프로젝트 분석
    const analysis = await this.analyzer.analyzeProject(projectPath);

    // 2. 현재 상태 평가
    const assessment = this.assessProject(analysis);

    // 3. 다음 액션 추천
    const actions = await this.recommendActions(analysis, assessment, userInfo);

    // 4. 리딩 리포트 생성
    const report = this.generateLeadershipReport(analysis, assessment, actions);

    return {
      analysis,
      assessment,
      actions,
      report
    };
  }

  /**
   * 프로젝트 상태 평가
   */
  assessProject(analysis) {
    const currentStep = analysis.currentStep;
    const stepScores = analysis.stepScores;

    // 전체 진행률
    const overallProgress = Math.round(
      Object.values(stepScores).reduce((a, b) => a + b, 0) / 10
    );

    // 단계별 상태
    const stepStatuses = {};
    for (let step = 1; step <= 10; step++) {
      const score = stepScores[step];
      stepStatuses[step] = {
        score,
        status: this.getStepStatus(score),
        isComplete: score >= 70,
        needsAttention: score < 50 && step < currentStep
      };
    }

    // 품질 점수
    const qualityScore = this.calculateQualityScore(analysis);

    // 위험 요소
    const risks = this.identifyRisks(analysis);

    // 강점
    const strengths = this.identifyStrengths(analysis);

    return {
      overallProgress,
      currentStep,
      stepStatuses,
      qualityScore,
      risks,
      strengths,
      readiness: this.assessReadiness(analysis)
    };
  }

  /**
   * 단계 상태 판단
   */
  getStepStatus(score) {
    if (score >= 70) return 'excellent';
    if (score >= 50) return 'good';
    if (score >= 30) return 'needs_work';
    return 'not_started';
  }

  /**
   * 품질 점수 계산
   */
  calculateQualityScore(analysis) {
    let score = 0;
    let factors = [];

    // Git 사용
    if (analysis.gitInfo.isGitRepo) {
      score += 10;
      factors.push('Git 버전 관리 사용 중');
    }

    // package.json 존재
    if (analysis.packageInfo) {
      score += 10;
      factors.push('package.json 설정됨');
    }

    // TypeScript 사용
    if (analysis.packageInfo?.dependencies?.typescript ||
        analysis.detectedFiles.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) {
      score += 15;
      factors.push('TypeScript 사용');
    }

    // 테스트 존재
    if (analysis.detectedDirs.some(d => d.includes('test') || d.includes('__tests__'))) {
      score += 15;
      factors.push('테스트 코드 존재');
    }

    // 환경변수 관리
    if (analysis.detectedFiles.some(f => f.includes('.env'))) {
      score += 10;
      factors.push('환경변수 관리');
    }

    // Supabase 통합
    if (analysis.packageInfo?.hasSupabase) {
      score += 10;
      factors.push('Supabase 통합');
    }

    // 디자인 시스템
    if (analysis.packageInfo?.hasTailwind) {
      score += 10;
      factors.push('Tailwind CSS 사용');
    }

    // 문서화
    const docsCount = analysis.detectedFiles.filter(f => f.endsWith('.md')).length;
    if (docsCount >= 5) {
      score += 10;
      factors.push('문서화 우수');
    } else if (docsCount >= 3) {
      score += 5;
      factors.push('문서화 보통');
    }

    // 배포 설정
    if (analysis.detectedFiles.some(f => f.includes('vercel.json') || f.includes('Dockerfile'))) {
      score += 10;
      factors.push('배포 설정 존재');
    }

    return {
      score: Math.min(score, 100),
      factors
    };
  }

  /**
   * 위험 요소 식별
   */
  identifyRisks(analysis) {
    const risks = [];

    // Git 미사용
    if (!analysis.gitInfo.isGitRepo) {
      risks.push({
        level: 'high',
        category: 'version_control',
        message: 'Git 버전 관리가 설정되지 않았습니다.',
        impact: '코드 변경 이력 추적 불가, 협업 어려움',
        solution: 'git init 실행 후 GitHub 연동'
      });
    }

    // 환경변수 없음
    if (analysis.currentStep >= 5 && !analysis.detectedFiles.some(f => f.includes('.env'))) {
      risks.push({
        level: 'high',
        category: 'configuration',
        message: '환경변수 파일이 없습니다.',
        impact: 'API 키 및 설정 관리 어려움',
        solution: 'npm run env로 환경변수 설정'
      });
    }

    // 테스트 없음
    if (analysis.currentStep >= 8 &&
        !analysis.detectedDirs.some(d => d.includes('test'))) {
      risks.push({
        level: 'medium',
        category: 'quality',
        message: '테스트 코드가 없습니다.',
        impact: '버그 발견 어려움, 리팩토링 위험',
        solution: 'Playwright 테스트 추가'
      });
    }

    // 이전 단계 미완성
    for (let step = 1; step < analysis.currentStep; step++) {
      if (analysis.stepScores[step] < 50) {
        risks.push({
          level: 'medium',
          category: 'process',
          message: `단계 ${step}가 ${analysis.stepScores[step]}%만 완료되었습니다.`,
          impact: '후속 단계의 품질 저하 가능',
          solution: `단계 ${step}로 돌아가서 보완`
        });
      }
    }

    return risks;
  }

  /**
   * 강점 식별
   */
  identifyStrengths(analysis) {
    const strengths = [];

    if (analysis.gitInfo.isGitRepo) {
      strengths.push('✓ 버전 관리 활성화');
    }

    if (analysis.packageInfo?.hasSupabase) {
      strengths.push('✓ Supabase 데이터베이스 통합');
    }

    if (analysis.packageInfo?.hasTailwind) {
      strengths.push('✓ Tailwind CSS 디자인 시스템');
    }

    if (analysis.packageInfo?.hasPlaywright) {
      strengths.push('✓ Playwright 테스트 프레임워크');
    }

    const docsCount = analysis.detectedFiles.filter(f => f.endsWith('.md')).length;
    if (docsCount >= 5) {
      strengths.push(`✓ ${docsCount}개 문서 파일`);
    }

    return strengths;
  }

  /**
   * 준비도 평가
   */
  assessReadiness(analysis) {
    const readiness = {};

    // 개발 준비도
    readiness.development = {
      ready: analysis.stepScores[5] >= 70,
      score: analysis.stepScores[5],
      message: analysis.stepScores[5] >= 70
        ? '개발 환경이 준비되었습니다.'
        : '개발 환경 설정이 필요합니다.'
    };

    // 배포 준비도
    readiness.deployment = {
      ready: analysis.stepScores[9] >= 70,
      score: analysis.stepScores[9],
      message: analysis.stepScores[9] >= 70
        ? '배포 준비가 완료되었습니다.'
        : '배포 설정이 필요합니다.'
    };

    // 운영 준비도
    readiness.operations = {
      ready: analysis.stepScores[10] >= 70,
      score: analysis.stepScores[10],
      message: analysis.stepScores[10] >= 70
        ? '운영 체계가 갖춰졌습니다.'
        : '운영 자동화가 필요합니다.'
    };

    return readiness;
  }

  /**
   * 다음 액션 추천
   */
  async recommendActions(analysis, assessment, userInfo) {
    const actions = [];
    const currentStep = analysis.currentStep;

    // 1. 현재 단계 완료
    if (assessment.stepStatuses[currentStep].score < 70) {
      const missingItems = await this.analyzer.findMissingItems(currentStep, analysis);

      actions.push({
        priority: 1,
        type: 'complete_current',
        step: currentStep,
        title: `현재 단계 ${currentStep} 완료하기`,
        description: `${assessment.stepStatuses[currentStep].score}%만 완료되었습니다. ${70 - assessment.stepStatuses[currentStep].score}% 더 진행해야 합니다.`,
        missingItems,
        prompt: await this.generateActionPrompt(currentStep, missingItems, userInfo)
      });
    }

    // 2. 이전 단계 보완
    for (let step = 1; step < currentStep; step++) {
      if (assessment.stepStatuses[step].needsAttention) {
        const missingItems = await this.analyzer.findMissingItems(step, analysis);

        actions.push({
          priority: 2,
          type: 'fix_previous',
          step,
          title: `단계 ${step} 보완하기`,
          description: `${assessment.stepStatuses[step].score}%만 완료되어 보완이 필요합니다.`,
          missingItems,
          prompt: await this.generateActionPrompt(step, missingItems, userInfo)
        });
      }
    }

    // 3. 위험 요소 해결
    for (const risk of assessment.risks) {
      actions.push({
        priority: risk.level === 'high' ? 1 : 3,
        type: 'mitigate_risk',
        risk,
        title: risk.message,
        description: `영향: ${risk.impact}`,
        solution: risk.solution
      });
    }

    // 4. 다음 단계 준비
    if (assessment.stepStatuses[currentStep].isComplete && currentStep < 10) {
      const nextStep = currentStep + 1;

      actions.push({
        priority: 1,
        type: 'next_step',
        step: nextStep,
        title: `다음 단계 ${nextStep} 시작하기`,
        description: `현재 단계가 완료되었습니다. 다음 단계를 시작할 수 있습니다.`,
        prompt: await this.generateActionPrompt(nextStep, [], userInfo)
      });
    }

    // 우선순위 정렬
    return actions.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 액션 프롬프트 생성
   */
  async generateActionPrompt(stepId, missingItems, userInfo) {
    const promptData = await this.promptGenerator.generatePrompt(stepId, userInfo);

    let prompt = promptData.prompt;

    if (missingItems.length > 0) {
      prompt += '\n\n## 🚨 누락된 항목\n\n';
      prompt += '다음 항목들이 누락되었습니다. 우선 생성해주세요:\n\n';

      const files = missingItems.filter(i => i.type === 'file');
      const dirs = missingItems.filter(i => i.type === 'directory');

      if (files.length > 0) {
        prompt += '**파일:**\n';
        files.forEach(f => {
          prompt += `- ${f.name}\n`;
        });
        prompt += '\n';
      }

      if (dirs.length > 0) {
        prompt += '**디렉토리:**\n';
        dirs.forEach(d => {
          prompt += `- ${d.name}/\n`;
        });
        prompt += '\n';
      }
    }

    return prompt;
  }

  /**
   * 리딩 리포트 생성
   */
  generateLeadershipReport(analysis, assessment, actions) {
    let report = '\n';
    report += '╔════════════════════════════════════════════════════════════════╗\n';
    report += '║  🤖 AI 프로젝트 리더 리포트\n';
    report += '╚════════════════════════════════════════════════════════════════╝\n\n';

    // 프로젝트 개요
    report += `📁 프로젝트: ${analysis.packageInfo?.name || '(이름 없음)'}\n`;
    report += `📅 분석 일시: ${new Date(analysis.analyzedAt).toLocaleString()}\n\n`;

    // 전체 상태
    report += `📊 전체 진행률: ${assessment.overallProgress}%\n`;
    report += `🎯 현재 단계: ${assessment.currentStep}\n`;
    report += `⭐ 품질 점수: ${assessment.qualityScore.score}/100\n\n`;

    // 강점
    if (assessment.strengths.length > 0) {
      report += '💪 강점:\n';
      assessment.strengths.forEach(s => {
        report += `  ${s}\n`;
      });
      report += '\n';
    }

    // 위험 요소
    if (assessment.risks.length > 0) {
      report += '⚠️  위험 요소:\n\n';
      assessment.risks.forEach(risk => {
        const emoji = risk.level === 'high' ? '🔴' : '🟡';
        report += `  ${emoji} ${risk.message}\n`;
        report += `     영향: ${risk.impact}\n`;
        report += `     해결: ${risk.solution}\n\n`;
      });
    }

    // 추천 액션
    if (actions.length > 0) {
      report += '🎯 추천 액션 (우선순위순):\n\n';

      actions.slice(0, 5).forEach((action, index) => {
        report += `  ${index + 1}. ${action.title}\n`;
        report += `     ${action.description}\n`;

        if (action.solution) {
          report += `     → ${action.solution}\n`;
        }

        if (action.missingItems && action.missingItems.length > 0) {
          const items = action.missingItems.slice(0, 3);
          report += `     누락: ${items.map(i => i.name).join(', ')}`;
          if (action.missingItems.length > 3) {
            report += ` 외 ${action.missingItems.length - 3}개`;
          }
          report += '\n';
        }

        report += '\n';
      });
    }

    // 준비도
    report += '🚀 준비도:\n\n';
    for (const [key, readiness] of Object.entries(assessment.readiness)) {
      const emoji = readiness.ready ? '✅' : '⏳';
      const label = key === 'development' ? '개발' :
                   key === 'deployment' ? '배포' : '운영';
      report += `  ${emoji} ${label}: ${readiness.score}% - ${readiness.message}\n`;
    }
    report += '\n';

    // 다음 단계
    if (actions.length > 0) {
      const topAction = actions[0];
      report += '📌 즉시 실행 가능한 액션:\n\n';
      if (topAction.type === 'complete_current' || topAction.type === 'next_step' || topAction.type === 'fix_previous') {
        report += '다음 명령어로 프롬프트를 받아보세요:\n';
        report += `  npm run prompt -- --step ${topAction.step}\n\n`;
      } else {
        report += `  ${topAction.solution || topAction.description}\n\n`;
      }
    }

    return report;
  }
}

export default AILeader;
