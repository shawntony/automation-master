'use client'

import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { FormField } from '@/components/unified/FormField'
import { DynamicArrayInput } from '@/components/unified/DynamicArrayInput'
import { PromptDisplay } from '@/components/unified/PromptDisplay'
import { generatePrompt, type PromptContext } from '@/lib/prompt-generator'

interface Step4Props {
  projectName: string
  projectType: string
  projectPath?: string
  prdPath?: string
  initialData?: Step4Data
  onComplete: (data: Step4Data, prompt: string) => void
}

export interface Step4Data {
  problem: string
  solution: string
  targetUsers: string
  keyFeatures: string[]
}

export function Step4IdeaDefinition({
  projectName,
  projectType,
  projectPath,
  prdPath,
  initialData,
  onComplete
}: Step4Props) {
  const [data, setData] = useState<Step4Data>(
    initialData || {
      problem: '',
      solution: '',
      targetUsers: '',
      keyFeatures: []
    }
  )

  const [errors, setErrors] = useState<Partial<Record<keyof Step4Data, string>>>({})
  const [showPrompt, setShowPrompt] = useState(false)

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Step4Data, string>> = {}

    if (!data.problem || data.problem.length < 20) {
      newErrors.problem = '문제 정의를 최소 20자 이상 입력해주세요'
    }

    if (!data.solution || data.solution.length < 20) {
      newErrors.solution = '해결 방안을 최소 20자 이상 입력해주세요'
    }

    if (!data.targetUsers || data.targetUsers.length < 5) {
      newErrors.targetUsers = '타겟 사용자를 최소 5자 이상 입력해주세요'
    }

    if (data.keyFeatures.length < 2) {
      newErrors.keyFeatures = '핵심 기능을 최소 2개 이상 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      stepNumber: 4,
      stepData: { ideaDefinition: data }
    })

    onComplete(data, prompt)
  }

  const generatedPrompt = showPrompt
    ? generatePrompt({
        projectName,
        projectType,
        projectPath,
        prdPath,
        stepNumber: 4,
        stepData: { ideaDefinition: data }
      })
    : ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <Lightbulb className="h-6 w-6 text-yellow-600" />
        <div>
          <p className="font-medium text-yellow-900">Step 4: 아이디어 발굴 및 정의</p>
          <p className="text-sm text-yellow-700">
            프로젝트의 핵심 아이디어를 명확하게 정의하세요
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Problem Definition */}
        <FormField
          label="문제 정의"
          required
          error={errors.problem}
          hint="어떤 문제를 해결하고자 하나요? 구체적으로 작성하세요 (최소 20자)"
        >
          <textarea
            value={data.problem}
            onChange={(e) => setData({ ...data, problem: e.target.value })}
            placeholder="예: 업무 자동화 과정에서 Google Sheets와 Supabase 간 데이터 동기화가 수동으로 이루어져 시간이 많이 소요되고 오류가 발생합니다."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </FormField>

        {/* Solution */}
        <FormField
          label="해결 방안"
          required
          error={errors.solution}
          hint="어떻게 이 문제를 해결할 것인가요? (최소 20자)"
        >
          <textarea
            value={data.solution}
            onChange={(e) => setData({ ...data, solution: e.target.value })}
            placeholder="예: Google Sheets와 Supabase를 실시간으로 동기화하는 자동화 시스템을 구축하여, Apps Script와 Supabase Realtime을 활용해 데이터 변경을 즉시 반영합니다."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </FormField>

        {/* Target Users */}
        <FormField
          label="타겟 사용자"
          required
          error={errors.targetUsers}
          hint="누가 이 시스템을 사용할 것인가요? (최소 5자)"
        >
          <input
            type="text"
            value={data.targetUsers}
            onChange={(e) => setData({ ...data, targetUsers: e.target.value })}
            placeholder="예: 데이터 분석팀, 영업팀, 관리자"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </FormField>

        {/* Key Features */}
        <FormField
          label="핵심 기능"
          required
          error={errors.keyFeatures}
          hint="프로젝트의 핵심 기능을 나열하세요 (최소 2개, 최대 5개)"
        >
          <DynamicArrayInput
            values={data.keyFeatures}
            onChange={(features) => setData({ ...data, keyFeatures: features })}
            placeholder="핵심 기능 입력 (예: 실시간 데이터 동기화)"
            maxItems={5}
            minItems={2}
          />
        </FormField>
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

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">💡 작성 팁</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>문제</strong>: 현재 상황의 pain point를 명확히 기술</li>
          <li>• <strong>해결방안</strong>: 기술적 접근 방법과 예상 효과 설명</li>
          <li>• <strong>타겟</strong>: 실제 사용자의 역할과 니즈 파악</li>
          <li>• <strong>핵심기능</strong>: MVP에 꼭 필요한 기능만 포함</li>
        </ul>
      </div>
    </div>
  )
}
