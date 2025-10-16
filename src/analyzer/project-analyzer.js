/**
 * 프로젝트 분석기
 * GitHub 프로젝트 폴더를 분석해서 현재 단계와 상태를 진단
 */

import fs from 'fs/promises';
import path from 'path';

class ProjectAnalyzer {
  constructor() {
    this.indicators = this.getStepIndicators();
  }

  /**
   * 각 단계별 파일/폴더 존재 여부로 진단
   */
  getStepIndicators() {
    return {
      1: {
        files: [
          'idea-definition.md',
          'competitive-analysis.md',
          'user-needs.md',
          'tech-feasibility.md'
        ],
        keywords: ['아이디어', '문제', '경쟁사', '사용자'],
        weight: 10
      },
      2: {
        files: [
          'pdr.md',
          'requirements.md',
          'architecture.md',
          'tech-options.md',
          'risk-analysis.md'
        ],
        keywords: ['요구사항', '아키텍처', 'PDR', '위험'],
        weight: 10
      },
      3: {
        files: [
          'system-design.md',
          'user-scenarios.md',
          'screen-specs.md',
          'database-design.md',
          'api-spec.yaml',
          'supabase-schema.sql'
        ],
        keywords: ['시스템', '데이터베이스', 'API', '시나리오'],
        weight: 15
      },
      4: {
        files: [
          'design-benchmark.md',
          'design-system.md',
          'tailwind.config.js',
          'tailwind.config.ts'
        ],
        directories: [
          'components/templates',
          'storybook',
          'src/components'
        ],
        keywords: ['디자인', 'UI', 'UX', '컴포넌트'],
        weight: 15
      },
      5: {
        files: [
          'package.json',
          'tsconfig.json',
          'vite.config.js',
          'vite.config.ts',
          'next.config.js',
          'next.config.ts',
          '.env',
          'vercel.json'
        ],
        keywords: ['React', 'Vue', 'Next', 'Vite', 'TypeScript'],
        weight: 10
      },
      6: {
        directories: [
          'src',
          'app',
          'pages',
          'components',
          'hooks',
          'api'
        ],
        files: [
          'src/App.tsx',
          'src/App.jsx',
          'app/layout.tsx',
          'pages/index.tsx'
        ],
        keywords: ['프론트엔드', 'React', 'component'],
        weight: 15
      },
      7: {
        directories: [
          'api',
          'server',
          'backend',
          'supabase'
        ],
        files: [
          'supabase-complete-setup.md',
          'api-spec.yaml',
          'server.js',
          'server.ts'
        ],
        keywords: ['백엔드', 'API', 'Supabase', 'database'],
        weight: 15
      },
      8: {
        directories: [
          'tests',
          'test',
          '__tests__',
          'e2e'
        ],
        files: [
          'playwright.config.js',
          'playwright.config.ts',
          'jest.config.js',
          'vitest.config.js'
        ],
        keywords: ['test', 'spec', 'playwright', 'jest'],
        weight: 10
      },
      9: {
        files: [
          'vercel.json',
          '.github/workflows/deploy.yml',
          'deploy.sh',
          'Dockerfile',
          'docker-compose.yml'
        ],
        keywords: ['deploy', 'CI/CD', 'vercel', 'docker'],
        weight: 5
      },
      10: {
        files: [
          'monitoring.md',
          'operations.md',
          '.github/workflows/monitor.yml'
        ],
        directories: [
          'scripts',
          'operations'
        ],
        keywords: ['monitoring', 'operations', 'maintenance'],
        weight: 5
      }
    };
  }

  /**
   * 프로젝트 폴더 분석
   */
  async analyzeProject(projectPath) {
    try {
      // 프로젝트 존재 확인
      await fs.access(projectPath);

      const analysis = {
        projectPath,
        analyzedAt: new Date().toISOString(),
        currentStep: 0,
        stepScores: {},
        detectedFiles: [],
        detectedDirs: [],
        packageInfo: null,
        gitInfo: null,
        recommendations: []
      };

      // 파일/폴더 목록 수집
      await this.scanDirectory(projectPath, analysis);

      // package.json 분석
      analysis.packageInfo = await this.analyzePackageJson(projectPath);

      // Git 정보
      analysis.gitInfo = await this.analyzeGit(projectPath);

      // 각 단계별 점수 계산
      for (let step = 1; step <= 10; step++) {
        analysis.stepScores[step] = await this.calculateStepScore(
          step,
          analysis.detectedFiles,
          analysis.detectedDirs,
          analysis.packageInfo
        );
      }

      // 현재 단계 추론
      analysis.currentStep = this.inferCurrentStep(analysis.stepScores);

      // 추천 사항 생성
      analysis.recommendations = await this.generateRecommendations(analysis);

      return analysis;
    } catch (error) {
      throw new Error(`프로젝트 분석 실패: ${error.message}`);
    }
  }

