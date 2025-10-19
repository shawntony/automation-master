'use client'

import { useState, useMemo } from 'react'
import { Search, BookOpen, ChevronRight, Home, Rocket, Wrench, FileText, GitBranch } from 'lucide-react'

interface Section {
  id: string
  title: string
  content: string
  category: string
  keywords: string[]
}

const manualSections: Section[] = [
  {
    id: 'overview',
    title: '개요',
    category: '시작하기',
    keywords: ['개요', 'automationmaster', 'ssa', '통합', '플랫폼'],
    content: `
# 🚀 Automation Master + SSA

**완전 자동화 개발 플랫폼** = **프로세스 가이드** + **코드 생성 엔진**

AutomationMaster의 10단계 개발 프로세스와 SSA(Smart Sheet Assistant)의 강력한 코드 생성 엔진이 통합된 완전한 자동화 플랫폼입니다!

## 🎯 통합 개요

### AutomationMaster (프로세스 레이어)
- 10단계 개발 프로세스 가이드
- 워크플로우 관리 및 진행상황 추적
- 프로젝트 관리 및 환경변수 설정

### + SSA (실행 엔진 레이어)
- **풀스택 생성기**: 5분 안에 완전한 Next.js 14 앱 생성 ⚡
- **백엔드 생성기**: V0/React → Supabase 백엔드 자동 변환
- **프론트엔드 생성기**: Supabase 스키마 → React/Next.js 앱 생성
- **Apps Script 생성기**: Google Sheets 수식 → Apps Script 자동 변환
- **제안서 자동 생성**: Claude Code + Canva MCP 기반 AI 프레젠테이션 자동화 🆕
- **마이그레이션**: Google Sheets → Supabase PostgreSQL
    `
  },
  {
    id: 'features',
    title: '주요 기능',
    category: '시작하기',
    keywords: ['기능', '프로세스', 'ssa', '코드생성', '워크플로우'],
    content: `
## ✨ 주요 기능

### 📋 프로세스 관리
- 🔄 **대화형 워크플로우** - 단계별 정보 입력 → 프롬프트 생성 → 결과 확인 → 승인 프로세스
- 📋 **10단계 개발 가이드** - 아이디어부터 배포까지 체계적인 단계별 안내
- 🤖 **AI 기반 분석** - 프로젝트 폴더 분석, 진단, AI 리더십 제공
- 📝 **MCP 프롬프트 생성** - 각 단계별 실행 가능한 Claude Code 프롬프트 자동 생성
- 🔧 **환경변수 관리** - 템플릿 기반 환경변수 중앙 관리 및 자동 생성
- ✅ **진행상황 추적** - 각 단계별 체크리스트와 진행률 관리
- 💻 **인터랙티브 CLI** - 사용하기 쉬운 대화형 인터페이스
- 📊 **프로젝트 대시보드** - 전체 프로젝트 진행 현황 한눈에 확인

### 🚀 SSA 코드 생성 엔진
- ⭐ **풀스택/백엔드/프론트엔드 자동 생성** - Supabase 스키마 기반 완전한 앱 생성
- 📝 **Apps Script 생성기** - Google Sheets 수식을 Apps Script로 자동 변환
- 🎨 **제안서 자동 생성** 🆕 - AI 기반 프레젠테이션 자동화 (4시간 → 50분, 79% 단축)
  - AI 스타일 학습: 브랜드 스타일 100% 재현
  - 직접 임포트: Canva 템플릿 활용
  - PPT 진단/개선: D등급 → A등급 자동 업그레이드
- 🔄 **Google Sheets 마이그레이션** - Sheets → Supabase PostgreSQL 자동 변환
    `
  },
  {
    id: 'installation',
    title: '설치',
    category: '시작하기',
    keywords: ['설치', 'install', 'npm', '시작'],
    content: `
## 📦 설치

\`\`\`bash
npm install
\`\`\`

설치 완료 후 바로 사용할 수 있습니다.
    `
  },
  {
    id: 'getting-started',
    title: '빠른 시작',
    category: '시작하기',
    keywords: ['시작', 'init', 'guide', 'workflow', '초기화'],
    content: `
## 🚀 시작하기

### 1. 프로젝트 초기화

\`\`\`bash
npm run init
\`\`\`

프로젝트 이름을 입력하고 진행상황 추적을 시작합니다.

### 2. 가이드 시작

\`\`\`bash
npm run guide
\`\`\`

인터랙티브 가이드가 시작됩니다. 현재 단계의 상세 정보를 확인하고 다양한 액션을 수행할 수 있습니다.

### 3. 진행 상태 확인

\`\`\`bash
npm run status
\`\`\`

전체 프로젝트의 진행 상태와 다음 액션을 확인합니다.

### 4. 환경변수 설정

\`\`\`bash
npm run env
\`\`\`

프로젝트 타입에 맞는 환경변수를 설정하고 \`.env\` 파일을 자동 생성합니다.

### 5. 🔥 대화형 워크플로우 (추천!)

\`\`\`bash
npm run workflow
\`\`\`

**가장 강력한 기능!** 각 단계마다 정보 입력 → 프롬프트 생성 → Claude Code 실행 → 결과 확인 → 승인하는 전체 프로세스를 자동화합니다.
    `
  },
  {
    id: 'web-app',
    title: '웹 애플리케이션',
    category: '사용 방법',
    keywords: ['웹', 'web', 'ui', 'dashboard', 'localhost'],
    content: `
## 🌐 웹 애플리케이션 (SSA 통합!)

\`\`\`bash
# 웹앱 의존성 설치
npm run web:install

# 웹앱 실행
npm run web:dev
\`\`\`

**아름다운 웹 UI로 사용하세요!** 브라우저에서 http://localhost:3000 을 열면:
- 📊 **시각적 대시보드**: 전체 진행 상황을 그래프와 차트로 확인
- 🔄 **웹 기반 워크플로우**: 폼 입력 → 프롬프트 생성 → 클립보드 복사
- 🎨 **현대적인 UI/UX**: Next.js 14 + Tailwind CSS 기반 반응형 디자인
- ⭐ **SSA 생성기**: 풀스택/백엔드/프론트엔드 생성 웹 UI
- 📝 **Apps Script 생성기**: \`/tools/appscript\` - Google Sheets 수식 자동 변환
- 🎨 **제안서 자동 생성**: \`/tools/proposal\` - AI 기반 프레젠테이션 자동화 🆕
- 🛠️ **SSA 도구**: Google Sheets 마이그레이션 도구
    `
  },
  {
    id: 'ssa-generators',
    title: 'SSA 생성기 사용',
    category: '사용 방법',
    keywords: ['ssa', '생성', 'fullstack', 'backend', 'frontend', 'appscript', '제안서'],
    content: `
## ⚡ SSA 생성기 사용

\`\`\`bash
# 풀스택 앱 5분 생성 (마법사 모드)
npm run ssa:fullstack -- generate --wizard

# 백엔드 생성
npm run ssa:backend -- --file app.tsx --name "My Backend"

# 프론트엔드 생성
npm run ssa:frontend -- --file schema.sql --name "My Frontend"

# Google Sheets 마이그레이션
npm run ssa:migrate

# Apps Script 생성기 (웹 UI 권장)
# http://localhost:3000/tools/appscript

# 제안서 자동 생성 (웹 UI 권장) 🆕
# http://localhost:3000/tools/proposal
\`\`\`
    `
  },
  {
    id: 'detailed-usage',
    title: '상세 사용법',
    category: '사용 방법',
    keywords: ['단계', 'step', 'action', 'checklist', '체크리스트'],
    content: `
## 📖 상세 사용법

### 특정 단계로 이동

\`\`\`bash
npm run guide -- --step 3
\`\`\`

### 단계 시작하기

\`\`\`bash
npm run guide -- --step 3 --action start
\`\`\`

### 단계 완료하기

\`\`\`bash
npm run guide -- --step 3 --action complete
\`\`\`

### 체크리스트 관리

\`\`\`bash
npm run checklist -- --step 3
\`\`\`

특정 항목 체크:
\`\`\`bash
npm run checklist -- --step 3 --item 0
\`\`\`

### 환경변수 관리

특정 프리셋으로 설정:
\`\`\`bash
npm run env -- --preset fullstack
\`\`\`

프로젝트 환경변수 상태 확인:
\`\`\`bash
npm run env -- --check ./your-project-path
\`\`\`

특정 경로에 생성:
\`\`\`bash
npm run env -- --preset frontend --target ./my-frontend-project
\`\`\`
    `
  },
  {
    id: '10-steps',
    title: '10단계 개발 프로세스',
    category: '개발 프로세스',
    keywords: ['10단계', '프로세스', 'pdr', 'ui/ux', '테스트', '배포'],
    content: `
## 📋 10단계 개발 프로세스

1. **아이디어 발굴 및 정의** (1-2주)
   - 문제 발견 및 구체화
   - 해결책 구상

2. **PDR 작성** (3-5일)
   - 요구사항 분석
   - 시스템 아키텍처 설계

3. **시스템 기획서 작성** (1주)
   - 사용자 시나리오
   - 데이터베이스 설계
   - API 명세

4. **UI/UX 설계 + Playwright 벤치마킹** (1-2주)
   - 벤치마킹
   - 디자인 시스템 구축

5. **기술 스택 선정** (2-3일)
   - 프론트엔드/백엔드 기술 선택
   - 프로젝트 초기화

6. **프론트엔드 개발** (2-4주)
   - 컴포넌트 개발
   - API 연동

7. **백엔드 개발** (2-4주)
   - Supabase 설정
   - API 개발

8. **테스트 시나리오 및 테스팅** (1-2주)
   - Playwright 테스트
   - 크로스 브라우저 테스트

9. **배포 준비** (3-5일)
   - Vercel 배포 설정
   - CI/CD 파이프라인

10. **배포 및 운영** (지속)
    - 운영 자동화
    - 모니터링
    `
  },
  {
    id: 'examples',
    title: '활용 예시',
    category: '사용 방법',
    keywords: ['예시', 'example', '시작', '재개', '프로젝트'],
    content: `
## 💡 활용 예시

### 새 프로젝트 시작

\`\`\`bash
# 1. 프로젝트 초기화
npm run init
# 프로젝트 이름: my-automation-tool

# 2. 환경변수 설정
npm run env
# 프리셋 선택: fullstack
# 각 변수 입력...

# 3. 가이드 시작
npm run guide
# 단계별로 진행...
\`\`\`

### 진행 중인 프로젝트 재개

\`\`\`bash
# 현재 상태 확인
npm run status

# 현재 단계 가이드 보기
npm run guide

# 체크리스트 확인
npm run checklist
\`\`\`

### 환경변수 업데이트

\`\`\`bash
# 설정 다시 하기
npm run env

# 다른 프로젝트에 적용
npm run env -- --target ../my-other-project
\`\`\`
    `
  },
  {
    id: 'key-features',
    title: '주요 특징',
    category: '고급',
    keywords: ['특징', '자동저장', '환경', '유효성', '체크리스트', 'mcp'],
    content: `
## 🎯 주요 특징

### 1. 진행상황 자동 저장
모든 진행 상태가 \`config/progress.json\`에 자동으로 저장됩니다.

### 2. 다중 환경 지원
\`.env\`, \`.env.development\`, \`.env.staging\`, \`.env.production\` 파일을 자동으로 생성합니다.

### 3. 유효성 검증
환경변수 필수 항목과 옵션 값을 자동으로 검증합니다.

### 4. 체크리스트 관리
각 단계별 체크리스트를 관리하여 빠뜨리지 않고 진행할 수 있습니다.

### 5. MCP 서버 가이드
각 단계에서 사용할 MCP 서버와 명령어 예시를 제공합니다.
    `
  },
  {
    id: 'deployment',
    title: '배포',
    category: '배포',
    keywords: ['배포', 'vercel', 'github', 'ci/cd', 'deploy'],
    content: `
## 🚀 배포

### Vercel 자동 배포 (권장)

이 프로젝트는 **main 브랜치**에 푸시하면 자동으로 Vercel에 배포됩니다.

#### GitHub 연동 배포 설정

1. https://vercel.com 접속 및 로그인
2. "New Project" 클릭
3. GitHub 저장소 임포트: \`shawntony/automation-master\`
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: \`web\`
   - **Build Command**: \`npm run build\`
   - **Output Directory**: \`.next\`
   - **Install Command**: \`npm install\`
5. **Production Branch**: \`main\` (중요!)
6. "Deploy" 클릭

#### GitHub Actions 자동 배포

\`.github/workflows/deploy.yml\`이 설정되어 있어 main 브랜치에 푸시하면 자동으로 배포됩니다.

**필요한 GitHub Secrets:**
- \`VERCEL_TOKEN\`: Vercel 계정 토큰
- \`VERCEL_ORG_ID\`: Vercel 조직 ID
- \`VERCEL_PROJECT_ID\`: Vercel 프로젝트 ID

#### Vercel CLI 배포

\`\`\`bash
# Vercel CLI 설치
npm i -g vercel

# 프로덕션 배포 (main 브랜치에서)
git checkout main
vercel --prod
\`\`\`

### 브랜치 전략

- **main**: 프로덕션 배포 브랜치 (Vercel 자동 배포)
- **develop**: 개발 브랜치
- **master**: 레거시 브랜치

**배포 프로세스:**
\`\`\`bash
# 1. develop 브랜치에서 개발
git checkout develop
# ... 작업 ...

# 2. develop에 커밋 및 푸시
git add .
git commit -m "feat: new feature"
git push origin develop

# 3. main 브랜치로 머지 (배포)
git checkout main
git merge develop
git push origin main  # 자동 배포 트리거!
\`\`\`
    `
  },
  {
    id: 'troubleshooting',
    title: '문제 해결',
    category: '문제 해결',
    keywords: ['문제', '해결', 'troubleshooting', '워크플로우', '반복', '오류'],
    content: `
## 🔧 문제 해결

### 워크플로우가 계속 반복되나요?

"수정/보완 후 다시 확인 (retry)"을 계속 선택하면 같은 단계가 반복됩니다. 이것은 의도된 기능입니다.

**해결 방법**:
- ✅ **"이 단계는 이정도로 충분함"** 선택 → 다음 단계로 진행
- ✅ **"워크플로우 종료"** 선택 → 저장하고 나중에 재개
- ✅ **10번 재시도 후** → 자동으로 강제 진행 옵션 제공

### 기타 문제

일반적인 문제와 해결 방법:
- npm install 실패
- 웹앱 시작 오류
- 환경변수 설정 문제
- MCP 서버 오류
- 프로젝트 분석 오류

자세한 내용은 TROUBLESHOOTING.md를 참고하세요.
    `
  },
  {
    id: 'env-templates',
    title: '환경변수 템플릿',
    category: '고급',
    keywords: ['환경변수', 'env', 'template', 'preset', 'supabase', 'vercel'],
    content: `
## 🔧 환경변수 템플릿

\`templates/env.template.json\` 파일에서 환경변수 템플릿을 관리합니다.

### 지원하는 프리셋:

- **frontend**: 프론트엔드 프로젝트 (Supabase, Vercel)
- **backend**: 백엔드 프로젝트 (Supabase)
- **fullstack**: 풀스택 프로젝트 (Supabase, Vercel, GitHub)

### 템플릿 구조:

\`\`\`json
{
  "templates": {
    "supabase": {
      "description": "Supabase 데이터베이스 연결",
      "variables": {
        "SUPABASE_URL": {
          "description": "Supabase 프로젝트 URL",
          "example": "https://xxx.supabase.co",
          "required": true
        }
      }
    }
  },
  "presets": {
    "frontend": ["supabase", "vercel", "common"]
  }
}
\`\`\`
    `
  },
  {
    id: 'project-structure',
    title: '프로젝트 구조',
    category: '고급',
    keywords: ['구조', 'structure', '폴더', 'directory', 'src', 'config'],
    content: `
## 📁 프로젝트 구조

\`\`\`
automationmaster/
├── src/
│   ├── cli/
│   │   └── index.js          # CLI 메인 프로그램
│   ├── guide/
│   │   ├── steps.js          # 10단계 정의
│   │   └── navigator.js      # 단계 네비게이션
│   ├── env/
│   │   └── manager.js        # 환경변수 관리자
│   └── utils/
│       └── storage.js        # 진행상황 저장/로드
├── templates/
│   └── env.template.json     # 환경변수 템플릿
├── config/
│   ├── progress.json         # 진행상황 (자동 생성)
│   └── env-config.json       # 환경변수 설정 (자동 생성)
├── planning.md               # 원본 가이드 문서
└── package.json
\`\`\`
    `
  },
  {
    id: 'ssa-overview',
    title: 'SSA 개요',
    category: 'SSA',
    keywords: ['ssa', 'smart sheet', 'apps script', '제안서', '자동화'],
    content: `
# SSA - Smart Sheet Assistant

Google Sheets 수식을 Google Apps Script로 자동 전환하는 지능형 자동화 도구

## 📋 SSA가 제공하는 기능

1. **Apps Script 생성기** - Google Sheets 수식을 Apps Script로 자동 전환
2. **제안서 자동 생성** - Claude Code + Canva MCP를 활용한 AI 기반 프레젠테이션 자동화

### Apps Script 생성기 주요 기능

1. **스프레드시트 분석**
   - 모든 시트의 수식 목록 추출
   - 시트 간 참조 관계 매핑
   - 데이터 흐름 분석

2. **수식 분류 및 전환**
   - 단순 계산 수식 (SUM, AVERAGE 등)
   - 조건부 수식 (IF, IFS, SWITCH 등)
   - 조회 수식 (VLOOKUP, INDEX-MATCH 등)
   - 배열 수식 (ARRAYFORMULA 등)
   - 날짜/시간 수식
   - 텍스트 처리 수식

3. **Apps Script 구현**
   - 각 수식을 Apps Script 함수로 자동 변환
   - 트리거 기반 자동 실행 설정
   - 오류 처리 및 로깅 구현
   - 모듈화된 코드 구조
    `
  },
  {
    id: 'ssa-quick-start',
    title: 'SSA 빠른 시작',
    category: 'SSA',
    keywords: ['ssa', '시작', 'apps script', 'generate', 'wizard'],
    content: `
## 🚀 SSA 빠른 시작

### Apps Script 생성기 사용

\`\`\`bash
# Apps Script 코드 생성
npm run ssa:generate

# 스프레드시트 분석
npm run ssa:analyze

# 마법사 모드로 시작
npm run ssa:wizard
\`\`\`

### 제안서 자동 생성 사용

\`\`\`bash
# 웹 UI 사용 (권장)
npm run web:dev
# → http://localhost:3000/tools/proposal 접속

# CLI 사용
npm run proposal:learn -- --template ./template.pptx --scenario ./scenario.yaml
npm run proposal:import -- --scenario ./scenario.yaml --canva-template "business-proposal"
npm run proposal:improve -- --file ./old-proposal.pptx --grade A
\`\`\`
    `
  },
  {
    id: 'ssa-formula-conversion',
    title: 'SSA 수식 변환 예시',
    category: 'SSA',
    keywords: ['수식', 'formula', 'vlookup', 'sumif', '변환', 'apps script'],
    content: `
## 🔧 수식 변환 예시

### VLOOKUP 변환

**기존 수식:**
\`\`\`
=VLOOKUP(A2, Sheet2!A:C, 3, FALSE)
\`\`\`

**Apps Script 변환:**
\`\`\`javascript
function vlookupReplace(searchKey, range, columnIndex) {
  const data = range.getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === searchKey) {
      return data[i][columnIndex - 1];
    }
  }
  return "Not Found";
}
\`\`\`

### SUMIF 변환

**기존 수식:**
\`\`\`
=SUMIF(A:A, "조건", B:B)
\`\`\`

**Apps Script 변환:**
\`\`\`javascript
function sumIfReplace(range, criteria, sumRange) {
  const criteriaData = range.getValues();
  const sumData = sumRange.getValues();
  let total = 0;

  for (let i = 0; i < criteriaData.length; i++) {
    if (criteriaData[i][0] === criteria) {
      total += sumData[i][0];
    }
  }
  return total;
}
\`\`\`
    `
  },
  {
    id: 'ssa-implementation',
    title: 'SSA 구현 단계',
    category: 'SSA',
    keywords: ['구현', 'implementation', '단계', 'phase', '테스트', '배포'],
    content: `
## 🎯 SSA 구현 단계

### Phase 1: 분석 및 설계
- 모든 시트 목록 작성
- 각 시트별 수식 추출
- 시트 간 참조 관계 매핑
- 데이터 흐름도 작성

### Phase 2: 개발
- 유틸리티 함수 작성
- 수식별 변환 함수 작성
- 메인 실행 함수 통합

### Phase 3: 테스트 및 검증
- 샘플 데이터로 단위 테스트
- 실제 데이터로 통합 테스트
- 기존 수식 결과와 비교 검증

### Phase 4: 배포 및 모니터링
- 백업 생성
- 단계적 배포
- 실행 로그 모니터링
    `
  },
  {
    id: 'ssa-success-criteria',
    title: 'SSA 성공 기준',
    category: 'SSA',
    keywords: ['성공', 'success', '기준', '성능', '요구사항'],
    content: `
## ✅ SSA 성공 기준

### 기능적 요구사항
- 모든 수식이 Apps Script로 정확히 전환됨
- 기존 수식과 동일한 결과값 출력
- 자동 실행 트리거가 정상 작동
- 오류 발생 시 알림 및 로그 기록

### 성능 요구사항
- 전체 실행 시간 6분 이내 (Apps Script 제한)
- 수식 대비 50% 이상 성능 향상
- 메모리 사용량 최적화

### 유지보수성
- 코드 주석 및 문서화 완료
- 함수별 단위 테스트 작성
- 에러 핸들링 구현

### 제안서 생성 성공 지표

**시간 절감:**
- 제안서 제작 시간: 4시간 → 50분 (79% 감소)
- 디자인 수정 시간: 2시간 → 10분 (92% 감소)

**품질 향상:**
- 브랜드 일관성: 60% → 100%
- 슬라이드 품질 등급: D → A
    `
  },
  {
    id: 'ssa-risks',
    title: 'SSA 리스크 및 대응',
    category: 'SSA',
    keywords: ['리스크', 'risk', '대응', '문제', '해결'],
    content: `
## 🚨 SSA 리스크 및 대응 방안

### 리스크 1: Apps Script 실행 시간 제한 (6분)
**대응:**
- 배치 처리로 분할 실행
- 시트별로 별도 함수 작성
- 트리거로 순차 실행

### 리스크 2: 복잡한 배열 수식 전환 어려움
**대응:**
- 단계별 분해하여 전환
- 필요시 일부 수식은 유지
- 대체 로직 설계

### 리스크 3: 데이터 손실 가능성
**대응:**
- 전환 전 전체 백업
- 단계적 롤아웃
- 롤백 계획 수립
    `
  },
  {
    id: 'ssa-project-structure',
    title: 'SSA 프로젝트 구조',
    category: 'SSA',
    keywords: ['ssa', '구조', 'structure', 'apps script', '제안서'],
    content: `
## 📦 SSA 프로젝트 구조

\`\`\`
ssa/
├── core/                    # Apps Script 생성 핵심 엔진
│   ├── analyzer.js         # 스프레드시트 분석기
│   ├── classifier.js       # 수식 분류기
│   ├── converter.js        # Apps Script 변환기
│   └── generator.js        # 코드 생성기
│
├── generators/             # Apps Script 생성기 모듈
│   ├── data-layer.js       # 데이터 레이어 생성
│   ├── business-logic.js   # 비즈니스 로직 생성
│   ├── infrastructure.js   # 인프라 생성
│   └── ui-layer.js         # UI 레이어 생성
│
├── lib/                    # Apps Script 라이브러리
│   ├── formula-parser.js   # 수식 파서
│   ├── dependency-graph.js # 의존성 그래프
│   └── template-engine.js  # 템플릿 엔진
│
├── templates/              # Apps Script 템플릿
│   ├── core/               # 핵심 템플릿
│   ├── data-layer/         # 데이터 레이어
│   ├── business-logic/     # 비즈니스 로직
│   └── infrastructure/     # 인프라
│
└── proposal-generator/     # 제안서 자동 생성 시스템
    ├── core/
    │   ├── style-learner.js      # PPT 스타일 학습 엔진
    │   ├── content-parser.js     # 콘텐츠 파싱 및 구조화
    │   ├── slide-generator.js    # 슬라이드 자동 생성
    │   └── quality-checker.js    # 품질 진단 시스템
    │
    ├── templates/
    │   ├── slide-types/          # 슬라이드 타입 템플릿
    │   ├── layouts/              # 레이아웃 템플릿
    │   └── scenarios/            # 시나리오 예제
    │
    └── lib/
        ├── canva-adapter.js      # Canva MCP 연동
        ├── ppt-parser.js         # PowerPoint 파싱
        └── yaml-parser.js        # YAML 시나리오 파싱
\`\`\`
    `
  },
  {
    id: 'proposal-generator-detailed',
    title: '제안서 자동 생성 상세',
    category: 'SSA',
    keywords: ['제안서', 'proposal', 'ppt', 'canva', 'ai', '스타일'],
    content: `
## 🎨 제안서 자동 생성 시스템 상세

### 해결하는 문제

- ❌ 제안서 제작에 평균 4-8시간 소요
- ❌ 디자인 일관성 유지의 어려움
- ❌ 반복적인 슬라이드 레이아웃 작업
- ❌ 브랜드 가이드라인 수동 적용

### 기대 효과

- ✅ 제안서 제작 시간 80% 단축 (4시간 → 50분)
- ✅ 브랜드 디자인 일관성 100% 유지
- ✅ 반복 작업 자동화로 창의적 작업에 집중
- ✅ AI 기반 콘텐츠 자동 배치 및 최적화

### 📝 콘텐츠 입력 방식

**1. 자유 텍스트 입력 (가장 빠름, 5분)**
간단한 아이디어나 메모를 입력하면 AI가 구조화

**2. 구조화 입력 (권장, 10-15분)**
YAML 형식으로 슬라이드별 상세 정보 입력

**3. 파일 업로드 (10분)**
기존 문서 (.txt, .docx, .md) 파일 업로드

**4. 대화형 입력 (가장 상세, 20분)**
Claude와 대화하며 내용 구체화

### 🛠 기술 스택

**필수 도구:**
- Claude Code - AI 분석 및 자동화 엔진
- Canva MCP - 디자인 생성 및 편집
- Node.js (22.16+) - MCP 서버 실행 환경

**계정 요구사항:**
- ✅ Claude Pro 또는 Team 구독
- ✅ Canva Pro 또는 Enterprise 계정
    `
  },
  {
    id: 'proposal-features',
    title: '제안서 생성 주요 기능',
    category: 'SSA',
    keywords: ['제안서', '기능', 'features', '스타일', '품질'],
    content: `
## 🎯 제안서 생성 주요 기능

### 1. 스타일 학습 엔진
- 색상 팔레트 자동 추출
- 폰트 스타일 분석
- 레이아웃 패턴 인식
- 디자인 요소 분류

### 2. 콘텐츠 자동 배치
- 텍스트 분량 자동 조절
- 이미지 최적 위치 선택
- 차트/그래프 자동 생성
- 아이콘 자동 매칭

### 3. 품질 진단
- 디자인 일관성 검사
- 가독성 점수 측정
- 메시지 전달력 평가
- 개선 제안 생성

### 📊 성공 지표 (KPI)

**시간 절감:**
- 제안서 제작 시간: 4시간 → 50분 (79% 감소)
- 디자인 수정 시간: 2시간 → 10분 (92% 감소)

**품질 향상:**
- 브랜드 일관성: 60% → 100%
- 슬라이드 품질 등급: D → A

**사용성:**
- 학습 시간: 30분 이내
- 재사용률: 80% 이상
    `
  },
  {
    id: 'proposal-examples',
    title: '제안서 생성 사용 예시',
    category: 'SSA',
    keywords: ['제안서', '예시', 'example', '사용법'],
    content: `
## 📚 제안서 생성 사용 예시

### 예시 1: 신규 제안서 작성 (AI 스타일 학습)

\`\`\`bash
# 1. 템플릿 스타일 학습
npm run proposal:learn -- --template ./company-template.pptx

# 2. 시나리오 작성 (자유 텍스트)
# scenario.txt 파일에 아이디어 작성

# 3. 제안서 생성
npm run proposal:generate -- --scenario ./scenario.txt --method ai-learning

# 결과: 25분 만에 완성된 제안서
\`\`\`

### 예시 2: 기존 PPT 개선 (진단 및 개선)

\`\`\`bash
# 1. 기존 PPT 진단
npm run proposal:diagnose -- --file ./old-proposal.pptx

# 진단 결과:
# - 디자인 등급: D
# - 개선 필요 사항: 12개
# - 예상 개선 시간: 40분

# 2. 자동 개선
npm run proposal:improve -- --file ./old-proposal.pptx --grade A

# 결과: D등급 → A등급 변환
\`\`\`

### 예시 3: Canva 템플릿 활용 (직접 임포트)

\`\`\`bash
# Canva 템플릿으로 빠른 생성
npm run proposal:import -- --scenario ./scenario.yaml --canva-template "business-proposal"

# 결과: 15분 만에 전문 디자인 제안서
\`\`\`
    `
  },
  {
    id: 'proposal-troubleshooting',
    title: '제안서 생성 문제 해결',
    category: 'SSA',
    keywords: ['제안서', '문제', 'troubleshooting', 'canva', '해결'],
    content: `
## 🆘 제안서 생성 문제 해결

### Q: Canva 연동이 안 됩니다
**A:** Canva API 키와 Claude MCP 설정을 확인하세요
- Canva Pro 계정이 필요합니다
- MCP 서버가 실행 중인지 확인하세요

### Q: 스타일 학습이 정확하지 않습니다
**A:** 템플릿 PPT에 일관된 디자인이 있는지 확인하세요
- 최소 5개 이상의 슬라이드 필요
- 색상과 폰트가 일관되게 사용되어야 합니다

### Q: 생성 속도가 느립니다
**A:** 슬라이드 수를 줄이거나 간단한 레이아웃 사용을 권장합니다
- 한 번에 최대 50페이지까지 생성 권장
- 복잡한 애니메이션은 자동으로 단순화됩니다

### ⚠️ 제약사항

- Canva MCP는 Canva Pro 계정 필요
- 일부 고급 PowerPoint 효과는 변환 시 단순화될 수 있음
- 한 번에 최대 50페이지까지 생성 권장
    `
  },
  {
    id: 'ssa-workflow-integration',
    title: 'SSA 워크플로우 통합',
    category: 'SSA',
    keywords: ['워크플로우', 'workflow', '통합', '10단계', '활용'],
    content: `
## 🔄 워크플로우에서 SSA 활용

AutomationMaster의 10단계 워크플로우가 각 단계에서 SSA 생성기를 자동으로 제안합니다:

### 1-2단계: 아이디어 발굴 및 PRD 작성
- AutomationMaster 가이드만 활용
- SSA는 아직 사용하지 않음

### 3단계: 시스템 기획서 작성
✨ **SSA 백엔드 생성기 활용!**

기획서에서 데이터 모델을 추출하여 Supabase 스키마 자동 생성

\`\`\`
"백엔드 생성기로 Supabase 스키마를 자동 생성하시겠습니까?"
→ Yes → [SSA backend-generator 실행] → Supabase 스키마 생성 완료!
\`\`\`

### 4단계: UI/UX 설계
✨ **SSA 프론트엔드 생성기 활용!**

3단계에서 생성한 스키마로 UI 컴포넌트 자동 생성

### 5단계: 기술 스택 선정
✨ **SSA 풀스택 생성기 활용! (최고 추천)**

완전한 앱을 5분 안에 생성:
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
    `
  },
  {
    id: 'ssa-generators-detailed',
    title: 'SSA 생성기 상세 가이드',
    category: 'SSA',
    keywords: ['생성기', '풀스택', '백엔드', '프론트엔드', '마이그레이션'],
    content: `
## 🎯 SSA 생성기 상세 가이드

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
\`\`\`bash
npm run ssa:fullstack -- generate --wizard
\`\`\`

### 2. 백엔드 생성기 🔧
**V0/React 코드를 Supabase 백엔드로 자동 변환**

**특징:**
- 코드 분석 및 모델 추출
- Supabase SQL 스키마 생성
- RLS 보안 정책
- TypeScript 타입 정의
- 성능 최적화 (인덱스, View)
- 실시간 구독 설정

**사용:**
\`\`\`bash
npm run ssa:backend -- --file app.tsx --name "My Backend"
\`\`\`

**생성되는 것:**
- \`migration.sql\` - 완전한 Supabase SQL 스키마
- \`types.ts\` - TypeScript 타입 정의
- \`SETUP_GUIDE.md\` - 단계별 설정 가이드

### 3. 프론트엔드 생성기 🎨
**Supabase 스키마에서 React/Next.js 애플리케이션 생성**

**특징:**
- React/Next.js 컴포넌트
- shadcn/ui 통합
- React Query 데이터 훅스
- 인증 시스템
- Middle Layer (Zustand, 미들웨어)
- 원클릭 자동 설정

**사용:**
\`\`\`bash
npm run ssa:frontend -- --file schema.sql --name "My Frontend" --ui shadcn --auto-setup
\`\`\`

**결과:** React/Next.js 완전한 관리자 패널

### 4. Google Sheets 마이그레이션 📊
**Google Sheets를 Supabase PostgreSQL로 자동 마이그레이션**

**특징:**
- 구조 자동 분석
- 정규화 변환 (차원 + 팩트 테이블)
- 관계 보존 (외래키)
- 성능 최적화 (Materialized View)
- 한국어 지원
- 실시간 분석 뷰

**사용:**
\`\`\`bash
npm run ssa:migrate
\`\`\`

**결과:** 정규화된 PostgreSQL 데이터베이스
    `
  },
  {
    id: 'ssa-scenarios',
    title: 'SSA 사용 시나리오',
    category: 'SSA',
    keywords: ['시나리오', 'scenario', '예제', '활용', 'use case'],
    content: `
## 💡 SSA 사용 시나리오

### 시나리오 1: 완전히 새로운 프로젝트

\`\`\`bash
# 1. 프로젝트 초기화
npm run init

# 2. 워크플로우 시작
npm run workflow

# 3. 3단계에서 기획서 작성 후
#    → SSA 백엔드 생성기로 스키마 생성

# 4. 5단계에서
#    → SSA 풀스택 생성기로 완전한 앱 생성

# 5. 생성된 앱에서 개발 시작!
\`\`\`

### 시나리오 2: 기존 Google Sheets 데이터 활용

\`\`\`bash
# 1. Google Sheets 마이그레이션
npm run ssa:migrate

# 2. 생성된 스키마로 프론트엔드 생성
npm run ssa:frontend -- --file schema.sql --name "Data Manager"

# 3. 완성!
\`\`\`

### 시나리오 3: V0 코드를 프로덕션 앱으로

\`\`\`bash
# 1. V0에서 받은 코드를 백엔드로 변환
npm run ssa:backend -- --file v0-app.tsx --name "My Backend"

# 2. 생성된 스키마로 프론트엔드 재생성
npm run ssa:frontend -- --file migration.sql --name "My Frontend"

# 3. 프로덕션 레디 앱 완성!
\`\`\`

### 시나리오 4: PDF 매출 보고서 자동화

\`\`\`bash
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
\`\`\`
    `
  },
  {
    id: 'ssa-tools',
    title: 'SSA 추출 도구',
    category: 'SSA',
    keywords: ['도구', 'tools', 'pdf', 'hwp', 'telegram', '추출'],
    content: `
## 🔧 SSA 추출 도구

### PDF 추출 도구 📄

**기능:**
- PDF에서 구조화된 데이터 추출
- 매출 보고서 자동 파싱
- 제품 카탈로그 추출
- Google Sheets로 직접 마이그레이션
- 일괄 처리 지원

**웹 UI:** http://localhost:3000/tools/pdf

### HWP 추출 도구 📝

**기능:**
- HWP 파일에서 텍스트 추출
- Python Flask 서비스 자동 시작
- 텍스트 파일로 저장
- 일괄 처리 지원

**웹 UI:** http://localhost:3000/tools/hwp

### Telegram 봇 🤖

**기능:**
- 실시간 매출 분석 리포트
- AI 기반 매출 예측
- PDF 리포트 자동 생성
- 이메일 자동 발송
- 정기 리포트 스케줄링

**사용:**
\`\`\`bash
npm run tools:telegram
\`\`\`

**명령어:**
- \`/start\` - 봇 시작 및 환영 메시지
- \`/report\` - 실시간 매출 분석 리포트
- \`/predict\` - AI 기반 30일 매출 예측
- \`/generate_report\` - PDF 리포트 생성
- \`/send_report [이메일]\` - 리포트 이메일 발송
- \`/schedule_report\` - 정기 리포트 설정
- \`/status\` - 시스템 상태 확인
- \`/help\` - 상세 도움말

**설정:**
\`\`\`bash
# .env 파일에 추가
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id
BOT_POLLING=true
\`\`\`
    `
  },
  {
    id: 'ssa-apps-script-structure',
    title: 'Apps Script 파일 구조',
    category: 'SSA',
    keywords: ['apps script', '구조', 'file', 'google', 'structure'],
    content: `
## 📝 Apps Script 파일 구조

생성되는 Apps Script 프로젝트 구조:

\`\`\`
📁 Google Apps Script Project
│
├── 📁 Core (핵심 실행 로직)
│   ├── 📄 Main.gs
│   └── 📄 Config.gs
│
├── 📁 DataLayer (데이터 레이어)
│   ├── 📄 DataReader.gs
│   ├── 📄 DataWriter.gs
│   └── 📄 DataValidator.gs
│
├── 📁 BusinessLogic (비즈니스 로직)
│   ├── 📄 Calculator.gs
│   ├── 📄 LookupFunctions.gs
│   ├── 📄 ConditionalLogic.gs
│   ├── 📄 ArrayProcessor.gs
│   ├── 📄 DateTimeHandler.gs
│   └── 📄 TextProcessor.gs
│
├── 📁 SheetSpecific (시트별 로직)
│   ├── 📄 Sheet1_Logic.gs
│   ├── 📄 Sheet2_Logic.gs
│   └── 📄 Sheet3_Logic.gs
│
├── 📁 Infrastructure (인프라)
│   ├── 📄 Logger.gs
│   ├── 📄 ErrorHandler.gs
│   ├── 📄 NotificationService.gs
│   └── 📄 CacheManager.gs
│
├── 📁 Automation (자동화)
│   ├── 📄 TriggerManager.gs
│   ├── 📄 ScheduledJobs.gs
│   └── 📄 EventHandlers.gs
│
├── 📁 UI (사용자 인터페이스)
│   ├── 📄 CustomMenu.gs
│   ├── 📄 Dialogs.gs
│   └── 📄 Sidebar.gs
│
└── 📁 Utils (유틸리티)
    ├── 📄 CommonUtils.gs
    ├── 📄 RangeUtils.gs
    └── 📄 TestHelpers.gs
\`\`\`
    `
  }
]

