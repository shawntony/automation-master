# 🔧 문제 해결 가이드

Automation Master 사용 중 발생할 수 있는 일반적인 문제와 해결 방법을 안내합니다.

## 🔄 문제: 워크플로우가 계속 반복됩니다 (Looping)

### 증상
```
? 작업 결과가 만족스럽습니까? No
? 다음 단계: 수정/보완 후 다시 확인 (retry) 선택
→ 같은 단계가 다시 시작됨
→ 또 retry 선택
→ 계속 반복...
```

### 원인
**"수정/보완 후 다시 확인 (retry)"**을 선택하면 같은 단계를 처음부터 다시 시작합니다. 이것은 버그가 아니라 **의도된 기능**입니다.

### 해결 방법

#### 방법 1: 다음 단계로 진행
```
? 다음 단계:
  ❯ 이 단계는 이정도로 충분함 (다음 단계로)
```
완벽하지 않아도 괜찮다면 다음 단계로 진행하세요.

#### 방법 2: 워크플로우 종료
```
? 다음 단계:
  ❯ 워크플로우 종료
```
현재 상태를 저장하고 나중에 다시 시작할 수 있습니다.

#### 방법 3: 재시도 제한 도달 대기
10번 재시도하면 자동으로 다음 옵션이 제공됩니다:
```
⚠️  최대 재시도 횟수에 도달했습니다.

? 어떻게 하시겠습니까?
  ❯ 다음 단계로 강제 진행
    이전 단계로 돌아가기
    워크플로우 종료
```

### 올바른 retry 사용법

#### ✅ Retry를 사용해야 할 때
- 입력한 정보가 완전히 잘못되어 **처음부터 다시** 시작해야 할 때
- 프롬프트를 **다시 확인**하고 싶을 때 (한두 번만!)

#### ❌ Retry를 사용하지 말아야 할 때
- 결과가 80% 이상 만족스러울 때 → **"이정도로 충분함"** 선택
- 시간이 없어서 나중에 하고 싶을 때 → **"워크플로우 종료"** 선택
- 작은 수정만 필요할 때 → **"다음 단계로"** 진행 후 나중에 수정

---

## 📦 문제: npm install 실패

### 증상
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

### 해결 방법

#### 방법 1: 강제 설치
```bash
npm install --legacy-peer-deps
```

#### 방법 2: 캐시 정리 후 재설치
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 방법 3: Node.js 버전 확인
```bash
node --version  # v18 이상 권장
```

---

## 🌐 문제: 웹앱이 시작되지 않음

### 증상
```bash
npm run web:dev
# Error: Cannot find module 'next'
```

### 해결 방법

#### 웹앱 의존성 설치 확인
```bash
npm run web:install
```

#### 웹 디렉토리 확인
```bash
cd web
npm install
npm run dev
```

---

## 📄 문제: config/progress.json 오류

### 증상
```bash
Error: ENOENT: no such file or directory
```

### 해결 방법

#### config 디렉토리 생성
```bash
mkdir -p config
```

#### 새 프로젝트 초기화
```bash
npm run init
```

---

## 🔐 문제: 환경변수 설정 오류

### 증상
```
Error: SUPABASE_URL is not defined
```

### 해결 방법

#### 환경변수 설정 명령 실행
```bash
npm run env
```

#### 수동으로 .env 파일 생성
```bash
# 프로젝트 루트에 .env 파일 생성
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚫 문제: MCP 서버 오류

### 증상
```
Error: @task-master is not available
```

### 원인
프롬프트에서 MCP 서버를 사용하려 했지만 MCP 서버가 설치되지 않았습니다.

### 해결 방법

#### 프롬프트 수정
생성된 프롬프트에서 MCP 서버 부분을 제거하고 일반 명령어로 실행하세요.

**예시:**
```markdown
# MCP 서버 사용 (오류 발생 가능)
@task-master를 사용해서...

# 일반 명령어로 변경 (권장)
프로젝트 구조를 만들어줘...
```

#### MCP 서버 설치 (선택)
Claude Code 문서를 참고하여 MCP 서버를 설치하세요:
https://docs.claude.com/

---

## 📊 문제: 프로젝트 분석이 작동하지 않음

### 증상
```bash
npm run analyze -- /path/to/project
# Error: Path does not exist
```

### 해결 방법

#### 절대 경로 사용
```bash
# Windows
npm run analyze -- C:\Users\username\myproject

# Mac/Linux
npm run analyze -- /Users/username/myproject
```

#### 현재 디렉토리 분석
```bash
cd /path/to/project
npm run analyze -- .
```

---

## 🔍 문제: 워크플로우 상태가 저장되지 않음

### 증상
워크플로우를 종료하고 다시 시작하면 처음부터 시작됩니다.

### 해결 방법

#### config 디렉토리 권한 확인
```bash
# Mac/Linux
ls -la config/

# 쓰기 권한이 없으면:
chmod 755 config
```

#### 수동으로 진행 상태 확인
```bash
cat config/progress.json
```

---

## 💾 문제: 프롬프트 파일이 저장되지 않음

### 증상
```
❌ 파일 저장 실패: ENOENT: no such file or directory
```

### 해결 방법

#### claudedocs 디렉토리 생성
```bash
mkdir -p claudedocs
```

#### 권한 확인
```bash
# Mac/Linux
chmod 755 claudedocs
```

---

## 🐛 문제: 기타 오류

### 일반적인 해결 방법

#### 1. 프로그램 재시작
```bash
# Ctrl+C로 종료 후
npm run workflow
```

#### 2. 로그 확인
```bash
# 오류 메시지 전체를 확인하세요
```

#### 3. 의존성 재설치
```bash
rm -rf node_modules
npm install
```

#### 4. 캐시 정리
```bash
npm cache clean --force
```

---

## 📚 추가 도움말

### 명령어 도움말
```bash
npm run help
```

### 진행 상태 확인
```bash
npm run status
```

### 전체 체크리스트 확인
```bash
npm run checklist
```

---

## 🆘 여전히 문제가 해결되지 않나요?

1. **README.md** 파일을 다시 읽어보세요
2. **WORKFLOW_GUIDE.md**에서 상세 가이드를 확인하세요
3. **WEB_APP_GUIDE.md**에서 웹앱 관련 문제를 확인하세요
4. GitHub Issues에 문제를 보고해주세요

---

**Happy Troubleshooting! 🔧**
