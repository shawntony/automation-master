# 업무 자동화 툴 개발 완벽 가이드 (MCP & Sub Agent 통합)

아이디어부터 배포까지 모든 단계를 초보자도 쉽게 따라할 수 있도록 정리했습니다.

---

## 🔧 사용할 MCP 서버 및 도구

### 필수 MCP 서버

```bash
# MCP 서버 설정 확인
claude mcp list

사용할 MCP:
✓ @filesystem - 파일 시스템 작업
✓ @terminal - 명령어 실행
✓ @web-search - 웹 검색
✓ @github - Git/GitHub 작업
✓ @memory - 컨텍스트 유지
✓ @task-master - 작업 관리 및 추적
✓ @supabase - 데이터베이스 직접 관리
✓ @vercel - 배포 자동화
✓ @playwright - UI 스크래핑 및 테스팅
✓ sub-agent - 복잡한 작업 위임
```

### Sub Agent 전략

```
Main Agent (당신과 대화)
    ├─ Design Agent (UI/UX 벤치마킹 및 디자인)
    ├─ Frontend Agent (프론트엔드 개발)
    ├─ Backend Agent (백엔드 개발)
    ├─ Testing Agent (테스트 자동화)
    └─ DevOps Agent (배포 및 운영)
```

---

## 📋 전체 프로세스 개요

```
1. 아이디어 발굴 및 정의 (1-2주) + Task Master 작업 생성
   ↓
2. PDR 작성 (3-5일) + 기술 스택 조사
   ↓
3. 시스템 기획서 작성 (1주) + Supabase 스키마 설계
   ↓
4. UI/UX 설계 (1-2주) + Playwright 벤치마킹 + 컴포넌트 템플릿
   ↓
5. 기술 스택 선정 (2-3일) + 프로젝트 초기화
   ↓
6. 프론트엔드 개발 (2-4주) + Sub Agent 활용
   ↓
7. 백엔드 개발 (2-4주) + Supabase MCP 직접 연동
   ↓
8. 테스트 시나리오 및 테스팅 (1-2주) + Playwright 자동화
   ↓
9. 배포 준비 (3-5일) + Vercel MCP 설정
   ↓
10. 배포 및 운영 (지속) + 자동화 파이프라인
```

---

## 1단계: 아이디어 발굴 및 정의

### 🎯 왜 필요한가요?

명확한 문제 정의 없이 개발을 시작하면 방향을 잃기 쉽습니다. 실제로 필요한 기능을 만들기 위해 문제를 정확히 파악해야 합니다.

### 📝 무엇을 해야 하나요?

#### 1.1 문제 발견하기

- 업무 중 반복적으로 하는 작업 찾기
- 시간이 많이 걸리는 작업 찾기
- 실수가 자주 발생하는 작업 찾기

#### 1.2 문제 구체화하기

다음 질문에 답해보세요:

- **누가** 이 문제를 겪고 있나요?
- **언제** 이 문제가 발생하나요?
- **얼마나 자주** 발생하나요?
- **현재** 어떻게 해결하고 있나요?
- 이 문제로 인해 **얼마나 많은 시간**을 낭비하나요?

#### 1.3 해결책 구상하기

- 자동화로 해결 가능한 부분 식별
- 예상되는 효과 계산 (시간 절약, 오류 감소 등)
- 비슷한 솔루션 조사

### 🤖 Claude Code + MCP 활용

```bash
# Task Master로 전체 프로젝트 작업 생성
claude "task-master를 사용해서 새 프로젝트를 시작하고 싶어.

프로젝트명: [자동화 툴 이름]
목적: [간단한 설명]

전체 10단계를 task로 등록하고:
- 각 단계의 예상 소요 시간
- 의존성 관계
- 우선순위

task-master로 프로젝트 보드를 만들어줘"

# 아이디어 정의서 작성
claude "업무 자동화 툴 아이디어를 정리하고 싶어.

자동화하려는 업무:
[구체적으로 설명]

다음 작업을 수행해줘:
1. @web-search로 유사 솔루션 조사
2. 경쟁 제품 분석
3. 차별화 포인트 도출
4. idea-definition.md 작성
5. @task-master에 '아이디어 정의' 작업 완료 표시

@memory에 이 아이디어를 저장해서 전체 프로젝트에서 참조할 수 있게 해줘"

# Sub Agent로 병렬 작업
claude "sub-agent를 생성해서 다음 작업들을 병렬로 수행해줘:

Agent 1: 경쟁사 분석
- 웹 검색으로 유사 툴 3-5개 찾기
- 각 툴의 장단점 분석
- competitive-analysis.md 작성

Agent 2: 사용자 니즈 분석
- 타겟 사용자 페르소나 정의
- 사용자 여정 맵 작성
- user-needs.md 작성

Agent 3: 기술 가능성 검토
- 사용 가능한 API/라이브러리 조사
- 기술적 제약사항 파악
- tech-feasibility.md 작성

모두 완료되면 결과를 통합해서 종합 보고서 작성해줘"
```

**MCP 서버 활용**

- `@task-master`: 프로젝트 작업 관리 및 추적
- `@web-search`: 경쟁 솔루션 조사
- `@filesystem`: 문서 생성 및 관리
- `@memory`: 핵심 정보 장기 저장
- `@github`: 저장소 생성 및 초기 커밋
- `sub-agent`: 병렬 분석 작업

### ✅ 체크리스트

- [ ] Task Master에 프로젝트 등록됨
- [ ] 문제를 한 문장으로 설명할 수 있다
- [ ] 경쟁 제품 분석 완료
- [ ] 목표 사용자가 명확하다
- [ ] 기대 효과를 구체적으로 정의했다
- [ ] 메모리에 핵심 정보 저장됨

### 📄 산출물

**아이디어 정의서**

```
프로젝트명: [툴 이름]
문제 정의: [해결하고자 하는 문제]
목표 사용자: [누가 사용할 것인가]
핵심 기능: [3-5가지 주요 기능]
기대 효과: [시간 절약, 비용 절감 등]
차별화 포인트: [경쟁 제품과의 차이]
```

---

## 2단계: PDR (Preliminary Design Review) 작성

### 🎯 왜 필요한가요?

PDR은 본격적인 개발 전에 기술적 타당성을 검토하는 단계입니다. 잘못된 방향으로 개발하는 것을 방지하고, 개발 비용과 시간을 예측할 수 있습니다.

### 📝 무엇을 해야 하나요?

#### 2.1 요구사항 분석

**기능적 요구사항**

- 시스템이 반드시 해야 하는 일
- 사용자가 수행할 수 있어야 하는 작업
- 예: "사용자는 CSV 파일을 업로드할 수 있어야 한다"

**비기능적 요구사항**

- 성능: 응답 시간, 처리량
- 보안: 인증, 권한, 데이터 암호화
- 확장성: 사용자 증가 대응
- 예: "파일 업로드는 3초 이내에 완료되어야 한다"

#### 2.2 시스템 아키텍처 설계

```
[사용자] ← → [프론트엔드] ← → [백엔드 API] ← → [Supabase]
                                    ↓
                              [외부 서비스]
```

