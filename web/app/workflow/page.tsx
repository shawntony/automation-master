'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { postData, ApiError } from '@/lib/utils/api'

const steps = [
  { id: 1, title: "아이디어 발굴 및 정의", duration: "1-2주" },
  { id: 2, title: "PDR 작성", duration: "3-5일" },
  { id: 3, title: "시스템 기획서 작성", duration: "1주" },
  { id: 4, title: "UI/UX 설계", duration: "1-2주" },
  { id: 5, title: "기술 스택 선정", duration: "2-3일" },
  { id: 6, title: "프론트엔드 개발", duration: "2-4주" },
  { id: 7, title: "백엔드 개발", duration: "2-4주" },
  { id: 8, title: "테스트 시나리오", duration: "1-2주" },
  { id: 9, title: "배포 준비", duration: "3-5일" },
  { id: 10, title: "배포 및 운영", duration: "지속" }
]

interface FormData {
  projectName: string
  problem: string
  targetUsers: string
  competitors: string
  additionalInfo: string
  pdrFile?: File | null
  pdrContent?: string
}

export default function WorkflowPage() {
  const { success, error, warning } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [projectName, setProjectName] = useState('')
  const [showProjectSetup, setShowProjectSetup] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    problem: '',
    targetUsers: '',
    competitors: '',
    additionalInfo: ''
  })
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedPDR, setUploadedPDR] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const handlePDRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const text = await file.text()
      setUploadedPDR(text)
      setFormData({ ...formData, pdrFile: file, pdrContent: text })
      success('PDR 업로드 완료', `${file.name} 파일이 성공적으로 업로드되었습니다.`)
    } catch (err) {
      console.error('PDR 업로드 오류:', err)
      error('업로드 실패', 'PDR 파일을 읽는 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleProjectSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (projectName) {
      try {
        const data = await postData('/api/project/create', { projectName })

        if (data.success) {
          console.log('✅ 프로젝트가 생성되었습니다:', data)
          success(
            '프로젝트 생성 완료',
            `프로젝트 "${projectName}"가 성공적으로 생성되었습니다! config/progress.json 파일이 생성되었습니다.`
          )
          setFormData({ ...formData, projectName })
          setShowProjectSetup(false)
        } else {
          console.error('프로젝트 생성 실패:', data.error)
          error('프로젝트 생성 실패', data.error || '알 수 없는 오류가 발생했습니다.')
        }
      } catch (err) {
        console.error('API 호출 오류:', err)
        if (err instanceof ApiError) {
          error('서버 연결 실패', err.message)
        } else {
          error('서버 연결 실패', '서버 연결에 실패했습니다.')
        }
      }
    }
  }

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulate prompt generation
    await new Promise(resolve => setTimeout(resolve, 1500))

    const prompt = generatePrompt(currentStep, formData)
    setGeneratedPrompt(prompt)
    setShowPrompt(true)
    setIsGenerating(false)
  }

  const generatePrompt = (step: number, data: FormData): string => {
    let basePrompt = `# 단계 ${step}: ${steps[step - 1].title}

## 프로젝트 정보
- 프로젝트명: ${data.projectName}
- 해결하려는 문제: ${data.problem || '[입력 필요]'}
- 타겟 사용자: ${data.targetUsers || '[입력 필요]'}
- 경쟁사: ${data.competitors || '[입력 필요]'}`

    // PDR 단계일 경우 업로드된 PDR 내용 포함
    if (step === 2 && data.pdrContent) {
      basePrompt += `

## 업로드된 PDR 문서

\`\`\`
${data.pdrContent}
\`\`\`

위 PDR 문서를 기반으로 시스템 기획서 작성을 진행해주세요.`
    }

    return basePrompt + `

## MCP 활용 작업

### 1. Task Master로 프로젝트 등록

\`\`\`
@task-master를 사용해서 새 프로젝트를 시작하고 싶어.

프로젝트명: ${data.projectName}
목표: ${data.problem || '자동화 툴 개발'}
타겟: ${data.targetUsers || '일반 사용자'}

경쟁사 분석이 필요해:
${data.competitors ? data.competitors.split(',').map(c => `- ${c.trim()}`).join('\n') : '- (없음)'}
\`\`\`

### 2. 웹 검색으로 리서치

\`\`\`
@web-search를 사용해서 다음 정보를 조사해줘:
- ${data.problem || '관련 문제'}에 대한 최신 동향
- 시장 규모와 기회
- 기술적 해결 방안
\`\`\`

### 3. 메모리에 정보 저장

\`\`\`
@memory를 사용해서 다음 정보를 저장해줘:
- 프로젝트 개요
- 핵심 인사이트
- 다음 단계 액션 아이템
\`\`\`

## 추가 정보
${data.additionalInfo || '(없음)'}

---

**다음 단계**: 이 프롬프트를 Claude Code에 붙여넣어 실행하세요.
`
  }

  const handleCompleteStep = async () => {
    try {
      const data = await postData('/api/progress', {
        stepNumber: currentStep,
        action: 'complete'
      })

      if (data.success) {
        console.log('✅ 단계가 완료되었습니다:', data)

        if (currentStep < 10) {
          setCurrentStep(currentStep + 1)
          setFormData({
            ...formData,
            problem: '',
            targetUsers: '',
            competitors: '',
            additionalInfo: ''
          })
          setShowPrompt(false)
          setGeneratedPrompt('')
        }
      } else {
        console.error('단계 완료 실패:', data.error)
        warning('단계 저장 실패', '단계 저장에 실패했지만 다음 단계로 진행합니다.')

        // 실패해도 다음 단계로 진행
        if (currentStep < 10) {
          setCurrentStep(currentStep + 1)
          setFormData({
            ...formData,
            problem: '',
            targetUsers: '',
            competitors: '',
            additionalInfo: ''
          })
          setShowPrompt(false)
          setGeneratedPrompt('')
        }
      }
    } catch (err) {
      console.error('API 호출 오류:', err)
      warning('서버 연결 실패', '서버 연결에 실패했지만 다음 단계로 진행합니다.')

      // 실패해도 다음 단계로 진행
      if (currentStep < 10) {
        setCurrentStep(currentStep + 1)
        setFormData({
          ...formData,
          problem: '',
          targetUsers: '',
          competitors: '',
          additionalInfo: ''
        })
        setShowPrompt(false)
        setGeneratedPrompt('')
      }
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt)
    success('복사 완료', '프롬프트가 클립보드에 복사되었습니다!')
  }

  if (showProjectSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">워크플로우 시작</h1>
            <p className="text-gray-600 mb-8">프로젝트를 시작하기 전에 기본 정보를 입력해주세요.</p>

            <form onSubmit={handleProjectSetup}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로젝트 이름 *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: my-automation-tool"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
              >
                워크플로우 시작하기
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          홈으로
        </Link>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">프로젝트: {projectName}</h2>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">전체 진행률</span>
              <span className="text-sm font-medium text-gray-700">{currentStep}/10 단계</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`p-3 rounded-lg text-left transition ${
                  step.id === currentStep
                    ? 'bg-blue-100 border-2 border-blue-600'
                    : step.id < currentStep
                    ? 'bg-green-50 border-2 border-green-500'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500">단계 {step.id}</span>
                  {step.id < currentStep && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {step.id === currentStep && <Circle className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="text-sm font-medium">{step.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-2">
              단계 {currentStep}: {steps[currentStep - 1].title}
            </h3>
            <p className="text-gray-600 mb-6">예상 소요 시간: {steps[currentStep - 1].duration}</p>

            {!showPrompt ? (
              <form onSubmit={handleStepSubmit} className="space-y-6">
                {currentStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        해결하려는 문제 *
                      </label>
                      <textarea
                        value={formData.problem}
                        onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="예: 팀 협업 시 작업 관리가 복잡함"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        타겟 사용자 *
                      </label>
                      <input
                        type="text"
                        value={formData.targetUsers}
                        onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 스타트업 개발팀"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        경쟁 제품/서비스
                      </label>
                      <input
                        type="text"
                        value={formData.competitors}
                        onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: Linear, Jira, Trello (쉼표로 구분)"
                      />
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PDR 문서 업로드 *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                        <input
                          type="file"
                          accept=".txt,.md,.pdf,.docx"
                          onChange={handlePDRUpload}
                          className="hidden"
                          id="pdr-upload"
                        />
                        <label
                          htmlFor="pdr-upload"
                          className="cursor-pointer"
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center">
                              <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
                              <p className="text-sm text-gray-600">파일 업로드 중...</p>
                            </div>
                          ) : uploadedPDR ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle2 className="h-10 w-10 text-green-600 mb-3" />
                              <p className="text-sm font-medium text-gray-900">PDR 문서가 업로드되었습니다</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formData.pdrFile?.name} ({Math.round((formData.pdrFile?.size || 0) / 1024)}KB)
                              </p>
                              <p className="text-xs text-blue-600 mt-2">클릭하여 다른 파일 선택</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <svg
                                className="h-10 w-10 text-gray-400 mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <p className="text-sm font-medium text-gray-900">
                                PDR 문서 파일을 업로드하세요
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                TXT, MD, PDF, DOCX 파일 지원
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {uploadedPDR && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          업로드된 PDR 내용 미리보기
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {uploadedPDR.substring(0, 1000)}
                            {uploadedPDR.length > 1000 && '\n\n... (생략됨)'}
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추가 정보 (선택)
                  </label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="추가로 고려할 사항을 입력하세요..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      프롬프트 생성 중...
                    </>
                  ) : (
                    '프롬프트 생성하기'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✅ 프롬프트가 생성되었습니다!</p>
                  <p className="text-green-600 text-sm mt-1">
                    오른쪽 패널에서 프롬프트를 확인하고 Claude Code에서 실행하세요.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowPrompt(false)
                    setGeneratedPrompt('')
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  프롬프트 다시 생성
                </button>

                <button
                  onClick={handleCompleteStep}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center"
                >
                  단계 완료 및 다음으로
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Prompt Display */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold mb-4">생성된 프롬프트</h3>

            {showPrompt ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {generatedPrompt}
                  </pre>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  📋 클립보드에 복사
                </button>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm font-medium">💡 다음 단계</p>
                  <ol className="text-yellow-700 text-sm mt-2 space-y-1 list-decimal list-inside">
                    <li>프롬프트를 클립보드에 복사</li>
                    <li>Claude Code를 열기</li>
                    <li>프롬프트를 붙여넣고 실행</li>
                    <li>작업 완료 후 "단계 완료" 버튼 클릭</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                <Circle className="h-16 w-16 mb-4" />
                <p>왼쪽 폼을 작성하고 프롬프트를 생성하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
