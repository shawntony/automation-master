import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import { StructureGenerator } from './structure-generator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 프로젝트 생성 유틸리티 클래스
 */
export class ProjectCreator {
  /**
   * 새 프로젝트 생성
   * @param {string} projectName - 프로젝트 이름
   * @param {string} projectType - 프로젝트 타입 (fullstack/frontend/backend/automation)
   * @param {Object} [prdOptions] - PRD 옵션
   * @param {string} [prdOptions.method] - PRD 입력 방식 ('file'|'idea'|'form'|'skip')
   * @param {string} [prdOptions.filePath] - PRD 파일 경로
   * @param {string} [prdOptions.fileContent] - PRD 파일 내용
   * @param {string} [prdOptions.idea] - 아이디어 텍스트
   * @param {Object} [prdOptions.formData] - PRD 폼 데이터
   * @returns {Promise<{success: boolean, projectPath: string, message: string, prdPath?: string}>}
   */
  async createProject(projectName, projectType = 'fullstack', prdOptions = null) {
    try {
      // 1. 프로젝트 경로 설정
      const projectPath = path.join('C:', 'Users', 'gram', 'myautomation', projectName)

      // 2. 폴더가 이미 존재하는지 확인
      try {
        await fs.access(projectPath)
        return {
          success: false,
          projectPath,
          message: `프로젝트 폴더가 이미 존재합니다: ${projectPath}`
        }
      } catch {
        // 폴더가 없으면 계속 진행
      }

      // 3. 프로젝트 폴더 구조 생성
      await this.createFolderStructure(projectPath)

      // 4. 가이드 문서 복사
      await this.copyGuideDocs(projectPath)

      // 5. .claude/commands/create-prd.md 복사
      await this.copyClaudeCommands(projectPath)

      // 6. 에이전트 가이드 생성
      await this.generateAgentsGuide(projectPath)

      // 7. 프로젝트 워크플로우 가이드 생성
      await this.generateProjectWorkflow(projectPath, projectType)

      // 8. README.md 생성
      await this.generateReadme(projectPath, projectName, projectType)

      // 9. .gitignore 생성
      await this.generateGitignore(projectPath)

      // 10. PRD 생성 (옵션)
      let prdPath = null
      let prdContent = null
      if (prdOptions && prdOptions.method !== 'skip') {
        const result = await this.handlePrd(projectPath, projectName, projectType, prdOptions)
        prdPath = result.prdPath
        prdContent = result.prdContent
      }

      // 11. 구조 자동 생성 (PRD가 있을 경우)
      let structureResult = null
      if (prdContent) {
        const generator = new StructureGenerator()
        structureResult = await generator.generateStructure(projectPath, prdContent, projectType)
      }

      // 12. config/progress.json 초기화
      await this.initializeProgress(projectPath, projectName, prdPath !== null)

      return {
        success: true,
        projectPath,
        prdPath,
        structurePath: structureResult?.structurePath,
        filesCreated: structureResult?.filesCreated?.length || 0,
        message: '프로젝트가 성공적으로 생성되었습니다!'
      }
    } catch (error) {
      console.error('프로젝트 생성 실패:', error)
      return {
        success: false,
        projectPath: '',
        message: `프로젝트 생성 중 오류 발생: ${error.message}`
      }
    }
  }

  /**
   * 폴더 구조 생성
   */
  async createFolderStructure(projectPath) {
    const folders = [
      'project-guide',
      '.claude/commands',
      'config',
      'docs' // PRD 저장용
    ]

    for (const folder of folders) {
      await fs.mkdir(path.join(projectPath, folder), { recursive: true })
    }
  }

  /**
   * 가이드 문서 복사
   */
  async copyGuideDocs(projectPath) {
    const automationmasterPath = path.join(__dirname, '..', '..')
    const guideDocs = [
      'planning.md',
      'PROJECT_SUMMARY.md',
      'WEB_APP_GUIDE.md',
      'WEB_CLI_INTEGRATION.md',
      'WORKFLOW_GUIDE.md'
    ]

    for (const doc of guideDocs) {
      const sourcePath = path.join(automationmasterPath, doc)
      const destPath = path.join(projectPath, 'project-guide', doc)

      try {
        await fs.copyFile(sourcePath, destPath)
      } catch (error) {
        console.warn(`${doc} 복사 실패:`, error.message)
      }
    }
  }

  /**
   * .claude/commands 복사
   */
  async copyClaudeCommands(projectPath) {
    const automationmasterPath = path.join(__dirname, '..', '..')
    const sourcePath = path.join(automationmasterPath, '.claude', 'commands', 'create-prd.md')
    const destPath = path.join(projectPath, '.claude', 'commands', 'create-prd.md')

    try {
      await fs.copyFile(sourcePath, destPath)
    } catch (error) {
      console.warn('create-prd.md 복사 실패:', error.message)
    }
  }