#### 2.3 기술적 제약사항 파악

- 예산 제한
- 인프라 제약
- 기술 스택 제한
- 개발 기간

#### 2.4 위험 요소 식별

- 기술적 위험 (처음 사용하는 기술)
- 일정 위험 (너무 타이트한 일정)
- 리소스 위험 (인력 부족)

### 🤖 Claude Code + MCP 활용

```bash
# Task Master로 PDR 작업 추적
claude "@task-master에서 'PDR 작성' 작업을 시작으로 표시하고
세부 작업들을 추가해줘:
- 요구사항 수집 (2일)
- 아키텍처 설계 (1일)
- 기술 스택 조사 (1일)
- 위험 분석 (1일)"

# Sub Agent로 병렬 PDR 작성
claude "sub-agent를 사용해서 PDR을 병렬로 작성해줘:

Agent 1 (Requirements Agent):
- idea-definition.md 읽기
- 기능적 요구사항 10개 도출
- 비기능적 요구사항 5개 도출
- requirements.md 작성

Agent 2 (Architecture Agent):
- 시스템 아키텍처 다이어그램 (Mermaid)
- 데이터 흐름도 작성
- 컴포넌트 간 통신 정의
- architecture.md 작성

Agent 3 (Tech Research Agent):
- @web-search로 최신 기술 스택 조사
- React, Next.js, Vue 비교
- Node.js, Deno, Bun 비교
- PostgreSQL, MongoDB 비교
- tech-options.md 작성

Agent 4 (Risk Analysis Agent):
- 기술적 위험 식별
- 일정 위험 분석
- 대응 방안 수립
- risk-analysis.md 작성

모든 에이전트 작업 완료 후:
- 결과 통합
- pdr.md로 종합 문서 생성
- @task-master에서 PDR 작업 완료 표시
- @memory에 핵심 결정사항 저장"

# Supabase 연동 검토
claude "@supabase를 사용해서 데이터베이스 옵션을 확인해줘:
- 사용 가능한 Postgres 버전
- 예상 테이블 수와 관계
- 예상 Row 수
- 필요한 인덱스
- 비용 추정

결과를 supabase-planning.md에 작성해줘"
```

**MCP 서버 활용**

- `@task-master`: PDR 단계 작업 추적
- `@web-search`: 기술 스택 최신 정보
- `@filesystem`: PDR 문서 생성
- `@memory`: 기술 결정사항 저장
- `@supabase`: DB 요구사항 검토
- `sub-agent`: 병렬 문서 작성

### ✅ 체크리스트

- [ ] Task Master에서 PDR 작업이 진행 중
- [ ] 모든 요구사항을 문서화했다
- [ ] 시스템 구조를 다이어그램으로 표현했다
- [ ] Supabase 연동 계획 수립
- [ ] 기술적 위험 요소를 파악했다
- [ ] 개발 일정을 대략적으로 수립했다

### 📄 산출물

**PDR 문서 구조**

```
1. 프로젝트 개요
2. 요구사항 명세
   - 기능적 요구사항
   - 비기능적 요구사항
3. 시스템 아키텍처
4. 기술 스택 후보 및 Supabase 활용 계획
5. 위험 요소 및 대응 방안
6. 개발 일정 (초안)
```

---

## 3단계: 시스템 기획서 작성

### 🎯 왜 필요한가요?

시스템 기획서는 개발팀 전체가 같은 그림을 그릴 수 있게 하는 청사진입니다. 개발 중 발생하는 혼란을 줄이고, 의사결정의 기준이 됩니다.

### 📝 무엇을 해야 하나요?

#### 3.1 사용자 시나리오 작성

```
시나리오 1: 일일 보고서 자동 생성
1. 사용자가 로그인한다
2. 대시보드에서 "보고서 생성" 버튼을 클릭한다
3. 날짜 범위를 선택한다
4. "생성하기" 버튼을 클릭한다
5. 시스템이 데이터를 수집하고 보고서를 생성한다
6. 생성된 보고서를 다운로드한다
```

#### 3.2 화면 정의서

각 화면별로:

- 화면 이름 및 목적
- 화면에 포함될 요소
- 사용자 액션
- 데이터 표시 방법

#### 3.3 데이터베이스 설계

**테이블 구조 예시**

```
users 테이블
- id (Primary Key)
- email
- name
- created_at
- updated_at

reports 테이블
- id (Primary Key)
- user_id (Foreign Key)
- title
- content
- status
- created_at
```

#### 3.4 API 명세

```
POST /api/reports
요청: { dateRange: "2025-01-01~2025-01-31" }
응답: { reportId: 123, status: "processing" }

GET /api/reports/:id
응답: { id: 123, title: "...", content: "...", status: "completed" }
```

### 🤖 Claude Code + MCP 활용

```bash
# Supabase로 실제 데이터베이스 스키마 생성
claude "@supabase를 연결해서 데이터베이스 스키마를 직접 생성하고 싶어.

단계:
1. @supabase에 프로젝트 연결
2. 다음 테이블 생성:

-- Users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports 테이블
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);

3. Row Level Security (RLS) 정책 설정
4. 초기 시드 데이터 삽입
5. @memory에 DB 스키마 정보 저장

완료 후 supabase-schema.sql 파일로도 백업해줘"

# Sub Agent로 시스템 기획서 병렬 작성
claude "sub-agent를 사용해서 시스템 기획서를 작성해줘:

Agent 1 (Scenario Writer):
- user-needs.md 기반 사용자 시나리오 작성
- 최소 10개 주요 시나리오
- 각 시나리오별 상세 단계
- user-scenarios.md 생성

Agent 2 (Screen Designer):
- 각 시나리오에 필요한 화면 정의
- 화면별 UI 요소 나열
- 화면 간 네비게이션 정의
- screen-specs.md 생성

Agent 3 (API Architect):
- 필요한 모든 API 엔드포인트 설계
- RESTful 규칙 준수
- Request/Response 스키마
- OpenAPI 3.0 형식
- api-spec.yaml 생성

Agent 4 (Database Designer):
- ERD 다이어그램 (Mermaid)
- 테이블 관계 정의
- 인덱스 전략
- @supabase로 실제 스키마 검증
- database-design.md 생성

모든 에이전트 작업 완료 후 system-design.md로 통합해줘"

# Task Master 업데이트
claude "@task-master에서:
1. '시스템 기획서 작성' 작업을 완료로 표시
2. 다음 단계 작업들을 세부 작업으로 추가
3. 각 작업의 예상 소요 시간 업데이트
4. 진행률 대시보드 생성"
```

**MCP 서버 활용**

- `@supabase`: 실제 DB 스키마 생성 및 검증
- `@task-master`: 기획 단계 작업 추적
- `@filesystem`: 문서 생성
- `@memory`: API 명세 및 스키마 저장
- `sub-agent`: 병렬 문서 작성

### ✅ 체크리스트