  /**
   * 디렉토리 스캔 (재귀)
   */
  async scanDirectory(dirPath, analysis, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return;

    try {
      const items = await fs.readdir(dirPath);

      for (const item of items) {
        // node_modules, .git 등 제외
        if (this.shouldSkip(item)) continue;

        const fullPath = path.join(dirPath, item);
        const relativePath = path.relative(analysis.projectPath, fullPath);

        try {
          const stat = await fs.stat(fullPath);

          if (stat.isDirectory()) {
            analysis.detectedDirs.push(relativePath);
            await this.scanDirectory(fullPath, analysis, depth + 1, maxDepth);
          } else if (stat.isFile()) {
            analysis.detectedFiles.push(relativePath);
          }
        } catch (error) {
          // 권한 없는 파일/폴더 무시
          continue;
        }
      }
    } catch (error) {
      // 디렉토리 읽기 실패 무시
    }
  }

  /**
   * 스킵할 항목
   */
  shouldSkip(item) {
    const skipList = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      '.cache',
      'coverage',
      '.vercel',
      '.turbo'
    ];
    return skipList.includes(item) || item.startsWith('.');
  }

  /**
   * package.json 분석
   */
  async analyzePackageJson(projectPath) {
    try {
      const pkgPath = path.join(projectPath, 'package.json');
      const content = await fs.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);

      return {
        name: pkg.name,
        version: pkg.version,
        dependencies: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
        scripts: Object.keys(pkg.scripts || {}),
        hasReact: !!pkg.dependencies?.react,
        hasNext: !!pkg.dependencies?.next,
        hasVue: !!pkg.dependencies?.vue,
        hasSupabase: !!pkg.dependencies?.['@supabase/supabase-js'],
        hasPlaywright: !!pkg.devDependencies?.playwright,
        hasTailwind: !!pkg.devDependencies?.tailwindcss
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Git 정보 분석
   */
  async analyzeGit(projectPath) {
    try {
      const gitPath = path.join(projectPath, '.git');
      await fs.access(gitPath);

      return {
        isGitRepo: true,
        hasRemote: await this.hasGitRemote(projectPath)
      };
    } catch (error) {
      return {
        isGitRepo: false,
        hasRemote: false
      };
    }
  }

  /**
   * Git remote 확인
   */
  async hasGitRemote(projectPath) {
    try {
      const configPath = path.join(projectPath, '.git', 'config');
      const content = await fs.readFile(configPath, 'utf-8');
      return content.includes('[remote');
    } catch (error) {
      return false;
    }
  }

  /**
   * 단계별 점수 계산
   */
  async calculateStepScore(step, detectedFiles, detectedDirs, packageInfo) {
    const indicators = this.indicators[step];
    if (!indicators) return 0;

    let score = 0;
    let maxScore = 0;

    // 파일 존재 확인
    if (indicators.files) {
      maxScore += indicators.files.length * 10;
      for (const file of indicators.files) {
        if (detectedFiles.some(f => f.includes(file))) {
          score += 10;
        }
      }
    }

    // 디렉토리 존재 확인
    if (indicators.directories) {
      maxScore += indicators.directories.length * 10;
      for (const dir of indicators.directories) {
        if (detectedDirs.some(d => d.includes(dir))) {
          score += 10;
        }
      }
    }

    // 키워드 기반 파일 검색
    if (indicators.keywords) {
      maxScore += indicators.keywords.length * 5;
      for (const keyword of indicators.keywords) {
        const keywordLower = keyword.toLowerCase();
        const found = detectedFiles.some(f =>
          f.toLowerCase().includes(keywordLower)
        );
        if (found) {
          score += 5;
        }
      }
    }

    // package.json 기반 점수 (단계 5, 6, 7)
    if (packageInfo && step >= 5 && step <= 7) {
      maxScore += 20;
      if (step === 5 || step === 6) {
        if (packageInfo.hasReact || packageInfo.hasNext || packageInfo.hasVue) {
          score += 10;
        }
        if (packageInfo.hasTailwind) {
          score += 5;
        }
      }
      if (step === 5 || step === 7) {
        if (packageInfo.hasSupabase) {
          score += 5;
        }
      }
    }

    // 정규화 (0-100)
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  /**
   * 현재 단계 추론
   */
  inferCurrentStep(stepScores) {
    // 가장 높은 점수를 가진 단계 찾기
    let maxScore = 0;
    let currentStep = 1;

    for (let step = 10; step >= 1; step--) {
      const score = stepScores[step];
      if (score >= 30) { // 최소 30% 이상 완료
        // 이전 단계들이 충분히 완료되었는지 확인
        let prevCompleted = true;
        for (let prev = 1; prev < step; prev++) {
          if (stepScores[prev] < 30) {
            prevCompleted = false;
            break;
          }
        }

        if (prevCompleted && score > maxScore) {
          maxScore = score;
          currentStep = score >= 70 ? step + 1 : step;
        }
      }
    }

    // 10단계를 넘지 않도록
    return Math.min(currentStep, 10);
  }

  /**
   * 추천 사항 생성
   */
  async generateRecommendations(analysis) {
    const recommendations = [];
    const currentStep = analysis.currentStep;

    // 현재 단계 분석
    const currentScore = analysis.stepScores[currentStep];
    if (currentScore < 70) {
      recommendations.push({
        type: 'current_step',
        priority: 'high',
        step: currentStep,
        message: `현재 단계 ${currentStep}가 ${currentScore}% 완료되었습니다. 더 많은 작업이 필요합니다.`,
        missingItems: await this.findMissingItems(currentStep, analysis)
      });
    }

    // 이전 단계 체크
    for (let step = 1; step < currentStep; step++) {
      const score = analysis.stepScores[step];
      if (score < 50) {
        recommendations.push({
          type: 'previous_step',
          priority: 'medium',
          step,
          message: `단계 ${step}가 ${score}%만 완료되었습니다. 보완이 필요합니다.`,
          missingItems: await this.findMissingItems(step, analysis)
        });
      }
    }

    // Git 관련
    if (!analysis.gitInfo.isGitRepo) {
      recommendations.push({
        type: 'setup',
        priority: 'medium',
        message: 'Git 저장소가 초기화되지 않았습니다.',
        action: 'git init'
      });
    }

    // package.json 관련
    if (!analysis.packageInfo && currentStep >= 5) {
      recommendations.push({
        type: 'setup',
        priority: 'high',
        message: 'package.json이 없습니다. 프로젝트를 초기화해야 합니다.',
        action: 'npm init'
      });
    }

    // 환경변수
    if (currentStep >= 5 && !analysis.detectedFiles.some(f => f.includes('.env'))) {
      recommendations.push({
        type: 'setup',
        priority: 'high',
        message: '환경변수 파일(.env)이 없습니다.',
        action: 'npm run env'
      });
    }

    return recommendations;
  }

  /**
   * 누락된 항목 찾기
   */
  async findMissingItems(step, analysis) {
    const indicators = this.indicators[step];
    const missing = [];

    if (indicators.files) {
      for (const file of indicators.files) {
        if (!analysis.detectedFiles.some(f => f.includes(file))) {
          missing.push({ type: 'file', name: file });
        }
      }
    }

    if (indicators.directories) {
      for (const dir of indicators.directories) {
        if (!analysis.detectedDirs.some(d => d.includes(dir))) {
          missing.push({ type: 'directory', name: dir });
        }
      }
    }

    return missing;
  }

  /**
   * 분석 결과 포맷팅
   */
  formatAnalysis(analysis) {
    let output = '\n';
    output += '╔════════════════════════════════════════════════════════════════╗\n';
    output += '║  프로젝트 분석 결과\n';
    output += '╚════════════════════════════════════════════════════════════════╝\n\n';

    output += `📁 프로젝트: ${path.basename(analysis.projectPath)}\n`;
    output += `📅 분석 일시: ${new Date(analysis.analyzedAt).toLocaleString()}\n`;
    if (analysis.packageInfo) {
      output += `📦 패키지: ${analysis.packageInfo.name} v${analysis.packageInfo.version}\n`;
    }
    output += `🔧 Git 저장소: ${analysis.gitInfo.isGitRepo ? '✓' : '✗'}\n\n`;

    output += '📊 단계별 완성도:\n\n';

    for (let step = 1; step <= 10; step++) {
      const score = analysis.stepScores[step];
      const bar = this.createProgressBar(score);
      const emoji = step === analysis.currentStep ? '👉' : (score >= 70 ? '✅' : score >= 30 ? '🔄' : '⏳');
      output += `  ${emoji} 단계 ${step}: ${bar} ${score}%\n`;
    }

    output += `\n🎯 현재 단계: ${analysis.currentStep}\n`;
    output += `📈 전체 진행률: ${Math.round(Object.values(analysis.stepScores).reduce((a, b) => a + b, 0) / 10)}%\n\n`;

    if (analysis.recommendations.length > 0) {
      output += '💡 추천 사항:\n\n';
      for (const rec of analysis.recommendations) {
        const priority = rec.priority === 'high' ? '🔴' : '🟡';
        output += `  ${priority} ${rec.message}\n`;
        if (rec.action) {
          output += `     → ${rec.action}\n`;
        }
        if (rec.missingItems && rec.missingItems.length > 0) {
          output += `     누락: ${rec.missingItems.map(i => i.name).join(', ')}\n`;
        }
        output += '\n';
      }
    }

    return output;
  }

  /**
   * 프로그레스 바 생성
   */
  createProgressBar(percentage, length = 20) {
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }
}

export default ProjectAnalyzer;
