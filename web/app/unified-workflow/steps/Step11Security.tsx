'use client'

import { useState, useCallback, useMemo } from 'react'
import { FormField } from '@/components/unified/FormField'
import { PromptDisplay } from '@/components/unified/PromptDisplay'
import { generatePrompt } from '@/lib/prompt-generator'
import { Shield, Check, X, Plus, Trash2, Eye, Code } from 'lucide-react'

interface Step11SecurityProps {
  stepNumber: number
  stepTitle: string
  stepIcon: React.ReactNode
  projectName: string
  projectType: string
  projectPath?: string
  prdPath?: string
  initialData?: Step11Data
  onComplete: (data: Step11Data, prompt: string) => void
  skipCondition?: {
    check: boolean
    message: string
  }
}

export interface Step11Data {
  authMethods: ('jwt' | 'oauth2' | 'session' | 'supabase-auth')[]
  rbacMatrix: { role: string; resources: Record<string, boolean> }[]
  encryptionConfig: {
    atRest: boolean
    inTransit: boolean
    keyManagement: string
  }
  owaspChecklist: { item: string; completed: boolean; notes: string }[]
  notes: string
}

const AUTH_METHODS = [
  { value: 'jwt', label: 'JWT Bearer Token' },
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'session', label: 'Session-based' },
  { value: 'supabase-auth', label: 'Supabase Auth' }
]

const DEFAULT_OWASP_ITEMS = [
  'A01: Broken Access Control',
  'A02: Cryptographic Failures',
  'A03: Injection',
  'A04: Insecure Design',
  'A05: Security Misconfiguration',
  'A06: Vulnerable and Outdated Components',
  'A07: Identification and Authentication Failures',
  'A08: Software and Data Integrity Failures',
  'A09: Security Logging and Monitoring Failures',
  'A10: Server-Side Request Forgery (SSRF)'
]

const DEFAULT_RESOURCES = ['users', 'posts', 'comments', 'settings']

