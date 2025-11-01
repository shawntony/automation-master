/**
 * Field configurations for workflow steps 5-13
 */

export interface FormFieldConfig {
  name: string
  label: string
  type: 'text' | 'textarea' | 'array' | 'select'
  required?: boolean
  placeholder?: string
  hint?: string
  options?: { value: string; label: string }[]
  minLength?: number
  maxItems?: number
}

export const step5Fields: FormFieldConfig[] = [
  {
    name: 'purpose',
    label: '프로젝트 목적',
    type: 'textarea',
    required: true,
    placeholder: '이 프로젝트를 통해 달성하고자 하는 목표를 작성하세요',
    hint: '비즈니스 목표와 기술적 목표를 모두 포함하세요',
    minLength: 30
  },
  {
    name: 'background',
    label: '배경 및 문제 정의',
    type: 'textarea',
    required: true,
    placeholder: '왜 이 프로젝트가 필요한지 배경을 설명하세요',
    hint: '현재 상황의 문제점과 개선이 필요한 이유',
    minLength: 30
  },
  {
    name: 'features',
    label: '주요 기능',
    type: 'array',
    required: true,
    placeholder: '주요 기능 입력',
    hint: '핵심 기능을 나열하세요',
    maxItems: 10
  },
  {
    name: 'techStack',
    label: '기술 스택',
    type: 'array',
    required: true,
    placeholder: '사용할 기술 입력 (예: Next.js, Supabase)',
    hint: '프론트엔드, 백엔드, 데이터베이스, 인프라 등',
    maxItems: 15
  }
]

export const step6Fields: FormFieldConfig[] = [
  {
    name: 'architecture',
    label: '아키텍처 패턴',
    type: 'select',
    required: true,
    options: [
      { value: 'mvc', label: 'MVC (Model-View-Controller)' },
      { value: 'layered', label: 'Layered Architecture' },
      { value: 'microservices', label: 'Microservices' },
      { value: 'serverless', label: 'Serverless' },
      { value: 'event-driven', label: 'Event-Driven' }
    ],
    hint: '프로젝트에 가장 적합한 아키텍처를 선택하세요'
  },
  {
    name: 'components',
    label: '주요 컴포넌트',
    type: 'array',
    required: true,
    placeholder: '컴포넌트명 입력 (예: AuthService, DataProcessor)',
    hint: '시스템의 주요 구성 요소를 나열하세요',
    maxItems: 20
  },
  {
    name: 'dataFlow',
    label: '데이터 플로우 설명',
    type: 'textarea',
    required: true,
    placeholder: 'Client → API → Database → Response 형태로 데이터 흐름을 설명하세요',
    minLength: 50
  },
  {
    name: 'apiDesign',
    label: 'API 설계 개요',
    type: 'textarea',
    required: true,
    placeholder: 'RESTful API 엔드포인트 설계 방향을 설명하세요',
    minLength: 30
  }
]

export const step7Fields: FormFieldConfig[] = [
  {
    name: 'tables',
    label: '테이블 목록',
    type: 'array',
    required: true,
    placeholder: '테이블명 입력 (예: users, posts, comments)',
    hint: '데이터베이스에 필요한 모든 테이블을 나열하세요',
    maxItems: 30
  },
  {
    name: 'relationships',
    label: '관계 정의',
    type: 'textarea',
    required: true,
    placeholder: 'users (1:N) posts, posts (1:N) comments 형태로 관계를 설명하세요',
    minLength: 20
  },
  {
    name: 'rlsPolicies',
    label: 'RLS 정책 필요 여부',
    type: 'textarea',
    required: true,
    placeholder: '어떤 테이블에 어떤 RLS 정책이 필요한지 설명하세요',
    minLength: 20
  },
  {
    name: 'indexes',
    label: '인덱스 계획',
    type: 'textarea',
    required: false,
    placeholder: '성능 최적화를 위한 인덱스 계획을 작성하세요',
    minLength: 10
  }
]

export const step8Fields: FormFieldConfig[] = [
  {
    name: 'pages',
    label: '페이지 목록 (Routes)',
    type: 'array',
    required: true,
    placeholder: '페이지 경로 입력 (예: /dashboard, /profile)',
    hint: 'Next.js App Router 기준으로 작성하세요',
    maxItems: 30
  },
  {
    name: 'components',
    label: '주요 컴포넌트',
    type: 'array',
    required: true,
    placeholder: '컴포넌트명 입력 (예: Header, Sidebar, DataTable)',
    maxItems: 50
  },
  {
    name: 'routing',
    label: '라우팅 구조',
    type: 'textarea',
    required: true,
    placeholder: 'App Router 구조와 동적 라우트를 설명하세요',
    minLength: 20
  },
  {
    name: 'stateManagement',
    label: '상태 관리 방식',
    type: 'select',
    required: true,
    options: [
      { value: 'context', label: 'React Context API' },
      { value: 'zustand', label: 'Zustand' },
      { value: 'redux', label: 'Redux Toolkit' },
      { value: 'jotai', label: 'Jotai' },
      { value: 'recoil', label: 'Recoil' }
    ]
  }
]

