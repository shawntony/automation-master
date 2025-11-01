'use client'

import { useState } from 'react'
import { FormField } from '@/components/unified/FormField'
import { DynamicArrayInput } from '@/components/unified/DynamicArrayInput'
import { PromptDisplay } from '@/components/unified/PromptDisplay'
import { generatePrompt, type PromptContext } from '@/lib/prompt-generator'
import type { UNIFIED_WORKFLOW_STEPS } from '@/types/unified-workflow'

interface GenericWorkflowStepProps {
  stepNumber: number
  stepTitle: string
  stepIcon: React.ReactNode
  projectName: string
  projectType: string
  projectPath?: string
  prdPath?: string
  fields: FormFieldConfig[]
  initialData?: any
  onComplete: (data: any, prompt: string) => void
  skipCondition?: {
    check: boolean
    message: string
  }
}

interface FormFieldConfig {
  name: string
  label: string
  type: 'text' | 'textarea' | 'array' | 'select'
  required?: boolean
  placeholder?: string
  hint?: string
  options?: { value: string; label: string }[]
  minLength?: number
  maxItems?: number
}

export function GenericWorkflowStep({
  stepNumber,
  stepTitle,
  stepIcon,
  projectName,
  projectType,
  projectPath,
  prdPath,
  fields,
  initialData,
  onComplete,
  skipCondition
}: GenericWorkflowStepProps) {
  const [data, setData] = useState<any>(initialData || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPrompt, setShowPrompt] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (field.required) {
        const value = data[field.name]

        if (!value) {
          newErrors[field.name] = `${field.label}을(를) 입력해주세요`
        } else if (field.type === 'text' || field.type === 'textarea') {
          if (field.minLength && value.length < field.minLength) {
            newErrors[field.name] = `최소 ${field.minLength}자 이상 입력해주세요`
          }
        } else if (field.type === 'array') {
          if (Array.isArray(value) && value.length === 0) {
            newErrors[field.name] = '최소 1개 이상 입력해주세요'
          }
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFieldChange = (name: string, value: any) => {
    setData({ ...data, [name]: value })
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleGeneratePrompt = () => {
    if (!validate()) return
    setShowPrompt(true)
  }

  const handleComplete = () => {
    if (!validate()) return

    const prompt = generatePrompt({
      projectName,
      projectType,
      projectPath,
      prdPath,
      stepNumber,
      stepData: data
    })

    onComplete(data, prompt)
  }

  const handleSkip = () => {
    onComplete({}, `# Step ${stepNumber} 건너뛰기\n\n${skipCondition?.message}`)
  }

  const generatedPrompt = showPrompt
    ? generatePrompt({
        projectName,
        projectType,
        projectPath,
        prdPath,
        stepNumber,
        stepData: data
      })
    : ''

  // Skip condition rendering
  if (skipCondition?.check) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
          {stepIcon}
          <div>
            <p className="font-medium text-gray-900">Step {stepNumber}: {stepTitle}</p>
            <p className="text-sm text-gray-600">{skipCondition.message}</p>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          건너뛰고 다음 단계로
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        {stepIcon}
        <div>
          <p className="font-medium text-indigo-900">Step {stepNumber}: {stepTitle}</p>
          <p className="text-sm text-indigo-700">
            이 단계의 정보를 입력하고 Claude Code 프롬프트를 생성하세요
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {fields.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            error={errors[field.name]}
            hint={field.hint}
          >
            {field.type === 'text' && (
              <input
                type="text"
                value={data[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={data[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            )}

            {field.type === 'array' && (
              <DynamicArrayInput
                values={data[field.name] || []}
                onChange={(values) => handleFieldChange(field.name, values)}
                placeholder={field.placeholder}
                maxItems={field.maxItems || 10}
                minItems={field.required ? 1 : 0}
              />
            )}

            {field.type === 'select' && field.options && (
              <select
                value={data[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">선택하세요</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleGeneratePrompt}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          프롬프트 생성
        </button>
        {showPrompt && (
          <button
            onClick={handleComplete}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            완료 및 다음 단계
          </button>
        )}
      </div>

      {/* Generated Prompt */}
      {showPrompt && (
        <PromptDisplay
          prompt={generatedPrompt}
          onRegenerate={() => setShowPrompt(false)}
        />
      )}
    </div>
  )
}
