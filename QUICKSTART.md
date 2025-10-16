# ⚡ Quick Start Guide

**5분 안에 시작하기!**

## 🚀 초고속 설치

```bash
# 1. 의존성 설치
npm install

# 2. 프로젝트 초기화
npm run init

# 3. 가이드 시작
npm run guide
```

끝! 이제 단계별 가이드를 따라가세요.

## 🎯 핵심 명령어

```bash
# 🔥 대화형 워크플로우 (가장 추천!)
npm run workflow

# 가이드 시작 (인터랙티브)
npm run guide

# 현재 상태 확인
npm run status

# 환경변수 설정
npm run env

# 체크리스트 관리
npm run checklist

# 프로젝트 분석
npm run analyze -- /path/to/project

# AI 리더십
npm run lead -- /path/to/project
```

## 📋 처음 5분 동안 할 일

### 1️⃣ 초기화 (1분)

```bash
npm run init
```

프로젝트 이름을 입력하세요.

### 2️⃣ 첫 단계 시작 (1분)

```bash
npm run guide
```

"단계 시작하기"를 선택하세요.

### 3️⃣ 작업 진행 (자유)

planning.md의 가이드를 따라 작업하세요.

### 4️⃣ 체크리스트 완료 (1분)

```bash
npm run checklist
```

완료한 항목을 체크하세요.

### 5️⃣ 단계 완료 (1분)

```bash
npm run guide
```

"단계 완료 처리"를 선택하세요.

## 🔥 즉시 사용 가능한 기능

### ✅ 진행상황 자동 저장

모든 작업이 자동으로 저장됩니다. 언제든 중단하고 재개할 수 있습니다!

### ✅ 환경변수 자동 생성

```bash
npm run env
```

프리셋 선택 → 변수 입력 → 완료!

`.env`, `.env.staging`, `.env.production` 파일이 자동으로 생성됩니다.

### ✅ 체크리스트 관리

```bash
npm run checklist
```

빠뜨린 항목을 놓치지 마세요!

### ✅ 전체 현황 대시보드

```bash
npm run status
```

한눈에 프로젝트 진행 상황을 확인하세요.

## 💡 자주 묻는 질문

**Q: 중간에 멈춰도 되나요?**

A: 네! 모든 진행상황이 자동 저장됩니다. `npm run guide`로 언제든 재개하세요.

**Q: 환경변수를 나중에 다시 설정할 수 있나요?**

A: 네! `npm run env`를 다시 실행하면 됩니다.

**Q: 다른 프로젝트에도 적용할 수 있나요?**

A: 네! `npm run env -- --target ../other-project`로 다른 프로젝트에 환경변수를 적용할 수 있습니다.

**Q: 단계를 건너뛸 수 있나요?**

A: 가능하지만 권장하지 않습니다. `npm run guide -- --step <번호>`로 특정 단계로 이동할 수 있습니다.

## 🎓 더 알아보기

- **전체 가이드**: `README.md`
- **상세 사용법**: `USAGE.md`
- **실전 예시**: `EXAMPLES.md`
- **원본 문서**: `planning.md`

## 🆘 문제 해결

### npm install 오류

```bash
rm -rf node_modules package-lock.json
npm install
```

### 진행상황 초기화

```bash
npm run init
# "기존 진행상황이 있다면 초기화할까요?" → Yes
```

### 환경변수 파일이 안 보여요

```bash
# 숨김 파일 보기 (Windows)
dir /a

# 숨김 파일 보기 (Mac/Linux)
ls -la
```

---

**시작할 준비가 되셨나요? 🚀**

```bash
npm install
npm run init
npm run guide
```

**Let's build something amazing!**
