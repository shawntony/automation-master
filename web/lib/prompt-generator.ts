/**
 * Centralized Claude Code Prompt Generation System
 *
 * Generates MCP-integrated prompts for each workflow step
 */

import type { StepData } from '@/types/unified-workflow'

export interface PromptContext {
  projectName: string
  projectType: string
  projectPath?: string
  prdPath?: string
  stepNumber: number
  stepData: any
}

/**
 * Generate Claude Code prompt for Step 4: 아이디어 발굴 및 정의
 */
export function generateStep4Prompt(ctx: PromptContext): string {
  const data = ctx.stepData.ideaDefinition

  return `# 🎯 아이디어 발굴 및 정의 (Step 4)

프로젝트: **${ctx.projectName}** (${ctx.projectType})
${ctx.projectPath ? `경로: ${ctx.projectPath}` : ''}
${ctx.prdPath ? `PRD: ${ctx.prdPath}` : ''}

## 문제 정의
${data.problem}

## 해결 방안
${data.solution}

## 타겟 사용자
${data.targetUsers}

## 핵심 기능
${data.keyFeatures.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

---

**작업 요청**:

1. 위 아이디어를 분석하고 MVP(Minimum Viable Product) 스코프를 정의해줘
2. task-decomposition-expert 에이전트를 활용해서 핵심 기능들을 구현 가능한 작업으로 분해해줘
3. 우선순위를 high/medium/low로 구분해줘
4. 각 작업의 예상 소요 시간을 추정해줘

**Expected Output**:
- MVP 스코프 정의 (포함/제외 기능 명확화)
- 작업 분해 결과 (Hierarchical task breakdown)
- 우선순위별 로드맵
- 총 개발 기간 추정

**MCP Tools**: task-decomposition-expert`
}

/**
 * Generate Claude Code prompt for Step 5: PRD 작성
 */
export function generateStep5Prompt(ctx: PromptContext): string {
  const data = ctx.stepData.prdCreation

  if (!data) {
    return `# 📋 PRD 작성 건너뛰기 (Step 5)

프로젝트: **${ctx.projectName}**
Step 2에서 PRD를 이미 작성했습니다: ${ctx.prdPath}

다음 단계(Step 6: 시스템 기획서)로 진행하세요.`
  }

  return `# 📋 PRD 작성 (Step 5)

프로젝트: **${ctx.projectName}** (${ctx.projectType})

## 프로젝트 목적
${data.purpose}

## 배경 및 문제 정의
${data.background}

## 주요 기능
${data.features.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

## 기술 스택
${data.techStack.join(', ')}

---

**작업 요청**:

Step 4의 아이디어 정의를 바탕으로 상세한 PRD 문서를 작성해줘.

다음 섹션을 포함해서:
1. 프로젝트 개요 (목적, 배경, 핵심 가치 제안)
2. 주요 기능 상세 (각 기능별 우선순위, 기술적 요구사항)
3. 타겟 사용자 (페르소나, 니즈, 사용 시나리오)
4. 기술 스택 (프론트엔드, 백엔드, 데이터베이스, 인프라)
5. 성공 지표 (KPI, 측정 방법, 목표 수치)
6. 제약사항 및 위험 요소 (기술적/비즈니스 제약, 완화 전략)
7. 다음 단계 (즉시 실행, 단기/중기 계획)

PRD는 \`docs/PRD.md\`에 저장해줘.`
}

/**
 * Generate Claude Code prompt for Step 6: 시스템 기획서 작성
 */
export function generateStep6Prompt(ctx: PromptContext): string {
  const data = ctx.stepData.systemDesign

  return `# 🏗️ 시스템 기획서 작성 (Step 6)

프로젝트: **${ctx.projectName}** (${ctx.projectType})
PRD: ${ctx.prdPath || 'docs/PRD.md'}

## 아키텍처 패턴
${data.architecture}

## 주요 컴포넌트
${data.components.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

## 데이터 플로우
${data.dataFlow}

## API 설계 개요
${data.apiDesign}

---

**작업 요청**:

Sequential MCP를 활용해서 시스템 아키텍처를 상세 분석하고 설계해줘.

1. **아키텍처 다이어그램** 생성 (Mermaid 형식)
   - 시스템 전체 구조
   - 컴포넌트 간 관계
   - 데이터 플로우

2. **컴포넌트 상세 설계**
   - 각 컴포넌트의 책임과 역할
   - 인터페이스 정의
   - 의존성 관계

3. **기술적 결정 문서화**
   - 왜 이 아키텍처 패턴을 선택했는지
   - Trade-offs 분석
   - 확장성 고려사항

4. **디렉토리 구조 제안**
   - 프로젝트 폴더 구조
   - 파일 명명 규칙
   - 모듈 구성

결과를 \`docs/SYSTEM_DESIGN.md\`에 저장해줘.

**MCP Tools**: Sequential (multi-step reasoning)`
}

