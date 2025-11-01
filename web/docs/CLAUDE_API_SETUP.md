# Anthropic Claude API 통합 가이드

## ✅ 완료된 작업

### 1. 패키지 설치
- `@anthropic-ai/sdk` 패키지 설치 완료
- Next.js 프로젝트에서 사용 가능

### 2. 환경 변수 설정
`.env.local` 파일에 다음이 추가되었습니다:
```
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

### 3. API 통합 완료
`web/app/api/ssa/assistant-chat/route.ts` 파일이 수정되어 실제 Claude API를 사용합니다:
- Claude 3.5 Sonnet 모델 사용
- 자동 폴백 메커니즘 (API 키 없을 시 패턴 매칭 모드로 전환)
- 한국어 응답 최적화
- 토큰 사용량 추적

## 📋 API 키 설정 방법

### 1. Anthropic API 키 발급
1. https://console.anthropic.com/ 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 키 생성
4. 생성된 키 복사 (sk-ant-로 시작)

### 2. 환경 변수 업데이트
`.env.local` 파일을 열고 `your-anthropic-api-key-here`를 실제 API 키로 교체:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. 개발 서버 재시작
환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다:
```bash
cd web
npm run dev
```

## 🚀 사용 방법

### 1. 애플리케이션 접속
브라우저에서 http://localhost:3000/tools/appscript 접속

### 2. 스프레드시트 분석
1. Google Sheets URL 입력
2. "분석 시작" 버튼 클릭
3. 분석 완료 대기

### 3. AI 어시스턴트 사용
분석 완료 후 화면 하단에 "AI 어시스턴트" 섹션이 나타납니다:

#### 초기 제안
- 분석 결과를 바탕으로 자동 생성된 제안 카드들이 표시됩니다
- "수락" 버튼을 클릭하면 해당 작업을 즉시 시작할 수 있습니다

#### 대화형 질문
예시 질문들:
- "중복된 데이터가 얼마나 있나요?"
- "빈 행을 제거하는 코드를 만들어주세요"
- "날짜 형식을 통일하고 싶어요"
- "수식을 값으로 변환해주세요"

#### 코드 생성 요청
- "중복 제거 코드를 만들어주세요"
- "빈 행 삭제 코드가 필요해요"
- "데이터 검증 규칙을 추가해주세요"

#### 대화 관리
- **내보내기**: 대화 내용을 Markdown 형식으로 다운로드
- **초기화**: 대화 내용 전체 삭제

## 🔧 기술 상세

### API 호출 구조
```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  temperature: 0.7,
  system: systemPrompt,
  messages: [
    {
      role: 'user',
      content: userMessage
    }
  ]
})
```

### 시스템 프롬프트
AI는 다음과 같은 역할을 수행합니다:
- Google Sheets Apps Script 코드 생성 전문가
- 스프레드시트 분석 결과 기반 솔루션 제공
- 한국어로 명확하고 친절한 응답
- 위험한 작업(대량 삭제 등)에 대한 경고

### 폴백 메커니즘
API 키가 없거나 API 호출이 실패할 경우:
- 자동으로 패턴 매칭 모드로 전환
- 기본적인 응답은 여전히 제공
- 콘솔에 경고 메시지 출력

## 📊 모니터링

### 콘솔 로그 확인
개발 서버 콘솔에서 다음을 확인할 수 있습니다:
- API 호출 성공/실패
- 토큰 사용량
- 폴백 모드 활성화 여부

### 메타데이터 확인
AI 응답 메시지의 메타데이터에 포함된 정보:
```typescript
{
  action: 'question' | 'generate_code' | 'modify_code' | 'suggestion',
  model: 'claude-3-5-sonnet-20241022',
  tokens: number // 총 토큰 사용량
}
```

## 💰 비용 관리

### Claude API 요금
- 입력: $3 per million tokens
- 출력: $15 per million tokens

### 사용량 최적화
- `max_tokens: 1024`로 제한하여 비용 절감
- 컨텍스트를 효율적으로 구성하여 입력 토큰 최소화
- 대화 히스토리는 최근 메시지만 포함

## 🐛 문제 해결

### API 키 오류
```
ANTHROPIC_API_KEY가 설정되지 않았습니다. 패턴 매칭 모드로 폴백합니다.
```
→ `.env.local` 파일의 API 키를 확인하고 개발 서버 재시작

### API 호출 실패
```
Claude API 호출 오류: ...
```
→ API 키 유효성 확인 및 Anthropic 대시보드에서 사용량/한도 확인

### 응답 속도 느림
→ `max_tokens` 값을 줄이거나 컨텍스트 크기 최적화

## 📚 추가 자료

- [Anthropic API 문서](https://docs.anthropic.com/)
- [Claude 모델 가격표](https://www.anthropic.com/pricing)
- [SDK 사용 가이드](https://github.com/anthropics/anthropic-sdk-typescript)

## 🎉 완료!

이제 실제 Claude AI를 사용하는 대화형 코드 생성 시스템이 준비되었습니다!