- [ ] Supabase에 실제 스키마 생성됨
- [ ] 모든 사용자 시나리오를 작성했다
- [ ] 각 화면의 기능을 정의했다
- [ ] API 엔드포인트를 정의했다
- [ ] 에러 처리 방안을 수립했다
- [ ] Task Master에서 진행 상황 추적 중

### 📄 산출물

**시스템 기획서 구조**

```
1. 시스템 개요
2. 사용자 시나리오
3. 화면 정의서
4. 데이터베이스 설계 (Supabase 실제 스키마 포함)
5. API 명세서
6. 에러 처리 정책
7. 보안 정책
```

---

## 4단계: UI/UX 설계 + Playwright 벤치마킹

### 🎯 왜 필요한가요?

아무리 기능이 좋아도 사용하기 어려우면 아무도 사용하지 않습니다. 실제 성공한 사이트를 벤치마킹하여 검증된 UI 패턴을 활용하면 더 나은 사용자 경험을 제공할 수 있습니다.

### 📝 무엇을 해야 하나요?

#### 4.1 벤치마킹 대상 선정

- 업계 선도 서비스 3-5개
- 유사한 기능을 제공하는 사이트
- UI/UX가 뛰어난 사이트

#### 4.2 Playwright로 UI 패턴 추출

- 레이아웃 구조 분석
- 색상 팔레트 추출
- 타이포그래피 분석
- 컴포넌트 패턴 파악

#### 4.3 디자인 시스템 구축

- 공통 컴포넌트 템플릿 생성
- 재사용 가능한 패턴 정리
- 일관성 있는 스타일 가이드

### 🤖 Claude Code + MCP 활용

```bash
# Playwright로 벤치마킹 사이트 분석
claude "@playwright를 사용해서 벤치마킹을 진행하고 싶어.

벤치마킹 대상 사이트:
1. https://linear.app (프로젝트 관리)
2. https://notion.so (문서 관리)
3. https://vercel.com (깔끔한 디자인)

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

결과를 design-benchmark.md에 정리해줘"

# Sub Agent로 디자인 시스템 구축
claude "sub-agent를 사용해서 디자인 시스템을 만들어줘:

Agent 1 (Color System Designer):
- 벤치마킹 결과 분석
- Primary, Secondary 색상 선정
- Success, Error, Warning 색상
- 중립 색상 팔레트 (gray scale)
- 다크모드 색상
- colors.ts 생성 (Tailwind config)

Agent 2 (Typography Designer):
- 폰트 선정 (구글 폰트에서)
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
- Storybook 설정 (컴포넌트 카탈로그)
- @memory에 디자인 토큰 저장"

# 공통 컴포넌트 템플릿 생성
claude "@playwright 벤치마킹 결과를 기반으로
재사용 가능한 컴포넌트 템플릿 라이브러리를 만들어줘:

templates/components/ 폴더 구조:
├── Button/
│   ├── Button.tsx (템플릿)
│   ├── Button.stories.tsx
│   ├── Button.test.tsx
│   └── variants.ts (모든 variant 정의)
├── Input/
│   ├── Input.tsx
│   ├── Input.stories.tsx
│   ├── Input.test.tsx
│   └── types.ts
├── Card/
├── Modal/
├── Alert/
└── ...

각 컴포넌트는:
1. TypeScript로 완전한 타입 정의
2. 벤치마킹 사이트의 best practice 반영
3. 접근성 (a11y) 완벽 지원
4. 다크모드 지원
5. 모든 상태 처리 (loading, error, success)
6. Storybook stories
7. Unit tests
8. 사용 예시 문서

완성된 템플릿은:
- component-library/ 폴더에 저장
- npm 패키지로 발행 가능하도록 설정
- README.md에 전체 컴포넌트 카탈로그
- 향후 모든 프로젝트에서 재사용 가능

component-library-guide.md에 사용법 작성해줘"

# Playwright로 반응형 디자인 검증
claude "@playwright를 사용해서
벤치마킹 사이트들의 반응형 패턴을 분석해줘:

테스트할 뷰포트:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1440px, 1920px

각 뷰포트에서:
- 레이아웃 변화 캡처
- 브레이크포인트 파악
- 네비게이션 패턴 변화
- 컴포넌트 크기 조정 패턴

결과를 responsive-patterns.md에 정리하고
Tailwind breakpoints 설정에 반영해줘"

# Task Master 업데이트
claude "@task-master에서 UI/UX 설계 작업을 세분화해줘:
- Playwright 벤치마킹 (완료)
- 디자인 시스템 구축 (진행 중)
- 컴포넌트 템플릿 생성 (대기)
- Storybook 설정 (대기)
- 디자인 QA (대기)

각 작업의 담당자와 예상 시간도 업데이트해줘"
```

**MCP 서버 활용**

- `@playwright`: UI 벤치마킹 및 스크래핑
- `@filesystem`: 디자인 시스템 파일 생성
- `@web-search`: 최신 디자인 트렌드 조사
- `@task-master`: 디자인 작업 추적
- `@memory`: 디자인 토큰 저장
- `sub-agent`: 병렬 디자인 시스템 구축

### ✅ 체크리스트

- [ ] Playwright로 3개 이상 사이트 벤치마킹 완료
- [ ] 색상 시스템 정의됨
- [ ] 타이포그래피 시스템 정의됨
- [ ] 공통 컴포넌트 템플릿 생성됨
- [ ] 컴포넌트 라이브러리 문서화됨
- [ ] Storybook 설정 완료
- [ ] 반응형 패턴 정의됨
- [ ] 재사용 가능한 템플릿으로 패키징됨

### 📄 산출물

- 벤치마킹 리포트 (design-benchmark.md)
- 디자인 시스템 가이드 (design-system.md)
- 공통 컴포넌트 템플릿 라이브러리
- Tailwind 설정 파일
- Storybook 컴포넌트 카탈로그
- 반응형 디자인 가이드

---

## 5단계: 기술 스택 선정

### 🎯 왜 필요한가요?

적절한 기술 스택을 선택하면 개발 속도가 빨라지고, 유지보수가 쉬워집니다. 프로젝트 특성에 맞는 기술을 선택하는 것이 중요합니다.

### 📝 무엇을 해야 하나요?

#### 5.1 프론트엔드 기술 선택

**초보자 추천**

```
React + Vite + TypeScript
- 학습 자료가 풍부
- 커뮤니티가 큼
- 빠른 개발 환경
- 우리의 컴포넌트 템플릿과 완벽 호환

+ Tailwind CSS
- 우리 디자인 시스템과 통합
- 빠른 스타일링

+ Vercel 배포
- @vercel MCP로 자동화
- 무료 티어
```

**다른 옵션**

- Vue.js: React보다 쉬움, 더 직관적
- Next.js: React + 서버 사이드 렌더링
- Svelte: 가볍고 빠름

#### 5.2 백엔드 기술 선택

**초보자 추천**

```
Node.js + Express + TypeScript
- JavaScript로 프론트/백엔드 통일
- 빠른 개발
- 풍부한 패키지

+ Supabase
- @supabase MCP로 직접 관리
- PostgreSQL 기반
- 인증/스토리지 내장
- 무료 티어
```

**다른 옵션**