  /**
   * 에이전트 가이드 생성
   */
  async generateAgentsGuide(projectPath) {
    const content = `# 🤖 에이전트 활용 가이드

SuperClaude 프레임워크에서 제공하는 전문 에이전트들을 활용하여 프로젝트를 효율적으로 진행하세요.

## 사용 가능한 에이전트

### 1. task-decomposition-expert
**역할**: 복잡한 목표를 관리 가능한 세부 작업으로 분해

**사용 시점**:
- 프로젝트 초기 계획 수립
- 대규모 기능 구현 전 작업 분해
- 워크플로우 아키텍처 설계

**활용 예시**:
\`\`\`
planning.md의 10단계를 구체적인 실행 가능한 작업으로 분해하여
각 단계별 소요 시간, 의존성, 우선순위를 파악하고 싶어.

task-decomposition-expert를 사용해서 분석해줘.
\`\`\`

**주요 기능**:
- ChromaDB 통합 우선순위 (문서 저장/검색)
- 워크플로우 최적화
- 도구 및 에이전트 조합 추천

---

### 2. project-supervisor-orchestrator
**역할**: 복잡한 multi-step 워크플로우를 조율하는 프로젝트 관리자

**사용 시점**:
- 여러 에이전트를 동시에 활용하는 복잡한 작업
- 순차적 에이전트 실행이 필요한 경우
- 페이로드 검증 및 라우팅이 필요한 워크플로우

**활용 예시**:
\`\`\`
프론트엔드, 백엔드, 테스팅을 동시에 진행하고 싶어.
각 작업을 담당할 에이전트를 배정하고,
작업 간 의존성을 관리하며 전체 워크플로우를 조율해줘.

project-supervisor-orchestrator를 사용해서 진행해줘.
\`\`\`

**주요 기능**:
- Intent Detection (완전한 데이터 vs 추가 정보 필요)
- 에이전트 순차 실행 및 결과 통합
- 유효성 검증 및 에러 처리

---

### 3. supabase-schema-architect
**역할**: Supabase 데이터베이스 스키마 설계 및 최적화 전문가

**사용 시점**:
- 데이터베이스 설계 단계 (planning.md 3단계)
- 마이그레이션 계획 수립
- RLS (Row Level Security) 정책 구현
- 백엔드 개발 단계 (planning.md 7단계)

**활용 예시**:
\`\`\`
사용자, 프로젝트, 작업을 관리하는 데이터베이스를 설계하고 싶어.
RLS 정책도 함께 설정하고, 마이그레이션 스크립트를 생성해줘.

supabase-schema-architect를 사용해서 진행해줘.
\`\`\`

**주요 기능**:
- 정규화된 스키마 설계
- 마이그레이션 전략 수립 (안전한 rollback 포함)
- RLS 정책 아키텍처
- 인덱스 및 성능 최적화

---

## 에이전트 활용 워크플로우

### Phase 1: 계획 수립
\`\`\`
1. task-decomposition-expert로 전체 프로젝트 분해
   → 10단계를 세부 작업으로 변환

2. project-supervisor-orchestrator로 워크플로우 설계
   → 작업 간 의존성 파악 및 병렬화 가능한 작업 식별
\`\`\`

### Phase 2: 데이터베이스 설계
\`\`\`
3. supabase-schema-architect로 DB 스키마 설계
   → ERD, 마이그레이션, RLS 정책 생성
\`\`\`

### Phase 3: 개발 실행
\`\`\`
4. project-supervisor-orchestrator로 병렬 개발 조율
   → Frontend Agent, Backend Agent, Testing Agent 동시 실행
\`\`\`

## 에이전트 조합 패턴

### 패턴 1: 초기 설계
\`\`\`
task-decomposition-expert
  ↓
supabase-schema-architect
  ↓
project-supervisor-orchestrator
\`\`\`

### 패턴 2: 복잡한 기능 구현
\`\`\`
task-decomposition-expert (작업 분해)
  ↓
project-supervisor-orchestrator (병렬 실행 조율)
  ├─ Frontend Agent
  ├─ Backend Agent
  └─ Testing Agent
\`\`\`

### 패턴 3: 데이터베이스 중심 개발
\`\`\`
supabase-schema-architect (스키마 설계)
  ↓
project-supervisor-orchestrator (프론트/백엔드 통합)
\`\`\`

## 팁과 모범 사례

### ✅ 좋은 패턴
1. **명확한 목표 제시**: 에이전트에게 구체적인 목표와 제약사항을 제공
2. **순차적 진행**: 계획 → 설계 → 구현 순서로 에이전트 활용
3. **결과 검증**: 각 에이전트 작업 후 결과를 확인하고 다음 단계로 진행
4. **문서화**: 에이전트가 생성한 결과를 프로젝트 문서로 저장

### ⚠️ 피해야 할 패턴
1. **모호한 요청**: "프로젝트 만들어줘" 대신 "사용자 인증 기능이 있는 태스크 관리 앱을 만들고 싶어"
2. **에이전트 중복 사용**: 같은 작업을 여러 에이전트에게 반복 요청
3. **결과 무시**: 에이전트 추천을 무시하고 진행
4. **순서 무시**: 설계 없이 바로 구현 단계로 진행

## 참고 문서

- \`project-guide/planning.md\` - 10단계 개발 가이드
- \`project-guide/WORKFLOW_GUIDE.md\` - 워크플로우 상세 가이드
- \`project-workflow.md\` - 이 프로젝트의 워크플로우

---

**에이전트를 효과적으로 활용하여 프로젝트를 성공적으로 완성하세요! 🚀**
`

    await fs.writeFile(path.join(projectPath, 'agents-guide.md'), content, 'utf-8')
  }

