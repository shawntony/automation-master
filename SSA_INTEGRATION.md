# SSA Integration Guide

**AutomationMaster + SSA (Smart Sheet Assistant) 통합**

AutomationMaster의 10단계 개발 프로세스와 SSA의 강력한 코드 생성 엔진이 통합되어 완전한 자동화 플랫폼이 되었습니다!

## 🎯 통합 개요

### 역할 분리

- **AutomationMaster** (프로세스 레이어)
  - 10단계 개발 프로세스 가이드
  - 워크플로우 관리 및 진행상황 추적
  - 프로젝트 관리 및 환경변수 설정

- **SSA** (실행 엔진 레이어)
  - 풀스택/백엔드/프론트엔드 코드 자동 생성
  - Google Sheets 수식 → Apps Script 자동 변환
  - Google Sheets → Supabase 마이그레이션
  - 제안서 자동 생성 (Claude Code + Canva MCP) 🆕
  - 실제 프로덕션 코드 생성

## 📦 설치 확인

```bash
# SSA 통합 테스트 실행
node test-ssa-integration.js
```

모든 테스트가 통과하면 SSA 통합이 완료된 것입니다!

## 🚀 사용 방법

### 1. 워크플로우에서 SSA 사용

```bash
npm run workflow
```

워크플로우를 진행하다가 각 단계에서 SSA 생성기를 호출할 수 있습니다:

- **3단계 (시스템 기획서 작성)**: 백엔드 생성기로 Supabase 스키마 자동 생성
- **4단계 (UI/UX 설계)**: 프론트엔드 생성기로 UI 컴포넌트 자동 생성
- **5단계 (기술 스택 선정)**: 풀스택 생성기로 완전한 앱 5분 안에 생성

### 2. SSA 생성기 직접 실행

#### 풀스택 생성기 (추천!)
```bash
# 대화형 마법사 모드
npm run ssa:fullstack -- generate --wizard

# 스키마 파일에서 생성
npm run ssa:fullstack -- generate schema.sql "My App" --auto-setup --deploy
```

**결과**: 5분 만에 Next.js 14 + Supabase 완전한 프로덕션 앱 생성!

#### 백엔드 생성기
```bash
# V0/React 코드에서 Supabase 백엔드 생성
npm run ssa:backend -- --file app.tsx --name "My Backend"
```

**결과**:
- `migration.sql` - 완전한 Supabase SQL 스키마
- `types.ts` - TypeScript 타입 정의
- `SETUP_GUIDE.md` - 단계별 설정 가이드

#### 프론트엔드 생성기
```bash
# Supabase 스키마에서 React 앱 생성
npm run ssa:frontend -- --file schema.sql --name "My Frontend" --ui shadcn --auto-setup
```

**결과**: React/Next.js 완전한 관리자 패널

#### Google Sheets 마이그레이션
```bash
# Google Sheets를 Supabase로 마이그레이션
npm run ssa:migrate
```

**결과**: 정규화된 PostgreSQL 데이터베이스

### 3. 프로그래밍 방식 사용

```javascript
import { generateFullstackApp, generateBackend, generateFrontend } from './src/generators/index.js';

// 풀스택 앱 생성
const result = await generateFullstackApp({
  schemaFile: './schema.sql',
  projectName: 'My Amazing App',
  autoSetup: true,
  deploy: true
});

// 백엔드만 생성
const backend = await generateBackend({
  codeFile: './app.tsx',
  projectName: 'My Backend',
  securityLevel: 'strict',
  realtime: true
});

// 프론트엔드만 생성
const frontend = await generateFrontend({
  schemaFile: './schema.sql',
  projectName: 'My Frontend',
  uiLibrary: 'shadcn',
  realtime: true
});
```

## 📋 단계별 SSA 활용 가이드

### 1-2단계: 아이디어 발굴 및 PRD 작성
- AutomationMaster 가이드 활용
- SSA는 아직 사용하지 않음

### 3단계: 시스템 기획서 작성
✨ **SSA 백엔드 생성기 활용!**

기획서에서 데이터 모델을 추출하여 Supabase 스키마 자동 생성:

```javascript
// 3단계 워크플로우에서 자동 제안
"백엔드 생성기로 Supabase 스키마를 자동 생성하시겠습니까?"
→ Yes
→ [SSA backend-generator 실행]
→ Supabase 스키마 생성 완료!
```

### 4단계: UI/UX 설계
✨ **SSA 프론트엔드 생성기 활용!**

3단계에서 생성한 스키마로 UI 컴포넌트 자동 생성:

