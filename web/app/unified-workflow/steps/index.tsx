/**
 * Centralized step component exports and configurations
 */

export { Step4IdeaDefinition, type Step4Data } from './Step4IdeaDefinition'
export { GenericWorkflowStep } from './GenericWorkflowStep'
export {
  step5Fields,
  step6Fields,
  step7Fields,
  step8Fields,
  step9Fields,
  step10Fields,
  step11Fields,
  step12Fields,
  step13Fields
} from './stepConfigs'

import {
  FileText,
  Layout,
  Database,
  Code,
  Network,
  Shield,
  TestTube,
  Rocket
} from 'lucide-react'

/**
 * Step icons mapping
 */
export const stepIcons = {
  5: <FileText className="h-6 w-6 text-blue-600" />,
  6: <Layout className="h-6 w-6 text-purple-600" />,
  7: <Database className="h-6 w-6 text-green-600" />,
  8: <Code className="h-6 w-6 text-pink-600" />,
  9: <Network className="h-6 w-6 text-indigo-600" />,
  10: <Network className="h-6 w-6 text-cyan-600" />,
  11: <Shield className="h-6 w-6 text-red-600" />,
  12: <TestTube className="h-6 w-6 text-orange-600" />,
  13: <Rocket className="h-6 w-6 text-teal-600" />
}

/**
 * Step titles mapping
 */
export const stepTitles = {
  5: 'PRD 작성',
  6: '시스템 기획서 작성',
  7: 'Supabase 스키마 설계',
  8: '프론트엔드 설계',
  9: '백엔드 API 설계',
  10: '데이터 플로우 설계',
  11: '보안 및 인증',
  12: '테스트 전략',
  13: '배포 및 모니터링'
}
