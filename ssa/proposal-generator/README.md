# 제안서 자동 생성 시스템

Claude Code와 Canva MCP를 활용한 AI 기반 프레젠테이션 자동화 도구

## 📋 개요

기존 PowerPoint 템플릿의 디자인 스타일을 학습하고, 사용자가 입력한 콘텐츠를 바탕으로 AI가 자동으로 일관된 브랜드 이미지의 제안서를 생성하는 종합 시스템

### 해결하는 문제

- ❌ 제안서 제작에 평균 4-8시간 소요
- ❌ 디자인 일관성 유지의 어려움
- ❌ 반복적인 슬라이드 레이아웃 작업
- ❌ 브랜드 가이드라인 수동 적용

### 기대 효과

- ✅ 제안서 제작 시간 80% 단축 (4시간 → 50분)
- ✅ 브랜드 디자인 일관성 100% 유지
- ✅ 반복 작업 자동화로 창의적 작업에 집중
- ✅ AI 기반 콘텐츠 자동 배치 및 최적화

## 🎯 3가지 생성 방법

### 방법 1: AI 스타일 학습 방식
**가장 강력한 방법 - 권장 ⭐**

**워크플로우:**
1. **템플릿 업로드** - 기존 PPT 템플릿 파일 업로드
2. **AI 스타일 학습** - 색상, 폰트, 레이아웃, 디자인 패턴 자동 분석
3. **콘텐츠 입력** - 제안서 내용을 자유 텍스트 또는 구조화 형식으로 입력
4. **자동 생성** - 학습한 스타일로 완전한 제안서 생성

**장점:**
- 🎨 브랜드 스타일 100% 재현
- 🚀 가장 빠른 생성 속도 (25-30분)
- 🔄 재사용 가능한 스타일 프로필

### 방법 2: 직접 임포트 방식
**빠른 프로토타이핑에 적합**

**워크플로우:**
1. **Canva 템플릿 선택** - Canva 라이브러리에서 템플릿 검색
2. **콘텐츠 매핑** - 시나리오의 각 슬라이드를 Canva 템플릿에 매핑
3. **자동 적용** - 내용을 템플릿에 자동으로 배치
4. **다운로드** - PDF/PPTX 형식으로 내보내기

**장점:**
- ⚡ 가장 빠른 시작 (템플릿 학습 불필요)
- 🎨 전문 디자이너 템플릿 활용
- 🌐 다국어 지원

### 방법 3: PPT 진단 및 자동 개선
**기존 자료 업그레이드에 최적**

**워크플로우:**
1. **기존 PPT 업로드** - 개선이 필요한 PPT 파일 업로드
2. **AI 진단** - 디자인, 구성, 메시지 전달력 자동 평가
3. **개선 제안** - 구체적인 개선 사항 리스트 생성
4. **자동 리뉴얼** - AI가 현대적인 디자인으로 자동 업데이트

**장점:**
- 🔧 기존 자료 재활용
- 📊 객관적인 품질 평가
- 🎯 명확한 개선 방향 제시

## 📝 콘텐츠 입력 방식

### 1. 자유 텍스트 입력 (가장 빠름, 5분)
간단한 아이디어나 메모를 입력하면 AI가 구조화

```
우리 회사의 AI 마케팅 자동화 솔루션을 ABC 기업에 제안하려고 해.

주요 내용:
- 현재 ABC는 수동 마케팅으로 시간 낭비
- 우리 솔루션으로 80% 시간 절감 가능
- 3개월 구축, 1년 ROI 300%

대상: ABC 마케팅 팀장
목표: 계약 체결
분량: 15페이지
```

### 2. 구조화 입력 (권장, 10-15분)
YAML 형식으로 슬라이드별 상세 정보 입력

```yaml
# 제안서 시나리오
제목: "AI 마케팅 자동화 솔루션 제안서"
고객사: "ABC 기업"
목표: "계약 체결"

슬라이드:
  - 타입: title_slide
    제목: "AI로 마케팅 혁신을"
    부제: "ABC 기업을 위한 맞춤 솔루션"

  - 타입: problem_slide
    제목: "현재의 과제"
    내용:
      - "수동 프로세스로 인한 시간 낭비"
      - "낮은 캠페인 효율성"
```

### 3. 파일 업로드 (10분)
기존 문서 (.txt, .docx, .md) 파일 업로드

### 4. 대화형 입력 (가장 상세, 20분)
Claude와 대화하며 내용 구체화

## 🛠 기술 스택

