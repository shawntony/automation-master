# 🌐 Automation Master - 웹 애플리케이션 가이드

**CLI뿐만 아니라 아름다운 웹 인터페이스로도 사용할 수 있습니다!**

## 🚀 빠른 시작

### 1. 웹앱 의존성 설치

```bash
npm run web:install
```

### 2. 개발 서버 실행

```bash
npm run web:dev
```

브라우저에서 http://localhost:3000 을 열면 웹앱이 실행됩니다!

### 3. 프로덕션 빌드

```bash
npm run web:build
npm run web:start
```

---

## 📱 웹앱 주요 기능

### 🏠 홈페이지
- **아름다운 랜딩 페이지**: 프로젝트 개요와 주요 기능 소개
- **빠른 액션 버튼**: 워크플로우 시작, 대시보드 보기
- **10단계 프로세스 요약**: 전체 개발 단계 한눈에 확인

### 🔄 대화형 워크플로우 (http://localhost:3000/workflow)
- **프로젝트 설정**: 프로젝트 이름 입력하고 시작
- **단계별 정보 입력**: 각 단계마다 필요한 정보를 대화형 폼으로 입력
- **실시간 프롬프트 생성**: 입력한 정보로 MCP 활용 프롬프트 자동 생성
- **진행률 시각화**: 전체 진행 상황을 막대 그래프로 표시
- **단계 간 이동**: 완료된 단계와 진행 중인 단계 한눈에 확인
- **클립보드 복사**: 프롬프트를 원클릭으로 복사
- **단계 완료 추적**: 각 단계 완료 시 자동으로 다음 단계로 진행

#### 워크플로우 사용 방법
```
1. 프로젝트 이름 입력 → "워크플로우 시작하기" 클릭
2. 단계 1 정보 입력 (문제, 타겟 사용자, 경쟁사 등)
3. "프롬프트 생성하기" 클릭
4. 생성된 프롬프트를 "📋 클립보드에 복사" 클릭
5. Claude Code에 프롬프트 붙여넣어 실행
6. 작업 완료 후 "단계 완료 및 다음으로" 클릭
7. 단계 2로 자동 진행 → 반복
```

### 📊 프로젝트 대시보드 (http://localhost:3000/dashboard)
- **전체 진행률**: 10단계 중 현재 진행 상황 퍼센트로 표시
- **완료된 단계**: 몇 개 단계가 완료되었는지 카운트
- **현재 단계**: 지금 진행 중인 단계 강조 표시
- **빠른 액션**: 워크플로우로 바로 이동
- **단계별 진행 상황**: 각 단계의 완료율과 상태 (대기/진행중/완료)
- **프로젝트 인사이트**: AI 기반 분석 결과와 진행 상태
- **추천 액션**: 다음에 해야 할 일 자동 제안

#### 대시보드 기능
- ✅ **완료 단계**: 초록색으로 표시, 100% 진행률
- 🔄 **진행 중 단계**: 파란색으로 표시, 현재 진행률
- ⏳ **대기 단계**: 회색으로 표시, 0% 진행률
- 📈 **전체 진행률 그래프**: 시각적으로 프로젝트 상태 확인
- 💡 **인사이트 & 추천**: AI가 분석한 프로젝트 상태와 다음 액션

---

## 🎨 웹앱 디자인 특징

### 현대적인 UI/UX
- **Tailwind CSS**: 깔끔하고 반응형 디자인
- **그라디언트 효과**: 아름다운 컬러 그라디언트
- **애니메이션**: 부드러운 전환 효과
- **반응형**: 모바일, 태블릿, 데스크톱 모두 지원
- **다크 모드 준비**: 다크 모드 전환 가능 (CSS 변수 기반)

### 직관적인 네비게이션
- **상단 헤더**: 로고, 메뉴, 네비게이션
- **빵가루 네비게이션**: 현재 위치 명확히 표시
- **이전으로 버튼**: 모든 페이지에서 홈으로 쉽게 돌아가기

### 시각적 피드백
- **진행률 바**: 실시간 진행 상황 시각화
- **상태 아이콘**: 완료/진행중/대기 상태를 아이콘으로 표시
- **색상 코딩**:
  - 🟢 초록색 = 완료
  - 🔵 파란색 = 진행 중
  - ⚪ 회색 = 대기 중
  - 🟡 노란색 = 주의 필요

---

## 💻 기술 스택

### 프론트엔드
- **Next.js 14**: 최신 React 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 우선 CSS
- **Lucide React**: 아이콘 라이브러리
- **Radix UI**: 접근성 좋은 UI 컴포넌트