export default function ManualPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = useMemo(() => {
    const cats = new Set<string>()
    manualSections.forEach(section => cats.add(section.category))
    return ['all', ...Array.from(cats)]
  }, [])

  const filteredSections = useMemo(() => {
    let sections = manualSections

    // Category filter
    if (selectedCategory !== 'all') {
      sections = sections.filter(s => s.category === selectedCategory)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      sections = sections.filter(section =>
        section.title.toLowerCase().includes(query) ||
        section.content.toLowerCase().includes(query) ||
        section.keywords.some(k => k.toLowerCase().includes(query))
      )
    }

    return sections
  }, [searchQuery, selectedCategory])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '시작하기':
        return <Home className="h-4 w-4" />
      case '사용 방법':
        return <Rocket className="h-4 w-4" />
      case '개발 프로세스':
        return <FileText className="h-4 w-4" />
      case '배포':
        return <GitBranch className="h-4 w-4" />
      case '고급':
        return <Wrench className="h-4 w-4" />
      case 'SSA':
        return <Wrench className="h-4 w-4 text-blue-600" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">사용 매뉴얼</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          AutomationMaster + SSA 통합 플랫폼 사용 가이드
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="매뉴얼 검색... (예: 배포, 워크플로우, SSA, 환경변수)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {category !== 'all' && getCategoryIcon(category)}
              {category === 'all' ? '전체' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredSections.length}개의 검색 결과
        </div>
      )}

      {/* Manual Sections */}
      <div className="space-y-6">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">검색 결과가 없습니다</p>
            <p className="text-sm text-muted-foreground mt-2">
              다른 검색어를 시도해보세요
            </p>
          </div>
        ) : (
          filteredSections.map(section => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-4">
                {getCategoryIcon(section.category)}
                <div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {section.category}
                    </span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {section.keywords.slice(0, 3).map(keyword => (
                        <span
                          key={keyword}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              <div className="prose prose-sm max-w-none">
                <div
                  className="text-gray-700 whitespace-pre-wrap font-mono text-sm"
                  dangerouslySetInnerHTML={{
                    __html: section.content
                      .replace(/```bash\n/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>')
                      .replace(/```json\n/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>')
                      .replace(/```\n/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>')
                      .replace(/```/g, '</code></pre>')
                      .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
                      .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
                      .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                      .replace(/^\*\*(.*?)\*\*/gm, '<strong class="font-bold">$1</strong>')
                      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">$1</code>')
                      .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
                      .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4 list-decimal">$2</li>')
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-600" />
          빠른 링크
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <a
            href="#overview"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>개요</strong>
            <p className="text-sm text-muted-foreground">플랫폼 소개</p>
          </a>
          <a
            href="#getting-started"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>빠른 시작</strong>
            <p className="text-sm text-muted-foreground">설치 및 초기 설정</p>
          </a>
          <a
            href="#web-app"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>웹 애플리케이션</strong>
            <p className="text-sm text-muted-foreground">웹 UI 사용법</p>
          </a>
          <a
            href="#ssa-generators"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>SSA 생성기</strong>
            <p className="text-sm text-muted-foreground">코드 자동 생성</p>
          </a>
          <a
            href="#ssa-overview"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>SSA 개요</strong>
            <p className="text-sm text-muted-foreground">Smart Sheet Assistant</p>
          </a>
          <a
            href="#ssa-formula-conversion"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>수식 변환</strong>
            <p className="text-sm text-muted-foreground">VLOOKUP, SUMIF 등</p>
          </a>
          <a
            href="#10-steps"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>10단계 프로세스</strong>
            <p className="text-sm text-muted-foreground">개발 워크플로우</p>
          </a>
          <a
            href="#deployment"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>배포</strong>
            <p className="text-sm text-muted-foreground">Vercel 자동 배포</p>
          </a>
          <a
            href="#ssa-project-structure"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>SSA 프로젝트 구조</strong>
            <p className="text-sm text-muted-foreground">폴더 및 파일 구성</p>
          </a>
          <a
            href="#proposal-generator-detailed"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>제안서 생성 상세</strong>
            <p className="text-sm text-muted-foreground">입력 방식, 기술 스택</p>
          </a>
          <a
            href="#proposal-features"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>제안서 주요 기능</strong>
            <p className="text-sm text-muted-foreground">스타일 학습, 품질 진단</p>
          </a>
          <a
            href="#proposal-examples"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>제안서 사용 예시</strong>
            <p className="text-sm text-muted-foreground">실제 활용 예제</p>
          </a>
          <a
            href="#ssa-workflow-integration"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>워크플로우 통합</strong>
            <p className="text-sm text-muted-foreground">10단계에서 SSA 활용</p>
          </a>
          <a
            href="#ssa-generators-detailed"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>생성기 상세 가이드</strong>
            <p className="text-sm text-muted-foreground">Fullstack, Backend, Frontend</p>
          </a>
          <a
            href="#ssa-scenarios"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>사용 시나리오</strong>
            <p className="text-sm text-muted-foreground">실제 프로젝트 예시</p>
          </a>
          <a
            href="#ssa-tools"
            className="p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
          >
            <strong>추출 도구</strong>
            <p className="text-sm text-muted-foreground">PDF, HWP, Telegram</p>
          </a>
        </div>
      </div>
    </div>
  )
}
