# SSA - Smart Sheet Assistant

Google Sheets 수식을 Google Apps Script로 자동 전환하는 지능형 자동화 도구

## 📋 개요

SSA는 다음과 같은 강력한 AI 기반 자동화 도구를 제공합니다:

1. **Apps Script 생성기** - Google Sheets 수식을 Apps Script로 자동 전환
2. **제안서 자동 생성** - Claude Code + Canva MCP를 활용한 AI 기반 프레젠테이션 자동화 🆕

### 주요 기능

1. **스프레드시트 분석**
   - 모든 시트의 수식 목록 추출
   - 시트 간 참조 관계 매핑
   - 데이터 흐름 분석

2. **수식 분류 및 전환**
   - 단순 계산 수식 (SUM, AVERAGE 등)
   - 조건부 수식 (IF, IFS, SWITCH 등)
   - 조회 수식 (VLOOKUP, INDEX-MATCH 등)
   - 배열 수식 (ARRAYFORMULA 등)
   - 날짜/시간 수식
   - 텍스트 처리 수식

3. **Apps Script 구현**
   - 각 수식을 Apps Script 함수로 자동 변환
   - 트리거 기반 자동 실행 설정
   - 오류 처리 및 로깅 구현
   - 모듈화된 코드 구조

## 🚀 빠른 시작

### 설치

```bash
npm install
```

### 기본 사용법

#### Apps Script 생성기
```bash
# Apps Script 코드 생성
npm run ssa:generate

# 스프레드시트 분석
npm run ssa:analyze

# 마법사 모드로 시작
npm run ssa:wizard
```

#### 제안서 자동 생성 🆕
```bash
# 웹 UI 사용 (권장)
npm run web:dev
# → http://localhost:3000/tools/proposal 접속

# CLI 사용
npm run proposal:learn -- --template ./template.pptx --scenario ./scenario.yaml
npm run proposal:import -- --scenario ./scenario.yaml --canva-template "business-proposal"
npm run proposal:improve -- --file ./old-proposal.pptx --grade A
```

## 📦 프로젝트 구조

```
ssa/
├── core/                    # Apps Script 생성 핵심 엔진
│   ├── analyzer.js         # 스프레드시트 분석기
│   ├── classifier.js       # 수식 분류기
│   ├── converter.js        # Apps Script 변환기
│   └── generator.js        # 코드 생성기
│
├── generators/             # Apps Script 생성기 모듈
│   ├── data-layer.js       # 데이터 레이어 생성
│   ├── business-logic.js   # 비즈니스 로직 생성
│   ├── infrastructure.js   # 인프라 생성
│   └── ui-layer.js         # UI 레이어 생성
│
├── lib/                    # Apps Script 라이브러리
│   ├── formula-parser.js   # 수식 파서
│   ├── dependency-graph.js # 의존성 그래프
│   └── template-engine.js  # 템플릿 엔진
│
├── templates/              # Apps Script 템플릿
│   ├── core/               # 핵심 템플릿
│   ├── data-layer/         # 데이터 레이어
│   ├── business-logic/     # 비즈니스 로직
│   └── infrastructure/     # 인프라
│
└── proposal-generator/     # 제안서 자동 생성 시스템 🆕
    ├── core/
    │   ├── style-learner.js      # PPT 스타일 학습 엔진
    │   ├── content-parser.js     # 콘텐츠 파싱 및 구조화
    │   ├── slide-generator.js    # 슬라이드 자동 생성
    │   └── quality-checker.js    # 품질 진단 시스템
    │
    ├── templates/
    │   ├── slide-types/          # 슬라이드 타입 템플릿
    │   ├── layouts/              # 레이아웃 템플릿
    │   └── scenarios/            # 시나리오 예제
    │
    └── lib/
        ├── canva-adapter.js      # Canva MCP 연동
        ├── ppt-parser.js         # PowerPoint 파싱
        └── yaml-parser.js        # YAML 시나리오 파싱
```

## 📝 Apps Script 파일 구조

생성되는 Apps Script 프로젝트 구조:

```
📁 Google Apps Script Project
│
├── 📁 Core (핵심 실행 로직)
│   ├── 📄 Main.gs
│   └── 📄 Config.gs
│
├── 📁 DataLayer (데이터 레이어)
│   ├── 📄 DataReader.gs
│   ├── 📄 DataWriter.gs
│   └── 📄 DataValidator.gs
│
├── 📁 BusinessLogic (비즈니스 로직)
│   ├── 📄 Calculator.gs
│   ├── 📄 LookupFunctions.gs
│   ├── 📄 ConditionalLogic.gs
│   ├── 📄 ArrayProcessor.gs
│   ├── 📄 DateTimeHandler.gs
│   └── 📄 TextProcessor.gs
│
├── 📁 SheetSpecific (시트별 로직)
│   ├── 📄 Sheet1_Logic.gs
│   ├── 📄 Sheet2_Logic.gs
│   └── 📄 Sheet3_Logic.gs
│
├── 📁 Infrastructure (인프라)
│   ├── 📄 Logger.gs
│   ├── 📄 ErrorHandler.gs
│   ├── 📄 NotificationService.gs
│   └── 📄 CacheManager.gs
│
├── 📁 Automation (자동화)
│   ├── 📄 TriggerManager.gs
│   ├── 📄 ScheduledJobs.gs
│   └── 📄 EventHandlers.gs
│
├── 📁 UI (사용자 인터페이스)
│   ├── 📄 CustomMenu.gs
│   ├── 📄 Dialogs.gs
│   └── 📄 Sidebar.gs
│
└── 📁 Utils (유틸리티)
    ├── 📄 CommonUtils.gs
    ├── 📄 RangeUtils.gs
    └── 📄 TestHelpers.gs
```

