# Phase 3: Steps 10-13 구현 - 핸드오프 문서

## 📊 현재 진행 상황 (2025-11-02)

### ✅ 완료된 작업 (50% 완료)

#### 1. Step10DataFlow.tsx ✅
**파일**: `web/app/unified-workflow/steps/Step10DataFlow.tsx`

**주요 기능**:
- ✅ Mermaid 시퀀스 다이어그램 에디터
- ✅ Client→Server / Server→Database 플로우 설명
- ✅ 캐싱 전략 설정 (Redis, CDN, In-Memory, None)
  - TTL 설정
  - 캐시 무효화 전략
- ✅ 실시간 구독 설정 (Supabase Realtime)
  - 채널 관리 (동적 추가/삭제)
  - 충돌 해결 전략 (Last Write Wins, Custom, None)
- ✅ 다이어그램/편집/Markdown 미리보기 토글
- ✅ 폼 유효성 검사
- ✅ Markdown 내보내기

**데이터 구조**:
```typescript
export interface Step10Data {
  clientToServer: string
  serverToDatabase: string
  cachingStrategy: {
    enabled: boolean
    type: 'redis' | 'cdn' | 'in-memory' | 'none'
    ttl: number
    invalidation: string
  }
  realtimeConfig: {
    enabled: boolean
    channels: string[]
    conflictResolution: 'last-write-wins' | 'custom' | 'none'
  }
  sequenceDiagram: string
  notes: string
}
```

**색상 테마**: Cyan (bg-cyan-50, border-cyan-200, text-cyan-900)

---

#### 2. Step11Security.tsx ✅
**파일**: `web/app/unified-workflow/steps/Step11Security.tsx`

**주요 기능**:
- ✅ 인증 방식 다중 선택 (JWT, OAuth2, Session, Supabase Auth)
- ✅ RBAC 매트릭스 (역할 × 리소스 테이블)
  - 역할 동적 추가/삭제
  - 리소스별 권한 토글 (✅/❌)
  - 인터랙티브 테이블 UI
- ✅ 암호화 설정
  - At Rest / In Transit 체크박스
  - 키 관리 전략 입력
- ✅ OWASP Top 10 체크리스트
  - 10개 항목 (A01~A10)
  - 완료 상태 토글
  - 항목별 노트 입력
  - 진행률 표시 (퍼센티지 + 프로그레스 바)
- ✅ Markdown 미리보기
- ✅ 폼 유효성 검사

**데이터 구조**:
```typescript
export interface Step11Data {
  authMethods: ('jwt' | 'oauth2' | 'session' | 'supabase-auth')[]
  rbacMatrix: { role: string; resources: Record<string, boolean> }[]
  encryptionConfig: {
    atRest: boolean
    inTransit: boolean
    keyManagement: string
  }
  owaspChecklist: { item: string; completed: boolean; notes: string }[]
  notes: string
}
```

**색상 테마**: Red (bg-red-50, border-red-200, text-red-900)

---

## 🚧 남은 작업 (50% 남음)

### 3. Step12Testing.tsx (미구현)
**예상 파일**: `web/app/unified-workflow/steps/Step12Testing.tsx`

**구현할 기능**:
1. **테스트 커버리지 목표**
   - 유닛 테스트: 슬라이더 (0-100%)
   - 통합 테스트: 슬라이더 (0-100%)
   - E2E 테스트: 슬라이더 (0-100%)
   - 전체 커버리지 계산 (자동)

2. **테스트 시나리오 빌더**
   - 시나리오 동적 추가/삭제
   - Given/When/Then 형식
   - 시나리오 타입 선택 (Unit, Integration, E2E)
   - 우선순위 설정

3. **CI/CD 파이프라인 설정**
   - 플랫폼 선택 (GitHub Actions, Jenkins, GitLab CI, CircleCI)
   - 트리거 설정 (Push, PR, Schedule)
   - 작업 정의 (lint, test, build, deploy)

4. **Playwright 테스트 코드 생성기**
   - 테스트 경로 입력
   - 테스트 설명
   - 단계별 액션 (Given/When/Then)
   - Playwright 코드 자동 생성