### 필수 도구
- **Claude Code** - AI 분석 및 자동화 엔진
- **Canva MCP** - 디자인 생성 및 편집
- **Node.js** (22.16+) - MCP 서버 실행 환경

### 계정 요구사항
- ✅ Claude Pro 또는 Team 구독
- ✅ Canva Pro 또는 Enterprise 계정

## 🚀 사용 방법

### 웹 UI 사용
```bash
# 웹 앱 실행
npm run web:dev

# 브라우저에서 접속
http://localhost:3000/tools/proposal
```

### CLI 사용
```bash
# 방법 1: AI 스타일 학습
npm run proposal:learn -- --template ./template.pptx --scenario ./scenario.yaml

# 방법 2: 직접 임포트
npm run proposal:import -- --scenario ./scenario.yaml --canva-template "business-proposal"

# 방법 3: PPT 진단 및 개선
npm run proposal:improve -- --file ./old-proposal.pptx --grade A
```

## 📁 프로젝트 구조

```
ssa/proposal-generator/
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

## 📊 성공 지표 (KPI)

### 시간 절감
- 제안서 제작 시간: 4시간 → 50분 (79% 감소)
- 디자인 수정 시간: 2시간 → 10분 (92% 감소)

### 품질 향상
- 브랜드 일관성: 60% → 100%
- 슬라이드 품질 등급: D → A

### 사용성
- 학습 시간: 30분 이내
- 재사용률: 80% 이상

## 🎯 주요 기능

### 1. 스타일 학습 엔진
- 색상 팔레트 자동 추출
- 폰트 스타일 분석
- 레이아웃 패턴 인식
- 디자인 요소 분류

### 2. 콘텐츠 자동 배치
- 텍스트 분량 자동 조절
- 이미지 최적 위치 선택
- 차트/그래프 자동 생성
- 아이콘 자동 매칭

### 3. 품질 진단
- 디자인 일관성 검사
- 가독성 점수 측정
- 메시지 전달력 평가
- 개선 제안 생성

## 📚 사용 예시

### 예시 1: 신규 제안서 작성 (방법 1)
```bash
# 1. 템플릿 스타일 학습
npm run proposal:learn -- --template ./company-template.pptx

# 2. 시나리오 작성 (자유 텍스트)
# scenario.txt 파일에 아이디어 작성

# 3. 제안서 생성
npm run proposal:generate -- --scenario ./scenario.txt --method ai-learning

# 결과: 25분 만에 완성된 제안서
```

### 예시 2: 기존 PPT 개선 (방법 3)
```bash
# 1. 기존 PPT 진단
npm run proposal:diagnose -- --file ./old-proposal.pptx

# 진단 결과:
# - 디자인 등급: D
# - 개선 필요 사항: 12개
# - 예상 개선 시간: 40분

# 2. 자동 개선
npm run proposal:improve -- --file ./old-proposal.pptx --grade A

# 결과: D등급 → A등급 변환
```

## 🔧 고급 설정

### 스타일 프로필 관리
```javascript
// 학습한 스타일 저장
{
  "brand": "Company Name",
  "colors": {
    "primary": "#0066CC",
    "secondary": "#FF6600",
    "accent": "#00CC66"
  },
  "fonts": {
    "heading": "Montserrat Bold",
    "body": "Open Sans Regular"
  },
  "layouts": [...]
}
```

### 커스텀 슬라이드 타입
```yaml
# custom-slide-type.yaml
타입: custom_comparison
레이아웃: 2컬럼
요소:
  - 왼쪽: 이미지 + 텍스트
  - 오른쪽: 차트 + 캡션
스타일: modern_minimal
```

## ⚠️ 제약사항

- Canva MCP는 Canva Pro 계정 필요
- 일부 고급 PowerPoint 효과는 변환 시 단순화될 수 있음
- 한 번에 최대 50페이지까지 생성 권장

## 🆘 문제 해결

### Q: Canva 연동이 안 됩니다
A: Canva API 키와 Claude MCP 설정을 확인하세요

### Q: 스타일 학습이 정확하지 않습니다
A: 템플릿 PPT에 일관된 디자인이 있는지 확인하세요

### Q: 생성 속도가 느립니다
A: 슬라이드 수를 줄이거나 간단한 레이아웃 사용을 권장합니다

---

**버전:** 1.0.0
**최종 업데이트:** 2025-10-19
**관련 문서:** [full_prd_detailed_report.md](../../../Downloads/full_prd_detailed_report.md)