  /**
   * 프로젝트 워크플로우 가이드 생성
   */
  async generateProjectWorkflow(projectPath, projectType) {
    const workflowByType = {
      fullstack: `
## Fullstack 프로젝트 워크플로우

### 1단계: 요구사항 정의
- PRD 작성 또는 업로드
- \`.claude/commands/create-prd.md\` 활용

### 2단계: 아키텍처 설계
- task-decomposition-expert로 전체 작업 분해
- supabase-schema-architect로 DB 스키마 설계

### 3단계: 개발 환경 설정
- planning.md 5단계 참조
- 프론트엔드/백엔드 프레임워크 선택

### 4단계: 병렬 개발
- project-supervisor-orchestrator로 조율
  - Frontend: UI/UX 개발
  - Backend: API + Supabase 연동
  - Testing: E2E 테스트

### 5단계: 통합 및 배포
- Vercel 배포
- Supabase 프로덕션 설정
`,
      frontend: `
## Frontend 프로젝트 워크플로우

### 1단계: 디자인 시스템
- planning.md 4단계 참조
- UI/UX 설계 및 컴포넌트 라이브러리

### 2단계: 개발
- React/Next.js/Vue 선택
- 컴포넌트 개발

### 3단계: 배포
- Vercel 배포
`,
      backend: `
## Backend 프로젝트 워크플로우

### 1단계: API 설계
- supabase-schema-architect로 DB 설계
- API 엔드포인트 정의

### 2단계: 개발
- Supabase Functions
- RLS 정책 구현

### 3단계: 배포
- Supabase 프로덕션 배포
`,
      automation: `
## Automation 프로젝트 워크플로우

### 1단계: 자동화 목표 정의
- 어떤 작업을 자동화할지 명확히

### 2단계: 스크립트 개발
- Node.js/Python 선택
- 단계별 스크립트 작성

### 3단계: 스케줄링
- Cron jobs 설정
- 모니터링
`
    }

    const content = `# 📋 프로젝트 워크플로우 가이드

이 문서는 **${projectType}** 타입 프로젝트의 진행 워크플로우를 안내합니다.

## 전체 프로세스 개요

\`\`\`
PRD 작성
   ↓
계획 수립 (planning.md 참조)
   ↓
에이전트 활용 (agents-guide.md 참조)
   ↓
단계별 개발 (WORKFLOW_GUIDE.md 참조)
   ↓
배포 및 운영
\`\`\`

${workflowByType[projectType]}

## 주요 참고 문서

### 프로젝트 가이드 폴더 (project-guide/)
- **planning.md**: 10단계 전체 개발 프로세스
- **PROJECT_SUMMARY.md**: 프로젝트 구조 및 컴포넌트
- **WEB_APP_GUIDE.md**: 웹 애플리케이션 개발 가이드
- **WEB_CLI_INTEGRATION.md**: CLI-웹 통합 방법
- **WORKFLOW_GUIDE.md**: 대화형 워크플로우 상세 가이드

### 루트 폴더
- **agents-guide.md**: 에이전트 활용 방법
- **README.md**: 프로젝트 개요
- **.claude/commands/create-prd.md**: PRD 생성 명령어

## 시작하기

1. **PRD 작성**
   \`\`\`
   .claude/commands/create-prd.md 참조
   또는 기존 PRD 문서 업로드
   \`\`\`

2. **계획 수립**
   \`\`\`
   project-guide/planning.md의 10단계 검토
   task-decomposition-expert로 세부 작업 분해
   \`\`\`

3. **개발 시작**
   \`\`\`
   project-guide/WORKFLOW_GUIDE.md 따라 진행
   agents-guide.md에서 적절한 에이전트 활용
   \`\`\`

4. **진행상황 추적**
   \`\`\`
   config/progress.json으로 진행률 추적
   \`\`\`

---

**프로젝트를 성공적으로 완성하세요! 🎉**
`

    await fs.writeFile(path.join(projectPath, 'project-workflow.md'), content, 'utf-8')
  }

