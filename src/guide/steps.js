/**
 * 10단계 개발 가이드 정의
 */

export const steps = [
  {
    id: 1,
    title: "아이디어 발굴 및 정의",
    duration: "1-2주",
    description: "명확한 문제 정의 및 해결책 구상",
    tasks: [
      {
        id: "1.1",
        title: "문제 발견하기",
        items: [
          "업무 중 반복적으로 하는 작업 찾기",
          "시간이 많이 걸리는 작업 찾기",
          "실수가 자주 발생하는 작업 찾기"
        ]
      },
      {
        id: "1.2",
        title: "문제 구체화하기",
        items: [
          "누가 이 문제를 겪고 있나요?",
          "언제 이 문제가 발생하나요?",
          "얼마나 자주 발생하나요?",
          "현재 어떻게 해결하고 있나요?",
          "이 문제로 인해 얼마나 많은 시간을 낭비하나요?"
        ]
      },
      {
        id: "1.3",
        title: "해결책 구상하기",
        items: [
          "자동화로 해결 가능한 부분 식별",
          "예상되는 효과 계산",
          "비슷한 솔루션 조사"
        ]
      }
    ],
    mcpServers: ["@task-master", "@web-search", "@memory", "@github", "sub-agent"],
    checklist: [
      "Task Master에 프로젝트 등록됨",
      "문제를 한 문장으로 설명할 수 있다",
      "경쟁 제품 분석 완료",
      "목표 사용자가 명확하다",
      "기대 효과를 구체적으로 정의했다",
      "메모리에 핵심 정보 저장됨"
    ],
    outputs: [
      "아이디어 정의서 (idea-definition.md)",
      "경쟁사 분석 (competitive-analysis.md)",
      "사용자 니즈 분석 (user-needs.md)",
      "기술 가능성 검토 (tech-feasibility.md)"
    ],
    cliCommands: [
      "task-master를 사용해서 새 프로젝트 시작",
      "@web-search로 유사 솔루션 조사",
      "sub-agent로 병렬 분석 작업"
    ]
  },
  {
    id: 2,
    title: "PDR (Preliminary Design Review) 작성",
    duration: "3-5일",
    description: "기술적 타당성 검토 및 시스템 아키텍처 설계",
    tasks: [
      {
        id: "2.1",
        title: "요구사항 분석",
        items: [
          "기능적 요구사항 정의",
          "비기능적 요구사항 정의"
        ]
      },
      {
        id: "2.2",
        title: "시스템 아키텍처 설계",
        items: [
          "시스템 구조 다이어그램 작성",
          "컴포넌트 간 통신 정의"
        ]
      },
      {
        id: "2.3",
        title: "기술적 제약사항 파악",
        items: [
          "예산 제한",
          "인프라 제약",
          "기술 스택 제한",
          "개발 기간"
        ]
      },
      {
        id: "2.4",
        title: "위험 요소 식별",
        items: [
          "기술적 위험",
          "일정 위험",
          "리소스 위험"
        ]
      }
    ],
    mcpServers: ["@task-master", "@web-search", "@supabase", "sub-agent"],
    checklist: [
      "Task Master에서 PDR 작업이 진행 중",
      "모든 요구사항을 문서화했다",
      "시스템 구조를 다이어그램으로 표현했다",
      "Supabase 연동 계획 수립",
      "기술적 위험 요소를 파악했다",
      "개발 일정을 대략적으로 수립했다"
    ],
    outputs: [
      "PDR 문서 (pdr.md)",
      "요구사항 명세 (requirements.md)",
      "아키텍처 설계 (architecture.md)",
      "기술 옵션 조사 (tech-options.md)",
      "위험 분석 (risk-analysis.md)",
      "Supabase 계획 (supabase-planning.md)"
    ],
    cliCommands: [
      "@task-master에서 'PDR 작성' 작업 시작",
      "sub-agent로 병렬 PDR 작성",
      "@supabase로 DB 요구사항 검토"
    ]
  },
  {
    id: 3,
    title: "시스템 기획서 작성",
    duration: "1주",
    description: "상세한 시스템 설계 및 데이터베이스 스키마 작성",
    tasks: [
      {
        id: "3.1",
        title: "사용자 시나리오 작성",
        items: [
          "주요 사용자 플로우 정의",
          "각 시나리오별 상세 단계 작성"
        ]
      },
      {
        id: "3.2",
        title: "화면 정의서",
        items: [
          "화면 이름 및 목적",
          "화면에 포함될 요소",
          "사용자 액션",
          "데이터 표시 방법"
        ]
      },
      {
        id: "3.3",
        title: "데이터베이스 설계",
        items: [
          "테이블 구조 정의",
          "관계 설정",
          "인덱스 전략"
        ]
      },
      {
        id: "3.4",
        title: "API 명세",
        items: [
          "RESTful API 설계",
          "Request/Response 스키마",
          "에러 처리 정책"
        ]
      }
    ],
    mcpServers: ["@supabase", "@task-master", "@memory", "sub-agent"],
    checklist: [
      "Supabase에 실제 스키마 생성됨",
      "모든 사용자 시나리오를 작성했다",
      "각 화면의 기능을 정의했다",
      "API 엔드포인트를 정의했다",
      "에러 처리 방안을 수립했다",
      "Task Master에서 진행 상황 추적 중"
    ],
    outputs: [
      "시스템 기획서 (system-design.md)",
      "사용자 시나리오 (user-scenarios.md)",
      "화면 정의서 (screen-specs.md)",
      "데이터베이스 설계 (database-design.md)",
      "API 명세서 (api-spec.yaml)",
      "Supabase 스키마 (supabase-schema.sql)"
    ],
    cliCommands: [
      "@supabase로 실제 DB 스키마 생성",
      "sub-agent로 시스템 기획서 병렬 작성",
      "@task-master 진행 상황 업데이트"
    ]
  },
  {
    id: 4,
    title: "UI/UX 설계 + Playwright 벤치마킹",
    duration: "1-2주",
    description: "검증된 UI 패턴 활용 및 디자인 시스템 구축",
    tasks: [
      {
        id: "4.1",
        title: "벤치마킹 대상 선정",
        items: [
          "업계 선도 서비스 3-5개",
          "유사한 기능을 제공하는 사이트",
          "UI/UX가 뛰어난 사이트"
        ]
      },
      {
        id: "4.2",
        title: "Playwright로 UI 패턴 추출",
        items: [
          "레이아웃 구조 분석",
          "색상 팔레트 추출",
          "타이포그래피 분석",
          "컴포넌트 패턴 파악"
        ]
      },
      {
        id: "4.3",
        title: "디자인 시스템 구축",
        items: [
          "공통 컴포넌트 템플릿 생성",
          "재사용 가능한 패턴 정리",
          "일관성 있는 스타일 가이드"
        ]
      }
    ],
    mcpServers: ["@playwright", "@task-master", "@memory", "sub-agent"],
    checklist: [
      "Playwright로 3개 이상 사이트 벤치마킹 완료",
      "색상 시스템 정의됨",
      "타이포그래피 시스템 정의됨",
      "공통 컴포넌트 템플릿 생성됨",
      "컴포넌트 라이브러리 문서화됨",
      "Storybook 설정 완료",
      "반응형 패턴 정의됨",
      "재사용 가능한 템플릿으로 패키징됨"
    ],
    outputs: [
      "벤치마킹 리포트 (design-benchmark.md)",
      "디자인 시스템 가이드 (design-system.md)",
      "공통 컴포넌트 템플릿 라이브러리",
      "Tailwind 설정 파일",
      "Storybook 컴포넌트 카탈로그",
      "반응형 디자인 가이드"
    ],
    cliCommands: [
      "@playwright로 벤치마킹 사이트 분석",
      "sub-agent로 디자인 시스템 구축",
      "공통 컴포넌트 템플릿 라이브러리 생성"
    ]
  },
  {
    id: 5,
    title: "기술 스택 선정",
    duration: "2-3일",
    description: "프로젝트에 적합한 기술 스택 선택 및 초기화",
    tasks: [
      {
        id: "5.1",
        title: "프론트엔드 기술 선택",
        items: [
          "React + Vite + TypeScript",
          "Tailwind CSS",
          "컴포넌트 템플릿 통합"
        ]
      },
      {
        id: "5.2",
        title: "백엔드 기술 선택",
        items: [
          "Node.js + Express + TypeScript",
          "Supabase 연동"
        ]
      },
      {
        id: "5.3",
        title: "배포 환경",
        items: [
          "프론트엔드: Vercel",
          "백엔드: Vercel Edge Functions",
          "데이터베이스: Supabase",
          "테스팅: Playwright"
        ]
      }
    ],
    mcpServers: ["@web-search", "@terminal", "@github", "@vercel", "@supabase", "@task-master"],
    checklist: [
      "기술 스택 선정 완료",
      "프론트엔드 프로젝트 초기화",
      "백엔드 프로젝트 초기화",
      "컴포넌트 템플릿 통합",
      "Vercel 프로젝트 연결",
      "Supabase 연결 설정",
      "GitHub 저장소 생성",
      "개발 환경 세팅 완료"
    ],
    outputs: [
      "기술 비교 문서 (tech-comparison-2025.md)",
      "프로젝트 설정 완료 (setup-complete.md)",
      "Vercel 설정 (vercel-setup.md)",
      "개발 계획 (development-plan.md)"
    ],
    cliCommands: [
      "@web-search로 기술 스택 조사",
      "프로젝트 완전 자동 초기화",
      "@vercel로 프로젝트 연결",
      "@task-master로 개발 계획 수립"
    ]
  },
  {
    id: 6,
    title: "프론트엔드 개발",
    duration: "2-4주",
    description: "컴포넌트 템플릿 기반 프론트엔드 개발",
    tasks: [
      {
        id: "6.1",
        title: "레이아웃 컴포넌트 개발",
        items: [
          "MainLayout",
          "AuthLayout",
          "DashboardLayout"
        ]
      },
      {
        id: "6.2",
        title: "인증 페이지 개발",
        items: [
          "Login",
          "Register",
          "ForgotPassword"
        ]
      },
      {
        id: "6.3",
        title: "주요 기능 페이지 개발",
        items: [
          "Dashboard",
          "기능별 페이지"
        ]
      },
      {
        id: "6.4",
        title: "상태 관리 및 API 연동",
        items: [
          "React Query 설정",
          "Supabase 클라이언트",
          "커스텀 훅"
        ]
      }
    ],
    mcpServers: ["@filesystem", "@terminal", "@supabase", "@playwright", "@vercel", "@github", "@task-master", "sub-agent"],
    checklist: [
      "컴포넌트 템플릿 활용됨",
      "모든 페이지 컴포넌트 생성",
      "라우팅 설정 완료",
      "Supabase 연동 완료",
      "Playwright 테스트 통과",
      "Vercel 프리뷰 배포 성공",
      "디자인 시스템 일관성 유지",
      "Task Master에서 진행 추적 중"
    ],
    outputs: [
      "작동하는 프론트엔드 애플리케이션",
      "Playwright 테스트 스위트",
      "Vercel 프리뷰 URL",
      "업데이트된 컴포넌트 템플릿"
    ],
    cliCommands: [
      "sub-agent로 병렬 프론트엔드 개발",
      "@playwright로 자동 컴포넌트 테스트",
      "@vercel로 프리뷰 배포"
    ]
  },
  {
    id: 7,
    title: "백엔드 개발 + Supabase 직접 연동",
    duration: "2-4주",
    description: "Supabase 완전 활용 및 백엔드 API 개발",
    tasks: [
      {
        id: "7.1",
        title: "Supabase 완전 설정",
        items: [
          "데이터베이스 최종화",
          "RLS 정책",
          "Real-time subscription",
          "Storage 설정",
          "Edge Functions"
        ]
      },
      {
        id: "7.2",
        title: "백엔드 API 개발",
        items: [
          "API 라우터",
          "비즈니스 로직",
          "미들웨어",
          "API 테스팅"
        ]
      }
    ],
    mcpServers: ["@supabase", "@filesystem", "@terminal", "@playwright", "@vercel", "@github", "@task-master", "sub-agent"],
    checklist: [
      "Supabase 스키마 최종화",
      "RLS 정책 설정",
      "API 라우터 구현",
      "Edge Functions 배포",
      "Real-time 연동",
      "API 테스트 통과",
      "백엔드 배포 성공"
    ],
    outputs: [
      "완전히 설정된 Supabase 프로젝트",
      "작동하는 백엔드 API",
      "Edge Functions",
      "API 문서",
      "Playwright API 테스트"
    ],
    cliCommands: [
      "@supabase로 완전 설정",
      "sub-agent로 백엔드 API 개발",
      "@supabase Real-time 연동"
    ]
  },
  {
    id: 8,
    title: "테스트 시나리오 및 테스팅",
    duration: "1-2주",
    description: "Playwright 중심의 완전한 테스트 자동화",
    tasks: [
      {
        id: "8.1",
        title: "E2E 테스트",
        items: [
          "사용자 플로우 테스트",
          "컴포넌트 인터랙션",
          "API 통합"
        ]
      },
      {
        id: "8.2",
        title: "크로스 브라우저 테스트",
        items: [
          "Chromium",
          "Firefox",
          "WebKit"
        ]
      },
      {
        id: "8.3",
        title: "성능 및 접근성 테스트",
        items: [
          "Lighthouse 점수",
          "WCAG 2.1 AA 준수"
        ]
      }
    ],
    mcpServers: ["@playwright", "@supabase", "@vercel", "@github", "@task-master", "sub-agent"],
    checklist: [
      "E2E 테스트 스위트 완성",
      "크로스 브라우저 테스트 통과",
      "성능 테스트 완료",
      "접근성 테스트 통과",
      "보안 테스트 완료",
      "시각적 회귀 테스트 설정",
      "CI/CD 통합 완료"
    ],
    outputs: [
      "완전한 Playwright 테스트 스위트",
      "테스트 리포트 (HTML)",
      "버그 리포트",
      "스크린샷 및 비디오",
      "성능 메트릭"
    ],
    cliCommands: [
      "@playwright로 전체 테스트 스위트 생성",
      "sub-agent로 병렬 테스트",
      "자동 버그 수정"
    ]
  },
  {
    id: 9,
    title: "배포 준비 + Vercel MCP 완전 활용",
    duration: "3-5일",
    description: "완전 자동 배포 설정 및 CI/CD 파이프라인",
    tasks: [
      {
        id: "9.1",
        title: "환경 설정",
        items: [
          "개발/스테이징/프로덕션 환경",
          "환경 변수 설정",
          "도메인 설정"
        ]
      },
      {
        id: "9.2",
        title: "빌드 최적화",
        items: [
          "코드 스플리팅",
          "이미지 최적화",
          "번들 크기 분석"
        ]
      },
      {
        id: "9.3",
        title: "CI/CD 파이프라인",
        items: [
          "GitHub Actions 워크플로우",
          "자동 테스트",
          "자동 배포"
        ]
      }
    ],
    mcpServers: ["@vercel", "@supabase", "@playwright", "@github", "@task-master", "@terminal"],
    checklist: [
      "환경별 설정 완료",
      "빌드 최적화 완료",
      "CI/CD 파이프라인 구축",
      "모니터링 설정",
      "원클릭 배포 스크립트 작성",
      "롤백 계획 수립"
    ],
    outputs: [
      "Vercel 배포 완료 문서 (vercel-deployment-complete.md)",
      "배포 체크리스트 (deployment-checklist.md)",
      "원클릭 배포 스크립트",
      "배포 로그"
    ],
    cliCommands: [
      "@vercel로 완전 자동 배포 설정",
      "원클릭 배포 스크립트 생성"
    ]
  },
  {
    id: 10,
    title: "배포 및 운영 + 지속적 자동화",
    duration: "지속",
    description: "운영 자동화 시스템 구축 및 지속적 개선",
    tasks: [
      {
        id: "10.1",
        title: "운영 자동화",
        items: [
          "Daily Tasks (매일)",
          "Weekly Tasks (매주)",
          "Monthly Tasks (매월)",
          "Continuous Monitoring (실시간)"
        ]
      },
      {
        id: "10.2",
        title: "모니터링",
        items: [
          "성능 모니터링",
          "에러 추적",
          "사용자 피드백"
        ]
      }
    ],
    mcpServers: ["@playwright", "@vercel", "@supabase", "@task-master", "sub-agent"],
    checklist: [
      "운영 자동화 스크립트 작성",
      "모니터링 설정 완료",
      "알림 시스템 구축",
      "백업 자동화",
      "컴포넌트 템플릿 생태계 구축"
    ],
    outputs: [
      "운영 자동화 스크립트",
      "모니터링 대시보드",
      "운영 매뉴얼",
      "컴포넌트 템플릿 생태계"
    ],
    cliCommands: [
      "운영 자동화 시스템 구축",
      "sub-agent로 운영 자동화",
      "컴포넌트 템플릿 생태계 구축"
    ]
  }
];

export default steps;
