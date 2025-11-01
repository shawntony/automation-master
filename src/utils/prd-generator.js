/**
 * PRD 생성기
 *
 * 아이디어나 간단한 입력으로부터 PRD 생성
 * (향후 AI 기반 생성 기능 추가 가능)
 */

/**
 * 아이디어 텍스트로부터 구조화된 PRD 생성
 * @param {string} projectName - 프로젝트명
 * @param {string} projectType - 프로젝트 타입
 * @param {string} idea - 아이디어 텍스트
 * @returns {string} 생성된 PRD (Markdown)
 */
export function generatePrdFromIdea(projectName, projectType, idea) {
  const today = new Date().toISOString().split('T')[0]

  // 프로젝트 타입에 따른 추천 기술 스택
  const techStackByType = {
    fullstack: {
      frontend: ['React', 'TypeScript', 'Tailwind CSS'],
      backend: ['Node.js', 'Express', 'PostgreSQL'],
      deployment: ['Vercel', 'Supabase']
    },
    frontend: {
      frontend: ['React', 'TypeScript', 'Tailwind CSS'],
      deployment: ['Vercel', 'Netlify']
    },
    backend: {
      backend: ['Node.js', 'Express', 'PostgreSQL'],
      deployment: ['Railway', 'Render']
    },
    automation: {
      tools: ['Node.js', 'Puppeteer'],
      deployment: ['PM2', 'Cron']
    }
  }

  const techStack = techStackByType[projectType] || techStackByType.fullstack

  return `# ${projectName} - PRD (Product Requirements Document)

> 작성일: ${today}
> 프로젝트 타입: ${projectType}
> 생성 방식: 아이디어 입력

## 1. 프로젝트 개요

### 초기 아이디어
${idea}

### 목적
위 아이디어를 구현하여 사용자에게 가치를 제공합니다.

**예상 가치**:
- 사용자 문제 해결
- 효율성 향상
- 자동화를 통한 시간 절약

## 2. 주요 기능 (초안)

아이디어를 바탕으로 다음 기능들을 고려할 수 있습니다:

### 1. 핵심 기능
- **우선순위**: 높음 🔴
- **설명**: 아이디어의 핵심 가치를 구현하는 기능

### 2. 부가 기능
- **우선순위**: 중간 🟡
- **설명**: 사용자 경험을 향상시키는 추가 기능

### 3. 향후 고려사항
- **우선순위**: 낮음 🟢
- **설명**: 향후 추가할 수 있는 기능

> 💡 **다음 단계**: 위 기능들을 구체화하고 우선순위를 재정의하세요.

## 3. 타겟 사용자 (초안)

### 주요 사용자
- **페르소나**: [사용자 유형을 정의하세요]
- **니즈**:
  - 효율적인 작업 처리
  - 사용하기 쉬운 인터페이스
  - 안정적인 서비스

> 💡 **다음 단계**: 구체적인 사용자 페르소나를 작성하세요.

## 4. 추천 기술 스택

${Object.entries(techStack).map(([category, technologies]) => `### ${category}
${technologies.map(tech => `- ${tech}`).join('\n')}`).join('\n\n')}

> 💡 **다음 단계**: 프로젝트 요구사항에 맞게 기술 스택을 조정하세요.

## 5. 성공 지표 (초안)

측정 가능한 성공 기준을 정의하세요:

1. **사용자 관련**: 목표 사용자 수, 만족도 등
2. **성능 관련**: 응답 시간, 처리 속도 등
3. **비즈니스 관련**: ROI, 비용 절감 등

> 💡 **다음 단계**: 구체적인 수치 목표를 설정하세요.

## 6. 제약사항

프로젝트 진행 시 고려해야 할 제약사항:

1. **기술적 제약**: 호환성, 성능 요구사항 등
2. **리소스 제약**: 시간, 인력, 예산 등
3. **비즈니스 제약**: 법적 요구사항, 정책 등

## 7. 다음 단계

이 PRD는 초기 아이디어를 기반으로 자동 생성되었습니다. 다음 작업을 진행하세요:

### 즉시 할 일
1. ✅ PRD 검토 및 수정
2. ✅ 기능 목록 상세화
3. ✅ 사용자 페르소나 구체화
4. ✅ 성공 지표 수치화

### 다음 문서 작성
1. 기술 설계 문서 (Technical Design)
2. API 명세서 (API Specification)
3. UI/UX 디자인 (Wireframe/Mockup)

### 추천 도구
- \`/create-prd\` 명령어로 더 상세한 PRD를 생성할 수 있습니다
- [planning.md](../project-guide/planning.md)의 10단계 프로세스를 따르세요
- [agents-guide.md](../agents-guide.md)에서 에이전트 활용법을 확인하세요

---

## 참고 문서
- [planning.md](../project-guide/planning.md) - 10단계 개발 가이드
- [PROJECT_SUMMARY.md](../project-guide/PROJECT_SUMMARY.md) - 프로젝트 요약
- [WEB_APP_GUIDE.md](../project-guide/WEB_APP_GUIDE.md) - 웹앱 개발 가이드
- [agents-guide.md](../agents-guide.md) - SuperClaude 에이전트 활용

## 버전 관리
- **v0.1** (${today}): 초안 작성 (아이디어 기반 자동 생성)
- **v1.0** (예정): 상세 PRD 작성 완료
`
}

/**
 * AI 기반 PRD 생성 (향후 구현)
 * @param {string} projectName - 프로젝트명
 * @param {string} idea - 아이디어
 * @returns {Promise<string>} 생성된 PRD
 */
export async function generatePrdWithAI(projectName, idea) {
  // TODO: Claude API 또는 다른 AI 서비스 연동
  // 현재는 간단한 템플릿 생성으로 대체
  console.warn('AI 기반 PRD 생성은 아직 구현되지 않았습니다. 기본 템플릿을 사용합니다.')
  return generatePrdFromIdea(projectName, 'fullstack', idea)
}

/**
 * PRD 개선 제안 생성
 * @param {string} currentPrd - 현재 PRD 내용
 * @returns {string[]} 개선 제안 목록
 */
export function suggestPrdImprovements(currentPrd) {
  const suggestions = []

  // 필수 섹션 체크
  const requiredSections = [
    { name: '목적', patterns: ['목적', 'purpose', '개요', 'overview'] },
    { name: '기능', patterns: ['기능', 'features', '요구사항', 'requirements'] },
    { name: '사용자', patterns: ['사용자', 'user', '타겟', 'target'] },
    { name: '기술', patterns: ['기술', 'tech', 'stack', '스택'] },
    { name: '성공 지표', patterns: ['성공', 'success', '지표', 'metrics', 'kpi'] }
  ]

  requiredSections.forEach(section => {
    const hasSection = section.patterns.some(pattern =>
      currentPrd.toLowerCase().includes(pattern)
    )
    if (!hasSection) {
      suggestions.push(`"${section.name}" 섹션을 추가하는 것을 권장합니다`)
    }
  })

  // 길이 체크
  if (currentPrd.length < 500) {
    suggestions.push('PRD를 더 상세하게 작성하는 것을 권장합니다 (현재 길이가 짧습니다)')
  }

  // 헤딩 구조 체크
  const hasMainHeadings = (currentPrd.match(/^##\s+/gm) || []).length >= 3
  if (!hasMainHeadings) {
    suggestions.push('주요 섹션을 ## 헤딩으로 구분하는 것을 권장합니다')
  }

  return suggestions
}