  /**
   * README.md 생성
   */
  async generateReadme(projectPath, projectName, projectType) {
    const content = `# ${projectName}

**프로젝트 타입**: ${projectType}

## 📋 프로젝트 개요

이 프로젝트는 Automation Master를 사용하여 생성되었습니다.

## 🚀 시작하기

### 1. PRD 작성
\`\`\`bash
# .claude/commands/create-prd.md 참조
# 또는 기존 PRD 문서를 프로젝트 폴더에 추가
\`\`\`

### 2. 개발 가이드 확인
- \`project-guide/planning.md\` - 10단계 개발 프로세스
- \`agents-guide.md\` - 에이전트 활용법
- \`project-workflow.md\` - 프로젝트 워크플로우

### 3. 진행상황 추적
- \`config/progress.json\` - 자동 생성되는 진행상황 파일

## 📚 문서

### project-guide/
- **planning.md**: 업무 자동화 툴 개발 완벽 가이드 (10단계)
- **PROJECT_SUMMARY.md**: Automation Master 프로젝트 요약
- **WEB_APP_GUIDE.md**: 웹 애플리케이션 가이드
- **WEB_CLI_INTEGRATION.md**: CLI-웹 통합 가이드
- **WORKFLOW_GUIDE.md**: 대화형 워크플로우 가이드

### 루트 폴더
- **agents-guide.md**: SuperClaude 에이전트 활용 가이드
- **project-workflow.md**: 이 프로젝트의 워크플로우 가이드

## 🤖 사용 가능한 에이전트

- **task-decomposition-expert**: 복잡한 작업을 세부 단계로 분해
- **project-supervisor-orchestrator**: 다중 에이전트 워크플로우 조율
- **supabase-schema-architect**: Supabase DB 스키마 설계 및 마이그레이션

자세한 내용은 \`agents-guide.md\`를 참조하세요.

## 📝 다음 단계

1. PRD 작성 또는 업로드
2. \`project-guide/planning.md\` 검토
3. 에이전트를 활용하여 개발 시작
4. \`project-workflow.md\` 따라 진행

---

**생성일**: ${new Date().toISOString().split('T')[0]}
**Automation Master 버전**: 1.0.0
`

    await fs.writeFile(path.join(projectPath, 'README.md'), content, 'utf-8')
  }

  /**
   * .gitignore 생성
   */
  async generateGitignore(projectPath) {
    const content = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist
/.next
/out

# Misc
.DS_Store
*.pem
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# Config (프로젝트별 설정 파일은 커밋하지 않음)
config/env-config.json

# 임시 파일
*.tmp
.temp/
`

    await fs.writeFile(path.join(projectPath, '.gitignore'), content, 'utf-8')
  }

  /**
   * config/progress.json 초기화
   */
  async initializeProgress(projectPath, projectName, hasPrd = false) {
    const progress = {
      projectName,
      createdAt: new Date().toISOString(),
      currentStep: hasPrd ? 2 : 1, // PRD가 있으면 2단계부터 시작
      steps: Array.from({ length: 10 }, (_, i) => ({
        stepId: i + 1,
        status: i === 0 && hasPrd ? 'completed' : 'pending', // PRD 있으면 1단계 완료
        checklist: []
      })),
      prd: hasPrd ? {
        path: 'docs/PRD.md',
        createdAt: new Date().toISOString()
      } : null
    }

    await fs.writeFile(
      path.join(projectPath, 'config', 'progress.json'),
      JSON.stringify(progress, null, 2),
      'utf-8'
    )
  }

  /**
   * PRD 처리 및 저장
   */
  async handlePrd(projectPath, projectName, projectType, prdOptions) {
    try {
      const { PrdProcessor } = await import('./prd-processor.js')
      const processor = new PrdProcessor()

      // PRD 처리
      const result = await processor.processPrd({
        ...prdOptions,
        projectName,
        projectType
      })

      if (!result.content) {
        console.warn('PRD 내용이 비어있습니다')
        return { prdPath: null, prdContent: null }
      }

      // PRD 저장
      const prdPath = await processor.savePrd(projectPath, result.content)
      console.log(chalk.green(`✓ PRD 저장 완료: ${prdPath}`))

      return { prdPath, prdContent: result.content }
    } catch (error) {
      console.error(chalk.red(`PRD 처리 실패: ${error.message}`))
      // PRD 실패해도 프로젝트 생성은 계속 진행
      return { prdPath: null, prdContent: null }
    }
  }
}