**제안 데이터 구조**:
```typescript
export interface Step12Data {
  coverageGoals: {
    unit: number
    integration: number
    e2e: number
  }
  testScenarios: {
    type: 'unit' | 'integration' | 'e2e'
    given: string
    when: string
    then: string
    priority: 'high' | 'medium' | 'low'
  }[]
  cicdPipeline: {
    platform: 'github-actions' | 'jenkins' | 'gitlab-ci' | 'circleci'
    triggers: ('push' | 'pr' | 'schedule')[]
    jobs: { name: string; commands: string[] }[]
  }
  playwrightTests: {
    path: string
    description: string
    steps: string[]
  }[]
  notes: string
}
```

**색상 테마**: Orange (bg-orange-50, border-orange-200, text-orange-900)

**참고 컴포넌트**: Step5PrdWriter.tsx (동적 리스트 관리 패턴)

---

### 4. Step13Deployment.tsx (미구현)
**예상 파일**: `web/app/unified-workflow/steps/Step13Deployment.tsx`

**구현할 기능**:
1. **배포 플랫폼 선택**
   - Vercel, Netlify, AWS, Azure, 자체 호스팅
   - 플랫폼별 조건부 설정 폼
   - 플랫폼별 가이드 링크

2. **환경변수 관리**
   - 키/값 테이블
   - 시크릿 여부 체크박스
   - 시크릿 마스킹 (●●●●)
   - 환경별 구분 (dev, staging, production)

3. **모니터링 설정**
   - 에러 추적 (Sentry, Bugsnag, Rollbar)
   - 분석 (Google Analytics, Mixpanel, Amplitude)
   - 업타임 모니터링 (UptimeRobot, Pingdom)
   - 알림 설정 (이메일, Slack, Discord)

4. **배포 체크리스트**
   - 인터랙티브 체크리스트 (OWASP 패턴 재사용)
   - 도메인 설정
   - SSL/TLS 인증서
   - 백업 전략
   - 롤백 계획

**제안 데이터 구조**:
```typescript
export interface Step13Data {
  platform: {
    type: 'vercel' | 'netlify' | 'aws' | 'azure' | 'self-hosted'
    config: Record<string, string>
  }
  environmentVars: {
    key: string
    value: string
    isSecret: boolean
    environment: 'dev' | 'staging' | 'production' | 'all'
  }[]
  monitoring: {
    errorTracking: { enabled: boolean; service: string; config: string }
    analytics: { enabled: boolean; service: string; config: string }
    uptime: { enabled: boolean; service: string; config: string }
    alerts: { email?: string; slack?: string; discord?: string }
  }
  deploymentChecklist: {
    item: string
    completed: boolean
    notes: string
  }[]
  notes: string
}
```

**색상 테마**: Teal (bg-teal-50, border-teal-200, text-teal-900)

**참고 컴포넌트**:
- Step11Security.tsx (체크리스트 패턴)
- Step9ApiDesigner.tsx (조건부 폼 패턴)

---

## 🔧 통합 작업 (완료 후 수행)

### 1. steps/index.tsx 업데이트
**파일**: `web/app/unified-workflow/steps/index.tsx`

**추가할 내용**:
```typescript
export { Step10DataFlow, type Step10Data } from './Step10DataFlow'
export { Step11Security, type Step11Data } from './Step11Security'
export { Step12Testing, type Step12Data } from './Step12Testing'
export { Step13Deployment, type Step13Data } from './Step13Deployment'
```

**현재 상태**: Step9ApiDesigner까지만 export됨

---

### 2. page.tsx 업데이트
**파일**: `web/app/unified-workflow/page.tsx`

#### 2.1 Import 추가 (line 11-22)
```typescript
import {
  Step4IdeaDefinition,
  Step5PrdWriter,
  Step6SystemDesign,
  Step7SupabaseSchema,
  Step8FrontendTree,
  Step9ApiDesigner,
  Step10DataFlow,      // 추가
  Step11Security,      // 추가
  Step12Testing,       // 추가
  Step13Deployment,    // 추가
  GenericWorkflowStep,
  getFieldsForStep,
  stepIcons,
  stepTitles
} from './steps'
```

