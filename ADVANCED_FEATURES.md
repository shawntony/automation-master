# 🚀 Automation Master - 고급 기능 가이드

## 새로운 강력한 기능들

planning.md를 기반으로 한 기본 기능 외에, **AI 기반 프로젝트 분석 및 리딩** 기능이 추가되었습니다!

## 🔍 프로젝트 자동 분석

### `analyze` 명령어

GitHub 프로젝트 폴더를 분석해서 **현재 어떤 단계에 있는지** 자동으로 진단합니다.

```bash
npm run analyze -- /path/to/your/project
```

**출력 예시:**

```
╔════════════════════════════════════════════════════════════════╗
║  프로젝트 분석 결과
╚════════════════════════════════════════════════════════════════╝

📁 프로젝트: my-awesome-app
📅 분석 일시: 2025/01/15 15:30:45
📦 패키지: my-awesome-app v1.0.0
🔧 Git 저장소: ✓

📊 단계별 완성도:

  ✅ 단계 1: [████████████████████] 85%
  ✅ 단계 2: [██████████████████░░] 75%
  🔄 단계 3: [████████████░░░░░░░░] 60%
  👉 단계 4: [██████░░░░░░░░░░░░░░] 35% <- 현재
  ⏳ 단계 5: [░░░░░░░░░░░░░░░░░░░░] 10%
  ...

🎯 현재 단계: 4
📈 전체 진행률: 42%

💡 추천 사항:

  🟡 단계 4가 35% 완료되었습니다. 더 많은 작업이 필요합니다.
     누락: design-system.md, components/templates, tailwind.config.js

  🔴 환경변수 파일(.env)이 없습니다.
     → npm run env
```

### 분석 기준

각 단계는 다음을 기반으로 점수가 매겨집니다:

- **파일 존재 여부**: 각 단계에 필요한 문서 파일들
- **디렉토리 구조**: 코드 조직 (src/, components/, tests/ 등)
- **package.json 분석**: 설치된 라이브러리 (React, Supabase, Tailwind 등)
- **Git 정보**: 버전 관리 상태

## 📝 프롬프트 자동 생성

### `prompt` 명령어

단계별로 **필요한 정보를 입력하면**, 실행 가능한 **MCP 활용 Claude 프롬프트**를 자동으로 생성합니다.

```bash
# 인터랙티브 모드
npm run prompt -- --interactive

# 특정 단계
npm run prompt -- --step 3
```

**사용 시나리오:**

```
╔════════════════════════════════════════════════╗
║  📝 MCP 프롬프트 생성
╚════════════════════════════════════════════════╝

? 프롬프트를 생성할 단계 (1-10): 3
? 프로젝트명: todo-app
? 간단한 설명: 할일 관리 자동화 툴
⠋ 프롬프트 생성 중...
✔ 프롬프트 생성 완료!

╔════════════════════════════════════════════════╗
║  시스템 기획서 작성
╚════════════════════════════════════════════════╝

⏱️  예상 소요 시간: 1주

🔧 사용할 MCP 서버:
  @supabase, @task-master, @memory, sub-agent

📋 생성될 Claude 프롬프트:

---
# 단계 3: 시스템 기획서 작성

## 프로젝트 정보
- 프로젝트명: todo-app
- 주요 기능: [핵심 기능들]
- 테이블 수: [테이블 목록]

## MCP 활용 작업

### 1. Supabase로 실제 데이터베이스 스키마 생성

\`\`\`
@supabase를 연결해서 데이터베이스 스키마를 직접 생성하고 싶어.

단계:
1. @supabase에 프로젝트 연결
2. 다음 테이블 생성:

-- Users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  ...
);

3. Row Level Security (RLS) 정책 설정
4. 인덱스 생성
...
\`\`\`
---

? 프롬프트를 파일로 저장할까요? Yes
✓ 프롬프트가 저장되었습니다: prompt-step-3.md
```

생성된 프롬프트를 **Claude Code에 바로 붙여넣기**해서 사용하면 됩니다!

## 🤖 AI 프로젝트 리더

### `lead` 명령어

프로젝트를 분석하고, **다음에 무엇을 해야 하는지** AI가 알려줍니다!

```bash
# 기본 모드
npm run lead -- /path/to/your/project

# 인터랙티브 모드 (추천)
npm run lead -- /path/to/your/project --interactive
```

**출력 예시:**

```
╔════════════════════════════════════════════════╗
║  🤖 AI 프로젝트 리더
╚════════════════════════════════════════════════╝

⠋ 프로젝트 분석 및 리딩 중...
✔ 리딩 완료!

╔════════════════════════════════════════════════╗
║  🤖 AI 프로젝트 리더 리포트
╚════════════════════════════════════════════════╝

📁 프로젝트: todo-app
📅 분석 일시: 2025/01/15 15:35:20

📊 전체 진행률: 42%
🎯 현재 단계: 4
⭐ 품질 점수: 65/100

💪 강점:
  ✓ Git 버전 관리 사용 중
  ✓ Supabase 데이터베이스 통합
  ✓ Tailwind CSS 디자인 시스템
  ✓ 7개 문서 파일

⚠️  위험 요소:

  🔴 환경변수 파일(.env)이 없습니다.
     영향: API 키 및 설정 관리 어려움
     해결: npm run env로 환경변수 설정

  🟡 단계 3가 60%만 완료되었습니다.
     영향: 후속 단계의 품질 저하 가능
     해결: 단계 3로 돌아가서 보완

🎯 추천 액션 (우선순위순):

  1. 현재 단계 4 완료하기
     35%만 완료되었습니다. 35% 더 진행해야 합니다.
     누락: design-system.md, components/templates, tailwind.config.js

  2. 단계 3 보완하기
     60%만 완료되어 보완이 필요합니다.
     누락: api-spec.yaml, database-design.md

  3. 환경변수 파일(.env)이 없습니다.
     영향: API 키 및 설정 관리 어려움
     → npm run env

🚀 준비도:

  ⏳ 개발: 10% - 개발 환경 설정이 필요합니다.
  ⏳ 배포: 0% - 배포 설정이 필요합니다.
  ⏳ 운영: 0% - 운영 자동화가 필요합니다.

📌 즉시 실행 가능한 액션:

다음 명령어로 프롬프트를 받아보세요:
  npm run prompt -- --step 4

? 다음 액션을 선택하세요:
  ❯ 1. 현재 단계 4 완료하기
    2. 단계 3 보완하기
    3. 환경변수 파일(.env)이 없습니다.
    나중에 하기
```

