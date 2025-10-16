/**
 * SSA 생성기 통합 모듈
 *
 * AutomationMaster에서 SSA의 모든 생성기를 쉽게 사용할 수 있도록 통합
 */

export { generateFullstackApp, generateFullstackWizard } from './fullstack.js';
export { generateBackend } from './backend.js';
export { generateFrontend } from './frontend.js';
export { migrateGoogleSheets } from './migration.js';

// SSA 어댑터 직접 접근
export { SSAAdapter, createSSAAdapter } from '../integrations/ssa-adapter.js';

/**
 * 사용 가능한 모든 생성기 목록
 */
export const AVAILABLE_GENERATORS = {
  fullstack: {
    name: '풀스택 생성기',
    description: '5분 안에 완전한 Next.js 14 애플리케이션 생성',
    features: [
      'AI 기반 스키마 분석',
      '지능형 아키텍처 설계',
      '실시간 대시보드',
      '완벽한 CRUD 시스템',
      '완전 인증 (소셜 로그인, MFA)',
      '배포 준비 완료'
    ]
  },
  backend: {
    name: '백엔드 생성기',
    description: 'V0/React 코드를 Supabase 백엔드로 자동 변환',
    features: [
      '코드 분석 및 모델 추출',
      'Supabase SQL 스키마 생성',
      'RLS 보안 정책',
      'TypeScript 타입 정의',
      '성능 최적화 (인덱스, View)',
      '실시간 구독 설정'
    ]
  },
  frontend: {
    name: '프론트엔드 생성기',
    description: 'Supabase 스키마에서 React/Next.js 애플리케이션 생성',
    features: [
      'React/Next.js 컴포넌트',
      'shadcn/ui 통합',
      'React Query 데이터 훅스',
      '인증 시스템',
      'Middle Layer (Zustand, 미들웨어)',
      '원클릭 자동 설정'
    ]
  },
  migration: {
    name: 'Google Sheets 마이그레이션',
    description: 'Google Sheets를 Supabase PostgreSQL로 자동 마이그레이션',
    features: [
      '구조 자동 분석',
      '정규화 변환 (차원 + 팩트 테이블)',
      '관계 보존 (외래키)',
      '성능 최적화 (Materialized View)',
      '한국어 지원',
      '실시간 분석 뷰'
    ]
  }
};

/**
 * 생성기 정보 가져오기
 */
export function getGeneratorInfo(generatorName) {
  return AVAILABLE_GENERATORS[generatorName] || null;
}

/**
 * 모든 생성기 목록 가져오기
 */
export function listGenerators() {
  return Object.entries(AVAILABLE_GENERATORS).map(([key, info]) => ({
    id: key,
    ...info
  }));
}