/**
 * Generate Claude Code prompt for Step 7: Supabase 스키마 설계
 */
export function generateStep7Prompt(ctx: PromptContext): string {
  const data = ctx.stepData.supabaseSchema

  return `# 🗄️ Supabase 스키마 설계 (Step 7)

프로젝트: **${ctx.projectName}**
System Design: docs/SYSTEM_DESIGN.md

## 테이블 목록
${data.tables.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}

## 관계 정의
${data.relationships}

## RLS 정책 필요 여부
${data.rlsPolicies}

## 인덱스 계획
${data.indexes}

---

**작업 요청**:

supabase-schema-architect 에이전트를 활용해서 프로덕션 레디 데이터베이스 스키마를 설계해줘.

1. **테이블 스키마 생성**
   - CREATE TABLE 문 (모든 컬럼, 타입, 제약조건)
   - 정규화 검증 (3NF 이상)
   - 외래키 관계 정의

2. **RLS (Row Level Security) 정책**
   - 테이블별 보안 정책
   - 역할 기반 접근 제어
   - 정책 테스트 시나리오

3. **인덱스 최적화**
   - 쿼리 패턴 분석
   - 복합 인덱스 설계
   - 성능 최적화 전략

4. **마이그레이션 스크립트**
   - 순차적 마이그레이션 파일
   - Rollback 전략
   - 시드 데이터

결과를 \`supabase/migrations/\` 폴더에 저장해줘.

**MCP Tools**: supabase-schema-architect`
}

/**
 * Generate Claude Code prompt for Step 8: 프론트엔드 설계
 */
export function generateStep8Prompt(ctx: PromptContext): string {
  const data = ctx.stepData.frontendDesign

  return `# 🎨 프론트엔드 설계 (Step 8)

프로젝트: **${ctx.projectName}** (${ctx.projectType})

## 페이지 목록 (Routes)
${data.pages.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

## 주요 컴포넌트
${data.components.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

## 라우팅
${data.routing}

## 상태 관리
${data.stateManagement}

---

**작업 요청**:

Magic MCP와 Context7을 활용해서 Next.js 14 + TypeScript 프론트엔드를 설계해줘.

1. **페이지 구조 및 라우팅**
   - App Router 구조 (\`app/\` 디렉토리)
   - 동적 라우트 설계
   - 레이아웃 및 템플릿
   - 메타데이터 설정

2. **컴포넌트 아키텍처**
   - Atomic Design 패턴 적용
   - 공통 컴포넌트 라이브러리
   - UI 컴포넌트 (shadcn/ui 활용)
   - 재사용성 극대화

3. **상태 관리 전략**
   - Server/Client Component 분리
   - 전역 상태 관리 (${data.stateManagement})
   - 데이터 페칭 전략 (React Query/SWR)
   - 폼 상태 관리

4. **스타일링 시스템**
   - Tailwind CSS 설정
   - 디자인 토큰
   - 반응형 디자인
   - 다크 모드 지원

Context7에서 Next.js 14 공식 패턴을 참조하고,
Magic으로 주요 UI 컴포넌트를 생성해줘.

**MCP Tools**: Magic, Context7`
}

/**
 * Generate Claude Code prompt for Step 9: 백엔드 API 설계
 */
