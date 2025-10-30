'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, AlertCircle, Clock, ChevronRight, Sparkles, Info, Code2 } from 'lucide-react'
import type { DataCleaningRoadmap, RoadmapStep, WizardState } from '@/types/roadmap'
import { CodeGeneratorChat } from './CodeGeneratorChat'

interface DataCleaningRoadmapProps {
  /** 분석 결과 */
  analysisResult: any
  /** 로드맵 생성 완료 콜백 */
  onRoadmapGenerated?: (roadmap: DataCleaningRoadmap) => void
  /** 감지된 문제점 섹션 표시 여부 (기본: false) */
  showDetectedIssues?: boolean
}

/**
 * 데이터 정리 로드맵 및 위자드 컴포넌트
 *
 * AI가 생성한 데이터 정리 계획을 시각화하고,
 * 단계별로 진행할 수 있는 인터랙티브 위자드를 제공합니다.
 */
export function DataCleaningRoadmap({
  analysisResult,
  onRoadmapGenerated,
  showDetectedIssues = false
}: DataCleaningRoadmapProps) {
  const [roadmap, setRoadmap] = useState<DataCleaningRoadmap | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStepId: null,
    completedSteps: [],
    skippedSteps: [],
    stepNotes: {}
  })
  const [showWizard, setShowWizard] = useState(false)
  const [showCodeGenerator, setShowCodeGenerator] = useState(false)

  // 로드맵 생성
  const generateRoadmap = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ssa/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisResult
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || '로드맵 생성에 실패했습니다')
      }

      setRoadmap(data.roadmap)
      onRoadmapGenerated?.(data.roadmap)
    } catch (err: any) {
      console.error('로드맵 생성 오류:', err)
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // 컴포넌트 마운트 시 자동 생성
  useEffect(() => {
    if (analysisResult && !roadmap && !isGenerating) {
      generateRoadmap()
    }
  }, [analysisResult])

  // 위자드 시작
  const startWizard = () => {
    if (!roadmap) return

    const firstStep = roadmap.steps[0]
    setWizardState({
      currentStepId: firstStep.id,
      completedSteps: [],
      skippedSteps: [],
      startedAt: new Date().toISOString(),
      stepNotes: {}
    })
    setShowWizard(true)
  }

  // 단계 완료
  const completeStep = (stepId: string, notes?: string) => {
    setWizardState((prev) => {
      const completedSteps = [...prev.completedSteps, stepId]
      const currentStep = roadmap?.steps.find((s) => s.id === stepId)

      // 다음 단계 찾기
      let nextStepId: string | null = null
      if (currentStep) {
        const currentIndex = roadmap!.steps.findIndex((s) => s.id === stepId)
        const nextStep = roadmap!.steps[currentIndex + 1]
        if (nextStep) {
          nextStepId = nextStep.id
        }
      }

      // 모든 단계 완료 시
      if (completedSteps.length === roadmap?.steps.length) {
        return {
          ...prev,
          completedSteps,
          currentStepId: null,
          completedAt: new Date().toISOString(),
          stepNotes: notes ? { ...prev.stepNotes, [stepId]: notes } : prev.stepNotes
        }
      }

      return {
        ...prev,
        completedSteps,
        currentStepId: nextStepId,
        stepNotes: notes ? { ...prev.stepNotes, [stepId]: notes } : prev.stepNotes
      }
    })
  }

  // 단계 건너뛰기
  const skipStep = (stepId: string, reason?: string) => {
    setWizardState((prev) => {
      const skippedSteps = [...prev.skippedSteps, stepId]
      const currentStep = roadmap?.steps.find((s) => s.id === stepId)

      // 다음 단계 찾기
      let nextStepId: string | null = null
      if (currentStep) {
        const currentIndex = roadmap!.steps.findIndex((s) => s.id === stepId)
        const nextStep = roadmap!.steps[currentIndex + 1]
        if (nextStep) {
          nextStepId = nextStep.id
        }
      }

      return {
        ...prev,
        skippedSteps,
        currentStepId: nextStepId,
        stepNotes: reason ? { ...prev.stepNotes, [stepId]: `건너뜀: ${reason}` } : prev.stepNotes
      }
    })
  }

  // 우선순위 색상
  const getPriorityColor = (priority: RoadmapStep['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  // 로딩 상태
  if (isGenerating) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
          <p className="text-lg font-medium text-gray-700">AI가 데이터 정리 로드맵을 생성하고 있습니다...</p>
        </div>
      </div>
    )
  }

  // 오류 상태
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">로드맵 생성 실패</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={generateRoadmap}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 로드맵이 없는 경우
  if (!roadmap) {
    return null
  }

  // 위자드 모드
  if (showWizard && wizardState.currentStepId) {
    const currentStep = roadmap.steps.find((s) => s.id === wizardState.currentStepId)
    if (!currentStep) return null

    const progress = ((wizardState.completedSteps.length / roadmap.steps.length) * 100).toFixed(0)

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* 진행률 표시 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              진행률: {wizardState.completedSteps.length} / {roadmap.steps.length} 단계 완료
            </span>
            <span className="text-sm font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 현재 단계 */}
        <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Circle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{currentStep.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor(
                    currentStep.priority
                  )}`}
                >
                  {currentStep.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{currentStep.description}</p>

              {/* 작업 지침 */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">작업 지침:</h4>
                <ul className="space-y-2">
                  {currentStep.actionInstructions.map((instruction, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 예상 결과 */}
              <div className="mb-4 bg-white rounded-lg p-3 border border-green-200">
                <p className="text-sm">
                  <span className="font-semibold text-green-900">예상 결과: </span>
                  <span className="text-green-800">{currentStep.expectedOutcome}</span>
                </p>
              </div>

              {/* 경고사항 */}
              {currentStep.warnings && currentStep.warnings.length > 0 && (
                <div className="mb-4 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 mb-1">주의사항:</p>
                      {currentStep.warnings.map((warning, idx) => (
                        <p key={idx} className="text-sm text-yellow-800">
                          {warning}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 메타 정보 */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{currentStep.estimatedMinutes}분</span>
                </div>
                <div>영향받는 시트: {currentStep.affectedSheets.join(', ')}</div>
              </div>

              {/* 코드 생성 힌트가 있으면 코드 생성 버튼 표시 */}
              {currentStep.codeGenerationHint && !showCodeGenerator && (
                <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-purple-800">
                      💡 {currentStep.codeGenerationHint}
                    </p>
                    <button
                      onClick={() => setShowCodeGenerator(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <Code2 className="h-4 w-4" />
                      코드 생성
                    </button>
                  </div>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => completeStep(currentStep.id)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  완료
                </button>
                <button
                  onClick={() => skipStep(currentStep.id)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  건너뛰기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 코드 생성기 */}
        {showCodeGenerator && (
          <div className="mt-6">
            <CodeGeneratorChat
              analysisResult={analysisResult}
              relatedStepId={currentStep.id}
              onCodeGenerated={(code) => {
                console.log('코드 생성 완료:', code)
                // 코드 생성 후에도 코드 생성기를 유지
              }}
            />
            <div className="mt-3 text-center">
              <button
                onClick={() => setShowCodeGenerator(false)}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                코드 생성기 닫기
              </button>
            </div>
          </div>
        )}

        {/* 위자드 종료 버튼 */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setShowWizard(false)
              setShowCodeGenerator(false)
            }}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            위자드 종료하고 전체 로드맵 보기
          </button>
        </div>
      </div>
    )
  }

  // 로드맵 개요 모드
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">데이터 정리 로드맵</h2>
          </div>
          <p className="text-gray-600">{roadmap.summary}</p>
        </div>
        <button
          onClick={startWizard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          위자드 시작
        </button>
      </div>

      {/* 전체 정보 */}
      <div className={`grid gap-4 mb-6 ${showDetectedIssues ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium mb-1">총 단계</p>
          <p className="text-2xl font-bold text-blue-900">{roadmap.steps.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium mb-1">예상 소요 시간</p>
          <p className="text-2xl font-bold text-green-900">{roadmap.totalEstimatedMinutes}분</p>
        </div>
        {showDetectedIssues && (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-600 font-medium mb-1">감지된 문제</p>
            <p className="text-2xl font-bold text-orange-900">{roadmap.detectedIssues.length}</p>
          </div>
        )}
      </div>

      {/* 감지된 문제점 */}
      {showDetectedIssues && roadmap.detectedIssues.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">감지된 문제점</h3>
          <div className="space-y-2">
            {roadmap.detectedIssues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  issue.severity === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : issue.severity === 'high'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{issue.category}</p>
                    <p className="text-sm text-gray-700">{issue.description}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      영향: {issue.affectedSheets.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 로드맵 단계 */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">정리 단계</h3>
        <div className="space-y-3">
          {roadmap.steps.map((step, idx) => {
            const isCompleted = wizardState.completedSteps.includes(step.id)
            const isSkipped = wizardState.skippedSteps.includes(step.id)

            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : isSkipped
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityColor(
                          step.priority
                        )}`}
                      >
                        {step.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{step.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.estimatedMinutes}분
                      </span>
                      <span>{step.affectedSheets.length}개 시트</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 추천사항 */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">추천사항</h4>
            <ul className="space-y-1">
              {roadmap.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-blue-800">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 코드 생성기 섹션 */}
      <div className="pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">자연어 코드 생성</h3>
            <p className="text-sm text-gray-600">원하는 작업을 설명하면 Apps Script 코드를 생성해드립니다</p>
          </div>
          {!showCodeGenerator && (
            <button
              onClick={() => setShowCodeGenerator(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Code2 className="h-5 w-5" />
              코드 생성기 열기
            </button>
          )}
        </div>

        {showCodeGenerator && (
          <div>
            <CodeGeneratorChat
              analysisResult={analysisResult}
              onCodeGenerated={(code) => {
                console.log('코드 생성 완료:', code)
              }}
            />
            <div className="mt-3 text-center">
              <button
                onClick={() => setShowCodeGenerator(false)}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                코드 생성기 닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
