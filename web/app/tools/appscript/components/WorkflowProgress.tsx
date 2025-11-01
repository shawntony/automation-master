'use client'

import { CheckCircle2, Clock, AlertCircle, Loader2, ArrowRight } from 'lucide-react'

export interface WorkflowStep {
  id: string
  title: string
  status: 'pending' | 'active' | 'completed' | 'error'
  progress?: number
  message?: string
}

interface WorkflowProgressProps {
  steps: WorkflowStep[]
  onStepClick?: (stepId: string) => void
}

export function WorkflowProgress({ steps, onStepClick }: WorkflowProgressProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 워크플로우 진행 상태</h3>

      <div className="flex items-center justify-between gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Card */}
            <div
              onClick={() => onStepClick?.(step.id)}
              className={`
                flex-1 border-2 rounded-lg p-4 transition-all cursor-pointer
                ${step.status === 'completed'
                  ? 'bg-green-50 border-green-300 hover:border-green-400'
                  : step.status === 'active'
                  ? 'bg-blue-50 border-blue-400 hover:border-blue-500 shadow-md'
                  : step.status === 'error'
                  ? 'bg-red-50 border-red-300 hover:border-red-400'
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Status Icon */}
              <div className="flex items-center justify-center mb-2">
                {step.status === 'completed' && (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                )}
                {step.status === 'active' && (
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                )}
                {step.status === 'pending' && (
                  <Clock className="h-8 w-8 text-gray-400" />
                )}
                {step.status === 'error' && (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
              </div>

              {/* Title */}
              <div className="text-center mb-1">
                <h4 className={`
                  font-semibold text-sm
                  ${step.status === 'completed' ? 'text-green-700' : ''}
                  ${step.status === 'active' ? 'text-blue-700' : ''}
                  ${step.status === 'pending' ? 'text-gray-500' : ''}
                  ${step.status === 'error' ? 'text-red-700' : ''}
                `}>
                  {step.title}
                </h4>
              </div>

              {/* Progress Bar (for active step) */}
              {step.status === 'active' && step.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              )}

              {/* Message */}
              {step.message && (
                <div className={`
                  text-xs text-center
                  ${step.status === 'completed' ? 'text-green-600' : ''}
                  ${step.status === 'active' ? 'text-blue-600' : ''}
                  ${step.status === 'pending' ? 'text-gray-500' : ''}
                  ${step.status === 'error' ? 'text-red-600' : ''}
                `}>
                  {step.message}
                </div>
              )}

              {/* Progress Percentage */}
              {step.status === 'active' && step.progress !== undefined && (
                <div className="text-xs text-center text-blue-700 font-semibold mt-1">
                  {step.progress}%
                </div>
              )}
            </div>

            {/* Arrow between steps */}
            {index < steps.length - 1 && (
              <div className="mx-2">
                <ArrowRight className={`
                  h-6 w-6
                  ${step.status === 'completed' ? 'text-green-400' : 'text-gray-300'}
                `} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