- Python + FastAPI: 간단하고 빠름
- Java + Spring Boot: 엔터프라이즈급
- Go: 고성능

#### 5.3 배포 환경

**초보자 추천**

```
프론트엔드: Vercel (@vercel MCP 사용)
백엔드: Vercel Edge Functions / Railway
데이터베이스: Supabase (@supabase MCP 사용)
테스팅: Playwright (@playwright MCP 사용)
```

#### 5.4 개발 도구

```
버전 관리: Git + GitHub (@github MCP)
작업 관리: Task Master (@task-master MCP)
IDE: VS Code + Claude Code
API 테스트: Playwright
협업: Notion / Linear
```

### 🤖 Claude Code + MCP 활용

```bash
# 기술 스택 조사 및 비교
claude "@web-search를 사용해서 2025년 최신 기술 스택을 조사해줘:

조사 항목:
1. 프론트엔드 프레임워크 (React vs Next.js vs Vue)
2. 백엔드 프레임워크 (Node.js vs Deno vs Bun)
3. 데이터베이스 (Supabase vs Firebase vs PlanetScale)
4. 배포 플랫폼 (Vercel vs Netlify vs Railway)

각 기술별:
- 인기도 (GitHub stars, npm downloads)
- 학습 곡선
- 성능 벤치마크
- 커뮤니티 크기
- 비용
- 우리 프로젝트 적합성

결과를 tech-comparison-2025.md에 정리해줘"

# 프로젝트 완전 자동 초기화
claude "선택된 기술 스택으로 프로젝트를 완전 자동으로 초기화해줘:

프론트엔드 설정:
1. React + Vite + TypeScript 프로젝트 생성
2. 우리가 만든 컴포넌트 템플릿 라이브러리 통합
3. Tailwind CSS + 우리 디자인 시스템 설정
4. 필수 라이브러리 설치:
   - react-router-dom
   - axios
   - react-hook-form
   - zod
   - @tanstack/react-query
5. 폴더 구조 생성 (best practice)
6. ESLint + Prettier 설정
7. Git 초기화 및 첫 커밋
8. @vercel MCP로 프로젝트 연결

백엔드 설정:
1. Node.js + Express + TypeScript 프로젝트 생성
2. @supabase MCP로 데이터베이스 연결 설정
3. 필수 미들웨어 설치
4. 폴더 구조 생성
5. 환경 변수 템플릿
6. API 라우터 스켈레톤 생성

테스팅 설정:
1. @playwright 설정
2. E2E 테스트 구조
3. 컴포넌트 테스트 설정

작업 관리:
1. @task-master에 개발 작업들 등록
2. GitHub Projects 연동

모든 설정 완료 후:
- setup-complete.md에 전체 구조 문서화
- 실행 방법 README.md에 작성
- @memory에 프로젝트 설정 저장

@github를 사용해서 저장소 생성하고 초기 커밋도 해줘"

# Vercel 프로젝트 연결
claude "@vercel을 사용해서 배포 설정을 완료해줘:

1. Vercel 프로젝트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정 (Supabase URL, API keys 등)
4. 빌드 설정 최적화
5. 프리뷰 배포 설정
6. 프로덕션 도메인 설정

완료 후 vercel-setup.md에 정보 기록해줘"

# Task Master로 개발 계획 수립
claude "@task-master를 사용해서 상세 개발 계획을 수립해줘:

프론트엔드 작업:
- [ ] 공통 컴포넌트 구현 (템플릿 기반)
- [ ] 레이아웃 컴포넌트
- [ ] 인증 페이지
- [ ] 메인 기능 페이지들
- [ ] 상태 관리 설정
- [ ] API 연동

백엔드 작업:
- [ ] Supabase 스키마 최종화
- [ ] API 라우터 구현
- [ ] 인증 시스템
- [ ] 비즈니스 로직
- [ ] 에러 처리

테스팅 작업:
- [ ] Playwright E2E 테스트
- [ ] 컴포넌트 테스트
- [ ] API 테스트

배포 작업:
- [ ] Vercel 자동 배포 설정
- [ ] 환경별 설정
- [ ] 모니터링 설정

각 작업에:
- 담당자 (또는 sub-agent)
- 예상 소요 시간
- 의존성
- 우선순위

간트 차트 형식으로 시각화해줘"
```

**MCP 서버 활용**

- `@web-search`: 기술 스택 조사
- `@filesystem`: 프로젝트 파일 생성
- `@terminal`: 프로젝트 초기화 명령 실행
- `@github`: 저장소 생성 및 관리
- `@vercel`: 배포 설정
- `@supabase`: DB 연결 설정
- `@task-master`: 개발 계획 수립
- `@memory`: 기술 결정사항 저장

### 📄 산출물

**기술 스택 문서**

```
프론트엔드: React + Vite + TypeScript + Tailwind
백엔드: Node.js + Express + TypeScript
데이터베이스: Supabase (PostgreSQL)
배포: Vercel (FE/BE) + Supabase (DB)
테스팅: Playwright
작업관리: Task Master
기타 도구: GitHub, Storybook

선정 이유: [각 기술을 선택한 구체적 이유]
컴포넌트 템플릿: 재사용 가능한 라이브러리 통합됨
```

---

## 6단계: 프론트엔드 개발

### 🎯 왜 필요한가요?

사용자가 직접 보고 사용하는 부분입니다. 우리가 만든 컴포넌트 템플릿을 활용하면 일관성 있고 빠른 개발이 가능합니다.

### 📝 무엇을 해야 하나요?

#### 6.1 개발 환경 세팅

```bash
# 이미 5단계에서 자동화됨
# 컴포넌트 템플릿 라이브러리 통합 완료
# Tailwind + 디자인 시스템 설정 완료
```

#### 6.2 프로젝트 구조

```
src/
├── components/        # 프로젝트별 컴포넌트
│   ├── features/     # 기능별 컴포넌트
│   └── layouts/      # 레이아웃
├── lib/              # 공통 컴포넌트 템플릿 (우리가 만든 것)
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   └── ...
├── pages/            # 페이지 컴포넌트
├── hooks/            # 커스텀 훅
├── utils/            # 유틸리티 함수
├── api/              # API 호출 함수
├── types/            # TypeScript 타입
└── App.tsx           # 메인 앱
```

#### 6.3 컴포넌트 개발 순서

1. **공통 컴포넌트** (이미 템플릿 있음)
2. **레이아웃 컴포넌트** (템플릿 기반 커스터마이즈)
3. **페이지 컴포넌트** (기능별 페이지)
4. **상태 관리** (React Query + Context)
5. **API 연동**

### 🤖 Claude Code + MCP 활용