export function Step11Security({
  stepNumber,
  stepTitle,
  stepIcon,
  projectName,
  projectType,
  projectPath,
  prdPath,
  initialData,
  onComplete,
  skipCondition
}: Step11SecurityProps) {
  const [data, setData] = useState<Step11Data>(
    initialData || {
      authMethods: [],
      rbacMatrix: [],
      encryptionConfig: {
        atRest: false,
        inTransit: false,
        keyManagement: ''
      },
      owaspChecklist: DEFAULT_OWASP_ITEMS.map((item) => ({
        item,
        completed: false,
        notes: ''
      })),
      notes: ''
    }
  )

  const [showPreview, setShowPreview] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newRole, setNewRole] = useState('')
  const [newResource, setNewResource] = useState('')

  const toggleAuthMethod = useCallback((method: Step11Data['authMethods'][number]) => {
    setData((prev) => ({
      ...prev,
      authMethods: prev.authMethods.includes(method)
        ? prev.authMethods.filter((m) => m !== method)
        : [...prev.authMethods, method]
    }))
  }, [])

  const addRole = useCallback(() => {
    if (newRole.trim() && !data.rbacMatrix.some((r) => r.role === newRole.trim())) {
      const resources: Record<string, boolean> = {}
      DEFAULT_RESOURCES.forEach((res) => (resources[res] = false))

      setData((prev) => ({
        ...prev,
        rbacMatrix: [...prev.rbacMatrix, { role: newRole.trim(), resources }]
      }))
      setNewRole('')
    }
  }, [newRole, data.rbacMatrix])

  const removeRole = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      rbacMatrix: prev.rbacMatrix.filter((_, i) => i !== index)
    }))
  }, [])

  const togglePermission = useCallback((roleIndex: number, resource: string) => {
    setData((prev) => {
      const newMatrix = [...prev.rbacMatrix]
      newMatrix[roleIndex].resources[resource] = !newMatrix[roleIndex].resources[resource]
      return { ...prev, rbacMatrix: newMatrix }
    })
  }, [])

  const toggleOwaspItem = useCallback((index: number) => {
    setData((prev) => {
      const newChecklist = [...prev.owaspChecklist]
      newChecklist[index].completed = !newChecklist[index].completed
      return { ...prev, owaspChecklist: newChecklist }
    })
  }, [])

  const updateOwaspNotes = useCallback((index: number, notes: string) => {
    setData((prev) => {
      const newChecklist = [...prev.owaspChecklist]
      newChecklist[index].notes = notes
      return { ...prev, owaspChecklist: newChecklist }
    })
  }, [])

  const generateMarkdown = useCallback((): string => {
    let markdown = `# ${projectName} - Security & Authentication\n\n`

    if (data.authMethods.length > 0) {
      markdown += `## 🔐 Authentication Methods\n`
      data.authMethods.forEach((method) => {
        const label = AUTH_METHODS.find((m) => m.value === method)?.label || method
        markdown += `- ${label}\n`
      })
      markdown += `\n`
    }

    if (data.rbacMatrix.length > 0) {
      markdown += `## 👥 RBAC Matrix\n\n`
      markdown += `| Role | ${Object.keys(data.rbacMatrix[0].resources).join(' | ')} |\n`
      markdown += `|------|${Object.keys(data.rbacMatrix[0].resources).map(() => '---').join('|')}|\n`

      data.rbacMatrix.forEach((row) => {
        const permissions = Object.entries(row.resources)
          .map(([_, allowed]) => (allowed ? '✅' : '❌'))
          .join(' | ')
        markdown += `| **${row.role}** | ${permissions} |\n`
      })
      markdown += `\n`
    }

    markdown += `## 🔒 Encryption Configuration\n`
    markdown += `- **At Rest**: ${data.encryptionConfig.atRest ? 'Enabled' : 'Disabled'}\n`
    markdown += `- **In Transit**: ${data.encryptionConfig.inTransit ? 'Enabled' : 'Disabled'}\n`
    if (data.encryptionConfig.keyManagement) {
      markdown += `- **Key Management**: ${data.encryptionConfig.keyManagement}\n`
    }
    markdown += `\n`

    markdown += `## 🛡️ OWASP Top 10 Checklist\n\n`
    data.owaspChecklist.forEach((item) => {
      const status = item.completed ? '✅' : '⏳'
      markdown += `${status} **${item.item}**\n`
      if (item.notes) {
        markdown += `   - ${item.notes}\n`
      }
      markdown += `\n`
    })

    if (data.notes) {
      markdown += `## 📝 Security Notes\n${data.notes}\n\n`
    }

    markdown += `---\n*Generated with Unified Workflow System*\n`

    return markdown
  }, [projectName, data])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (data.authMethods.length === 0) {
      newErrors.authMethods = '최소 1개 이상의 인증 방식을 선택해주세요'
    }
    if (data.rbacMatrix.length === 0) {
      newErrors.rbacMatrix = '최소 1개 이상의 역할을 추가해주세요'
    }
    if (
      (data.encryptionConfig.atRest || data.encryptionConfig.inTransit) &&
      !data.encryptionConfig.keyManagement
    ) {
      newErrors.keyManagement = '암호화를 활성화한 경우 키 관리 전략을 작성해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGeneratePrompt = useCallback(() => {
    if (!validate()) return
    setShowPrompt(true)
  }, [data])

  const handleComplete = useCallback(() => {
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
  }, [data, projectName, projectType, projectPath, prdPath, stepNumber, onComplete])

  const handleSkip = useCallback(() => {
    if (skipCondition) {
      onComplete(data, `# Step ${stepNumber} 건너뛰기\n\n${skipCondition.message}`)
    }
  }, [skipCondition, data, stepNumber, onComplete])

  const generatedPrompt = useMemo(
    () =>
      showPrompt
        ? generatePrompt({
            projectName,
            projectType,
            projectPath,
            prdPath,
            stepNumber,
            stepData: data
          })
        : '',
    [showPrompt, projectName, projectType, projectPath, prdPath, stepNumber, data]
  )

  // Memoize completion calculations
  const completedCount = useMemo(
    () => data.owaspChecklist.filter((item) => item.completed).length,
    [data.owaspChecklist]
  )
  const completionPercentage = useMemo(
    () => Math.round((completedCount / data.owaspChecklist.length) * 100),
    [completedCount, data.owaspChecklist.length]
  )

  // Skip condition rendering
  if (skipCondition?.check) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
          {stepIcon}
          <div>
            <p className="font-medium text-gray-900">
              Step {stepNumber}: {stepTitle}
            </p>
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
      <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          {stepIcon}
          <div>
            <p className="font-medium text-red-900">
              Step {stepNumber}: {stepTitle}
            </p>
            <p className="text-sm text-red-700">
              인증 방식, RBAC 매트릭스, OWASP Top 10 체크리스트
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {showPreview ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreview ? '편집 모드' : 'Markdown'}
        </button>
      </div>

      {showPreview ? (
        /* Markdown Preview */
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Markdown 미리보기
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateMarkdown())
                alert('Markdown이 클립보드에 복사되었습니다!')
              }}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              복사
            </button>
          </div>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
              {generateMarkdown()}
            </pre>
          </div>
        </div>
      ) : (
        /* Edit Mode - Security Form */
        <div className="space-y-6">
          {/* Authentication Methods */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">인증 방식</h3>
            {errors.authMethods && (
              <p className="text-sm text-red-600 mb-4">{errors.authMethods}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {AUTH_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    data.authMethods.includes(
                      method.value as Step11Data['authMethods'][number]
                    )
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.authMethods.includes(
                      method.value as Step11Data['authMethods'][number]
                    )}
                    onChange={() =>
                      toggleAuthMethod(method.value as Step11Data['authMethods'][number])
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* RBAC Matrix */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">RBAC 매트릭스</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRole()}
                  placeholder="역할 이름"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={addRole}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  역할 추가
                </button>
              </div>
            </div>

            {errors.rbacMatrix && (
              <p className="text-sm text-red-600 mb-4">{errors.rbacMatrix}</p>
            )}

            {data.rbacMatrix.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold border-r">역할</th>
                      {Object.keys(data.rbacMatrix[0].resources).map((resource) => (
                        <th key={resource} className="px-4 py-2 text-center text-sm font-semibold border-r">
                          {resource}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-center text-sm font-semibold">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rbacMatrix.map((row, roleIndex) => (
                      <tr key={roleIndex} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium border-r">{row.role}</td>
                        {Object.entries(row.resources).map(([resource, allowed]) => (
                          <td key={resource} className="px-4 py-2 text-center border-r">
                            <button
                              onClick={() => togglePermission(roleIndex, resource)}
                              className={`p-1 rounded ${
                                allowed
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                            >
                              {allowed ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                            </button>
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => removeRole(roleIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Encryption Configuration */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">암호화 설정</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={data.encryptionConfig.atRest}
                  onChange={(e) =>
                    setData({
                      ...data,
                      encryptionConfig: {
                        ...data.encryptionConfig,
                        atRest: e.target.checked
                      }
                    })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">저장 시 암호화 (At Rest)</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={data.encryptionConfig.inTransit}
                  onChange={(e) =>
                    setData({
                      ...data,
                      encryptionConfig: {
                        ...data.encryptionConfig,
                        inTransit: e.target.checked
                      }
                    })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">전송 중 암호화 (In Transit - HTTPS/TLS)</span>
              </label>

              {(data.encryptionConfig.atRest || data.encryptionConfig.inTransit) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    키 관리 전략
                  </label>
                  <textarea
                    value={data.encryptionConfig.keyManagement}
                    onChange={(e) =>
                      setData({
                        ...data,
                        encryptionConfig: {
                          ...data.encryptionConfig,
                          keyManagement: e.target.value
                        }
                      })
                    }
                    placeholder="예: AWS KMS를 사용하여 암호화 키 관리, 자동 키 로테이션 활성화"
                    className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                  {errors.keyManagement && (
                    <p className="text-sm text-red-600 mt-2">{errors.keyManagement}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* OWASP Top 10 Checklist */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">OWASP Top 10 체크리스트</h3>
              <div className="text-sm">
                <span className="font-semibold text-red-600">{completedCount}</span>
                <span className="text-gray-600"> / {data.owaspChecklist.length}</span>
                <span className="ml-2 text-gray-500">({completionPercentage}%)</span>
              </div>
            </div>

            <div className="mb-4 bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="space-y-3">
              {data.owaspChecklist.map((item, index) => (
                <div key={index} className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleOwaspItem(index)}
                      className={`mt-0.5 p-1 rounded ${
                        item.completed
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {item.completed ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-400 rounded" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          item.completed ? 'text-green-600 line-through' : 'text-gray-900'
                        }`}
                      >
                        {item.item}
                      </p>
                      <textarea
                        value={item.notes}
                        onChange={(e) => updateOwaspNotes(index, e.target.value)}
                        placeholder="구현 방법이나 주의사항 메모"
                        className="mt-2 w-full h-20 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <FormField
            label="보안 노트 (선택사항)"
            hint="보안 설계 의도나 주의사항을 메모하세요"
          >
            <textarea
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              placeholder="취약점 스캔 일정, 침투 테스트 계획 등"
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </FormField>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleGeneratePrompt}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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
        <PromptDisplay prompt={generatedPrompt} onRegenerate={() => setShowPrompt(false)} />
      )}
    </div>
  )
}
