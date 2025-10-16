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
- **마이그레이션**: Google Sheets → Supabase PostgreSQL

> 📖 **SSA 통합 가이드**: [SSA_INTEGRATION.md](./SSA_INTEGRATION.md)

## ✨ 주요 기능

- 🔄 **대화형 워크플로우** - 단계별 정보 입력 → 프롬프트 생성 → 결과 확인 → 승인 프로세스
- 📋 **10단계 개발 가이드** - 아이디어부터 배포까지 체계적인 단계별 안내
- 🤖 **AI 기반 분석** - 프로젝트 폴더 분석, 진단, AI 리더십 제공
- 📝 **MCP 프롬프트 생성** - 각 단계별 실행 가능한 Claude Code 프롬프트 자동 생성
- 🔧 **환경변수 관리** - 템플릿 기반 환경변수 중앙 관리 및 자동 생성
- ✅ **진행상황 추적** - 각 단계별 체크리스트와 진행률 관리
- 💻 **인터랙티브 CLI** - 사용하기 쉬운 대화형 인터페이스
- 📊 **프로젝트 대시보드** - 전체 프로젝트 진행 현황 한눈에 확인
- ⭐ **SSA 코드 생성** - 풀스택/백엔드/프론트엔드 자동 생성

## 📦 설치

```bash
npm install
```

## 🚀 시작하기

### 1. 프로젝트 초기화

```bash
npm run init
```

프로젝트 이름을 입력하고 진행상황 추적을 시작합니다.

### 2. 가이드 시작

```bash
npm run guide
```

인터랙티브 가이드가 시작됩니다. 현재 단계의 상세 정보를 확인하고 다양한 액션을 수행할 수 있습니다.

### 3. 진행 상태 확인

```bash
npm run status
```

전체 프로젝트의 진행 상태와 다음 액션을 확인합니다.

### 4. 환경변수 설정

```bash
npm run env
```

프로젝트 타입에 맞는 환경변수를 설정하고 `.env` 파일을 자동 생성합니다.

### 5. 🔥 대화형 워크플로우 (추천!)

```bash
npm run workflow
```

**가장 강력한 기능!** 각 단계마다 정보 입력 → 프롬프트 생성 → Claude Code 실행 → 결과 확인 → 승인하는 전체 프로세스를 자동화합니다.

> 📖 **상세 가이드**: [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md) 참고

### 6. 🌐 웹 애플리케이션 (SSA 통합!)

```bash
# 웹앱 의존성 설치
npm run web:install

# 웹앱 실행
npm run web:dev
```

**아름다운 웹 UI로 사용하세요!** 브라우저에서 http://localhost:3000 을 열면:
- 📊 **시각적 대시보드**: 전체 진행 상황을 그래프와 차트로 확인
- 🔄 **웹 기반 워크플로우**: 폼 입력 → 프롬프트 생성 → 클립보드 복사
- 🎨 **현대적인 UI/UX**: Next.js 14 + Tailwind CSS 기반 반응형 디자인
- ⭐ **SSA 생성기**: 풀스택/백엔드/프론트엔드 생성 웹 UI
- 🛠️ **SSA 도구**: Google Sheets 마이그레이션 도구

> 📖 **웹앱 가이드**: [WEB_APP_GUIDE.md](./WEB_APP_GUIDE.md) 참고

### 7. ⚡ SSA 생성기 사용

```bash
# 풀스택 앱 5분 생성 (마법사 모드)
npm run ssa:fullstack -- generate --wizard

# 백엔드 생성
npm run ssa:backend -- --file app.tsx --name "My Backend"

# 프론트엔드 생성
npm run ssa:frontend -- --file schema.sql --name "My Frontend"

# Google Sheets 마이그레이션
npm run ssa:migrate
```

> 📖 **SSA 통합 가이드**: [SSA_INTEGRATION.md](./SSA_INTEGRATION.md) 참고

## 📖 상세 사용법

