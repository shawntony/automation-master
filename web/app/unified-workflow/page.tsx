'use client'

import { useState, useEffect } from 'react'
import { ProgressBar } from '@/components/unified/ProgressBar'
import { StepNavigation } from '@/components/unified/StepNavigation'
import { ProjectInfo } from '@/components/unified/ProjectInfo'
import { PrdUpload } from '../create-project/components/PrdUpload'
import { PrdIdeaInput } from '../create-project/components/PrdIdeaInput'
import { PrdFormWizard } from '../create-project/components/PrdFormWizard'
import { PromptHistory } from '@/components/unified/PromptHistory'
import {
  Step4IdeaDefinition,
  GenericWorkflowStep,
  step5Fields,
  step6Fields,
  step7Fields,
  step8Fields,
  step9Fields,
  step10Fields,
  step11Fields,
  step12Fields,
  step13Fields,
  stepIcons,
  stepTitles
} from './steps'
import {
  Package,
  FileText,
  CheckCircle2,
  Sparkles,
  Save,
  FolderOpen,
  History,
  Download
} from 'lucide-react'
import type {
  UnifiedWorkflowState,
  ProjectType,
  PrdMethod,
  UNIFIED_WORKFLOW_STEPS,
  CreateProjectResponse
} from '@/types/unified-workflow'
import type { PrdOptions, PrdFormData } from '@/types/prd'
import {
  saveProgressClient,
  loadProgressClient,
  hasProgressClient
} from '@/lib/progress-storage'

const PROJECT_TYPES = [
  {
    value: 'fullstack' as ProjectType,
    label: 'Fullstack',
    description: 'Next.js + Supabase 풀스택 애플리케이션',
    icon: '🌐'
  },
  {
    value: 'frontend' as ProjectType,
    label: 'Frontend',
    description: 'React/Next.js 프론트엔드 프로젝트',
    icon: '🎨'
  },
  {
    value: 'backend' as ProjectType,
    label: 'Backend',
    description: 'API 서버 및 백엔드 시스템',
    icon: '⚙️'
  },
  {
    value: 'automation' as ProjectType,
    label: 'Automation',
    description: '자동화 스크립트 및 도구',
    icon: '🤖'
  }
]