export function generateStep9Prompt(ctx: PromptContext): string {
  const data = ctx.stepData.backendApi

  return `# ⚙️ 백엔드 API 설계 (Step 9)

프로젝트: **${ctx.projectName}**
Database: supabase/migrations/

## API 엔드포인트
${data.endpoints.map((e: string, i: number) => `${i + 1}. ${e}`).join('\n')}

## 인증 방식
${data.authentication}

## 미들웨어
${data.middleware}

## 에러 처리
${data.errorHandling}

---

**작업 요청**:

Context7을 활용해서 Next.js API Routes를 설계하고 구현해줘.

1. **API 엔드포인트 구현**
   - RESTful API 설계 원칙
   - \`app/api/\` 디렉토리 구조
   - Request/Response 타입 정의
   - Validation (Zod 스키마)

2. **인증 및 권한**
   - ${data.authentication} 구현
   - 미들웨어 체인
   - 세션 관리
   - RBAC (Role-Based Access Control)

3. **에러 처리 및 로깅**
   - 표준 에러 응답 형식
   - HTTP 상태 코드 전략
   - 에러 로깅 (Sentry 연동)
   - Rate limiting

4. **Supabase 통합**
   - Supabase 클라이언트 설정
   - RLS 정책과의 연동
   - Realtime 구독 설정
   - Edge Function 활용

**MCP Tools**: Context7 (Next.js API patterns)`
}

/**
 * Generate Claude Code prompt for Step 10: 데이터 플로우 설계
 */
export function generateStep10Prompt(ctx: PromptContext): string {
  const data = ctx.stepData.dataFlow

  return `# 🔄 데이터 플로우 설계 (Step 10)

프로젝트: **${ctx.projectName}**

## Client → Server 플로우
${data.clientToServer}

## Server → Database 플로우
${data.serverToDatabase}

## Realtime 구독
${data.realtime}

## 캐싱 전략
${data.caching}

---

**작업 요청**:

시스템 전체의 데이터 흐름을 분석하고 최적화해줘.

1. **데이터 플로우 다이어그램**
   - Mermaid 시퀀스 다이어그램
   - 주요 사용자 시나리오별 플로우
   - 에러 처리 플로우

2. **데이터 페칭 전략**
   - SSR vs CSR vs ISR 선택 기준
   - 데이터 프리페칭
   - Optimistic Updates
   - 에러 바운더리

3. **캐싱 최적화**
   - ${data.caching} 전략 구현
   - 캐시 무효화 전략
   - Stale-While-Revalidate
   - CDN 활용

4. **Realtime 동기화**
   - Supabase Realtime 설정
   - WebSocket 연결 관리
   - 낙관적 업데이트
   - 충돌 해결 전략

**Systems Thinking**: Meadows의 관점에서 피드백 루프와 레버리지 포인트를 식별해줘.`
}

/**
 * Generate Claude Code prompt for Step 11: 보안 및 인증
 */
export function generateStep11Prompt(ctx: PromptContext): string {
  const data = ctx.stepData.security

  return `# 🛡️ 보안 및 인증 (Step 11)

프로젝트: **${ctx.projectName}**

## 인증 방식
${data.authMethod}

## 권한 관리 (RBAC)
${data.roleBasedAccess}

## 데이터 암호화
${data.dataEncryption}

## API 보안
${data.apiSecurity}

---

**작업 요청**:

OWASP Top 10을 기준으로 보안 체크리스트를 작성하고 구현해줘.

1. **인증 시스템 강화**
   - ${data.authMethod} 상세 구현
   - 비밀번호 정책 (해싱, salt)
   - 2FA/MFA 지원
   - 세션 타임아웃

2. **권한 관리 (RBAC)**
   - 역할 정의 (admin, user, guest)
   - 권한 매트릭스
   - 리소스 접근 제어
   - Supabase RLS와 통합

3. **데이터 보호**
   - 전송 중 암호화 (HTTPS, TLS 1.3)
   - 저장 시 암호화 (${data.dataEncryption})
   - PII 데이터 마스킹
   - GDPR/개인정보보호법 준수

4. **API 보안 강화**
   - CORS 설정
   - Rate Limiting (IP 기반, 사용자 기반)
   - Input Validation (XSS, SQL Injection 방지)
   - CSRF 토큰
   - API 키 관리

5. **보안 테스트**
   - 침투 테스트 시나리오
   - 보안 스캔 도구 설정
   - 취약점 모니터링

결과를 \`docs/SECURITY.md\`에 문서화해줘.`
}

/**
 * Generate Claude Code prompt for Step 12: 테스트 전략
 */