액션을 선택하면 **자동으로 해당 프롬프트를 생성**해줍니다!

## 🎯 통합 워크플로우

### 시나리오 1: 새 프로젝트 시작

```bash
# 1. Automation Master 초기화
npm run init

# 2. 가이드 시작
npm run guide

# 3. 각 단계마다 프롬프트 생성
npm run prompt -- --interactive

# 4. Claude Code에 프롬프트 붙여넣기 → 실행

# 5. 진행 확인
npm run status
```

### 시나리오 2: 기존 프로젝트 진단 및 보완

```bash
# 1. 프로젝트 분석
npm run analyze -- ../my-existing-project

# 2. AI 리더 실행
npm run lead -- ../my-existing-project --interactive

# 3. 추천받은 액션 선택 → 자동으로 프롬프트 생성

# 4. 프롬프트 실행 → 부족한 부분 보완
```

### 시나리오 3: 단계별 진행

```bash
# 현재 상태 확인
npm run status

# 현재 단계 프롬프트 생성
npm run prompt

# Claude Code에서 실행

# 완료 후 체크리스트 확인
npm run checklist

# 다음 단계로
npm run guide -- --action next
```

## 🔥 고급 활용법

### 1. 사용자 정보 미리 준비

프롬프트 생성 시 입력할 정보:

```yaml
프로젝트명: my-automation-tool
핵심 기능: "데이터 수집, 자동 분석, 리포트 생성"
테이블 구조: "users, tasks, reports, analytics"
기술 스택: "React, Next.js, Supabase, Tailwind"
벤치마킹 사이트: "linear.app, notion.so"
디자인 스타일: "모던, 미니멀, 프로페셔널"
```

### 2. 진단 결과를 단계 관리에 반영

```bash
# 프로젝트 분석
npm run analyze -- ../my-project

# 현재 단계가 4라고 나왔다면
npm run guide -- --step 4 --action start

# 부족한 항목 확인 후 생성
npm run prompt -- --step 4 --interactive
```

### 3. 자동화 스크립트

```bash
#!/bin/bash

# daily-check.sh
echo "🔍 프로젝트 상태 확인..."
npm run analyze -- ../my-project

echo "📊 진행 현황..."
npm run status

echo "🤖 AI 리더 리포트..."
npm run lead -- ../my-project
```

## 📊 분석 점수 체계

### 단계별 점수 (0-100%)

- **0-29%**: 시작 안 됨 (⏳)
- **30-49%**: 작업 필요 (🔄)
- **50-69%**: 진행 중 (🔄)
- **70-100%**: 완료 (✅)

### 품질 점수 요소 (최대 100점)

- Git 사용: +10점
- package.json 존재: +10점
- TypeScript 사용: +15점
- 테스트 코드 존재: +15점
- 환경변수 관리: +10점
- Supabase 통합: +10점
- Tailwind CSS: +10점
- 문서화 (5개 이상): +10점
- 배포 설정: +10점

## 🎓 최적 활용 패턴

### 패턴 1: AI 리더 중심

```
매일:
1. npm run lead -- ./project --interactive
2. 추천 액션 선택
3. 생성된 프롬프트 실행
4. 체크리스트 완료

주간:
1. npm run status (전체 진행 확인)
2. 품질 점수 향상 작업
```

### 패턴 2: 단계별 완성

```
각 단계 시작 시:
1. npm run prompt -- --step N --interactive
2. 프롬프트 실행
3. npm run checklist
4. npm run guide -- --step N --action complete
```

### 패턴 3: 프로젝트 리커버리

```
오래된 프로젝트 재개:
1. npm run analyze -- ./project
2. npm run lead -- ./project --interactive
3. 가장 높은 우선순위 액션부터 처리
4. 단계별로 보완
```

## 💡 팁과 주의사항

### ✅ 팁

1. **인터랙티브 모드 활용**: `--interactive` 옵션으로 더 정확한 프롬프트 생성
2. **정기적 분석**: 주 1회 `npm run analyze`로 프로젝트 상태 점검
3. **프롬프트 저장**: 생성된 프롬프트를 `claudedocs/` 폴더에 저장
4. **AI 리더 활용**: 막막할 때 `npm run lead`로 방향 잡기

### ⚠️ 주의사항

1. 프로젝트 경로는 **절대 경로** 권장
2. 대규모 프로젝트는 분석에 시간이 걸릴 수 있음
3. `node_modules`, `.git` 폴더는 자동으로 제외됨
4. 분석 결과는 참고용이며, 실제 상황과 다를 수 있음

## 🚀 다음 단계

이제 강력한 AI 기반 기능들을 활용할 수 있습니다:

```bash
# 프로젝트 초기화
npm run init

# 프로젝트 경로 지정 후 AI 리더 실행
npm run lead -- /path/to/project --interactive

# 추천받은 대로 진행! 🎉
```

---

**Happy Building with AI! 🤖✨**