#### 2.2 Case 10-13 교체 (line 530-553)
**현재 코드**:
```typescript
case 10:
case 11:
case 12:
case 13:
  const stepNum = currentStep as 10 | 11 | 12 | 13
  const skipCondition = !isStepRequired(projectType, stepNum)
    ? {
        check: true,
        message: getSkipReason(projectType, stepNum) || '이 단계는 현재 프로젝트 타입에서 선택사항입니다'
      }
    : undefined

  return (
    <GenericWorkflowStep
      stepNumber={stepNum}
      stepTitle={stepTitles[stepNum]}
      stepIcon={stepIcons[stepNum]}
      {...stepProps}
      fields={getFieldsForStep(stepNum, projectType)}
      initialData={workflowData[stepNum]}
      onComplete={(data, prompt) => handleStepComplete(stepNum, data, prompt)}
      skipCondition={skipCondition}
    />
  )
```

**교체할 코드**:
```typescript
case 10:
  const skip10 = !isStepRequired(projectType, 10)
    ? {
        check: true,
        message: getSkipReason(projectType, 10) || '이 단계는 현재 프로젝트 타입에서 선택사항입니다'
      }
    : undefined

  return (
    <Step10DataFlow
      stepNumber={10}
      stepTitle={stepTitles[10]}
      stepIcon={stepIcons[10]}
      {...stepProps}
      initialData={workflowData[10]}
      onComplete={(data, prompt) => handleStepComplete(10, data, prompt)}
      skipCondition={skip10}
    />
  )

case 11:
  const skip11 = !isStepRequired(projectType, 11)
    ? {
        check: true,
        message: getSkipReason(projectType, 11) || '이 단계는 현재 프로젝트 타입에서 선택사항입니다'
      }
    : undefined

  return (
    <Step11Security
      stepNumber={11}
      stepTitle={stepTitles[11]}
      stepIcon={stepIcons[11]}
      {...stepProps}
      initialData={workflowData[11]}
      onComplete={(data, prompt) => handleStepComplete(11, data, prompt)}
      skipCondition={skip11}
    />
  )

case 12:
  const skip12 = !isStepRequired(projectType, 12)
    ? {
        check: true,
        message: getSkipReason(projectType, 12) || '이 단계는 현재 프로젝트 타입에서 선택사항입니다'
      }
    : undefined

  return (
    <Step12Testing
      stepNumber={12}
      stepTitle={stepTitles[12]}
      stepIcon={stepIcons[12]}
      {...stepProps}
      initialData={workflowData[12]}
      onComplete={(data, prompt) => handleStepComplete(12, data, prompt)}
      skipCondition={skip12}
    />
  )

case 13:
  const skip13 = !isStepRequired(projectType, 13)
    ? {
        check: true,
        message: getSkipReason(projectType, 13) || '이 단계는 현재 프로젝트 타입에서 선택사항입니다'
      }
    : undefined

  return (
    <Step13Deployment
      stepNumber={13}
      stepTitle={stepTitles[13]}
      stepIcon={stepIcons[13]}
      {...stepProps}
      initialData={workflowData[13]}
      onComplete={(data, prompt) => handleStepComplete(13, data, prompt)}
      skipCondition={skip13}
    />
  )
```

---

## 🧪 테스트 계획

### 수동 테스트 체크리스트

#### Step 10 테스트
- [ ] 시퀀스 다이어그램이 올바르게 렌더링되는가?
- [ ] Mermaid 코드 편집 시 실시간으로 다이어그램이 업데이트되는가?
- [ ] 캐싱 전략 활성화/비활성화가 동작하는가?
- [ ] 실시간 채널 추가/삭제가 동작하는가?
- [ ] 폼 유효성 검사가 올바르게 작동하는가?
- [ ] Markdown 내보내기가 정상인가?
- [ ] 프롬프트 생성이 정상인가?

