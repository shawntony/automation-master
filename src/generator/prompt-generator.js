/**
 * 프롬프트 생성기
 * 단계별 정보를 받아서 실행 가능한 Claude 프롬프트를 생성
 */

import steps from '../guide/steps.js';

class PromptGenerator {
  constructor() {
    this.templates = this.getPromptTemplates();
  }

  /**
   * 단계별 프롬프트 템플릿
   */
  getPromptTemplates() {
    return {
      1: this.getStep1Template(),
      2: this.getStep2Template(),
      3: this.getStep3Template(),
      4: this.getStep4Template(),
      5: this.getStep5Template(),
      6: this.getStep6Template(),
      7: this.getStep7Template(),
      8: this.getStep8Template(),
      9: this.getStep9Template(),
      10: this.getStep10Template()
    };
  }

  /**
   * 프롬프트 생성
   */
  async generatePrompt(stepId, userInfo = {}) {
    const step = steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`단계 ${stepId}를 찾을 수 없습니다.`);
    }

    const template = this.templates[stepId];
    if (!template) {
      throw new Error(`단계 ${stepId}의 템플릿이 없습니다.`);
    }

    // 사용자 정보로 템플릿 채우기
    const prompt = template(userInfo);

    return {
      stepId,
      stepTitle: step.title,
      prompt,
      mcpServers: step.mcpServers,
      expectedOutputs: step.outputs,
      estimatedTime: step.duration
    };
  }

  /**
   * 단계 1: 아이디어 발굴 및 정의
   */
  getStep1Template() {
    return (info) => `# 단계 1: 아이디어 발굴 및 정의

## 프로젝트 정보
- 프로젝트명: ${info.projectName || '[프로젝트명을 입력하세요]'}
- 해결하려는 문제: ${info.problem || '[문제를 설명하세요]'}
- 목표 사용자: ${info.targetUsers || '[사용자를 정의하세요]'}

## MCP 활용 작업

### 1. Task Master로 프로젝트 등록

\`\`\`
@task-master를 사용해서 새 프로젝트를 시작하고 싶어.

프로젝트명: ${info.projectName || '[프로젝트명]'}
목적: ${info.problem || '[문제 해결 목적]'}

전체 10단계를 task로 등록하고:
- 각 단계의 예상 소요 시간
- 의존성 관계
- 우선순위

task-master로 프로젝트 보드를 만들어줘
\`\`\`

### 2. 웹 검색으로 경쟁 솔루션 조사

\`\`\`
@web-search를 사용해서 다음 주제로 유사 솔루션을 조사해줘:

주제: ${info.problem || '[문제 설명]'}

조사 항목:
- 유사 제품/서비스 3-5개
- 각 제품의 주요 기능
- 가격 정책
- 사용자 리뷰
- 차별화 포인트

결과를 competitive-analysis.md로 작성해줘
\`\`\`

### 3. Sub Agent로 병렬 분석

\`\`\`
sub-agent를 생성해서 다음 작업들을 병렬로 수행해줘:

Agent 1: 경쟁사 분석
- 웹 검색으로 유사 툴 3-5개 찾기
- 각 툴의 장단점 분석
- competitive-analysis.md 작성

Agent 2: 사용자 니즈 분석
- 타겟 사용자: ${info.targetUsers || '[사용자 그룹]'}
- 사용자 페르소나 정의
- 사용자 여정 맵 작성
- user-needs.md 작성

Agent 3: 기술 가능성 검토
- ${info.techStack || '웹/모바일'} 기술로 구현 가능한지 조사
- 필요한 API/라이브러리 조사
- 기술적 제약사항 파악
- tech-feasibility.md 작성

모두 완료되면 결과를 통합해서 idea-definition.md 작성해줘
\`\`\`

### 4. 메모리에 핵심 정보 저장

\`\`\`
@memory에 다음 정보를 저장해서 전체 프로젝트에서 참조할 수 있게 해줘:

프로젝트명: ${info.projectName || '[프로젝트명]'}
문제 정의: ${info.problem || '[문제]'}
목표 사용자: ${info.targetUsers || '[사용자]'}
기대 효과: ${info.expectedOutcome || '[효과]'}
차별화 포인트: ${info.uniqueValue || '[차별점]'}
\`\`\`

## 예상 산출물
- idea-definition.md
- competitive-analysis.md
- user-needs.md
- tech-feasibility.md

## 다음 단계
모든 산출물이 완성되면 "단계 1 완료" 처리하고 단계 2로 진행하세요.
`;
  }

  /**
   * 단계 2: PDR 작성
   */
  getStep2Template() {
    return (info) => `# 단계 2: PDR (Preliminary Design Review) 작성

## 프로젝트 정보
- 프로젝트명: ${info.projectName || '[프로젝트명]'}
- 주요 기능: ${info.coreFeatures || '[핵심 기능들]'}

## MCP 활용 작업

### 1. Task Master로 PDR 작업 추적

\`\`\`
@task-master에서 'PDR 작성' 작업을 시작으로 표시하고
세부 작업들을 추가해줘:
- 요구사항 수집 (2일)
- 아키텍처 설계 (1일)
- 기술 스택 조사 (1일)
- 위험 분석 (1일)
\`\`\`

### 2. Sub Agent로 병렬 PDR 작성

\`\`\`
sub-agent를 사용해서 PDR을 병렬로 작성해줘:

Agent 1 (Requirements Agent):
- idea-definition.md 읽기
- 기능적 요구사항 10개 도출
  핵심 기능: ${info.coreFeatures || '[기능들]'}
- 비기능적 요구사항 5개 도출
  성능, 보안, 확장성 등
- requirements.md 작성

Agent 2 (Architecture Agent):
- 시스템 아키텍처 다이어그램 (Mermaid)
  ${info.architecture || '프론트엔드 ← → 백엔드 ← → Supabase'}
- 데이터 흐름도 작성
- 컴포넌트 간 통신 정의
- architecture.md 작성

Agent 3 (Tech Research Agent):
- @web-search로 최신 기술 스택 조사
- React vs Next.js vs Vue 비교
- Node.js vs Deno vs Bun 비교
- PostgreSQL (Supabase) 장단점
- tech-options.md 작성

Agent 4 (Risk Analysis Agent):
- 기술적 위험 식별
  ${info.technicalRisks || '새로운 기술 사용, 성능 이슈'}
- 일정 위험 분석
- 대응 방안 수립
- risk-analysis.md 작성

모든 에이전트 작업 완료 후:
- 결과 통합
- pdr.md로 종합 문서 생성
- @task-master에서 PDR 작업 완료 표시
- @memory에 핵심 결정사항 저장
\`\`\`

### 3. Supabase 연동 검토

\`\`\`
@supabase를 사용해서 데이터베이스 옵션을 확인해줘:
- 사용 가능한 Postgres 버전
- 예상 테이블 수: ${info.tableCount || '5-10'}개
- 예상 Row 수: ${info.estimatedRows || '수천~수만'}개
- 필요한 인덱스
- 비용 추정

결과를 supabase-planning.md에 작성해줘
\`\`\`

## 예상 산출물
- pdr.md
- requirements.md
- architecture.md
- tech-options.md
- risk-analysis.md
- supabase-planning.md

## 다음 단계
PDR 검토 후 단계 3으로 진행하세요.
`;
  }

  /**
   * 단계 3: 시스템 기획서 작성
   */
  getStep3Template() {
    return (info) => `# 단계 3: 시스템 기획서 작성

## 프로젝트 정보
- 프로젝트명: ${info.projectName || '[프로젝트명]'}
- 주요 기능: ${info.coreFeatures || '[핵심 기능들]'}
- 테이블 수: ${info.tables || '[테이블 목록]'}

## MCP 활용 작업

### 1. Supabase로 실제 데이터베이스 스키마 생성

\`\`\`
@supabase를 연결해서 데이터베이스 스키마를 직접 생성하고 싶어.

단계:
1. @supabase에 프로젝트 연결
2. 다음 테이블 생성:

${info.schemaSQL || `-- Users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [추가 테이블들...]`}

3. Row Level Security (RLS) 정책 설정
   - 사용자는 자신의 데이터만 접근
   - 관리자는 모든 데이터 접근
4. 인덱스 생성
5. 초기 시드 데이터 삽입
6. @memory에 DB 스키마 정보 저장

완료 후 supabase-schema.sql 파일로도 백업해줘
\`\`\`

### 2. Sub Agent로 시스템 기획서 병렬 작성

\`\`\`
sub-agent를 사용해서 시스템 기획서를 작성해줘:

Agent 1 (Scenario Writer):
- user-needs.md 기반 사용자 시나리오 작성
- 최소 10개 주요 시나리오
  ${info.scenarios || '예: 사용자 등록, 로그인, 데이터 조회, 수정, 삭제...'}
- 각 시나리오별 상세 단계
- user-scenarios.md 생성

Agent 2 (Screen Designer):
- 각 시나리오에 필요한 화면 정의
  ${info.screens || '예: 로그인, 대시보드, 목록, 상세, 설정...'}
- 화면별 UI 요소 나열
- 화면 간 네비게이션 정의
- screen-specs.md 생성

Agent 3 (API Architect):
- 필요한 모든 API 엔드포인트 설계
- RESTful 규칙 준수
- Request/Response 스키마
  ${info.apiEndpoints || 'GET /api/items, POST /api/items, PUT /api/items/:id, DELETE /api/items/:id'}
- OpenAPI 3.0 형식
- api-spec.yaml 생성

Agent 4 (Database Designer):
- ERD 다이어그램 (Mermaid)
- 테이블 관계 정의
- 인덱스 전략
- @supabase로 실제 스키마 검증
- database-design.md 생성

모든 에이전트 작업 완료 후 system-design.md로 통합해줘
\`\`\`

## 예상 산출물
- system-design.md
- user-scenarios.md
- screen-specs.md
- api-spec.yaml
- database-design.md
- supabase-schema.sql

## 다음 단계
시스템 기획서 검토 후 단계 4로 진행하세요.
`;
  }

  /**
   * 단계 4: UI/UX 설계
   */
  getStep4Template() {
    return (info) => `# 단계 4: UI/UX 설계 + Playwright 벤치마킹

## 프로젝트 정보
- 프로젝트명: ${info.projectName || '[프로젝트명]'}
- 벤치마킹 사이트: ${info.benchmarkSites || 'linear.app, notion.so, vercel.com'}
- 디자인 스타일: ${info.designStyle || '모던, 미니멀'}

## MCP 활용 작업

### 1. Playwright로 벤치마킹 사이트 분석

\`\`\`
@playwright를 사용해서 벤치마킹을 진행하고 싶어.

벤치마킹 대상 사이트:
${info.benchmarkSites ? info.benchmarkSites.split(',').map((site, i) => `${i + 1}. ${site.trim()}`).join('\n') : '1. https://linear.app\n2. https://notion.so\n3. https://vercel.com'}

각 사이트에서 추출할 정보:
1. 색상 팔레트 (CSS variables)
2. 타이포그래피 (폰트, 크기, 굵기)
3. 간격 시스템 (padding, margin patterns)
4. 버튼 스타일 (variants, states)
5. 카드 컴포넌트 스타일
6. 입력 필드 스타일
7. 네비게이션 패턴
8. 레이아웃 구조

@playwright 스크립트:
- 각 사이트 방문
- 주요 컴포넌트 스크린샷
- CSS 스타일 추출
- 레이아웃 구조 파악

결과를 design-benchmark.md에 정리해줘
\`\`\`

### 2. Sub Agent로 디자인 시스템 구축

\`\`\`
sub-agent를 사용해서 디자인 시스템을 만들어줘:

Agent 1 (Color System Designer):
- 벤치마킹 결과 분석
- Primary 색상: ${info.primaryColor || '#3B82F6 (blue)'}
- Secondary 색상: ${info.secondaryColor || '#8B5CF6 (purple)'}
- Success/Error/Warning 색상
- 중립 색상 팔레트 (gray scale)
- 다크모드 색상
- colors.ts 생성 (Tailwind config)

Agent 2 (Typography Designer):
- 폰트 선정: ${info.fontFamily || 'Inter, system-ui'}
- 크기 스케일 정의 (12px ~ 72px)
- 굵기 시스템 (light, regular, medium, bold)
- 행간 정의
- typography.ts 생성

Agent 3 (Spacing Designer):
- 간격 시스템 (4px 기반)
- spacing scale: 0, 1, 2, 4, 6, 8, 12, 16, 24, 32, 48, 64
- spacing.ts 생성

Agent 4 (Component Template Creator):
- 벤치마킹 기반 컴포넌트 템플릿 생성
- Button 템플릿 (primary, secondary, danger, ghost)
- Input 템플릿 (text, email, password, search)
- Card 템플릿
- Modal 템플릿
- Alert 템플릿
- components/templates/ 폴더에 생성

모든 에이전트 작업 완료 후:
- design-system.md 통합 문서 생성
- Tailwind config 파일 생성
- Storybook 설정
- @memory에 디자인 토큰 저장
\`\`\`

## 예상 산출물
- design-benchmark.md
- design-system.md
- 공통 컴포넌트 템플릿 라이브러리
- Tailwind config 파일
- Storybook 설정

## 다음 단계
디자인 시스템 완성 후 단계 5로 진행하세요.
`;
  }

  /**
   * 단계 5: 기술 스택 선정
   */
  getStep5Template() {
    return (info) => `# 단계 5: 기술 스택 선정

## 프로젝트 정보
- 프로젝트명: ${info.projectName || '[프로젝트명]'}
- 선호 기술: ${info.preferredTech || 'React, TypeScript, Tailwind, Supabase'}

## MCP 활용 작업

### 1. 기술 스택 조사 및 비교

\`\`\`
@web-search를 사용해서 2025년 최신 기술 스택을 조사해줘:

조사 항목:
1. 프론트엔드: ${info.frontendOptions || 'React vs Next.js vs Vue'}
2. 백엔드: ${info.backendOptions || 'Node.js vs Deno vs Bun'}
3. 데이터베이스: Supabase (PostgreSQL)
4. 배포: ${info.deploymentOptions || 'Vercel vs Netlify vs Railway'}

각 기술별:
- 인기도 (GitHub stars, npm downloads)
- 학습 곡선
- 성능 벤치마크
- 커뮤니티 크기
- 비용
- 우리 프로젝트 적합성

결과를 tech-comparison-2025.md에 정리해줘
\`\`\`

### 2. 프로젝트 완전 자동 초기화

\`\`\`
선택된 기술 스택으로 프로젝트를 완전 자동으로 초기화해줘:

프론트엔드 설정:
1. ${info.frontend || 'React + Vite + TypeScript'} 프로젝트 생성
2. 우리가 만든 컴포넌트 템플릿 라이브러리 통합
3. Tailwind CSS + 우리 디자인 시스템 설정
4. 필수 라이브러리 설치:
   - react-router-dom
   - axios
   - react-hook-form
   - zod
   - @tanstack/react-query
   - @supabase/supabase-js
5. 폴더 구조 생성
6. ESLint + Prettier 설정
7. Git 초기화 및 첫 커밋

백엔드 설정:
1. @supabase MCP로 데이터베이스 연결 설정
2. 환경 변수 템플릿
3. API 라우터 스켈레톤 생성

완료 후:
- setup-complete.md에 전체 구조 문서화
- README.md에 실행 방법 작성
- @memory에 프로젝트 설정 저장
- @github를 사용해서 저장소 생성하고 초기 커밋
\`\`\`

### 3. Vercel 프로젝트 연결

\`\`\`
@vercel을 사용해서 배포 설정을 완료해줘:

1. Vercel 프로젝트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정 (Supabase URL, API keys 등)
4. 빌드 설정 최적화
5. 프리뷰 배포 설정
6. 프로덕션 도메인 설정

완료 후 vercel-setup.md에 정보 기록해줘
\`\`\`

## 예상 산출물
- tech-comparison-2025.md
- 초기화된 프로젝트
- setup-complete.md
- vercel-setup.md

## 다음 단계
프로젝트 초기화 완료 후 단계 6으로 진행하세요.
`;
  }

  // 나머지 단계들도 유사하게 구현...
  getStep6Template() {
    return (info) => `# 단계 6: 프론트엔드 개발

## 프로젝트 정보
- 프로젝트명: ${info.projectName || '[프로젝트명]'}
- 주요 페이지: ${info.mainPages || '로그인, 대시보드, 목록, 상세'}

## MCP 활용 작업

### Sub Agent로 병렬 프론트엔드 개발

\`\`\`
sub-agent를 사용해서 프론트엔드를 병렬로 개발해줘:

Agent 1 (Layout Builder):
- 우리의 컴포넌트 템플릿 활용
- MainLayout.tsx, AuthLayout.tsx, DashboardLayout.tsx
- 반응형 디자인
- @playwright로 벤치마킹한 패턴 적용

Agent 2 (Auth Pages Builder):
- Login.tsx, Register.tsx, ForgotPassword.tsx
- React Hook Form + Zod 검증
- Supabase Auth 연동

Agent 3 (Feature Pages Builder):
- 주요 페이지: ${info.mainPages || '대시보드, 목록, 상세'}
- Mock 데이터 사용

Agent 4 (State & API Integration):
- React Query 설정
- @supabase 클라이언트 설정
- API 함수 작성

모든 에이전트 완료 후:
- npm run dev로 개발 서버 실행
- @playwright로 자동 테스트
- @vercel로 프리뷰 배포
\`\`\`

## 예상 산출물
- 작동하는 프론트엔드 애플리케이션
- Vercel 프리뷰 URL

## 다음 단계
프론트엔드 완성 후 단계 7로 진행하세요.
`;
  }

  getStep7Template() {
    return (info) => `# 단계 7: 백엔드 개발 + Supabase 연동

## Supabase 완전 설정

\`\`\`
@supabase를 사용해서 백엔드를 완전히 설정하고 싶어:

Phase 1: 데이터베이스 최종화
- RLS 정책 설정
- Functions 생성
- Triggers 설정

Phase 2: Authentication 설정
- Email/Password 인증
- OAuth (Google, GitHub)

Phase 3: Real-time 설정
- 실시간 구독 활성화

Phase 4: Edge Functions
- 비즈니스 로직 구현

결과를 supabase-complete-setup.md에 문서화해줘
\`\`\`

## 다음 단계
백엔드 완성 후 단계 8로 진행하세요.
`;
  }

  getStep8Template() {
    return (info) => `# 단계 8: 테스트 시나리오 및 테스팅

## Playwright 전체 테스트 스위트 생성

\`\`\`
@playwright를 사용해서 완전한 테스트 스위트를 만들어줘:

Test Suite 1: E2E 사용자 플로우
- user-scenarios.md의 모든 시나리오

Test Suite 2: 컴포넌트 인터랙션
- 모든 버튼, 입력, 폼 테스트

Test Suite 3: API 통합
- @supabase 연동 확인

Test Suite 4: 크로스 브라우저
- Chromium, Firefox, WebKit

Test Suite 5: 성능 테스트
- Lighthouse 점수

Test Suite 6: 접근성 테스트
- WCAG 2.1 AA 준수

전체 테스트 실행 후 test-report.html 생성해줘
\`\`\`

## 다음 단계
모든 테스트 통과 후 단계 9로 진행하세요.
`;
  }

  getStep9Template() {
    return (info) => `# 단계 9: 배포 준비

## Vercel 완전 자동 배포 설정

\`\`\`
@vercel을 사용해서 완전 자동 배포를 설정하고 싶어:

Phase 1: 환경 설정
- 개발/스테이징/프로덕션 환경 구성
- 환경 변수 설정

Phase 2: 빌드 최적화
- 번들 크기 분석
- Lighthouse 점수 90+ 목표

Phase 3: CI/CD 파이프라인
- GitHub Actions 워크플로우

Phase 4: 모니터링 설정
- Vercel Analytics
- 에러 트래킹

완료 후 vercel-deployment-complete.md에 문서화해줘
\`\`\`

## 다음 단계
배포 준비 완료 후 단계 10으로 진행하세요.
`;
  }

  getStep10Template() {
    return (info) => `# 단계 10: 배포 및 운영

## 운영 자동화 시스템 구축

\`\`\`
모든 MCP를 활용해서 운영을 완전 자동화하고 싶어:

Daily Tasks (매일):
- @playwright로 헬스체크
- @supabase 백업 검증
- @vercel 분석 리포트

Weekly Tasks (매주):
- @playwright 전체 회귀 테스트
- 보안 스캔
- 성능 분석

Monthly Tasks (매월):
- 의존성 업데이트
- 비용 분석

operations/ 폴더에 스크립트 생성하고 Cron 설정해줘
\`\`\`

## 축하합니다!
프로젝트가 완성되었습니다! 🎉
`;
  }

  /**
   * 프롬프트 포맷팅
   */
  formatPrompt(promptData) {
    let output = '\n';
    output += '╔════════════════════════════════════════════════════════════════╗\n';
    output += `║  ${promptData.stepTitle}\n`;
    output += '╚════════════════════════════════════════════════════════════════╝\n\n';

    output += `⏱️  예상 소요 시간: ${promptData.estimatedTime}\n\n`;

    output += '🔧 사용할 MCP 서버:\n';
    output += `  ${promptData.mcpServers.join(', ')}\n\n`;

    output += '📋 생성될 Claude 프롬프트:\n\n';
    output += '---\n';
    output += promptData.prompt;
    output += '\n---\n\n';

    output += '📄 예상 산출물:\n';
    for (const file of promptData.expectedOutputs) {
      output += `  • ${file}\n`;
    }
    output += '\n';

    return output;
  }
}

export default PromptGenerator;
