'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Rocket,
  Folder,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Code,
  BookOpen,
  Layers,
  Upload,
  Lightbulb,
  ClipboardList,
  SkipForward
} from 'lucide-react'
import { StepIndicator } from './components/StepIndicator'
import { PrdUpload } from './components/PrdUpload'
import { PrdIdeaInput } from './components/PrdIdeaInput'
import { PrdFormWizard } from './components/PrdFormWizard'
import type { PrdFormData } from '@/types/prd'

const PROJECT_TYPES = [
  {
    value: 'fullstack',
    label: 'Fullstack',
    icon: Layers,
    description: '웹앱 전체 (프론트엔드 + 백엔드 + DB)',
    color: 'bg-purple-100 text-purple-700 border-purple-300'
  },
  {
    value: 'frontend',
    label: 'Frontend',
    icon: Code,
    description: 'UI/UX만 (프론트엔드)',
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  {
    value: 'backend',
    label: 'Backend',
    icon: FileText,
    description: 'API + DB (백엔드)',
    color: 'bg-green-100 text-green-700 border-green-300'
  },
  {
    value: 'automation',
    label: 'Automation',
    icon: Rocket,
    description: '스크립트/도구',
    color: 'bg-orange-100 text-orange-700 border-orange-300'
  }
]

const STEPS = [
  { id: 1, name: '기본 정보', description: '프로젝트 이름과 타입' },
  { id: 2, name: 'PRD 입력', description: 'PRD 작성 또는 업로드' },
  { id: 3, name: '확인 및 생성', description: '최종 확인' }
]

type PrdMethod = 'file' | 'idea' | 'form' | 'skip'

interface CreateProjectResult {
  success: boolean
  projectPath?: string
  prdPath?: string
  message?: string
}

export default function CreateProjectPage() {
  const router = useRouter()

  // Step 1: Basic Info
  const [currentStep, setCurrentStep] = useState(1)
  const [projectName, setProjectName] = useState('')
  const [projectType, setProjectType] = useState<string>('fullstack')

  // Step 2: PRD
  const [prdMethod, setPrdMethod] = useState<PrdMethod>('skip')
  const [prdFile, setPrdFile] = useState<File | null>(null)
  const [prdFileContent, setPrdFileContent] = useState<string>('')
  const [prdIdea, setPrdIdea] = useState<string>('')
  const [prdFormData, setPrdFormData] = useState<PrdFormData | null>(null)

  // Submission
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string>('')
  const [result, setResult] = useState<CreateProjectResult | null>(null)

  const validateProjectName = (name: string): string | null => {
    if (!name || name.trim() === '') {
      return '프로젝트 이름을 입력해주세요'
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      return '프로젝트 이름은 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다'
    }
    return null
  }

  const handleNextStep = () => {
    setError('')

    if (currentStep === 1) {
      const validationError = validateProjectName(projectName)
      if (validationError) {
        setError(validationError)
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  const handlePrevStep = () => {
    setError('')
    setCurrentStep(currentStep - 1)
  }

  const handlePrdMethodChange = (method: PrdMethod) => {
    setPrdMethod(method)
    setError('')
  }

  const handleFileSelect = (file: File, content: string) => {
    setPrdFile(file)
    setPrdFileContent(content)
  }

  const handleFileClear = () => {
    setPrdFile(null)
    setPrdFileContent('')
  }

  const handleIdeaSubmit = (idea: string) => {
    setPrdIdea(idea)
  }

  const handleFormSubmit = (formData: PrdFormData) => {
    setPrdFormData(formData)
  }

  const handleCreateProject = async () => {
    setError('')
    setIsCreating(true)

    try {
      // Prepare PRD options
      let prdOptions: any = { method: prdMethod }

      if (prdMethod === 'file') {
        prdOptions.fileUpload = {
          fileName: prdFile?.name || '',
          content: prdFileContent
        }
      } else if (prdMethod === 'idea') {
        prdOptions.ideaInput = {
          idea: prdIdea
        }
      } else if (prdMethod === 'form') {
        prdOptions.formData = prdFormData
      }

      const response = await fetch('/api/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName: projectName.trim(),
          projectType,
          prdOptions
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '프로젝트 생성에 실패했습니다')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || '프로젝트 생성 중 오류가 발생했습니다')
    } finally {
      setIsCreating(false)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setProjectName('')
    setProjectType('fullstack')
    setPrdMethod('skip')
    setPrdFile(null)
    setPrdFileContent('')
    setPrdIdea('')
    setPrdFormData(null)
    setError('')
    setResult(null)
  }

  // Success screen
  if (result?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200">
            {/* Success Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  프로젝트 생성 완료!
                </h1>
                <p className="text-gray-600">
                  새 프로젝트가 성공적으로 생성되었습니다
                </p>
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">프로젝트명</p>
                  <p className="font-semibold text-gray-900">{projectName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">타입</p>
                  <p className="font-semibold text-gray-900">
                    {PROJECT_TYPES.find((t) => t.value === projectType)?.label}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">경로</p>
                  <p className="font-mono text-sm text-gray-900 bg-white p-2 rounded border">
                    {result.projectPath}
                  </p>
                </div>
                {result.prdPath && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">PRD 파일</p>
                    <p className="font-mono text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {result.prdPath}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Created Files */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                복사된 가이드 문서
              </h2>
              <div className="bg-indigo-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                    planning.md - 10단계 개발 가이드
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                    PROJECT_SUMMARY.md - 프로젝트 요약
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                    WEB_APP_GUIDE.md - 웹앱 개발 가이드
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                    WEB_CLI_INTEGRATION.md - CLI-웹 통합 가이드
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-indigo-600" />
                    WORKFLOW_GUIDE.md - 워크플로우 가이드
                  </li>
                </ul>
              </div>
            </div>

            {/* Generated Files */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-green-600" />
                생성된 파일
              </h2>
              <div className="bg-green-50 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                  {result.prdPath && (
                    <li className="flex items-center gap-2 text-gray-700 font-medium">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      docs/PRD.md - 프로젝트 요구사항 문서
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    agents-guide.md - 에이전트 활용 가이드
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    project-workflow.md - 프로젝트 워크플로우
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    README.md - 프로젝트 개요
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    .claude/commands/create-prd.md - PRD 생성 명령어
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    config/progress.json - 진행상황 추적
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    .gitignore - Git 설정
                  </li>
                </ul>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                다음 단계
              </h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>프로젝트 폴더로 이동: <code className="bg-white px-2 py-1 rounded text-xs font-mono">cd {result.projectPath}</code></li>
                  <li>README.md 파일 확인</li>
                  {result.prdPath ? (
                    <li>docs/PRD.md 파일 검토 및 보완</li>
                  ) : (
                    <li>PRD 작성 (나중에 작성 가능)</li>
                  )}
                  <li>project-guide/planning.md 참조하여 개발 시작</li>
                  <li>agents-guide.md에서 에이전트 활용법 확인</li>
                </ol>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                새 프로젝트 만들기
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Rocket className="h-7 w-7 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                프로젝트 생성 도우미
              </h1>
              <p className="text-gray-600">
                새로운 프로젝트를 시작하세요
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} steps={STEPS} />

          {/* Step Content */}
          <div className="mt-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로젝트 이름 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="my-awesome-project"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능
                  </p>
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    프로젝트 타입 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PROJECT_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setProjectType(type.value)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            projectType === type.value
                              ? type.color + ' border-2'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="h-5 w-5" />
                            <span className="font-semibold">{type.label}</span>
                          </div>
                          <p className="text-xs opacity-80">{type.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Project Path Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">생성 경로</p>
                  <p className="font-mono text-sm text-gray-900">
                    C:\Users\gram\myautomation\
                    {projectName || '<프로젝트명>'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: PRD Input */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    PRD 입력 방법 선택
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    프로젝트 요구사항 문서(PRD)를 어떻게 작성하시겠습니까?
                  </p>

                  {/* PRD Method Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button
                      type="button"
                      onClick={() => handlePrdMethodChange('file')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center gap-2 ${
                        prdMethod === 'file'
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      파일 업로드
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrdMethodChange('idea')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center gap-2 ${
                        prdMethod === 'idea'
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Lightbulb className="h-4 w-4" />
                      아이디어 입력
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrdMethodChange('form')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center gap-2 ${
                        prdMethod === 'form'
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <ClipboardList className="h-4 w-4" />
                      단계별 폼
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrdMethodChange('skip')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center gap-2 ${
                        prdMethod === 'skip'
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <SkipForward className="h-4 w-4" />
                      나중에 작성
                    </button>
                  </div>

                  {/* PRD Method Content */}
                  {prdMethod === 'file' && (
                    <PrdUpload
                      onFileSelect={handleFileSelect}
                      onClear={handleFileClear}
                    />
                  )}

                  {prdMethod === 'idea' && (
                    <PrdIdeaInput
                      projectName={projectName}
                      projectType={projectType}
                      onIdeaSubmit={handleIdeaSubmit}
                    />
                  )}

                  {prdMethod === 'form' && (
                    <PrdFormWizard
                      projectName={projectName}
                      projectType={projectType}
                      onFormSubmit={handleFormSubmit}
                    />
                  )}

                  {prdMethod === 'skip' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <SkipForward className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                      <p className="font-medium text-yellow-900 mb-2">
                        PRD를 나중에 작성합니다
                      </p>
                      <p className="text-sm text-yellow-700">
                        프로젝트 생성 후 docs/PRD.md 파일을 직접 작성하거나<br />
                        .claude/commands/create-prd.md 명령어를 사용할 수 있습니다
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    프로젝트 생성 최종 확인
                  </h2>

                  {/* Project Summary */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-medium text-gray-900 mb-4">기본 정보</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">프로젝트명</span>
                        <span className="font-semibold text-gray-900">{projectName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">타입</span>
                        <span className="font-semibold text-gray-900">
                          {PROJECT_TYPES.find((t) => t.value === projectType)?.label}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">생성 경로</p>
                        <p className="font-mono text-xs text-gray-900">
                          C:\Users\gram\myautomation\{projectName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PRD Summary */}
                  <div className="bg-indigo-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-4">PRD 정보</h3>
                    {prdMethod === 'file' && prdFile && (
                      <div className="flex items-center gap-3">
                        <Upload className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">파일 업로드</p>
                          <p className="text-xs text-gray-600">{prdFile.name}</p>
                        </div>
                      </div>
                    )}
                    {prdMethod === 'idea' && prdIdea && (
                      <div className="flex items-center gap-3">
                        <Lightbulb className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">아이디어 입력</p>
                          <p className="text-xs text-gray-600">AI로 PRD 자동 생성됨</p>
                        </div>
                      </div>
                    )}
                    {prdMethod === 'form' && prdFormData && (
                      <div className="flex items-center gap-3">
                        <ClipboardList className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">단계별 폼 작성</p>
                          <p className="text-xs text-gray-600">
                            {prdFormData.features.filter(f => f.trim()).length}개 기능 • {prdFormData.techStack.length}개 기술
                          </p>
                        </div>
                      </div>
                    )}
                    {prdMethod === 'skip' && (
                      <div className="flex items-center gap-3">
                        <SkipForward className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">나중에 작성</p>
                          <p className="text-xs text-gray-600">PRD를 생성하지 않음</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* What will be created */}
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">생성될 파일</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {prdMethod !== 'skip' && (
                        <li>• docs/PRD.md - 프로젝트 요구사항 문서</li>
                      )}
                      <li>• project-guide/ - 개발 가이드 문서들</li>
                      <li>• agents-guide.md - 에이전트 활용 가이드</li>
                      <li>• config/progress.json - 진행상황 추적</li>
                      <li>• README.md 및 기타 설정 파일들</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                disabled={isCreating}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                이전
              </button>
            )}

            <div className="flex-1" />

            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleCreateProject}
                disabled={isCreating}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    프로젝트 생성 중...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    프로젝트 생성
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