export function generateStep12Prompt(ctx: PromptContext): string {
  const data = ctx.stepData.testing

  return `# 🧪 테스트 전략 (Step 12)

프로젝트: **${ctx.projectName}**

## 단위 테스트
${data.unitTests}

## 통합 테스트
${data.integrationTests}

## E2E 테스트
${data.e2eTests}

## 목표 커버리지
${data.testCoverage}

---

**작업 요청**:

Playwright MCP를 활용해서 포괄적인 테스트 전략을 구현해줘.

1. **단위 테스트 (Jest + React Testing Library)**
   - 컴포넌트 테스트
   - 유틸리티 함수 테스트
   - API 핸들러 테스트
   - 목표 커버리지: ${data.testCoverage}

2. **통합 테스트**
   - API 통합 테스트
   - Database 통합 테스트
   - 외부 서비스 Mock
   - 테스트 데이터 시드

3. **E2E 테스트 (Playwright)**
   - 주요 사용자 시나리오
   - 크로스 브라우저 테스트
   - 모바일 반응형 테스트
   - 접근성 테스트 (WCAG 2.1)

4. **테스트 자동화**
   - GitHub Actions CI/CD
   - Pre-commit 훅
   - 자동 리그레션 테스트
   - 성능 테스트 (Lighthouse)

Playwright로 주요 E2E 테스트 시나리오를 생성하고,
\`tests/\` 디렉토리에 저장해줘.

**MCP Tools**: Playwright (browser automation)`
}

/**
 * Generate Claude Code prompt for Step 13: 배포 및 모니터링
 */
export function generateStep13Prompt(ctx: PromptContext): string {
  const data = ctx.stepData.deployment

  return `# 🚀 배포 및 모니터링 (Step 13)

프로젝트: **${ctx.projectName}**

## 배포 플랫폼
${data.platform}

## CI/CD 파이프라인
${data.cicd}

## 모니터링 도구
${data.monitoring}

## 로깅 전략
${data.logging}

---

**작업 요청**:

프로덕션 배포 및 모니터링 시스템을 구축해줘.

1. **배포 설정 (${data.platform})**
   - 환경 변수 관리
   - 빌드 최적화
   - 도메인 설정
   - SSL/TLS 인증서

2. **CI/CD 파이프라인 (${data.cicd})**
   - GitHub Actions workflow
   - 자동 빌드 및 테스트
   - 스테이징 환경
   - 프로덕션 배포 자동화

3. **모니터링 및 알림 (${data.monitoring})**
   - 에러 추적 (Sentry)
   - 성능 모니터링 (Vercel Analytics)
   - 업타임 모니터링
   - 슬랙/이메일 알림

4. **로깅 시스템 (${data.logging})**
   - 구조화된 로깅
   - 로그 레벨 (DEBUG, INFO, WARN, ERROR)
   - 로그 수집 및 분석
   - 보안 로그 감사

5. **백업 및 재해 복구**
   - 데이터베이스 백업 전략
   - 재해 복구 계획 (DR)
   - 장애 조치 (Failover)
   - RTO/RPO 정의

6. **배포 체크리스트**
   - 환경별 설정 확인
   - 보안 설정 검증
   - 성능 벤치마크
   - 롤백 절차 문서화

결과를 \`docs/DEPLOYMENT.md\`에 문서화하고,
\`.github/workflows/\`에 CI/CD 파이프라인을 생성해줘.`
}

/**
 * Main prompt generator - routes to appropriate step
 */
export function generatePrompt(ctx: PromptContext): string {
  switch (ctx.stepNumber) {
    case 4:
      return generateStep4Prompt(ctx)
    case 5:
      return generateStep5Prompt(ctx)
    case 6:
      return generateStep6Prompt(ctx)
    case 7:
      return generateStep7Prompt(ctx)
    case 8:
      return generateStep8Prompt(ctx)
    case 9:
      return generateStep9Prompt(ctx)
    case 10:
      return generateStep10Prompt(ctx)
    case 11:
      return generateStep11Prompt(ctx)
    case 12:
      return generateStep12Prompt(ctx)
    case 13:
      return generateStep13Prompt(ctx)
    default:
      return `# Step ${ctx.stepNumber}\n\nPrompt not yet implemented for this step.`
  }
}
