'use client'

import { useState } from 'react'
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react'
import type { PrdFormData } from '@/types/prd'

interface PrdFormWizardProps {
  projectName: string
  projectType: string
  onFormSubmit: (formData: PrdFormData) => void
}

export function PrdFormWizard({ projectName, projectType, onFormSubmit }: PrdFormWizardProps) {
  const [formData, setFormData] = useState<PrdFormData>({
    purpose: '',
    background: '',
    features: [''],
    targetUsers: '',
    techStack: [],
    successMetrics: '',
    constraints: ''
  })

  const [newTech, setNewTech] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.purpose || formData.purpose.trim().length < 10) {
      newErrors.purpose = '프로젝트 목적을 10자 이상 입력해주세요'
    }

    const validFeatures = formData.features.filter(f => f.trim())
    if (validFeatures.length === 0) {
      newErrors.features = '최소 1개 이상의 기능을 입력해주세요'
    }

    if (!formData.targetUsers || formData.targetUsers.trim().length < 5) {
      newErrors.targetUsers = '타겟 사용자를 5자 이상 입력해주세요'
    }

    if (formData.techStack.length === 0) {
      newErrors.techStack = '최소 1개 이상의 기술을 추가해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      // 빈 기능 제거
      const cleanedFormData = {
        ...formData,
        features: formData.features.filter(f => f.trim())
      }
      onFormSubmit(cleanedFormData)
      setIsSubmitted(true)
    }
  }

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      setFormData({
        ...formData,
        features: formData.features.filter((_, i) => i !== index)
      })
    }
  }

  const addTech = () => {
    if (newTech.trim() && !formData.techStack.includes(newTech.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, newTech.trim()]
      })
      setNewTech('')
    }
  }

  const removeTech = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter(t => t !== tech)
    })
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-6">
          <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900 text-lg">PRD 폼 작성 완료!</p>
            <p className="text-sm text-green-700 mt-1">
              입력한 정보로 PRD 문서가 생성됩니다
            </p>
          </div>
        </div>

        {/* Form Summary */}
        <div className="bg-white rounded-lg border-2 border-indigo-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">입력 정보 요약</h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">프로젝트 목적</p>
              <p className="text-sm text-gray-800">{formData.purpose}</p>
            </div>

            {formData.background && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">배경</p>
                <p className="text-sm text-gray-800">{formData.background}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">주요 기능 ({formData.features.filter(f => f.trim()).length}개)</p>
              <ul className="text-sm text-gray-800 list-disc list-inside">
                {formData.features.filter(f => f.trim()).map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">타겟 사용자</p>
              <p className="text-sm text-gray-800">{formData.targetUsers}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">기술 스택 ({formData.techStack.length}개)</p>
              <div className="flex flex-wrap gap-2">
                {formData.techStack.map((tech, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {formData.successMetrics && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">성공 지표</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{formData.successMetrics}</p>
              </div>
            )}

            {formData.constraints && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">제약사항</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{formData.constraints}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsSubmitted(false)}
          className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          수정하기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          1. 프로젝트 목적 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          placeholder="이 프로젝트가 해결하려는 문제와 목표를 설명하세요..."
          className={`w-full h-24 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
            errors.purpose ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.purpose}
          </p>
        )}
      </div>

      {/* Background (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          2. 배경 및 문제 정의 <span className="text-gray-400 text-xs">(선택사항)</span>
        </label>
        <textarea
          value={formData.background || ''}
          onChange={(e) => setFormData({ ...formData, background: e.target.value })}
          placeholder="현재 문제 상황과 배경을 설명하세요..."
          className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          3. 주요 기능 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder={`기능 ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {formData.features.length > 1 && (
                <button
                  onClick={() => removeFeature(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="기능 제거"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addFeature}
          className="mt-2 px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          기능 추가
        </button>
        {errors.features && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.features}
          </p>
        )}
      </div>

      {/* Target Users */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          4. 타겟 사용자 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.targetUsers}
          onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
          placeholder="예: 중소기업 관리자, 개발팀, 일반 사용자"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            errors.targetUsers ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.targetUsers && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.targetUsers}
          </p>
        )}
      </div>

      {/* Tech Stack */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          5. 기술 스택 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
            placeholder="기술명을 입력하고 Enter"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={addTech}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            추가
          </button>
        </div>
        {formData.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.techStack.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2"
              >
                {tech}
                <button
                  onClick={() => removeTech(tech)}
                  className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.techStack && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.techStack}
          </p>
        )}
      </div>

      {/* Success Metrics (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          6. 성공 지표 <span className="text-gray-400 text-xs">(선택사항)</span>
        </label>
        <textarea
          value={formData.successMetrics || ''}
          onChange={(e) => setFormData({ ...formData, successMetrics: e.target.value })}
          placeholder="프로젝트 성공을 측정할 수 있는 지표를 작성하세요 (줄바꿈으로 구분)"
          className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Constraints (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          7. 제약사항 <span className="text-gray-400 text-xs">(선택사항)</span>
        </label>
        <textarea
          value={formData.constraints || ''}
          onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
          placeholder="기술적, 비즈니스적 제약사항을 작성하세요 (줄바꿈으로 구분)"
          className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <CheckCircle className="h-5 w-5" />
        PRD 폼 작성 완료
      </button>

      {/* Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">💡 폼 작성 도움말</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 필수 항목(*)은 반드시 입력해야 합니다</li>
          <li>• 선택사항은 나중에 PRD 파일을 수정하여 추가할 수 있습니다</li>
          <li>• 기술 스택은 Enter 키로 빠르게 추가할 수 있습니다</li>
        </ul>
      </div>
    </div>
  )
}
