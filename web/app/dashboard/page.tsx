'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Circle, Clock, BarChart3, Zap } from 'lucide-react'

interface StepStatus {
  id: number
  title: string
  status: 'pending' | 'in_progress' | 'completed'
  progress: number
}

export default function DashboardPage() {
  const [projectName, setProjectName] = useState('로딩 중...')
  const [steps, setSteps] = useState<StepStatus[]>([])
  const [loading, setLoading] = useState(true)

  // API에서 실제 진행 상황 로드
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch('/api/progress')
        const data = await response.json()

        if (data.success && data.progress) {
          const progress = data.progress

          // 프로젝트 이름 설정
          setProjectName(progress.projectName || '프로젝트 이름 없음')

          // 단계 정보 변환
          const stepTitles = [
            "아이디어 발굴 및 정의",
            "PDR 작성",
            "시스템 기획서 작성",
            "UI/UX 설계",
            "기술 스택 선정",
            "프론트엔드 개발",
            "백엔드 개발",
            "테스트 시나리오",
            "배포 준비",
            "배포 및 운영"
          ]

          const stepsData: StepStatus[] = stepTitles.map((title, index) => {
            const stepId = index + 1
            const stepProgress = progress.steps.find((s: any) => s.stepId === stepId)

            let status: 'pending' | 'in_progress' | 'completed' = 'pending'
            let progressPercent = 0

            if (stepProgress) {
              status = stepProgress.status
              if (status === 'completed') {
                progressPercent = 100
              } else if (status === 'in_progress') {
                const checkedCount = stepProgress.checklist?.filter(Boolean).length || 0
                const totalCount = stepProgress.checklist?.length || 1
                progressPercent = Math.round((checkedCount / totalCount) * 100)
              }
            }

            return {
              id: stepId,
              title,
              status,
              progress: progressPercent
            }
          })

          setSteps(stepsData)
        } else {
          // 프로젝트가 없는 경우 기본 데이터
          setProjectName('프로젝트를 시작하세요')
          setSteps(
            Array.from({ length: 10 }, (_, i) => ({
              id: i + 1,
              title: [
                "아이디어 발굴 및 정의",
                "PDR 작성",
                "시스템 기획서 작성",
                "UI/UX 설계",
                "기술 스택 선정",
                "프론트엔드 개발",
                "백엔드 개발",
                "테스트 시나리오",
                "배포 준비",
                "배포 및 운영"
              ][i],
              status: 'pending' as const,
              progress: 0
            }))
          )
        }
      } catch (error) {
        console.error('진행 상황 로드 오류:', error)
        setProjectName('오류 발생')
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [])

  const completedSteps = steps.filter(s => s.status === 'completed').length
  const inProgressSteps = steps.filter(s => s.status === 'in_progress').length
  const overallProgress = steps.length > 0
    ? Math.round(steps.reduce((sum, s) => sum + s.progress, 0) / steps.length)
    : 0
  const currentStep = steps.find(s => s.status === 'in_progress') || steps[completedSteps]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          홈으로
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">프로젝트 대시보드</h1>
          <p className="text-xl text-gray-600">{projectName}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Overall Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">전체 진행률</h3>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{overallProgress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Completed Steps */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">완료된 단계</h3>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{completedSteps}/10</div>
            <p className="text-sm text-gray-500 mt-2">
              {completedSteps === 10 ? '모든 단계 완료! 🎉' : `${10 - completedSteps}개 단계 남음`}
            </p>
          </div>

          {/* Current Step */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">현재 단계</h3>
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">단계 {currentStep?.id}</div>
            <p className="text-sm text-gray-500 mt-2 truncate">{currentStep?.title}</p>
          </div>

          {/* Quick Action */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">빠른 액션</h3>
              <Zap className="h-5 w-5" />
            </div>
            <Link
              href="/workflow"
              className="block bg-white text-blue-600 text-center py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              워크플로우 시작
            </Link>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">단계별 진행 상황</h2>

          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                        step.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : step.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : step.status === 'in_progress' ? (
                        <Circle className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        단계 {step.id}: {step.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {step.status === 'completed' && '✅ 완료됨'}
                        {step.status === 'in_progress' && '🔄 진행 중'}
                        {step.status === 'pending' && '⏳ 대기 중'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{step.progress}%</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      step.status === 'completed'
                        ? 'bg-green-500'
                        : step.status === 'in_progress'
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Insights */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold mb-4">📊 프로젝트 인사이트</h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                <div>
                  <p className="font-medium">순조로운 진행</p>
                  <p className="text-sm text-gray-600">
                    {completedSteps}개 단계가 성공적으로 완료되었습니다.
                  </p>
                </div>
              </div>

              {inProgressSteps > 0 && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="font-medium">진행 중인 작업</p>
                    <p className="text-sm text-gray-600">
                      현재 {inProgressSteps}개 단계가 진행 중입니다.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 shrink-0" />
                <div>
                  <p className="font-medium">예상 완료</p>
                  <p className="text-sm text-gray-600">
                    현재 속도로는 약 {Math.ceil((10 - completedSteps) * 1.5)}주 후 완료 예상
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 border border-blue-200">
            <h2 className="text-xl font-bold mb-4">💡 추천 액션</h2>

            <div className="space-y-4">
              {currentStep && currentStep.status === 'in_progress' && (
                <div className="bg-white rounded-lg p-4 border border-blue-300">
                  <p className="font-medium text-blue-900 mb-2">
                    1. 현재 단계 {currentStep.id} 완료하기
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {currentStep.title} 단계를 완료하세요.
                  </p>
                  <Link
                    href="/workflow"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    계속하기 →
                  </Link>
                </div>
              )}

              <div className="bg-white rounded-lg p-4">
                <p className="font-medium text-gray-900 mb-2">
                  2. 프로젝트 분석 실행
                </p>
                <p className="text-sm text-gray-600">
                  AI가 프로젝트 상태를 분석하고 개선 방안을 제안합니다.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="font-medium text-gray-900 mb-2">
                  3. 환경변수 설정 확인
                </p>
                <p className="text-sm text-gray-600">
                  프로젝트에 필요한 환경변수가 모두 설정되었는지 확인하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
