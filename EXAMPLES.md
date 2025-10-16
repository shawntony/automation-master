# 💡 Automation Master 활용 예시

실제 사용 시나리오와 CLI 출력 예시를 모아놓은 문서입니다.

## 시나리오 1: 완전히 새로운 프로젝트 시작

### Step 1: 프로젝트 초기화

```bash
$ npm run init

┌────────────────────────────────────────┐
│  🚀 Automation Master 프로젝트 초기화 │
└────────────────────────────────────────┘

? 프로젝트 이름: todo-automation-app
? 기존 진행상황이 있다면 초기화할까요? No
⠋ 프로젝트 초기화 중...
✔ 프로젝트 초기화 완료!

✓ 프로젝트가 성공적으로 초기화되었습니다.
다음 명령어로 가이드를 시작하세요:
  npm run guide
```

### Step 2: 첫 단계 시작

```bash
$ npm run guide

┌────────────────────────────────────────┐
│  📚 단계 1: 아이디어 발굴 및 정의     │
└────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════╗
║  단계 1: 아이디어 발굴 및 정의
╚════════════════════════════════════════════════════════════════╝

📅 예상 소요 시간: 1-2주
📝 설명: 명확한 문제 정의 및 해결책 구상

📋 주요 작업:

  1.1. 문제 발견하기
     • 업무 중 반복적으로 하는 작업 찾기
     • 시간이 많이 걸리는 작업 찾기
     • 실수가 자주 발생하는 작업 찾기

  1.2. 문제 구체화하기
     • 누가 이 문제를 겪고 있나요?
     • 언제 이 문제가 발생하나요?
     • 얼마나 자주 발생하나요?
     • 현재 어떻게 해결하고 있나요?
     • 이 문제로 인해 얼마나 많은 시간을 낭비하나요?

  1.3. 해결책 구상하기
     • 자동화로 해결 가능한 부분 식별
     • 예상되는 효과 계산
     • 비슷한 솔루션 조사

🔧 사용할 MCP 서버:
  @task-master, @web-search, @memory, @github, sub-agent

✅ 체크리스트:
  [ ] Task Master에 프로젝트 등록됨
  [ ] 문제를 한 문장으로 설명할 수 있다
  [ ] 경쟁 제품 분석 완료
  [ ] 목표 사용자가 명확하다
  [ ] 기대 효과를 구체적으로 정의했다
  [ ] 메모리에 핵심 정보 저장됨

📄 산출물:
  • 아이디어 정의서 (idea-definition.md)
  • 경쟁사 분석 (competitive-analysis.md)
  • 사용자 니즈 분석 (user-needs.md)
  • 기술 가능성 검토 (tech-feasibility.md)

💻 CLI 명령어 예시:
  • task-master를 사용해서 새 프로젝트 시작
  • @web-search로 유사 솔루션 조사
  • sub-agent로 병렬 분석 작업

📊 진행 상태:
  상태: ⏳ pending
  체크리스트: 0% 완료

? 무엇을 하시겠습니까? (Use arrow keys)
❯ 단계 시작하기
  체크리스트 관리
  단계 완료 처리
  다음 단계로
  이전 단계로
  다른 단계로 이동
  환경변수 설정
  전체 현황 보기
  종료
```

사용자가 "단계 시작하기" 선택:

```bash
⠋ 작업 처리 중...
✔ 단계 1 시작됨!

✓ 단계 1이(가) 시작되었습니다.
체크리스트를 확인하며 진행해주세요.
```

### Step 3: 체크리스트 관리

```bash
$ npm run checklist -- --step 1

📋 단계 1 체크리스트:

  ☐ 1. Task Master에 프로젝트 등록됨
  ☐ 2. 문제를 한 문장으로 설명할 수 있다
  ☐ 3. 경쟁 제품 분석 완료
  ☐ 4. 목표 사용자가 명확하다
  ☐ 5. 기대 효과를 구체적으로 정의했다
  ☐ 6. 메모리에 핵심 정보 저장됨

? 완료한 항목을 선택하세요: (Press <space> to select, <a> to toggle all)
❯◯ Task Master에 프로젝트 등록됨
 ◉ 문제를 한 문장으로 설명할 수 있다
 ◉ 경쟁 제품 분석 완료
 ◯ 목표 사용자가 명확하다
 ◯ 기대 효과를 구체적으로 정의했다
 ◯ 메모리에 핵심 정보 저장됨

✓ 체크리스트가 업데이트되었습니다.
```

### Step 4: 단계 완료