## 🔧 수식 변환 예시

### VLOOKUP 변환

**기존 수식:**
```
=VLOOKUP(A2, Sheet2!A:C, 3, FALSE)
```

**Apps Script 변환:**
```javascript
function vlookupReplace(searchKey, range, columnIndex) {
  const data = range.getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === searchKey) {
      return data[i][columnIndex - 1];
    }
  }
  return "Not Found";
}
```

### SUMIF 변환

**기존 수식:**
```
=SUMIF(A:A, "조건", B:B)
```

**Apps Script 변환:**
```javascript
function sumIfReplace(range, criteria, sumRange) {
  const criteriaData = range.getValues();
  const sumData = sumRange.getValues();
  let total = 0;

  for (let i = 0; i < criteriaData.length; i++) {
    if (criteriaData[i][0] === criteria) {
      total += sumData[i][0];
    }
  }
  return total;
}
```

## 🎯 구현 단계

### Phase 1: 분석 및 설계
- 모든 시트 목록 작성
- 각 시트별 수식 추출
- 시트 간 참조 관계 매핑
- 데이터 흐름도 작성

### Phase 2: 개발
- 유틸리티 함수 작성
- 수식별 변환 함수 작성
- 메인 실행 함수 통합

### Phase 3: 테스트 및 검증
- 샘플 데이터로 단위 테스트
- 실제 데이터로 통합 테스트
- 기존 수식 결과와 비교 검증

### Phase 4: 배포 및 모니터링
- 백업 생성
- 단계적 배포
- 실행 로그 모니터링

## ✅ 성공 기준

### 기능적 요구사항
- 모든 수식이 Apps Script로 정확히 전환됨
- 기존 수식과 동일한 결과값 출력
- 자동 실행 트리거가 정상 작동
- 오류 발생 시 알림 및 로그 기록

### 성능 요구사항
- 전체 실행 시간 6분 이내 (Apps Script 제한)
- 수식 대비 50% 이상 성능 향상
- 메모리 사용량 최적화

### 유지보수성
- 코드 주석 및 문서화 완료
- 함수별 단위 테스트 작성
- 에러 핸들링 구현

## 🚨 리스크 및 대응 방안

### 리스크 1: Apps Script 실행 시간 제한 (6분)
**대응:**
- 배치 처리로 분할 실행
- 시트별로 별도 함수 작성
- 트리거로 순차 실행

### 리스크 2: 복잡한 배열 수식 전환 어려움
**대응:**
- 단계별 분해하여 전환
- 필요시 일부 수식은 유지
- 대체 로직 설계

### 리스크 3: 데이터 손실 가능성
**대응:**
- 전환 전 전체 백업
- 단계적 롤아웃
- 롤백 계획 수립

## 📚 참고 자료

### Apps Script 공식 문서
- [Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)
- [Triggers](https://developers.google.com/apps-script/guides/triggers)
- [Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)

## 🎯 제안서 자동 생성 시스템 🆕

### 3가지 생성 방법

#### 방법 1: AI 스타일 학습 방식 ⭐
**가장 강력한 방법 - 권장**

1. 템플릿 업로드 - 기존 PPT 템플릿 파일 업로드
2. AI 스타일 학습 - 색상, 폰트, 레이아웃, 디자인 패턴 자동 분석
3. 콘텐츠 입력 - 제안서 내용을 자유 텍스트 또는 구조화 형식으로 입력
4. 자동 생성 - 학습한 스타일로 완전한 제안서 생성

**장점**: 브랜드 스타일 100% 재현, 가장 빠른 생성 속도 (25-30분)

#### 방법 2: 직접 임포트 방식
**빠른 프로토타이핑에 적합**

1. Canva 템플릿 선택 - Canva 라이브러리에서 템플릿 검색
2. 콘텐츠 매핑 - 시나리오의 각 슬라이드를 Canva 템플릿에 매핑
3. 자동 적용 - 내용을 템플릿에 자동으로 배치
4. 다운로드 - PDF/PPTX 형식으로 내보내기

**장점**: 가장 빠른 시작, 전문 디자이너 템플릿 활용

#### 방법 3: PPT 진단 및 자동 개선
**기존 자료 업그레이드에 최적**

1. 기존 PPT 업로드 - 개선이 필요한 PPT 파일 업로드
2. AI 진단 - 디자인, 구성, 메시지 전달력 자동 평가
3. 개선 제안 - 구체적인 개선 사항 리스트 생성
4. 자동 리뉴얼 - AI가 현대적인 디자인으로 자동 업데이트

**장점**: 기존 자료 재활용, 객관적인 품질 평가

### 성공 지표

**시간 절감:**
- 제안서 제작 시간: 4시간 → 50분 (79% 감소)
- 디자인 수정 시간: 2시간 → 10분 (92% 감소)

**품질 향상:**
- 브랜드 일관성: 60% → 100%
- 슬라이드 품질 등급: D → A

자세한 내용은 `proposal-generator/README.md` 참조

## 🔗 AutomationMaster 통합

SSA는 AutomationMaster의 일부로 통합되어 있습니다:

- **웹 UI**:
  - `/tools/appscript` - Apps Script 생성기
  - `/tools/proposal` - 제안서 자동 생성 🆕
- **CLI**: `npm run ssa:*`, `npm run proposal:*` 명령어로 실행
- **워크플로우**: 자동화 워크플로우에 통합

---

**버전:** 1.1.0
**최종 업데이트:** 2025-10-19