### 아키텍처
- **App Router**: Next.js 14 최신 라우팅 시스템
- **Server Components**: 성능 최적화
- **Client Components**: 인터랙티브 UI
- **API Routes**: CLI 로직과 통합

---

## 🔧 개발 가이드

### 프로젝트 구조

```
web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 홈페이지
│   ├── workflow/          # 워크플로우 페이지
│   │   └── page.tsx
│   ├── dashboard/         # 대시보드 페이지
│   │   └── page.tsx
│   ├── api/               # API 라우트
│   │   └── progress/
│   │       └── route.ts
│   ├── layout.tsx         # 루트 레이아웃
│   └── globals.css        # 글로벌 스타일
├── lib/                   # 유틸리티 함수
│   └── storage.ts         # 스토리지 로직
├── components/            # 재사용 컴포넌트 (향후 확장)
├── public/                # 정적 파일
├── next.config.js         # Next.js 설정
├── tailwind.config.js     # Tailwind CSS 설정
├── tsconfig.json          # TypeScript 설정
└── package.json           # 의존성
```

### 로컬 개발

```bash
# 웹 디렉토리로 이동
cd web

# 의존성 설치
npm install

# 개발 서버 시작 (hot reload)
npm run dev

# TypeScript 체크
npm run build

# 프로덕션 빌드
npm run build && npm run start
```

### 새 페이지 추가

```typescript
// web/app/new-page/page.tsx
export default function NewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <h1>새 페이지</h1>
      </div>
    </div>
  )
}
```

### API 라우트 추가

```typescript
// web/app/api/new-endpoint/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello from API' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({ received: body })
}
```

---

## 🌟 CLI vs 웹앱 비교

| 기능 | CLI | 웹앱 |
|------|-----|------|
| **워크플로우** | 터미널 대화형 | 웹 UI 폼 |
| **프로젝트 상태** | 텍스트 출력 | 시각적 대시보드 |
| **프롬프트 생성** | 파일 저장 | 클립보드 복사 |
| **진행률** | 퍼센트 표시 | 그래프/막대 |
| **환경** | 터미널 | 브라우저 |
| **접근성** | 개발자 | 모든 사용자 |
| **UI/UX** | 텍스트 | 그래픽 |
| **협업** | 어려움 | 쉬움 (URL 공유) |

### 언제 CLI를 사용할까?
- ✅ 터미널을 선호하는 개발자
- ✅ 스크립트 자동화가 필요할 때
- ✅ CI/CD 파이프라인에서
- ✅ 서버 환경에서 작업할 때

### 언제 웹앱을 사용할까?
- ✅ 시각적인 인터페이스를 선호할 때
- ✅ 팀원들과 협업할 때
- ✅ 진행 상황을 한눈에 보고 싶을 때
- ✅ 비개발자도 사용해야 할 때

---

## 🚀 배포 가이드

### Vercel 배포 (추천)

```bash
# Vercel CLI 설치
npm i -g vercel

# 웹 디렉토리로 이동
cd web

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 설정

Vercel 대시보드 또는 `.env.local` 파일에서 설정:

```env
# API 엔드포인트 (옵션)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 빌드 설정

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

---

## 🎯 향후 개발 계획

### 단기 (v1.1)
- [ ] 실시간 프로젝트 분석 통합
- [ ] AI 리더 웹 UI
- [ ] 환경변수 관리 페이지
- [ ] 체크리스트 인터랙티브 UI

### 중기 (v1.2)
- [ ] 사용자 인증 및 프로젝트 관리
- [ ] 팀 협업 기능
- [ ] 프로젝트 히스토리 및 버전 관리
- [ ] 실시간 협업 (WebSocket)

### 장기 (v2.0)
- [ ] AI 챗봇 통합
- [ ] 자동화된 코드 리뷰
- [ ] 프로젝트 템플릿 마켓플레이스
- [ ] 멀티 프로젝트 대시보드

---

## 🆘 문제 해결

### 포트 충돌
```bash
# 다른 포트로 실행
cd web
PORT=3001 npm run dev
```

### 의존성 오류
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

### 빌드 오류
```bash
cd web
npm run build
# 오류 메시지 확인 후 해결
```

---

## 📚 더 알아보기

- **CLI 가이드**: [README.md](./README.md)
- **워크플로우 가이드**: [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)
- **고급 기능**: [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)
- **빠른 시작**: [QUICKSTART.md](./QUICKSTART.md)

---

## 🎉 웹앱 시작하기

```bash
# 1. 웹앱 설치
npm run web:install

# 2. 개발 서버 실행
npm run web:dev

# 3. 브라우저에서 확인
# http://localhost:3000
```

**이제 CLI와 웹앱 모두 사용할 수 있습니다! 🚀**

---

**Happy Building with Web UI! 🌐✨**