### 특정 단계로 이동

```bash
npm run guide -- --step 3
```

### 단계 시작하기

```bash
npm run guide -- --step 3 --action start
```

### 단계 완료하기

```bash
npm run guide -- --step 3 --action complete
```

### 체크리스트 관리

```bash
npm run checklist -- --step 3
```

특정 항목 체크:
```bash
npm run checklist -- --step 3 --item 0
```

### 환경변수 관리

특정 프리셋으로 설정:
```bash
npm run env -- --preset fullstack
```

프로젝트 환경변수 상태 확인:
```bash
npm run env -- --check ./your-project-path
```

특정 경로에 생성:
```bash
npm run env -- --preset frontend --target ./my-frontend-project
```

## 📁 프로젝트 구조

```
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
```

## 🔧 환경변수 템플릿

`templates/env.template.json` 파일에서 환경변수 템플릿을 관리합니다.

### 지원하는 프리셋:

- **frontend**: 프론트엔드 프로젝트 (Supabase, Vercel)
- **backend**: 백엔드 프로젝트 (Supabase)
- **fullstack**: 풀스택 프로젝트 (Supabase, Vercel, GitHub)

### 템플릿 구조:

```json
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
```

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

## 💡 활용 예시

### 새 프로젝트 시작

```bash
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
```

### 진행 중인 프로젝트 재개

```bash
# 현재 상태 확인
npm run status

# 현재 단계 가이드 보기
npm run guide

# 체크리스트 확인
npm run checklist
```

### 환경변수 업데이트

```bash
# 설정 다시 하기
npm run env

# 다른 프로젝트에 적용
npm run env -- --target ../my-other-project
```

## 🎯 주요 특징

### 1. 진행상황 자동 저장
모든 진행 상태가 `config/progress.json`에 자동으로 저장됩니다.

### 2. 다중 환경 지원
`.env`, `.env.development`, `.env.staging`, `.env.production` 파일을 자동으로 생성합니다.

### 3. 유효성 검증
환경변수 필수 항목과 옵션 값을 자동으로 검증합니다.

### 4. 체크리스트 관리
각 단계별 체크리스트를 관리하여 빠뜨리지 않고 진행할 수 있습니다.

### 5. MCP 서버 가이드
각 단계에서 사용할 MCP 서버와 명령어 예시를 제공합니다.

## 🔄 워크플로우 예시

```
초기화 → 1단계 시작 → 체크리스트 완료 → 1단계 완료
       ↓
2단계 시작 → 환경변수 설정 → 체크리스트 완료 → 2단계 완료
       ↓
3단계 시작 → ...
       ↓
...
       ↓
10단계 완료 → 프로젝트 완성! 🎉
```

## 🔧 문제 해결

### 워크플로우가 계속 반복되나요?

"수정/보완 후 다시 확인 (retry)"을 계속 선택하면 같은 단계가 반복됩니다. 이것은 의도된 기능입니다.

**해결 방법**:
- ✅ **"이 단계는 이정도로 충분함"** 선택 → 다음 단계로 진행
- ✅ **"워크플로우 종료"** 선택 → 저장하고 나중에 재개
- ✅ **10번 재시도 후** → 자동으로 강제 진행 옵션 제공

> 📖 **상세 가이드**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 참고

### 기타 문제

일반적인 문제와 해결 방법은 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)를 참고하세요:
- npm install 실패
- 웹앱 시작 오류
- 환경변수 설정 문제
- MCP 서버 오류
- 프로젝트 분석 오류

## 🛠️ 개발자 정보

이 도구는 `planning.md` 문서를 기반으로 개발되었으며, MCP 서버와 Sub Agent를 활용한 자동화 툴 개발을 지원합니다.

## 📝 라이선스

MIT

## 🤝 기여

기여는 언제나 환영합니다! 이슈나 PR을 자유롭게 제출해주세요.

---

**Happy Coding! 🚀**