```javascript
"프론트엔드 생성기로 UI를 자동 생성하시겠습니까?"
→ Yes
→ [SSA frontend-generator 실행]
→ React 컴포넌트 생성 완료!
```

### 5단계: 기술 스택 선정
✨ **SSA 풀스택 생성기 활용! (최고 추천)**

완전한 앱을 5분 안에 생성:

```javascript
"풀스택 생성기로 완전한 앱을 5분 안에 생성하시겠습니까?"
→ Yes
→ [SSA fullstack-generator 실행]
→ 완전한 Next.js 14 앱 생성 완료!
```

**생성되는 것들:**
- Next.js 14 App Router 프로젝트
- Supabase 연동 및 인증 시스템
- 관리자 대시보드 (KPI 자동 감지)
- 완벽한 CRUD 시스템
- 실시간 기능
- 배포 준비 (Vercel)

### 6-7단계: 개발
생성된 코드를 기반으로 커스터마이징

### 8-10단계: 테스트, 배포, 운영
AutomationMaster 가이드 활용

## 🔧 SSA 어댑터 API

### SSAAdapter 클래스

```javascript
import { createSSAAdapter } from './src/integrations/ssa-adapter.js';

const adapter = createSSAAdapter({
  verbose: true,  // 상세 로그 출력
  outputDir: './output'  // 출력 디렉터리
});

// SSA 설치 확인
const isInstalled = await adapter.checkSSAInstalled();

// SSA 버전 확인
const version = await adapter.getSSAVersion();

// 풀스택 생성
await adapter.generateFullstack({
  schemaFile: './schema.sql',
  projectName: 'My App',
  autoSetup: true,
  deploy: true,
  wizard: false
});

// 백엔드 생성
await adapter.generateBackend({
  codeFile: './app.tsx',
  projectName: 'My Backend',
  securityLevel: 'standard',
  realtime: true,
  performance: true
});

// 프론트엔드 생성
await adapter.generateFrontend({
  schemaFile: './schema.sql',
  projectName: 'My Frontend',
  uiLibrary: 'shadcn',
  realtime: true,
  autoSetup: true
});

// Google Sheets 마이그레이션
await adapter.migrateGoogleSheets({
  sheetId: 'your-sheet-id',
  analyze: true,
  migrate: true
});
```

## 📁 프로젝트 구조

```
automationmaster/
├── src/
│   ├── integrations/
│   │   └── ssa-adapter.js        # SSA 통합 어댑터 레이어
│   ├── generators/               # SSA 생성기 래퍼들
│   │   ├── index.js             # 통합 인터페이스
│   │   ├── fullstack.js         # 풀스택 생성기
│   │   ├── backend.js           # 백엔드 생성기
│   │   ├── frontend.js          # 프론트엔드 생성기
│   │   └── migration.js         # 마이그레이션
│   ├── cli/                     # 기존 CLI
│   ├── guide/                   # 10단계 가이드
│   └── workflow/                # 워크플로우
├── lib/
│   └── [SSA 참조]               # ../ssa 디렉터리 참조
├── test-ssa-integration.js      # 통합 테스트
└── package.json                  # SSA 스크립트 추가됨
```

## 🎯 생성기 목록

### 1. 풀스택 생성기 🚀
**5분 안에 완전한 Next.js 14 애플리케이션 생성**

**특징:**
- AI 기반 스키마 분석
- 지능형 아키텍처 설계
- 실시간 대시보드
- 완벽한 CRUD 시스템
- 완전 인증 (소셜 로그인, MFA)
- 배포 준비 완료

**사용:**
```bash
npm run ssa:fullstack -- generate --wizard
```

### 2. Apps Script 생성기
**Google Sheets 수식을 Apps Script로 자동 변환**

**특징:**
- 모든 수식 자동 분석 및 분류
- Apps Script 코드 자동 생성
- 모듈화된 코드 구조
- 트리거 자동화 설정
- 성능 최적화 (50% 이상 향상)
- 오류 처리 및 로깅 시스템

**사용:**
- 웹 UI: http://localhost:3000/tools/appscript
- 직접 분석: `/ssa` 폴더의 `analyzer.js` 활용