export const step9Fields: FormFieldConfig[] = [
  {
    name: 'endpoints',
    label: 'API 엔드포인트',
    type: 'array',
    required: true,
    placeholder: 'API 경로 입력 (예: /api/users, /api/posts)',
    maxItems: 50
  },
  {
    name: 'authentication',
    label: '인증 방식',
    type: 'select',
    required: true,
    options: [
      { value: 'jwt', label: 'JWT (JSON Web Token)' },
      { value: 'session', label: 'Session-based' },
      { value: 'oauth', label: 'OAuth 2.0' },
      { value: 'supabase-auth', label: 'Supabase Auth' }
    ]
  },
  {
    name: 'middleware',
    label: '미들웨어 목록',
    type: 'array',
    required: false,
    placeholder: '미들웨어명 입력 (예: authMiddleware, loggerMiddleware)',
    maxItems: 10
  },
  {
    name: 'errorHandling',
    label: '에러 처리 전략',
    type: 'textarea',
    required: true,
    placeholder: '에러 응답 형식, 로깅 방식, 에러 복구 전략을 설명하세요',
    minLength: 30
  }
]

export const step10Fields: FormFieldConfig[] = [
  {
    name: 'clientToServer',
    label: 'Client → Server 플로우',
    type: 'textarea',
    required: true,
    placeholder: 'React 컴포넌트에서 API를 호출하는 방식을 설명하세요',
    minLength: 30
  },
  {
    name: 'serverToDatabase',
    label: 'Server → Database 플로우',
    type: 'textarea',
    required: true,
    placeholder: 'API 핸들러에서 Supabase로 쿼리하는 방식을 설명하세요',
    minLength: 30
  },
  {
    name: 'realtime',
    label: 'Realtime 구독',
    type: 'textarea',
    required: false,
    placeholder: 'Supabase Realtime을 어떻게 활용할지 설명하세요',
    minLength: 20
  },
  {
    name: 'caching',
    label: '캐싱 전략',
    type: 'select',
    required: true,
    options: [
      { value: 'react-query', label: 'React Query (TanStack Query)' },
      { value: 'swr', label: 'SWR (Stale-While-Revalidate)' },
      { value: 'redux-toolkit', label: 'Redux Toolkit RTK Query' },
      { value: 'none', label: '캐싱 없음' }
    ]
  }
]

export const step11Fields: FormFieldConfig[] = [
  {
    name: 'authMethod',
    label: '인증 방식 상세',
    type: 'textarea',
    required: true,
    placeholder: 'JWT/OAuth/Session 등의 구체적인 구현 방식을 설명하세요',
    minLength: 30
  },
  {
    name: 'roleBasedAccess',
    label: '권한 관리 (RBAC)',
    type: 'textarea',
    required: true,
    placeholder: 'admin, user, guest 등의 역할과 권한을 정의하세요',
    minLength: 30
  },
  {
    name: 'dataEncryption',
    label: '데이터 암호화',
    type: 'textarea',
    required: true,
    placeholder: '전송 중 암호화(HTTPS), 저장 시 암호화 방식을 설명하세요',
    minLength: 20
  },
  {
    name: 'apiSecurity',
    label: 'API 보안',
    type: 'textarea',
    required: true,
    placeholder: 'CORS, Rate Limiting, Input Validation 등 API 보안 조치를 설명하세요',
    minLength: 30
  }
]

export const step12Fields: FormFieldConfig[] = [
  {
    name: 'unitTests',
    label: '단위 테스트 범위',
    type: 'textarea',
    required: true,
    placeholder: '어떤 컴포넌트와 함수를 단위 테스트할지 설명하세요',
    minLength: 20
  },
  {
    name: 'integrationTests',
    label: '통합 테스트 시나리오',
    type: 'textarea',
    required: true,
    placeholder: 'API 통합, DB 통합 등의 테스트 시나리오를 설명하세요',
    minLength: 20
  },
  {
    name: 'e2eTests',
    label: 'E2E 테스트 계획',
    type: 'textarea',
    required: true,
    placeholder: 'Playwright로 테스트할 주요 사용자 시나리오를 나열하세요',
    minLength: 30
  },
  {
    name: 'testCoverage',
    label: '목표 커버리지',
    type: 'select',
    required: true,
    options: [
      { value: '60%', label: '60% (최소)' },
      { value: '70%', label: '70% (권장)' },
      { value: '80%', label: '80% (우수)' },
      { value: '90%', label: '90% (매우 우수)' }
    ]
  }
]

export const step13Fields: FormFieldConfig[] = [
  {
    name: 'platform',
    label: '배포 플랫폼',
    type: 'select',
    required: true,
    options: [
      { value: 'vercel', label: 'Vercel' },
      { value: 'netlify', label: 'Netlify' },
      { value: 'aws', label: 'AWS (EC2/ECS)' },
      { value: 'gcp', label: 'Google Cloud Platform' },
      { value: 'azure', label: 'Microsoft Azure' }
    ]
  },
  {
    name: 'cicd',
    label: 'CI/CD 파이프라인',
    type: 'select',
    required: true,
    options: [
      { value: 'github-actions', label: 'GitHub Actions' },
      { value: 'gitlab-ci', label: 'GitLab CI/CD' },
      { value: 'circle-ci', label: 'CircleCI' },
      { value: 'jenkins', label: 'Jenkins' }
    ]
  },
  {
    name: 'monitoring',
    label: '모니터링 도구',
    type: 'array',
    required: true,
    placeholder: '모니터링 도구 입력 (예: Sentry, Vercel Analytics)',
    maxItems: 10
  },
  {
    name: 'logging',
    label: '로깅 전략',
    type: 'textarea',
    required: true,
    placeholder: '로그 레벨, 로그 수집 방식, 보안 로그 등을 설명하세요',
    minLength: 30
  }
]
