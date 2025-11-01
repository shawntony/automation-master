import type { PrdDocument, PrdFormData } from '@/types/prd'

/**
 * PRD Markdown 템플릿 생성
 */
export function generatePrdMarkdown(data: Partial<PrdDocument>): string {
  const {
    projectName = '프로젝트명',
    createdAt = new Date().toISOString().split('T')[0],
    purpose = '',
    background = '',
    features = [],
    targetUsers = [],
    techStack = [],
    successMetrics = [],
    constraints = [],
    timeline = []
  } = data

  return `# ${projectName} - PRD (Product Requirements Document)

> 작성일: ${createdAt}

## 1. 프로젝트 개요

### 목적
${purpose || '프로젝트의 목적을 작성하세요.'}

### 배경 및 문제 정의
${background || '이 프로젝트가 해결하고자 하는 문제와 배경을 설명하세요.'}

## 2. 주요 기능

${features.length > 0
  ? features.map((feature, index) => `### ${index + 1}. ${feature.title}
- **우선순위**: ${feature.priority === 'high' ? '높음 🔴' : feature.priority === 'medium' ? '중간 🟡' : '낮음 🟢'}
- **설명**: ${feature.description}
`).join('\n')
  : '### 기능 1\n- **우선순위**: 높음 🔴\n- **설명**: 주요 기능을 작성하세요.\n'}

## 3. 타겟 사용자

${targetUsers.length > 0
  ? targetUsers.map((user) => `### ${user.persona}
- **니즈**:
${user.needs.map(need => `  - ${need}`).join('\n')}
`).join('\n')
  : '### 사용자 페르소나 1\n- **니즈**:\n  - 니즈를 작성하세요.\n'}

## 4. 기술 스택

${techStack.length > 0
  ? techStack.map((stack) => `### ${stack.category}
${stack.technologies.map(tech => `- ${tech}`).join('\n')}
`).join('\n')
  : '### 프론트엔드\n- React\n- TypeScript\n\n### 백엔드\n- Node.js\n- Express\n'}

## 5. 성공 지표

${successMetrics.length > 0
  ? successMetrics.map((metric, index) => `${index + 1}. ${metric}`).join('\n')
  : '1. 성공 지표를 정의하세요.\n2. 측정 가능한 목표를 설정하세요.'}

## 6. 제약사항

${constraints.length > 0
  ? constraints.map((constraint, index) => `${index + 1}. ${constraint}`).join('\n')
  : '1. 제약사항을 작성하세요.\n2. 기술적/비즈니스적 제한사항을 명시하세요.'}

${timeline && timeline.length > 0 ? `
## 7. 일정 (Timeline)

${timeline.map((phase) => `### ${phase.phase} (${phase.duration})
**주요 산출물**:
${phase.deliverables.map(d => `- ${d}`).join('\n')}
`).join('\n')}
` : ''}

---

## 참고 문서
- [planning.md](../project-guide/planning.md) - 10단계 개발 가이드
- [agents-guide.md](../agents-guide.md) - SuperClaude 에이전트 활용
- [project-workflow.md](../project-workflow.md) - 프로젝트 워크플로우

## 다음 단계
1. PRD 검토 및 승인
2. 기술 설계 문서 작성
3. 프로젝트 구조 설정
4. 개발 착수
`
}

/**
 * 폼 데이터로부터 PRD 문서 생성
 */
export function formDataToPrdDocument(
  projectName: string,
  formData: PrdFormData
): PrdDocument {
  return {
    projectName,
    createdAt: new Date().toISOString().split('T')[0],
    purpose: formData.purpose,
    background: formData.background || '사용자 입력 없음',
    features: formData.features.map((feature, index) => ({
      title: feature,
      description: '',
      priority: index === 0 ? 'high' : 'medium'
    })),
    targetUsers: [
      {
        persona: formData.targetUsers,
        needs: []
      }
    ],
    techStack: [
      {
        category: '기술 스택',
        technologies: formData.techStack
      }
    ],
    successMetrics: formData.successMetrics?.split('\n').filter(Boolean) || [],
    constraints: formData.constraints?.split('\n').filter(Boolean) || []
  }
}

/**
 * 아이디어 텍스트로부터 간단한 PRD 생성
 */
export function ideaToPrdMarkdown(
  projectName: string,
  idea: string
): string {
  const today = new Date().toISOString().split('T')[0]

  return `# ${projectName} - PRD (Product Requirements Document)

> 작성일: ${today}
> 생성 방식: 아이디어 입력

## 1. 프로젝트 개요

### 초기 아이디어
${idea}

### 목적
위 아이디어를 구현하여 사용자에게 가치를 제공합니다.

## 2. 다음 단계

이 PRD는 초기 아이디어를 기반으로 자동 생성되었습니다. 다음 단계를 진행하세요:

1. **목적 명확화**: 프로젝트의 구체적인 목적과 목표를 정의하세요.
2. **기능 정의**: 필요한 기능 목록을 작성하세요.
3. **사용자 정의**: 타겟 사용자 페르소나를 만드세요.
4. **기술 스택 선정**: 사용할 기술을 결정하세요.
5. **성공 지표 설정**: 측정 가능한 성공 기준을 정하세요.

### 추천 도구
- \`/create-prd\` 명령어로 더 상세한 PRD를 생성할 수 있습니다.
- [planning.md](../project-guide/planning.md)의 2단계를 참조하세요.

## 참고 문서
- [planning.md](../project-guide/planning.md) - 10단계 개발 가이드
- [agents-guide.md](../agents-guide.md) - SuperClaude 에이전트 활용
`
}

/**
 * 빈 PRD 템플릿
 */
export function getEmptyPrdTemplate(projectName: string): string {
  return generatePrdMarkdown({
    projectName,
    createdAt: new Date().toISOString().split('T')[0],
    purpose: '',
    background: '',
    features: [],
    targetUsers: [],
    techStack: [],
    successMetrics: [],
    constraints: []
  })
}