**생성되는 것들:**
- Main.gs - 메인 실행 함수
- Config.gs - 전역 설정
- DataLayer/*.gs - 데이터 읽기/쓰기
- BusinessLogic/*.gs - 수식 변환 로직
- Infrastructure/*.gs - 로깅, 에러 처리
- Automation/*.gs - 트리거 관리
- UI/*.gs - 커스텀 메뉴

### 2-1. 제안서 자동 생성 🆕
**Claude Code + Canva MCP를 활용한 AI 기반 프레젠테이션 자동화**

**3가지 생성 방법:**

1. **AI 스타일 학습 방식** (권장 ⭐)
   - 기존 PPT 템플릿 업로드
   - AI가 색상, 폰트, 레이아웃 학습
   - 콘텐츠 입력 후 자동 생성
   - **시간**: 25-30분
   - **장점**: 브랜드 스타일 100% 재현

2. **직접 임포트 방식**
   - Canva 템플릿 검색 및 선택
   - 콘텐츠 매핑 및 자동 배치
   - PDF/PPTX 내보내기
   - **시간**: 15분
   - **장점**: 전문 디자이너 템플릿 활용

3. **PPT 진단 및 개선**
   - 기존 PPT 업로드
   - AI 진단 (디자인, 구성, 메시지 전달력)
   - 자동 개선 제안 및 리뉴얼
   - **시간**: 40분
   - **장점**: D등급 → A등급 자동 업그레이드

**사용:**
- 웹 UI: http://localhost:3000/tools/proposal
- CLI:
  ```bash
  npm run proposal:learn -- --template ./template.pptx
  npm run proposal:import -- --canva-template "business-proposal"
  npm run proposal:improve -- --file ./old-proposal.pptx --grade A
  ```

**성과:**
- 제안서 제작 시간: 4시간 → 50분 (79% 단축)
- 디자인 수정 시간: 2시간 → 10분 (92% 단축)
- 브랜드 일관성: 60% → 100%
- 슬라이드 품질: D → A 등급

### 3. 백엔드 생성기 🔧
**V0/React 코드를 Supabase 백엔드로 자동 변환**

**특징:**
- 코드 분석 및 모델 추출
- Supabase SQL 스키마 생성
- RLS 보안 정책
- TypeScript 타입 정의
- 성능 최적화 (인덱스, View)
- 실시간 구독 설정

**사용:**
```bash
npm run ssa:backend -- --file app.tsx --name "My Backend"
```

### 4. 프론트엔드 생성기 🎨
**Supabase 스키마에서 React/Next.js 애플리케이션 생성**

**특징:**
- React/Next.js 컴포넌트
- shadcn/ui 통합
- React Query 데이터 훅스
- 인증 시스템
- Middle Layer (Zustand, 미들웨어)
- 원클릭 자동 설정

**사용:**
```bash
npm run ssa:frontend -- --file schema.sql --name "My Frontend"
```

### 5. Google Sheets 마이그레이션 📊
**Google Sheets를 Supabase PostgreSQL로 자동 마이그레이션**

**특징:**
- 구조 자동 분석
- 정규화 변환 (차원 + 팩트 테이블)
- 관계 보존 (외래키)
- 성능 최적화 (Materialized View)
- 한국어 지원
- 실시간 분석 뷰

**사용:**
```bash
npm run ssa:migrate
```

## 💡 사용 시나리오

### 시나리오 1: 완전히 새로운 프로젝트
```bash
# 1. 프로젝트 초기화
npm run init

# 2. 워크플로우 시작
npm run workflow

# 3. 3단계에서 기획서 작성 후
#    → SSA 백엔드 생성기로 스키마 생성

# 4. 5단계에서
#    → SSA 풀스택 생성기로 완전한 앱 생성

# 5. 생성된 앱에서 개발 시작!
```

### 시나리오 2: 기존 Google Sheets 데이터 활용
```bash
# 1. Google Sheets 마이그레이션
npm run ssa:migrate

# 2. 생성된 스키마로 프론트엔드 생성
npm run ssa:frontend -- --file schema.sql --name "Data Manager"

# 3. 완성!
```

### 시나리오 3: V0 코드를 프로덕션 앱으로
```bash
# 1. V0에서 받은 코드를 백엔드로 변환
npm run ssa:backend -- --file v0-app.tsx --name "My Backend"

# 2. 생성된 스키마로 프론트엔드 재생성
npm run ssa:frontend -- --file migration.sql --name "My Frontend"

# 3. 프로덕션 레디 앱 완성!
```

## 🔄 워크플로우 통합

AutomationMaster 워크플로우가 각 단계에서 SSA 생성기를 자동으로 제안합니다:

```
1-2단계: 아이디어 & PRD
       ↓
3단계: 시스템 기획
       ↓ [SSA 백엔드 생성기 제안]
4단계: UI/UX 설계
       ↓ [SSA 프론트엔드 생성기 제안]
5단계: 기술 스택 선정
       ↓ [SSA 풀스택 생성기 제안 ★]
6-7단계: 개발 (생성된 코드 커스터마이징)
       ↓
8-10단계: 테스트, 배포, 운영
```

## 🎉 통합 완료!

이제 AutomationMaster에서 SSA의 강력한 생성기를 모두 사용할 수 있습니다!

**다음 단계:**
1. `npm run workflow` - 워크플로우 시작
2. `npm run ssa:fullstack -- generate --wizard` - 풀스택 앱 5분 생성
3. `npm run web:dev` - 웹 UI에서 모든 기능 사용

## 🔧 도구 통합 (Tools Integration)

AutomationMaster에서 SSA의 추출 도구와 Telegram 봇을 사용할 수 있습니다!

### PDF 추출 도구 📄

**기능:**
- PDF에서 구조화된 데이터 추출
- 매출 보고서 자동 파싱
- 제품 카탈로그 추출
- Google Sheets로 직접 마이그레이션
- 일괄 처리 지원

**사용 예시:**
```javascript
import { createPDFExtractor } from './src/integrations/pdf-extractor.js';

const extractor = createPDFExtractor({ verbose: true });

// PDF 분석
const result = await extractor.extractFromPDF('./sales-report.pdf');

// Google Sheets로 마이그레이션
await extractor.extractAndMigrateToSheets('./sales-report.pdf');

// 미리보기
const preview = await extractor.previewPDF('./sales-report.pdf');

// 디렉토리 일괄 처리
await extractor.batchExtract('./reports/');
```

### HWP 추출 도구 📝

**기능:**
- HWP 파일에서 텍스트 추출
- Python Flask 서비스 자동 시작
- 텍스트 파일로 저장
- 일괄 처리 지원

**사용 예시:**
```javascript
import { createHWPExtractor } from './src/integrations/hwp-extractor.js';

const extractor = createHWPExtractor({ verbose: true });

// 서비스 시작 (자동)
await extractor.startService();

// HWP 추출
const result = await extractor.extractFromHWP('./document.hwp');

// 텍스트 파일로 저장
await extractor.extractToTextFile('./document.hwp', './output.txt');

// 디렉토리 일괄 처리
await extractor.batchExtract('./documents/');

// 서비스 중지
extractor.stopService();
```

### Telegram 봇 🤖

**기능:**
- 실시간 매출 분석 리포트
- AI 기반 매출 예측
- PDF 리포트 자동 생성
- 이메일 자동 발송
- 정기 리포트 스케줄링

**사용:**
```bash
# Telegram 봇 시작
npm run tools:telegram
```

**명령어:**
- `/start` - 봇 시작 및 환영 메시지
- `/report` - 실시간 매출 분석 리포트
- `/predict` - AI 기반 30일 매출 예측
- `/generate_report` - PDF 리포트 생성
- `/send_report [이메일]` - 리포트 이메일 발송
- `/schedule_report` - 정기 리포트 설정
- `/status` - 시스템 상태 확인
- `/help` - 상세 도움말

**설정:**
```bash
# .env 파일에 추가
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id
BOT_POLLING=true
```

## 📦 통합 아키텍처

```
┌─────────────────────────────────────────┐
│      AutomationMaster (메타 레이어)      │
│  - 10단계 프로세스 가이드                │
│  - 워크플로우 관리                       │
│  - 프로젝트 추적                         │
└───────────────┬─────────────────────────┘
                │
                ├──► SSA 생성기 (실행 엔진)
                │    ├─ 풀스택 생성기
                │    ├─ 백엔드 생성기
                │    ├─ 프론트엔드 생성기
                │    └─ 마이그레이션
                │
                └──► SSA 도구 (추출/분석)
                     ├─ PDF 추출기
                     ├─ HWP 추출기
                     └─ Telegram 봇
                          └─ AI 예측
                          └─ PDF 리포트
                          └─ 이메일 발송
```

## 🔄 통합 워크플로우 예시

### 시나리오: PDF 매출 보고서 자동화
```bash
# 1. PDF 매출 보고서 추출
npm run tools:pdf extract ./sales-report.pdf

# 2. Google Sheets로 마이그레이션
npm run tools:pdf migrate ./sales-report.pdf

# 3. Supabase로 정규화 마이그레이션
npm run ssa:migrate

# 4. Telegram 봇으로 실시간 분석
npm run tools:telegram
# → Telegram에서 /report 실행

# 5. AI 예측 및 PDF 리포트 생성
# → Telegram에서 /generate_report 실행
```

**Happy Coding! 🚀**