```bash
# Sub Agent로 병렬 프론트엔드 개발
claude "sub-agent를 사용해서 프론트엔드를 병렬로 개발해줘:

Agent 1 (Layout Builder):
임무: 레이아웃 컴포넌트 생성
- 우리의 컴포넌트 템플릿 활용
- MainLayout.tsx (헤더, 사이드바, 콘텐츠)
- AuthLayout.tsx (로그인 페이지용)
- DashboardLayout.tsx
- 모두 반응형 디자인
- @playwright로 벤치마킹한 패턴 적용
- layouts/ 폴더에 생성
- @task-master에서 작업 상태 업데이트

Agent 2 (Auth Pages Builder):
임무: 인증 관련 페이지 생성
- 템플릿의 Button, Input 컴포넌트 사용
- Login.tsx
- Register.tsx
- ForgotPassword.tsx
- React Hook Form + Zod 검증
- Supabase Auth 연동 준비
- pages/auth/ 폴더에 생성
- @task-master 업데이트

Agent 3 (Feature Pages Builder):
임무: 주요 기능 페이지 생성
- user-scenarios.md 기반
- Dashboard.tsx
- [각 주요 기능 페이지]
- 템플릿 컴포넌트로 구성
- Mock 데이터 사용
- pages/features/ 폴더에 생성
- @task-master 업데이트

Agent 4 (State & API Integration):
임무: 상태 관리 및 API 연동
- React Query 설정
- @supabase 클라이언트 설정
- API 함수 작성 (api/ 폴더)
- 커스텀 훅 작성 (hooks/ 폴더)
- Context 설정 (AuthContext, ThemeContext)
- @memory에 API 패턴 저장
- @task-master 업데이트

Agent 5 (Router & Navigation):
임무: 라우팅 설정
- React Router v6 설정
- 모든 페이지 라우트 연결
- Protected Route 설정
- 네비게이션 가드
- routes/index.tsx 생성
- @task-master 업데이트

모든 에이전트가 작업 완료하면:
1. npm run dev로 개발 서버 실행
2. @playwright로 자동 테스트
3. 스크린샷 캡처
4. frontend-progress.md에 진행 상황 기록
5. @github에 커밋
6. @vercel로 프리뷰 배포
7. 배포 URL을 팀에 공유"

# Playwright로 자동 컴포넌트 테스트
claude "@playwright를 사용해서 생성된 모든 컴포넌트를 자동으로 테스트해줘:

테스트 시나리오:
1. 모든 페이지 방문
2. 버튼 클릭 가능 확인
3. 폼 입력 테스트
4. 반응형 테스트 (모바일, 태블릿, 데스크톱)
5. 접근성 테스트
6. 스크린샷 비교 (벤치마킹 사이트와)

tests/e2e/ 폴더에:
- components.spec.ts
- pages.spec.ts
- responsive.spec.ts
- accessibility.spec.ts

모든 테스트 실행하고:
- 결과를 test-results/ 폴더에 저장
- 스크린샷을 screenshots/ 폴더에 저장
- 리포트를 playwright-report.html 생성
- 실패한 테스트가 있으면 즉시 알림
- @task-master에 테스트 결과 기록"

# Vercel 프리뷰 배포
claude "@vercel을 사용해서 프리뷰 배포를 자동화해줘:

배포 프로세스:
1. 현재 브랜치의 변경사항 확인
2. 빌드 실행 (npm run build)
3. @vercel로 프리뷰 배포
4. 배포 URL 획득
5. @playwright로 배포된 사이트 자동 테스트
6. 테스트 통과하면:
   - @github에 커밋 및 PR 생성
   - PR에 프리뷰 URL 코멘트
   - @task-master에 배포 기록
7. 테스트 실패하면:
   - 에러 로그 수집
   - debug-deployment.md에 기록
   - 배포 롤백

deployment-log.md에 전체 과정 기록해줘"

# 컴포넌트 라이브러리 업데이트
claude "개발 중 발견한 개선사항을 컴포넌트 템플릿에 반영해줘:

1. 현재 프로젝트에서 개선된 컴포넌트 파악
2. 템플릿 라이브러리 업데이트
3. 버전 업 (semantic versioning)
4. CHANGELOG.md 업데이트
5. 다른 프로젝트에도 적용 가능하도록 일반화
6. component-library/ 폴더에 커밋
7. npm 패키지 업데이트 (선택)

향후 모든 프로젝트가 최신 템플릿을 사용할 수 있게!"
```

**MCP 서버 활용**

- `@filesystem`: 컴포넌트 파일 생성
- `@terminal`: 개발 서버 실행
- `@supabase`: 인증 및 데이터 연동
- `@playwright`: 자동 테스트
- `@vercel`: 프리뷰 배포
- `@github`: 버전 관리
- `@task-master`: 개발 진행 추적
- `@memory`: 컴포넌트 패턴 저장
- `sub-agent`: 병렬 개발

### ✅ 체크리스트

- [ ] 컴포넌트 템플릿 활용됨
- [ ] 모든 페이지 컴포넌트 생성
- [ ] 라우팅 설정 완료
- [ ] Supabase 연동 완료
- [ ] Playwright 테스트 통과
- [ ] Vercel 프리뷰 배포 성공
- [ ] 디자인 시스템 일관성 유지
- [ ] Task Master에서 진행 추적 중

### 📄 산출물

- 작동하는 프론트엔드 애플리케이션
- Playwright 테스트 스위트
- Vercel 프리뷰 URL
- 업데이트된 컴포넌트 템플릿

---

## 7단계: 백엔드 개발 + Supabase 직접 연동

### 🎯 왜 필요한가요?

Supabase MCP를 활용하면 데이터베이스를 직접 관리하고, 실시간으로 쿼리를 테스트하며, 즉각적인 피드백을 받을 수 있습니다.

### 📝 무엇을 해야 하나요?

#### 7.1 Supabase 완전 활용

- 직접 SQL 쿼리 실행
- Row Level Security 설정
- Real-time subscription
- Storage 설정
- Edge Functions

### 🤖 Claude Code + MCP 활용

