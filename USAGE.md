# 🎓 Automation Master 사용 가이드

## 📚 목차

1. [빠른 시작](#빠른-시작)
2. [단계별 가이드](#단계별-가이드)
3. [환경변수 관리](#환경변수-관리)
4. [체크리스트 활용](#체크리스트-활용)
5. [고급 사용법](#고급-사용법)
6. [문제 해결](#문제-해결)

## 빠른 시작

### 1️⃣ 설치 및 초기화

```bash
# 저장소 클론 (또는 다운로드)
git clone <your-repo-url>
cd automationmaster

# 의존성 설치
npm install

# 프로젝트 초기화
npm run init
```

**출력 예시:**
```
? 프로젝트 이름: my-awesome-tool
? 기존 진행상황이 있다면 초기화할까요? No
✔ 프로젝트 초기화 완료!

✓ 프로젝트가 성공적으로 초기화되었습니다.
다음 명령어로 가이드를 시작하세요:
  npm run guide
```

### 2️⃣ 첫 번째 가이드 시작

```bash
npm run guide
```

인터랙티브 메뉴가 나타납니다:

```
╔════════════════════════════════════════════════════════╗
║  단계 1: 아이디어 발굴 및 정의
╚════════════════════════════════════════════════════════╝

📅 예상 소요 시간: 1-2주
📝 설명: 명확한 문제 정의 및 해결책 구상

...

? 무엇을 하시겠습니까?
  ❯ 단계 시작하기
    체크리스트 관리
    단계 완료 처리
    다음 단계로
    이전 단계로
    ...
```

## 단계별 가이드

### 단계 1: 아이디어 발굴 및 정의

#### 시작하기

```bash
npm run guide -- --step 1 --action start
```

#### 체크리스트 확인

```bash
npm run checklist -- --step 1
```

**체크리스트 항목:**
- [ ] Task Master에 프로젝트 등록됨
- [ ] 문제를 한 문장으로 설명할 수 있다
- [ ] 경쟁 제품 분석 완료
- [ ] 목표 사용자가 명확하다
- [ ] 기대 효과를 구체적으로 정의했다
- [ ] 메모리에 핵심 정보 저장됨

#### 완료하기

```bash
npm run guide -- --step 1 --action complete
```

### 단계 3: 시스템 기획서 작성 + 환경변수 설정

이 단계에서는 환경변수 설정이 중요합니다.

#### 환경변수 설정

```bash
npm run env
```

**대화형 프롬프트:**
```
? 프로젝트 타입을 선택하세요:
  ❯ frontend (supabase, vercel, common)
    backend (supabase, common)
    fullstack (supabase, vercel, github, common)

"fullstack" 프리셋의 환경변수를 입력해주세요:

? SUPABASE_URL (Supabase 프로젝트 URL): https://xxx.supabase.co
? SUPABASE_ANON_KEY (Supabase Anonymous Key): eyJhbGciOiJIUz...
? VERCEL_TOKEN (Vercel API Token): xxx
? GITHUB_TOKEN (GitHub Personal Access Token): ghp_xxx
? GITHUB_REPO (GitHub Repository): myuser/my-repo
? NODE_ENV (환경 설정): development
? PORT (서버 포트): 3000
? API_URL (API Base URL): http://localhost:3000/api

✔ .env 파일 생성 완료!

✓ 다음 파일들이 생성되었습니다:
  • C:\Users\gram\myautomation\automationmaster\.env
  • C:\Users\gram\myautomation\automationmaster\.env.staging
  • C:\Users\gram\myautomation\automationmaster\.env.production
```

#### 생성된 .env 파일 예시

```env
# 환경변수 설정
# 환경: development
# 생성일: 2025-01-15T10:30:00.000Z

# Supabase 데이터베이스 연결
# Supabase 프로젝트 URL
# 예시: https://xxx.supabase.co
# 필수
SUPABASE_URL=https://xxx.supabase.co

# Supabase Anonymous Key
# 예시: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# 필수
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vercel 배포 설정
# Vercel API Token
# 예시: xxx
# 필수
VERCEL_TOKEN=xxx

# 공통 설정
# 환경 설정
# 예시: development
# 필수
NODE_ENV=development

# 서버 포트
# 예시: 3000
PORT=3000

# API Base URL
# 예시: http://localhost:3000/api
# 필수
API_URL=http://localhost:3000/api
```

## 환경변수 관리

### 프로젝트에 환경변수 적용

기존 프로젝트에 환경변수를 적용하려면:

```bash
# 특정 경로에 생성
npm run env -- --target ../my-project

# 특정 프리셋 사용
npm run env -- --preset frontend --target ../my-frontend-project
```

### 환경변수 상태 확인

```bash
# 현재 프로젝트
npm run env -- --check .

# 다른 프로젝트
npm run env -- --check ../my-other-project
```

**출력 예시:**
```
✔ 확인 완료

✓ .env
  변수 개수: 8
  변수 목록: SUPABASE_URL, SUPABASE_ANON_KEY, VERCEL_TOKEN, ...

✓ .env.staging
  변수 개수: 8
  변수 목록: SUPABASE_URL, SUPABASE_ANON_KEY, VERCEL_TOKEN, ...

✗ .env.production (없음)
```

### 환경변수 템플릿 수정

`templates/env.template.json` 파일을 편집하여 새로운 변수를 추가할 수 있습니다:

```json
{
  "templates": {
    "custom": {
      "description": "커스텀 서비스",
      "variables": {
        "CUSTOM_API_KEY": {
          "description": "커스텀 API 키",
          "example": "xxx",
          "required": true
        }
      }
    }
  },
  "presets": {
    "custom-stack": ["supabase", "custom", "common"]
  }
}
```

## 체크리스트 활용

### 전체 체크리스트 보기

```bash
npm run checklist -- --step 3
```

### 특정 항목 체크

```bash
# 항목 0번 체크
npm run checklist -- --step 3 --item 0

# 항목 1번 체크 해제
npm run checklist -- --step 3 --item 1 --uncheck
```

### 인터랙티브 모드

```bash
npm run checklist
```

현재 단계의 체크리스트를 인터랙티브하게 관리할 수 있습니다.

## 고급 사용법

### 진행 상태 확인

```bash
npm run status
```

**출력 예시:**
```
╔════════════════════════════════════════════════════════════════╗
║  프로젝트 로드맵: my-awesome-tool
╚════════════════════════════════════════════════════════════════╝

📊 전체 진행률: 30.0%
✅ 완료: 3/10
🔄 진행 중: 1
⏳ 대기: 6
📅 시작일: 2025/01/15

단계별 상태:
  ✅ 1. 아이디어 발굴 및 정의 (1-2주)
  ✅ 2. PDR (Preliminary Design Review) 작성 (3-5일)
  ✅ 3. 시스템 기획서 작성 (1주)
  🔄 4. UI/UX 설계 + Playwright 벤치마킹 (1-2주) ← 현재
  ⏳ 5. 기술 스택 선정 (2-3일)
  ...

📌 다음 액션:
  • 체크리스트 확인 및 완료 표시
    npm run guide -- --step 4 --action checklist
  • 단계 완료 처리
    npm run guide -- --step 4 --action complete
```

### 특정 단계로 바로 이동

```bash
# 단계 7로 이동
npm run guide -- --step 7

# 단계 7 시작하기
npm run guide -- --step 7 --action start
```

### 진행상황 초기화

프로젝트를 처음부터 다시 시작하려면:

```bash
npm run init
# "기존 진행상황이 있다면 초기화할까요?" → Yes
```

## 문제 해결

### 의존성 오류

```bash
# 의존성 재설치
rm -rf node_modules
npm install
```

### 설정 파일 손상

```bash
# 진행상황 초기화
npm run init -- --reset

# 환경변수 재설정
npm run env
```

### 특정 단계 가이드가 보이지 않음

```bash
# 상태 확인
npm run status

# 특정 단계로 이동
npm run guide -- --step <number>
```

### 환경변수 파일이 생성되지 않음

```bash
# 권한 확인
ls -la

# 디렉토리 생성 권한 확인
mkdir test-dir
rmdir test-dir

# 환경변수 재생성
npm run env -- --target .
```

## 🎯 사용 팁

### 1. 단계별로 천천히 진행하기

각 단계를 완료하지 않고 다음으로 넘어가지 마세요. 체크리스트를 활용하여 빠뜨린 항목이 없는지 확인하세요.

### 2. 환경변수 미리 준비하기

단계 3에 도달하기 전에 필요한 API 키와 토큰을 미리 준비해두세요:
- Supabase 프로젝트 생성 및 URL/KEY 획득
- Vercel 계정 생성 및 토큰 발급
- GitHub Personal Access Token 생성

### 3. 정기적으로 상태 확인

```bash
# 매일 아침 상태 확인
npm run status

# 현재 단계 가이드 다시 보기
npm run guide
```

### 4. 노트 활용 (추후 구현)

각 단계에서 중요한 결정사항이나 메모를 저장할 수 있습니다.

### 5. 여러 프로젝트 관리

각 프로젝트 디렉토리에 별도의 `automationmaster`를 설치하여 독립적으로 관리하세요.

## 📞 지원

문제가 발생하거나 기능 요청이 있다면:
1. GitHub Issues에 등록
2. README.md의 FAQ 확인
3. planning.md 원본 문서 참조

---

**Happy Building! 🚀**