```bash
$ npm run guide -- --step 1 --action complete

⠋ 작업 처리 중...
✔ 단계 1 완료!

✓ 축하합니다! 단계 1이(가) 완료되었습니다.
다음은 단계 2: PDR (Preliminary Design Review) 작성
```

## 시나리오 2: 환경변수 설정 (단계 3-5)

### Fullstack 프로젝트 환경변수 설정

```bash
$ npm run env

┌────────────────────────────┐
│  🔧 환경변수 설정          │
└────────────────────────────┘

? 프로젝트 타입을 선택하세요: (Use arrow keys)
  frontend (supabase, vercel, common)
  backend (supabase, common)
❯ fullstack (supabase, vercel, github, common)

"fullstack" 프리셋의 환경변수를 입력해주세요:

? SUPABASE_URL (Supabase 프로젝트 URL): https://myproject.supabase.co
? SUPABASE_ANON_KEY (Supabase Anonymous Key): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
? SUPABASE_SERVICE_ROLE_KEY (Supabase Service Role Key (서버용)):
? VERCEL_TOKEN (Vercel API Token): vercel_xxx
? VERCEL_ORG_ID (Vercel Organization ID):
? VERCEL_PROJECT_ID (Vercel Project ID):
? GITHUB_TOKEN (GitHub Personal Access Token): ghp_xxx
? GITHUB_REPO (GitHub Repository): myusername/todo-automation-app
? NODE_ENV (환경 설정): development
? PORT (서버 포트): 3000
? API_URL (API Base URL): http://localhost:3000/api

⠋ .env 파일 생성 중...
✔ .env 파일 생성 완료!

✓ 다음 파일들이 생성되었습니다:
  • C:\Users\gram\myautomation\automationmaster\.env
  • C:\Users\gram\myautomation\automationmaster\.env.staging
  • C:\Users\gram\myautomation\automationmaster\.env.production
```

### 다른 프로젝트에 적용

```bash
$ npm run env -- --preset frontend --target ../my-frontend-app

┌────────────────────────────┐
│  🔧 환경변수 설정          │
└────────────────────────────┘

"frontend" 프리셋의 환경변수를 입력해주세요:

? SUPABASE_URL (Supabase 프로젝트 URL): https://myproject.supabase.co
? SUPABASE_ANON_KEY (Supabase Anonymous Key): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
...

✔ .env 파일 생성 완료!

✓ 다음 파일들이 생성되었습니다:
  • C:\Users\gram\myautomation\my-frontend-app\.env
  • C:\Users\gram\myautomation\my-frontend-app\.env.staging
  • C:\Users\gram\myautomation\my-frontend-app\.env.production
```

### 환경변수 상태 확인

```bash
$ npm run env -- --check ../my-frontend-app

┌────────────────────────────────┐
│  🔍 환경변수 상태 확인        │
└────────────────────────────────┘

⠋ 환경변수 파일 확인 중...
✔ 확인 완료

✓ .env
  변수 개수: 6
  변수 목록: SUPABASE_URL, SUPABASE_ANON_KEY, VERCEL_TOKEN, NODE_ENV, PORT, API_URL

✓ .env.staging
  변수 개수: 6
  변수 목록: SUPABASE_URL, SUPABASE_ANON_KEY, VERCEL_TOKEN, NODE_ENV, PORT, API_URL

✓ .env.production
  변수 개수: 6
  변수 목록: SUPABASE_URL, SUPABASE_ANON_KEY, VERCEL_TOKEN, NODE_ENV, PORT, API_URL
```

## 시나리오 3: 중간 단계 재개

### 현재 상태 확인

```bash
$ npm run status

╔════════════════════════════════════════════════════════════════╗
║  프로젝트 로드맵: todo-automation-app
╚════════════════════════════════════════════════════════════════╝

📊 전체 진행률: 50.0%
✅ 완료: 5/10
🔄 진행 중: 1
⏳ 대기: 4
📅 시작일: 2025/01/10

단계별 상태:
  ✅ 1. 아이디어 발굴 및 정의 (1-2주)
  ✅ 2. PDR (Preliminary Design Review) 작성 (3-5일)
  ✅ 3. 시스템 기획서 작성 (1주)
  ✅ 4. UI/UX 설계 + Playwright 벤치마킹 (1-2주)
  ✅ 5. 기술 스택 선정 (2-3일)
  🔄 6. 프론트엔드 개발 (2-4주) ← 현재
  ⏳ 7. 백엔드 개발 + Supabase 직접 연동 (2-4주)
  ⏳ 8. 테스트 시나리오 및 테스팅 (1-2주)
  ⏳ 9. 배포 준비 + Vercel MCP 완전 활용 (3-5일)
  ⏳ 10. 배포 및 운영 + 지속적 자동화 (지속)

📌 다음 액션:
  • 체크리스트 확인 및 완료 표시
    npm run guide -- --step 6 --action checklist
  • 단계 완료 처리
    npm run guide -- --step 6 --action complete
```