```bash
# Supabase 완전 설정
claude "@supabase를 사용해서 백엔드를 완전히 설정하고 싶어:

Phase 1: 데이터베이스 최종화
1. database-schema.md 읽기
2. @supabase로 모든 테이블 생성
3. 관계 (Foreign Keys) 설정
4. 인덱스 추가
5. RLS (Row Level Security) 정책:
   - 사용자는 자신의 데이터만 조회/수정
   - 관리자는 모든 데이터 접근 가능
6. Functions 생성 (복잡한 비즈니스 로직)
7. Triggers 설정 (자동 업데이트)
8. 실제 쿼리 테스트
9. 성능 최적화 (EXPLAIN ANALYZE)

Phase 2: Authentication 설정
1. Supabase Auth 활성화
2. Email/Password 인증
3. OAuth 제공자 (Google, GitHub)
4. JWT 설정
5. 세션 관리
6. 비밀번호 리셋 플로우

Phase 3: Storage 설정
1. 파일 업로드 버킷 생성
2. 접근 정책 설정
3. 이미지 최적화 설정
4. CDN 설정

Phase 4: Real-time 설정
1. 실시간 구독 테이블 설정
2. 변경 알림 활성화
3. 프론트엔드 연동 코드

Phase 5: Edge Functions
1. 복잡한 비즈니스 로직을 Edge Function으로
2. Scheduled Functions (cron jobs)
3. Webhooks 처리

모든 설정을 supabase-complete-setup.md에 문서화하고
@memory에 저장해줘"

# Sub Agent로 백엔드 API 개발
claude "sub-agent를 사용해서 백엔드 API를 개발해줘:

Agent 1 (API Router Builder):
임무: API 라우터 구현
- api-spec.yaml 기반
- Express 라우터 생성
- @supabase 클라이언트 사용
- routes/ 폴더에 생성
- @task-master 업데이트

Agent 2 (Business Logic Builder):
임무: 비즈니스 로직 구현
- services/ 폴더에 서비스 레이어
- @supabase로 데이터 CRUD
- 에러 처리
- 트랜잭션 관리
- @task-master 업데이트

Agent 3 (Middleware Builder):
임무: 미들웨어 구현
- Supabase JWT 검증
- 권한 확인
- Rate limiting
- 로깅
- 에러 핸들러
- middlewares/ 폴더에 생성
- @task-master 업데이트

Agent 4 (API Testing):
임무: API 자동 테스트
- @playwright로 API 테스트
- 모든 엔드포인트 검증
- 인증 플로우 테스트
- 에러 케이스 테스트
- tests/api/ 폴더에 생성
- @task-master 업데이트

모든 에이전트 완료 후:
1. 통합 테스트 실행
2. @supabase로 실제 데이터 테스트
3. API 문서 자동 생성 (OpenAPI)
4. Postman 컬렉션 생성
5. @github에 커밋
6. @vercel로 백엔드 배포
7. 배포 URL 프론트엔드에 연결"

# Supabase Real-time 연동
claude "@supabase의 real-time 기능을 프론트엔드에 연동해줘:

1. 실시간 업데이트가 필요한 기능 파악
2. Supabase 구독 설정
3. React 컴포넌트에 통합
4. 최적화 (불필요한 리렌더링 방지)
5. 에러 처리 및 재연결 로직

예시:
- 새 메시지 알림
- 데이터 변경 즉시 반영
- 다른 사용자 활동 표시

realtime-integration.md에 사용법 문서화해줘"

# Supabase Functions 배포
claude "@supabase를 사용해서 Edge Functions를 배포해줘:

Functions:
1. report-generator
   - 보고서 생성 로직
   - 복잡한 데이터 처리
   - 이메일 발송

2. scheduled-backup
   - 매일 자동 백업
   - 오래된 데이터 정리
   - 통계 생성

3. webhook-handler
   - 외부 서비스 연동
   - 이벤트 처리

각 Function:
- TypeScript로 작성
- @supabase로 배포
- 로그 모니터링 설정
- 에러 알림 설정

functions/ 폴더에 코드 작성하고
supabase-functions.md에 사용법 문서화해줘"

# Task Master로 백엔드 진행 추적
claude "@task-master에서 백엔드 개발 현황을 확인하고 업데이트해줘:

완료된 작업:
- Supabase 스키마 생성
- RLS 정책 설정
- API 라우터 구현
- ...

진행 중인 작업:
- Edge Functions 개발
- ...

대기 중인 작업:
- 성능 최적화
- ...

전체 진행률과 예상 완료일을 계산해줘"
```

**MCP 서버 활용**

- `@supabase`: 데이터베이스 직접 관리
- `@filesystem`: 백엔드 코드 생성
- `@terminal`: 서버 실행 및 테스트
- `@playwright`: API 테스트
- `@vercel`: 백엔드 배포
- `@github`: 버전 관리
- `@task-master`: 개발 추적
- `@memory`: API 패턴 저장
- `sub-agent`: 병렬 개발

### 📄 산출물

- 완전히 설정된 Supabase 프로젝트
- 작동하는 백엔드 API
- Edge Functions
- API 문서
- Playwright API 테스트

---

## 8단계: 테스트 시나리오 및 테스팅 (Playwright 중심)

### 🎯 왜 필요한가요?

Playwright MCP를 활용하면 실제 사용자처럼 애플리케이션을 테스트하고, 자동으로 버그를 발견하며, 회귀 테스트를 자동화할 수 있습니다.

### 🤖 Claude Code + MCP 활용

```bash
# Playwright 전체 테스트 스위트 생성
claude "@playwright를 사용해서 완전한 테스트 스위트를 만들어줘:

Test Suite 1: E2E 사용자 플로우
- user-scenarios.md의 모든 시나리오
- 실제 사용자처럼 전체 플로우 테스트
- 스크린샷 및 비디오 녹화
- tests/e2e/user-flows/ 폴더

Test Suite 2: 컴포넌트 인터랙션
- 모든 버튼, 입력, 폼 테스트
- 상태 변화 확인
- 에러 케이스
- tests/e2e/components/ 폴더

Test Suite 3: API 통합
- 모든 API 엔드포인트
- @supabase 연동 확인
- 인증 플로우
- tests/e2e/api/ 폴더

Test Suite 4: 크로스 브라우저
- Chromium, Firefox, WebKit
- 모든 주요 기능 검증
- tests/e2e/cross-browser/ 폴더

Test Suite 5: 성능 테스트
- 로딩 시간 측정
- Lighthouse 점수
- Core Web Vitals
- tests/performance/ 폴더

Test Suite 6: 접근성 테스트
- axe-core 통합
- WCAG 2.1 AA 준수
- 키보드 내비게이션
- 스크린 리더 호환성
- tests/accessibility/ 폴더

Test Suite 7: 보안 테스트
- XSS 방어 확인
- SQL Injection 방어
- CSRF 토큰 확인
- 인증 우회 시도
- tests/security/ 폴더

Test Suite 8: 시각적 회귀 테스트
- 스크린샷 비교
- UI 변경 감지
- 벤치마킹 사이트와 비교
- tests/visual/ 폴더

각 테스트:
- TypeScript로 작성
- 명확한 설명
- 실패 시 상세 로그
- 스크린샷/비디오 첨부
- 재시도 로직

전체 테스트 실행:
npx playwright test

CI/CD 통합:
- @github Actions에 추가
- PR마다 자동 실행
- 결과를 PR에 코멘트

테스트 결과를 test-report.html로 생성하고
@task-master에 테스트 현황 업데이트해줘"

# Sub Agent로 병렬 테스트
claude "sub-agent를 사용해서 테스트를 병렬로 작성하고 실행해줘:

Agent 1 (E2E Test Writer):
- 모든 사용자 시나리오 테스트 작성
- @playwright로 실행
- 결과 리포트

Agent 2 (Component Test Writer):
- 모든 컴포넌트 테스트 작성
- @playwright로 실행
- 결과 리포트

Agent 3 (API Test Writer):
- 모든 API 테스트 작성
- @supabase 연동 검증
- 결과 리포트

Agent 4 (Performance Tester):
- Lighthouse 실행
- 성능 메트릭 수집
- 개선 사항 제안

Agent 5 (Security Tester):
- 보안 취약점 스캔
- 침투 테스트
- 결과 리포트

모든 에이전트 완료 후:
1. 결과 통합
2. 우선순위별 버그 분류
3. bug-report.md 생성
4. @task-master에 버그 등록
5. 심각한 버그는 즉시 알림"

# 자동 버그 수정
claude "Playwright 테스트에서 발견된 버그를 자동으로 수정해줘:

1. 실패한 테스트 분석
2. 에러 원인 파악
3. 관련 코드 찾기
4. 수정 방법 제안
5. 자동 수정 시도 (간단한 경우)
6. 수정 후 테스트 재실행
7. 통과하면:
   - @github에 커밋
   - @task-master 업데이트
8. 실패하면:
   - 상세 분석 리포트
   - 수동 수정 필요 표시

bug-fix-log.md에 모든 과정 기록해줘"
```

