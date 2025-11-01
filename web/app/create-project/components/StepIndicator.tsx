'use client'

import { Check } from 'lucide-react'

interface Step {
  id: number
  name: string
  description: string
}

interface StepIndicatorProps {
  currentStep: number
  steps: Step[]
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`flex-1 ${index !== steps.length - 1 ? 'pr-8' : ''}`}
            >
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div className="flex items-center w-full">
                  <div className="flex items-center justify-center relative">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-semibold
                        ${
                          step.id < currentStep
                            ? 'bg-indigo-600 text-white'
                            : step.id === currentStep
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}
                    >
                      {step.id < currentStep ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        step.id
                      )}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index !== steps.length - 1 && (
                    <div
                      className={`
                        flex-1 h-0.5 mx-2
                        ${step.id < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}
                      `}
                    />
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`
                      text-sm font-medium
                      ${
                        step.id === currentStep
                          ? 'text-indigo-600'
                          : step.id < currentStep
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }
                    `}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