#### Step 11 테스트
- [ ] 인증 방식 다중 선택이 동작하는가?
- [ ] RBAC 매트릭스 테이블이 올바르게 렌더링되는가?
- [ ] 역할 추가/삭제가 동작하는가?
- [ ] 권한 토글 (✅/❌)이 동작하는가?
- [ ] 암호화 설정 체크박스가 동작하는가?
- [ ] OWASP 체크리스트 진행률이 정확한가?
- [ ] 체크리스트 항목별 노트 입력이 동작하는가?
- [ ] Markdown 내보내기가 정상인가?

#### Step 12 테스트 (구현 후)
- [ ] 커버리지 슬라이더가 동작하는가?
- [ ] 테스트 시나리오 추가/삭제가 동작하는가?
- [ ] CI/CD 파이프라인 설정이 저장되는가?
- [ ] Playwright 테스트 코드가 생성되는가?

#### Step 13 테스트 (구현 후)
- [ ] 플랫폼별 설정 폼이 조건부로 표시되는가?
- [ ] 환경변수 시크릿 마스킹이 동작하는가?
- [ ] 모니터링 설정이 저장되는가?
- [ ] 배포 체크리스트가 동작하는가?

#### 통합 테스트
- [ ] Steps 10-13으로 이동 시 컴포넌트가 올바르게 렌더링되는가?
- [ ] 각 단계 완료 후 진행상황이 저장되는가?
- [ ] 브라우저 새로고침 후 진행상황이 복원되는가?
- [ ] Skip 조건이 올바르게 작동하는가?
- [ ] 이전 단계로 돌아가기가 동작하는가?
- [ ] TypeScript 컴파일 에러가 없는가?
- [ ] 개발 서버가 정상적으로 실행되는가?

---

## 📝 개발 노트

### 구현 패턴

#### 1. 컴포넌트 구조 (일관성 유지)
모든 Step 컴포넌트는 동일한 구조를 따릅니다:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { FormField } from '@/components/unified/FormField'
import { PromptDisplay } from '@/components/unified/PromptDisplay'
import { generatePrompt } from '@/lib/prompt-generator'
import { 아이콘들... } from 'lucide-react'

interface StepXProps {
  stepNumber: number
  stepTitle: string
  stepIcon: React.ReactNode
  projectName: string
  projectType: string
  projectPath?: string
  prdPath?: string
  initialData?: StepXData
  onComplete: (data: StepXData, prompt: string) => void
  skipCondition?: {
    check: boolean
    message: string
  }
}

export interface StepXData {
  // 단계별 데이터 구조
}

export function StepX({ ...props }: StepXProps) {
  const [data, setData] = useState<StepXData>(initialData || { /* 기본값 */ })
  const [showPreview, setShowPreview] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const generateMarkdown = (): string => { /* ... */ }
  const validate = (): boolean => { /* ... */ }
  const handleGeneratePrompt = () => { /* ... */ }
  const handleComplete = () => { /* ... */ }
  const handleSkip = () => { /* ... */ }

  // Skip condition rendering
  if (skipCondition?.check) { /* ... */ }

  return (
    <div className="space-y-6">
      {/* Header with color theme */}
      {showPreview ? (
        /* Markdown Preview */
      ) : (
        /* Edit Mode - Form */
      )}
      {/* Action Buttons */}
      {/* Generated Prompt */}
    </div>
  )
}
```

#### 2. 색상 테마 할당
- Step 5: Blue (bg-blue-50)
- Step 6: Purple (bg-purple-50)
- Step 7: Green (bg-green-50)
- Step 8: Pink (bg-pink-50)
- Step 9: Indigo (bg-indigo-50)
- **Step 10: Cyan (bg-cyan-50)** ✅
- **Step 11: Red (bg-red-50)** ✅
- **Step 12: Orange (bg-orange-50)** 🔜
- **Step 13: Teal (bg-teal-50)** 🔜

#### 3. Mermaid 통합 패턴
```typescript
import mermaid from 'mermaid'

useEffect(() => {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    sequence: { useMaxWidth: true } // 또는 flowchart, er
  })
}, [])