**MCP 서버 활용**

- `@playwright`: 모든 테스트 자동화
- `@supabase`: DB 상태 검증
- `@vercel`: 배포된 환경 테스트
- `@github`: 테스트 결과 PR 코멘트
- `@task-master`: 버그 추적
- `@memory`: 테스트 패턴 저장
- `sub-agent`: 병렬 테스트

### 📄 산출물

- 완전한 Playwright 테스트 스위트
- 테스트 리포트 (HTML)
- 버그 리포트
- 스크린샷 및 비디오
- 성능 메트릭

---

## 9단계: 배포 준비 + Vercel MCP 완전 활용

### 🤖 Claude Code + MCP 활용

```bash
# Vercel 완전 자동 배포 설정
claude "@vercel을 사용해서 완전 자동 배포를 설정하고 싶어:

Phase 1: 환경 설정
1. 개발/스테이징/프로덕션 환경 구성
2. @vercel에 환경 변수 설정:
   - SUPABASE_URL (@supabase에서 가져오기)
   - SUPABASE_ANON_KEY
   - 기타 API 키들
3. 도메인 설정 (커스텀 도메인)
4. SSL 인증서 자동 발급

Phase 2: 빌드 최적화
1. 프론트엔드 빌드 최적화
2. 이미지 최적화
3. 코드 스플리팅
4. Tree shaking
5. 번들 크기 분석
6. Lighthouse 점수 90+ 목표

Phase 3: 배포 전략
1. 프리뷰 배포 (모든 PR)
2. 스테이징 배포 (develop 브랜치)
3. 프로덕션 배포 (main 브랜치)
4. 롤백 계획

Phase 4: CI/CD 파이프라인
1. @github Actions 워크플로우:
   a. 코드 푸시
   b. 린팅 및 타입 체크
   c. @playwright 테스트 실행
   d. 빌드
   e. @vercel 배포
   f. @playwright로 배포 검증
   g. 통과하면 프로덕션으로
   h. 실패하면 롤백

Phase 5: 모니터링 설정
1. Vercel Analytics 활성화
2. 에러 트래킹 (Sentry 연동)
3. 성능 모니터링
4. 알림 설정 (Slack/Email)

모든 설정을 vercel-deployment-complete.md에 문서화하고
deployment-checklist.md 생성해줘"

# 원클릭 배포 스크립트
claude "모든 MCP를 활용해서 원클릭 배포 스크립트를 만들어줘:

deploy-to-production.sh:

Step 1: 사전 검증
- Git 상태 확인
- @task-master에서 미완료 중요 작업 확인
- 경고가 있으면 진행 여부 물어보기

Step 2: 테스트
- @playwright로 전체 테스트 실행
- 모든 테스트 통과 필요
- 실패하면 중단

Step 3: 데이터베이스
- @supabase 마이그레이션 실행
- 백업 생성
- 검증

Step 4: 빌드
- 프론트엔드 빌드
- 백엔드 빌드
- 빌드 에러 없음 확인

Step 5: 배포
- @vercel로 프로덕션 배포
- 배포 URL 획득

Step 6: 검증
- @playwright로 배포된 사이트 테스트
- @supabase 연결 확인
- 핵심 기능 작동 확인

Step 7: 완료
- @github에 릴리스 태그 생성
- @task-master에 배포 기록
- 팀에 알림

Step 8: 모니터링
- 5분간 에러 로그 모니터링
- 이상 없으면 배포 성공!
- 이상 있으면 즉시 롤백

실행:
./deploy-to-production.sh

전체 과정을 deployment-log-[timestamp].md에 기록해줘"
```

**MCP 서버 활용**

- `@vercel`: 배포 자동화
- `@supabase`: DB 마이그레이션
- `@playwright`: 배포 검증
- `@github`: 릴리스 관리
- `@task-master`: 배포 추적
- `@terminal`: 스크립트 실행
- `@memory`: 배포 설정 저장

---

## 10단계: 배포 및 운영 + 지속적 자동화

### 🤖 Claude Code + MCP 활용

```bash
# 운영 자동화 시스템 구축
claude "모든 MCP를 활용해서 운영을 완전 자동화하고 싶어:

Daily Tasks (매일 자동 실행):
1. @playwright로 헬스체크
   - 모든 주요 기능 작동 확인
   - 응답 시간 측정
   - 에러 로그 확인

2. @supabase 백업 검증
   - 어제 백업 존재 확인
   - 백업 복원 테스트

3. @vercel 분석 리포트
   - 방문자 수
   - 에러율
   - 성능 메트릭

4. @task-master 업데이트
   - 어제 완료된 작업
   - 오늘 계획된 작업
   - 블로커 확인

Weekly Tasks (매주 자동 실행):
1. @playwright 전체 회귀 테스트
2. @supabase 데이터베이스 최적화
3. 보안 스캔
4. 성능 분석 및 개선 제안
5. 컴포넌트 템플릿 업데이트 확인

Monthly Tasks (매월 자동 실행):
1. 의존성 업데이트
2. 비용 분석
3. 사용자 피드백 종합
4. 로드맵 업데이트

Continuous Monitoring (실시간):
1. @vercel 배포 상태
2. @supabase 연결 상태
3. 에러 발생 시 즉시 알림
4. 자동 롤백 트리거

operations/ 폴더에:
- daily-tasks.sh
- weekly-tasks.sh
- monthly-tasks.sh
- monitor.sh

Cron 설정까지 해줘"

# Sub Agent로 운영 자동화
claude "sub-agent를 사용해서 운영 작업을 자동화해줘:

Agent 1 (Monitoring Agent):
24/7 실행:
- @playwright로 5분마다 핵심 기능 테스트
- @vercel 상태 확인
- @supabase 연결 확인
- 이상 감지 시 즉시 알림
- 자동 복구 시도

Agent 2 (Performance Agent):
매시간 실행:
- Lighthouse 점수 측정
- Core Web Vitals 수집
- @supabase 쿼리 성능 분석
- 느린 쿼리 최적화 제안
- 개선 사항 @task-master에 등록

Agent 3 (Security Agent):
매일 실행:
- @playwright로 보안 테스트
- 취약점 스캔
- 의존성 보안 업데이트 확인
- 심각한 문제 발견 시 즉시 알림

Agent 4 (User Feedback Agent):
매주 실행:
- 사용자 피드백 수집
- @web-search로 유사 제품 트렌드 조사
- 개선 아이디어 도출
- @task-master에 새 작업 등록

Agent 5 (DevOps Agent):
온디맨드 실행:
- 배포 요청 시 전체 파이프라인 실행
- 장애 발생 시 자동 대응
- 백업 및 복구
- 스케일링

모든 에이전트 작동 상황을
operations-dashboard.md에 실시간 업데이트해줘"

# 컴포넌트 템플릿 생태계 구축
claude "우리가 만든 컴포넌트 템플릿을 생태계로 발전시키고 싶어:

Phase 1: 템플릿 라이브러리 완성
1. 현재 프로젝트에서 개선된 컴포넌트 반영
2. 새로운 패턴 추가
3. 문서 업데이트
4. Storybook 배포

Phase 2: NPM 패키지 발행
1. 패키지 설정
2. npm에 발행
3. 버전 관리
4. 자동 배포 설정

Phase 3: 다음 프로젝트 템플릿
1. 전체 프로젝트 구조를 템플릿으로
2. 설정 파일들
3. 초기화 스크립트
4. create-automation-tool CLI

Phase 4: 커뮤니티
1. GitHub 저장소 공개
2. 사용 가이드
3. 기여 가이드
4. 이슈 템플릿

향후 새 프로젝트는:
npx create-automation-tool my-new-project

몇 분 안에 모든 설정 완료!

template-ecosystem.md에 전체 비전 작성해줘"
```