export default function UnifiedWorkflowPage() {
  // ========== State Management ==========
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showPromptHistory, setShowPromptHistory] = useState(false)

  // Project Creation (Steps 1-3)
  const [projectName, setProjectName] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('fullstack')
  const [prdMethod, setPrdMethod] = useState<PrdMethod>('skip')
  const [prdOptions, setPrdOptions] = useState<PrdOptions>({
    method: 'skip'
  })

  // Creation Results
  const [projectPath, setProjectPath] = useState<string>()
  const [prdPath, setPrdPath] = useState<string>()
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [creationError, setCreationError] = useState<string>()

  // Workflow State (Steps 4-13)
  const [workflowData, setWorkflowData] = useState<Record<number, any>>({})
  const [workflowPrompts, setWorkflowPrompts] = useState<Record<number, string>>({})

  // Progress Save/Load
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string>()
  const [hasExistingProgress, setHasExistingProgress] = useState(false)

  // Check for existing progress on mount
  useEffect(() => {
    if (projectPath) {
      checkExistingProgress()
    }
  }, [projectPath])

  const checkExistingProgress = async () => {
    if (!projectPath) return
    const exists = await hasProgressClient(projectPath)
    setHasExistingProgress(exists)
  }

  // Auto-save after each step completion
  useEffect(() => {
    if (projectPath && completedSteps.length > 3) {
      // Auto-save after workflow steps (4+)
      handleSaveProgress(true)
    }
  }, [completedSteps.length])

  // ========== Progress Save/Load Handlers ==========
  const handleSaveProgress = async (isAutoSave = false) => {
    if (!projectPath) {
      setSaveMessage('❌ 프로젝트 경로가 없습니다')
      return
    }

    setIsSaving(true)
    setSaveMessage(undefined)

    const state: Partial<UnifiedWorkflowState> = {
      projectName,
      projectType,
      projectPath,
      prdPath,
      prdMethod,
      currentStep,
      completedSteps,
      workflowData,
      workflowPrompts,
      timestamp: new Date().toISOString()
    }

    const result = await saveProgressClient(projectPath, state)

    setIsSaving(false)

    if (result.success) {
      setSaveMessage(isAutoSave ? '✅ 자동 저장됨' : '✅ 진행 상황 저장 완료')
      setTimeout(() => setSaveMessage(undefined), 3000)
    } else {
      setSaveMessage(`❌ 저장 실패: ${result.error}`)
    }
  }

  const handleLoadProgress = async () => {
    if (!projectPath) {
      alert('프로젝트 경로가 없습니다')
      return
    }

    setIsLoading(true)

    const result = await loadProgressClient(projectPath)

    setIsLoading(false)

    if (result.success && result.data) {
      const { data } = result
      setProjectName(data.projectName)
      setProjectType(data.projectType)
      setProjectPath(data.projectPath)
      setPrdPath(data.prdPath)
      setPrdMethod(data.prdMethod as PrdMethod)
      setCurrentStep(data.currentStep)
      setCompletedSteps(data.completedSteps)
      setWorkflowData(data.workflowData)
      setWorkflowPrompts(data.workflowPrompts)
      alert('✅ 진행 상황 불러오기 완료!')
    } else {
      alert(`❌ 불러오기 실패: ${result.error}`)
    }
  }

  const handleExportPrompts = () => {
    const promptEntries = Object.entries(workflowPrompts)
      .map(([stepNum, prompt]) => {
        const title = stepTitles[Number(stepNum)] || `Step ${stepNum}`
        return `# ${title}\n\n${prompt}\n\n---\n`
      })
      .join('\n')

    const blob = new Blob([promptEntries], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName}-prompts.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ... rest of the existing code (handleNext, handlePrevious, etc.)
  // [Insert all existing handler functions here]

  const handleNext = async () => {
    if (currentStep === 3) {
      // Step 3: Create the project
      await handleCreateProject()
    } else {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateProject = async () => {
    setIsCreating(true)
    setCreationError(undefined)

    try {
      const response = await fetch('/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          projectType,
          prdOptions
        })
      })

      const result: CreateProjectResponse = await response.json()

      if (result.success) {
        setProjectPath(result.projectPath)
        setPrdPath(result.prdPath)
        setGeneratedFiles(result.generatedFiles || [])
        setCompletedSteps([...completedSteps, 1, 2, 3])
        setCurrentStep(4)
      } else {
        setCreationError(result.error || '프로젝트 생성 실패')
      }
    } catch (error) {
      console.error('Project creation error:', error)
      setCreationError('프로젝트 생성 중 오류 발생')
    } finally {
      setIsCreating(false)
    }
  }

  const handlePrdFormSubmit = (formData: PrdFormData) => {
    setPrdOptions({
      method: 'form',
      formData
    })
  }

  const handlePrdIdeaSubmit = (ideaText: string) => {
    setPrdOptions({
      method: 'idea',
      ideaText
    })
  }

  const handlePrdFileUpload = (filePath: string) => {
    setPrdOptions({
      method: 'file',
      filePath
    })
  }

  const handleStepComplete = (stepNumber: number, data: any, prompt: string) => {
    setWorkflowData({ ...workflowData, [stepNumber]: data })
    setWorkflowPrompts({ ...workflowPrompts, [stepNumber]: prompt })
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber])
    }
    setCurrentStep(stepNumber + 1)
  }

  const canGoBack = currentStep > 1 && !isCreating
  const canGoForward =
    (currentStep === 1 && projectName.trim()) ||
    (currentStep === 2 && projectType) ||
    (currentStep === 3 && prdMethod) ||
    currentStep > 3

  // [Insert all renderStepContent and other render functions here]
  const renderStepContent = () => {
    const renderWorkflowStep = () => {
      const stepProps = {
        projectName,
        projectType,
        projectPath,
        prdPath
      }

      switch (currentStep) {
        case 4:
          return (
            <Step4IdeaDefinition
              {...stepProps}
              initialData={workflowData[4]}
              onComplete={(data, prompt) => handleStepComplete(4, data, prompt)}
            />
          )

        case 5:
          return (
            <GenericWorkflowStep
              stepNumber={5}
              stepTitle={stepTitles[5]}
              stepIcon={stepIcons[5]}
              {...stepProps}
              fields={step5Fields}
              initialData={workflowData[5]}
              onComplete={(data, prompt) => handleStepComplete(5, data, prompt)}
              skipCondition={
                prdPath
                  ? {
                      check: true,
                      message: `Step 2에서 PRD를 이미 작성했습니다: ${prdPath}`
                    }
                  : undefined
              }
            />
          )

        case 6:
          return (
            <GenericWorkflowStep
              stepNumber={6}
              stepTitle={stepTitles[6]}
              stepIcon={stepIcons[6]}
              {...stepProps}
              fields={step6Fields}
              initialData={workflowData[6]}
              onComplete={(data, prompt) => handleStepComplete(6, data, prompt)}
            />
          )

        case 7:
          return (
            <GenericWorkflowStep
              stepNumber={7}
              stepTitle={stepTitles[7]}
              stepIcon={stepIcons[7]}
              {...stepProps}
              fields={step7Fields}
              initialData={workflowData[7]}
              onComplete={(data, prompt) => handleStepComplete(7, data, prompt)}
            />
          )

        case 8:
          return (
            <GenericWorkflowStep
              stepNumber={8}
              stepTitle={stepTitles[8]}
              stepIcon={stepIcons[8]}
              {...stepProps}
              fields={step8Fields}
              initialData={workflowData[8]}
              onComplete={(data, prompt) => handleStepComplete(8, data, prompt)}
            />
          )

        case 9:
          return (
            <GenericWorkflowStep
              stepNumber={9}
              stepTitle={stepTitles[9]}
              stepIcon={stepIcons[9]}
              {...stepProps}
              fields={step9Fields}
              initialData={workflowData[9]}
              onComplete={(data, prompt) => handleStepComplete(9, data, prompt)}
            />
          )

        case 10:
          return (
            <GenericWorkflowStep
              stepNumber={10}
              stepTitle={stepTitles[10]}
              stepIcon={stepIcons[10]}
              {...stepProps}
              fields={step10Fields}
              initialData={workflowData[10]}
              onComplete={(data, prompt) => handleStepComplete(10, data, prompt)}
            />
          )

        case 11:
          return (
            <GenericWorkflowStep
              stepNumber={11}
              stepTitle={stepTitles[11]}
              stepIcon={stepIcons[11]}
              {...stepProps}
              fields={step11Fields}
              initialData={workflowData[11]}
              onComplete={(data, prompt) => handleStepComplete(11, data, prompt)}
            />
          )

        case 12:
          return (
            <GenericWorkflowStep
              stepNumber={12}
              stepTitle={stepTitles[12]}
              stepIcon={stepIcons[12]}
              {...stepProps}
              fields={step12Fields}
              initialData={workflowData[12]}
              onComplete={(data, prompt) => handleStepComplete(12, data, prompt)}
            />
          )

        case 13:
          return (
            <GenericWorkflowStep
              stepNumber={13}
              stepTitle={stepTitles[13]}
              stepIcon={stepIcons[13]}
              {...stepProps}
              fields={step13Fields}
              initialData={workflowData[13]}
              onComplete={(data, prompt) => handleStepComplete(13, data, prompt)}
            />
          )

        default:
          return (
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">완료!</p>
                <p className="text-sm text-gray-600 mt-2">
                  모든 단계를 완료했습니다 🎉
                </p>
              </div>

              {/* Prompt History */}
              <PromptHistory prompts={workflowPrompts} stepTitles={stepTitles} />
            </div>
          )
      }
    }

    // Steps 1-3: Project Creation
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <Package className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="font-medium text-indigo-900">Step 1: 프로젝트 정보</p>
              <p className="text-sm text-indigo-700">
                프로젝트 이름과 타입을 선택하세요
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-awesome-project"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트 타입 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setProjectType(type.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      projectType === type.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <FileText className="h-6 w-6 text-purple-600" />
            <div>
              <p className="font-medium text-purple-900">Step 2: PRD 방식 선택</p>
              <p className="text-sm text-purple-700">
                PRD(Product Requirements Document) 작성 방법을 선택하세요
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setPrdMethod('file')}
                className={`p-4 border-2 rounded-lg text-left ${
                  prdMethod === 'file'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">파일 업로드</p>
                    <p className="text-sm text-gray-600">
                      기존 PRD 파일 (.md, .txt)을 업로드
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPrdMethod('idea')}
                className={`p-4 border-2 rounded-lg text-left ${
                  prdMethod === 'idea'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">아이디어 입력</p>
                    <p className="text-sm text-gray-600">
                      프로젝트 아이디어를 간단히 입력 (Claude가 PRD 생성)
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPrdMethod('form')}
                className={`p-4 border-2 rounded-lg text-left ${
                  prdMethod === 'form'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">폼 작성</p>
                    <p className="text-sm text-gray-600">
                      단계별 폼으로 PRD 직접 작성
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPrdMethod('skip')}
                className={`p-4 border-2 rounded-lg text-left ${
                  prdMethod === 'skip'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">건너뛰기</p>
                    <p className="text-sm text-gray-600">
                      PRD 작성을 건너뛰고 Step 5에서 작성
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Step 3: PRD 작성</p>
              <p className="text-sm text-green-700">
                선택한 방식으로 PRD를 작성하거나 건너뛰세요
              </p>
            </div>
          </div>

          {prdMethod === 'file' && (
            <PrdUpload projectName={projectName} onComplete={handlePrdFileUpload} />
          )}

          {prdMethod === 'idea' && (
            <PrdIdeaInput projectName={projectName} onComplete={handlePrdIdeaSubmit} />
          )}

          {prdMethod === 'form' && (
            <PrdFormWizard
              projectName={projectName}
              projectType={projectType}
              onFormSubmit={handlePrdFormSubmit}
            />
          )}

          {prdMethod === 'skip' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">PRD 작성을 건너뜁니다</p>
              <p className="text-sm text-gray-500 mt-2">
                프로젝트 생성 후 워크플로우 Step 5에서 PRD를 작성할 수 있습니다
              </p>
            </div>
          )}

          {creationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{creationError}</p>
            </div>
          )}
        </div>
      )
    }

    // Steps 4+: Workflow
    return renderWorkflowStep()
  }

  // ========== Main Render ==========
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Project Info (after creation) */}
          {projectPath && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <ProjectInfo
                projectName={projectName}
                projectType={projectType}
                projectPath={projectPath}
              />

              {/* Progress Controls */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleSaveProgress(false)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? '저장 중...' : '진행 상황 저장'}
                </button>

                {hasExistingProgress && (
                  <button
                    onClick={handleLoadProgress}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                  >
                    <FolderOpen className="h-4 w-4" />
                    {isLoading ? '불러오는 중...' : '진행 상황 불러오기'}
                  </button>
                )}

                {Object.keys(workflowPrompts).length > 0 && (
                  <>
                    <button
                      onClick={() => setShowPromptHistory(!showPromptHistory)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <History className="h-4 w-4" />
                      프롬프트 히스토리
                    </button>

                    <button
                      onClick={handleExportPrompts}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <Download className="h-4 w-4" />
                      내보내기
                    </button>
                  </>
                )}

                {saveMessage && (
                  <span className="text-sm text-gray-600 ml-auto">{saveMessage}</span>
                )}
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="p-8">
            {showPromptHistory ? (
              <PromptHistory prompts={workflowPrompts} stepTitles={stepTitles} />
            ) : (
              renderStepContent()
            )}
          </div>

          {/* Navigation */}
          {!showPromptHistory && (
            <StepNavigation
              currentStep={currentStep}
              totalSteps={13}
              onPrevious={handlePrevious}
              onNext={handleNext}
              canGoBack={canGoBack}
              canGoForward={canGoForward && !isCreating}
              isCreationComplete={projectPath !== undefined}
            />
          )}
        </div>

        {/* Loading Overlay */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">프로젝트 생성 중...</p>
                  <p className="text-sm text-gray-600">잠시만 기다려주세요</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
