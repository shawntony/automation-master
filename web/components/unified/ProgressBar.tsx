'use client'

import { Check } from 'lucide-react'
import { UNIFIED_WORKFLOW_STEPS } from '@/types/unified-workflow'

interface ProgressBarProps {
  currentStep: number
  completedSteps: number[]
}

export function ProgressBar({ currentStep, completedSteps }: ProgressBarProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            통합 프로젝트 생성 & 워크플로우
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            프로젝트 생성부터 배포까지 13단계를 안내합니다
          </p>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (UNIFIED_WORKFLOW_STEPS.length - 1)) * 100}%`
              }}
            />
          </div>

          {/* Step Circles */}
          <div className="relative flex justify-between">
            {UNIFIED_WORKFLOW_STEPS.map((step) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = currentStep === step.id
              const isPast = step.id < currentStep

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`
                      relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
                      ${
                        isCompleted || isPast
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : isCurrent
                          ? 'border-indigo-600 bg-white text-indigo-600'
                          : 'border-gray-300 bg-white text-gray-400'
                      }
                    `}
                  >
                    {isCompleted || isPast ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-2 text-center" style={{ width: '120px' }}>
                    <p
                      className={`
                        text-xs font-medium truncate
                        ${isCurrent ? 'text-indigo-600' : 'text-gray-500'}
                      `}
                      title={step.title}
                    >
                      {step.title}
                    </p>
                    {step.category === 'creation' && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                        생성
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Divider */}
        {currentStep === 4 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-900">
              ✅ 프로젝트 생성 완료! 이제 워크플로우를 진행합니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
