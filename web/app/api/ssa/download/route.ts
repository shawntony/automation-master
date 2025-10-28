import { NextRequest, NextResponse } from 'next/server'

/**
 * Apps Script ZIP 파일 다운로드 API
 * POST /api/ssa/download
 */
export async function POST(request: NextRequest) {
  try {
    const { files, spreadsheetTitle } = await request.json()

    if (!files) {
      return NextResponse.json(
        { error: '파일 데이터가 필요합니다' },
        { status: 400 }
      )
    }

    // ZIP 파일 생성을 위한 데이터 준비
    const zipData = await createZipStructure(files, spreadsheetTitle)

    return NextResponse.json({
      success: true,
      files: zipData,
      projectName: sanitizeFileName(spreadsheetTitle || 'apps-script-project')
    })

  } catch (error: any) {
    console.error('ZIP 생성 오류:', error)
    return NextResponse.json(
      { error: 'ZIP 파일 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * ZIP 파일 구조 생성
 */
async function createZipStructure(files: Record<string, string>, spreadsheetTitle: string) {
  const zipFiles: Record<string, string> = {}

  // 파일명에서 경로 제거하고 .gs 파일로 변환
  Object.entries(files).forEach(([filePath, content]) => {
    // "Core/Main.gs" → "Main.gs"
    const fileName = filePath.split('/').pop() || filePath
    zipFiles[fileName] = content
  })

  // appsscript.json 추가
  zipFiles['appsscript.json'] = JSON.stringify({
    timeZone: 'Asia/Seoul',
    dependencies: {},
    exceptionLogging: 'STACKDRIVER',
    runtimeVersion: 'V8',
    oauthScopes: [
      'https://www.googleapis.com/auth/spreadsheets.currentonly',
      'https://www.googleapis.com/auth/script.container.ui'
    ]
  }, null, 2)

  // README.md 추가
  zipFiles['README.md'] = generateReadme(spreadsheetTitle)

  // .clasp.json 템플릿 추가
  zipFiles['.clasp.json.template'] = JSON.stringify({
    scriptId: 'YOUR_SCRIPT_ID_HERE',
    rootDir: '.'
  }, null, 2)

  return zipFiles
}

/**
 * README 생성
 */
function generateReadme(spreadsheetTitle: string): string {
  return `# ${spreadsheetTitle} - Apps Script 프로젝트

AutomationMaster에서 자동 생성된 Google Apps Script 프로젝트입니다.

## 📦 설치 방법

### 방법 1: clasp 사용 (권장)

\`\`\`bash
# 1. clasp 설치 (처음 한 번만)
npm install -g @google/clasp

# 2. Google 계정 로그인
clasp login

# 3. 새 Apps Script 프로젝트 생성
clasp create --title "${spreadsheetTitle}" --type standalone

# 4. 코드 푸시
clasp push

# 5. 브라우저에서 열기
clasp open
\`\`\`

### 방법 2: 수동 업로드

1. Google Sheets 열기
2. **확장 프로그램** → **Apps Script** 클릭
3. 각 .gs 파일의 내용을 복사하여 Apps Script 에디터에 붙여넣기
4. **프로젝트 설정** → **"appsscript.json" 매니페스트 파일 표시** 체크
5. appsscript.json 내용 복사하여 붙여넣기

## 📁 파일 구조

- **Main.gs**: 메인 실행 함수
- **Config.gs**: 전역 설정
- **DataReader.gs**: 데이터 읽기 함수
- **DataWriter.gs**: 데이터 쓰기 함수
- **LookupFunctions.gs**: VLOOKUP 대체 함수 (있는 경우)
- **Calculator.gs**: SUMIF 등 계산 함수 (있는 경우)
- **ConditionalLogic.gs**: IF 조건부 로직 (있는 경우)
- **Logger.gs**: 로깅 시스템
- **ErrorHandler.gs**: 에러 처리
- **CustomMenu.gs**: 커스텀 메뉴
- **TriggerManager.gs**: 트리거 관리

## 🚀 사용 방법

### 1. 수동 실행
1. Google Sheets 열기
2. 메뉴에서 **🤖 자동화** → **▶️ 전체 실행** 클릭

### 2. 자동 실행 (트리거 설정)
1. 메뉴에서 **🤖 자동화** → **⚙️ 트리거 설정** 클릭
2. 매일 자정에 자동 실행됩니다

### 3. 코드에서 직접 실행
Apps Script 에디터에서:
\`\`\`javascript
main(); // 실행 버튼 클릭
\`\`\`

## ⚙️ 설정

**Config.gs** 파일에서 다음을 수정하세요:
- \`SPREADSHEET_ID\`: 스프레드시트 ID (자동 설정됨)
- \`EMAIL_RECIPIENTS\`: 에러 알림 받을 이메일 주소

## 🔧 커스터마이징

### 트리거 시간 변경
**TriggerManager.gs**의 \`setupTriggers\` 함수에서:
\`\`\`javascript
ScriptApp.newTrigger('main')
  .timeBased()
  .atHour(9)  // 오전 9시로 변경
  .everyDays(1)
  .create();
\`\`\`

### 비즈니스 로직 수정
**BusinessLogic/** 폴더의 파일들을 수정하여 원하는 로직 구현

## 📊 성능 최적화

- 대용량 데이터 처리 시 배치 크기 조정
- 캐시 활용으로 API 호출 최소화
- 불필요한 로그 제거

## 🐛 문제 해결

### 권한 오류
Apps Script 에디터에서 실행 → 권한 승인

### 할당량 초과
- Google Apps Script 할당량: https://developers.google.com/apps-script/guides/services/quotas
- 실행 시간을 분산하거나 데이터 처리량 줄이기

## 📝 로그 확인

Apps Script 에디터 → **실행** → **로그** 또는 **실행 로그**

## 🔗 유용한 링크

- [Apps Script 문서](https://developers.google.com/apps-script)
- [clasp 문서](https://github.com/google/clasp)
- [스프레드시트 서비스 API](https://developers.google.com/apps-script/reference/spreadsheet)

---

**생성 일시**: ${new Date().toLocaleString('ko-KR')}
**생성 도구**: AutomationMaster
`
}

/**
 * 파일명 정리
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9가-힣\s-_]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
}
