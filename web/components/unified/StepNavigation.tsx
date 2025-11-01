'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { UNIFIED_WORKFLOW_STEPS } from '@/types/unified-workflow'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  canGoBack: boolean
  canGoForward: boolean
  isCreationComplete?: boolean
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canGoBack,
  canGoForward,
  isCreationComplete = false
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!canGoBack}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        이전
      </button>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </span>
        {isCreationComplete && currentStep === 3 && (
          <span className="ml-2 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
            프로젝트 생성 완료
          </span>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canGoForward}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {currentStep === 3 && !isCreationComplete ? '프로젝트 생성' : '다음'}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