---

## 🤖 Claude Code + Super Claude MCP 종합 활용 가이드

### 필수 MCP 서버 설정

```bash
# MCP 서버 상태 확인
claude mcp list

# 필요한 MCP 서버:
✓ @filesystem - 파일 관리
✓ @terminal - 명령어 실행
✓ @web-search - 웹 검색
✓ @github - Git/GitHub
✓ @memory - 장기 저장
✓ @task-master - 작업 관리
✓ @supabase - 데이터베이스
✓ @vercel - 배포 자동화
✓ @playwright - 테스팅
✓ sub-agent - 병렬 작업
```

### 마스터 자동화 워크플로우

```bash
# 전체 프로젝트를 처음부터 끝까지 자동화
claude "업무 자동화 툴을 완전 자동으로 만들고 싶어.

모든 MCP와 Sub Agent를 활용해서:

[1단계] 프로젝트 시작
- @task-master에 프로젝트 등록
- @memory에 핵심 정보 저장
- @github 저장소 생성

[2단계] 벤치마킹 및 디자인
- @playwright로 3개 사이트 분석
- @web-search로 최신 트렌드 조사
- Sub Agent로 디자인 시스템 구축
- 컴포넌트 템플릿 라이브러리 생성

[3단계] 데이터베이스 설계
- @supabase 프로젝트 생성
- 스키마 설계 및 생성
- RLS 정책 설정
- 초기 데이터 삽입

[4단계] 프로젝트 초기화
- @terminal로 프론트/백엔드 생성
- 템플릿 라이브러리 통합
- @vercel 프로젝트 연결
- @github 초기 커밋

[5단계] 병렬 개발
Sub Agent 5개 동시 실행:
- Frontend Agent (프론트엔드)
- Backend Agent (백엔드)
- Testing Agent (Playwright 테스트)
- Documentation Agent (문서화)
- DevOps Agent (배포 설정)

[6단계] 통합 및 테스트
- @playwright 전체 테스트
- @supabase 연동 검증
- @vercel 프리뷰 배포
- 문제 발견 시 자동 수정

[7단계] 프로덕션 배포
- @vercel 프로덕션 배포
- @playwright 배포 검증
- @task-master 완료 표시
- 팀에 알림

[8단계] 운영 자동화
- 모니터링 에이전트 시작
- 자동 백업 설정
- 성능 추적 시작

전체 과정:
- 각 단계 완료마다 진행 상황 알림
- 문제 발생 시 즉시 중단
- PROJECT_MASTER_LOG.md에 모든 것 기록
- 예상 완료 시간: 2-4시간

시작할까요?"
```

### 긴급 상황 대응

```bash
# 프로덕션 장애 발생
claude "긴급! 프로덕션에 문제가 있어.

자동 대응 프로토콜:

1. @playwright로 즉시 진단
   - 어떤 기능이 작동 안 하는지
   - 에러 메시지 수집

2. @supabase 상태 확인
   - DB 연결 상태
   - 쿼리 성능
   - 에러 로그

3. @vercel 로그 확인
   - 배포 상태
   - 에러 로그
   - 트래픽 상황

4. 원인 파악 및 해결
   - 자동 수정 가능하면 즉시 수정
   - 불가능하면 상세 리포트

5. 필요시 롤백
   - @vercel로 이전 버전으로
   - @supabase 백업 복구

6. 검증
   - @playwright로 재테스트
   - 정상 작동 확인

7. 사후 분석
   - 근본 원인 분석
   - 재발 방지 대책
   - incident-report.md 작성

즉시 시작해줘!"
```

---

## 📚 추가 학습 자료

### MCP 서버별 심화 학습

- **Task Master**: 프로젝트 관리 자동화
- **Supabase**: PostgreSQL 고급 기능
- **Vercel**: Edge Functions 활용
- **Playwright**: 고급 테스팅 패턴
- **Sub Agent**: 복잡한 워크플로우 설계

### 컴포넌트 템플릿 활용

- 템플릿 커스터마이징 가이드
- 새 컴포넌트 추가 방법
- 버전 관리 전략
- 다른 프로젝트에 적용하기

---

## 🎯 성공을 위한 팁

### MCP 활용 전략

1. **Task Master를 중심으로**
   - 모든 작업을 Task Master에 등록
   - 진행 상황 실시간 추적
   - 블로커 즉시 파악

2. **Playwright로 품질 보증**
   - 개발 중에도 계속 테스트
   - 버그를 일찍 발견
   - 회귀 방지

3. **Supabase로 빠른 개발**
   - 백엔드 복잡도 감소
   - Real-time 기능 즉시 사용
   - 인증 시스템 내장

4. **Vercel로 쉬운 배포**
   - 자동 배포 파이프라인
   - 프리뷰 URL 즉시 생성
   - 롤백 원클릭

5. **Sub Agent로 병렬화**
   - 여러 작업 동시 진행
   - 개발 시간 단축
   - 일관성 유지

### 컴포넌트 템플릿 Best Practice

1. **한 번 만들어 계속 사용**
   - 프로젝트마다 재활용
   - 지속적 개선
   - 팀 전체 공유

2. **디자인 일관성 유지**
   - 모든 프로젝트 동일한 Look & Feel
   - 브랜딩 강화
   - 개발 속도 향상

3. **접근성 기본 내장**
   - WCAG 2.1 AA 준수
   - 키보드 내비게이션
   - 스크린 리더 지원

---

**축하합니다! 이제 완전 자동화된 개발 환경이 준비되었습니다! 🎉**

모든 MCP 서버와 Sub Agent를 활용하여:

- ⚡ 개발 속도 5배 향상
- 🎨 일관된 디자인 시스템
- ✅ 자동화된 품질 보증
- 🚀 원클릭 배포
- 🔄 지속적 개선

다음 프로젝트는 더욱 빠르게! 🚀