### 특정 단계로 바로 이동

```bash
$ npm run guide -- --step 6

╔════════════════════════════════════════════════════════════════╗
║  단계 6: 프론트엔드 개발
╚════════════════════════════════════════════════════════════════╝

📅 예상 소요 시간: 2-4주
📝 설명: 컴포넌트 템플릿 기반 프론트엔드 개발

📋 주요 작업:

  6.1. 레이아웃 컴포넌트 개발
     • MainLayout
     • AuthLayout
     • DashboardLayout

  6.2. 인증 페이지 개발
     • Login
     • Register
     • ForgotPassword

  6.3. 주요 기능 페이지 개발
     • Dashboard
     • 기능별 페이지

  6.4. 상태 관리 및 API 연동
     • React Query 설정
     • Supabase 클라이언트
     • 커스텀 훅

...

📊 진행 상태:
  상태: 🔄 in_progress
  시작일: 2025/01/15
  체크리스트: 37% 완료
```

## 시나리오 4: 프로젝트 완성

### 마지막 단계 완료

```bash
$ npm run guide -- --step 10 --action complete

⠋ 작업 처리 중...
✔ 단계 10 완료!

✓ 축하합니다! 단계 10이(가) 완료되었습니다.

🎉 모든 단계를 완료했습니다! 프로젝트가 완성되었습니다!
```

### 최종 상태 확인

```bash
$ npm run status

╔════════════════════════════════════════════════════════════════╗
║  프로젝트 로드맵: todo-automation-app
╚════════════════════════════════════════════════════════════════╝

📊 전체 진행률: 100.0%
✅ 완료: 10/10
🔄 진행 중: 0
⏳ 대기: 0
📅 시작일: 2025/01/10

단계별 상태:
  ✅ 1. 아이디어 발굴 및 정의 (1-2주)
  ✅ 2. PDR (Preliminary Design Review) 작성 (3-5일)
  ✅ 3. 시스템 기획서 작성 (1주)
  ✅ 4. UI/UX 설계 + Playwright 벤치마킹 (1-2주)
  ✅ 5. 기술 스택 선정 (2-3일)
  ✅ 6. 프론트엔드 개발 (2-4주)
  ✅ 7. 백엔드 개발 + Supabase 직접 연동 (2-4주)
  ✅ 8. 테스트 시나리오 및 테스팅 (1-2주)
  ✅ 9. 배포 준비 + Vercel MCP 완전 활용 (3-5일)
  ✅ 10. 배포 및 운영 + 지속적 자동화 (지속)

🎊 프로젝트가 완전히 완료되었습니다!
```

## 시나리오 5: 다중 프로젝트 관리

### 프로젝트 A: Frontend만

```bash
cd project-a
npm init -y
npm install ../automationmaster
npm run init
# 프로젝트 이름: project-a-frontend

npm run env -- --preset frontend
# Supabase, Vercel 환경변수 설정
```

### 프로젝트 B: Backend만

```bash
cd ../project-b
npm init -y
npm install ../automationmaster
npm run init
# 프로젝트 이름: project-b-backend

npm run env -- --preset backend
# Supabase 환경변수 설정
```

### 프로젝트 C: Fullstack

```bash
cd ../project-c
npm init -y
npm install ../automationmaster
npm run init
# 프로젝트 이름: project-c-fullstack

npm run env -- --preset fullstack
# 모든 환경변수 설정
```

각 프로젝트는 독립적으로 진행상황을 관리합니다!

## 실전 팁

### 1. 매일 아침 루틴

```bash
# 1. 상태 확인
npm run status

# 2. 현재 단계 가이드 보기
npm run guide

# 3. 오늘 할 일 체크
npm run checklist
```

### 2. 단계 완료 전 체크리스트

```bash
# 체크리스트 확인
npm run checklist

# 모든 항목이 체크되었는지 확인 후
npm run guide -- --action complete
```

### 3. 환경변수 빠른 적용

```bash
# 기존 설정 재사용
npm run env -- --target ../new-project

# 프리셋만 변경
npm run env -- --preset backend --target ../backend-service
```

### 4. 문제 발생 시

```bash
# 1. 상태 확인
npm run status

# 2. 현재 단계 다시 보기
npm run guide

# 3. 필요시 초기화
npm run init
# "기존 진행상황이 있다면 초기화할까요?" → Yes
```

---

**이제 여러분의 차례입니다! 🚀**