useEffect(() => {
  if (diagramCode && showDiagram) {
    const renderDiagram = async () => {
      try {
        const element = document.getElementById('diagram-container')
        if (element) {
          element.innerHTML = diagramCode
          await mermaid.run({ nodes: [element] })
        }
      } catch (error) {
        console.error('Failed to render diagram:', error)
      }
    }
    renderDiagram()
  }
}, [diagramCode, showDiagram])
```

#### 4. 동적 리스트 관리 패턴
```typescript
const [newItem, setNewItem] = useState('')

const addItem = () => {
  if (newItem.trim() && /* 중복 체크 */) {
    setData({
      ...data,
      items: [...data.items, newItem.trim()]
    })
    setNewItem('')
  }
}

const removeItem = (index: number) => {
  setData({
    ...data,
    items: data.items.filter((_, i) => i !== index)
  })
}

// JSX
<input
  value={newItem}
  onChange={(e) => setNewItem(e.target.value)}
  onKeyPress={(e) => e.key === 'Enter' && addItem()}
/>
<button onClick={addItem}>추가</button>

{data.items.map((item, index) => (
  <div key={index}>
    <span>{item}</span>
    <button onClick={() => removeItem(index)}>삭제</button>
  </div>
))}
```

---

## 🚀 다음 세션 시작 가이드

### 1. 현재 상태 확인
```bash
cd web
npm run dev
# http://localhost:3000/unified-workflow 접속
# Steps 10, 11이 GenericWorkflowStep으로 표시되는지 확인
```

### 2. Step12Testing.tsx 생성
- 파일 생성: `web/app/unified-workflow/steps/Step12Testing.tsx`
- 위의 "제안 데이터 구조" 참고
- Step5PrdWriter.tsx의 동적 리스트 패턴 활용
- 색상 테마: Orange (bg-orange-50, border-orange-200)

### 3. Step13Deployment.tsx 생성
- 파일 생성: `web/app/unified-workflow/steps/Step13Deployment.tsx`
- Step11Security.tsx의 체크리스트 패턴 활용
- Step9ApiDesigner.tsx의 조건부 폼 패턴 활용
- 색상 테마: Teal (bg-teal-50, border-teal-200)

### 4. steps/index.tsx 업데이트
- Step10~13 export 추가

### 5. page.tsx 업데이트
- Import 추가
- Case 10~13 교체

### 6. 테스트
- 모든 단계 수동 테스트
- TypeScript 컴파일 확인
- 개발 서버 정상 동작 확인

---

## 📊 예상 소요 시간

- Step12Testing.tsx: 6-8시간
- Step13Deployment.tsx: 6-8시간
- 통합 작업: 2시간
- 테스트 및 버그 수정: 2시간

**총 예상 시간**: 16-20시간 (2-2.5일)

---

## 📚 참고 자료

### 기존 컴포넌트 참고
- **Step5PrdWriter.tsx**: 동적 리스트 (coreFeatures 배열)
- **Step6SystemDesign.tsx**: Mermaid 다이어그램 통합
- **Step7SupabaseSchema.tsx**: 복잡한 테이블 구조
- **Step8FrontendTree.tsx**: 계층 구조 (트리)
- **Step9ApiDesigner.tsx**: 조건부 폼, JSON 입력
- **Step10DataFlow.tsx**: 시퀀스 다이어그램, 중첩 설정
- **Step11Security.tsx**: 체크리스트, 매트릭스 테이블

### 외부 라이브러리
- **Mermaid.js**: 다이어그램 렌더링 (이미 설치됨)
- **Lucide React**: 아이콘 (이미 사용 중)

---

## ✅ 완료 체크리스트

- [x] Step10DataFlow.tsx 생성
- [x] Step11Security.tsx 생성
- [ ] Step12Testing.tsx 생성
- [ ] Step13Deployment.tsx 생성
- [ ] steps/index.tsx 업데이트
- [ ] page.tsx import 추가
- [ ] page.tsx case 10-13 교체
- [ ] 통합 테스트
- [ ] TypeScript 컴파일 확인
- [ ] 개발 서버 정상 동작 확인

---

**작성일**: 2025-11-02
**작성자**: Claude Code
**다음 세션 계속**: Step12Testing.tsx 생성부터 시작
