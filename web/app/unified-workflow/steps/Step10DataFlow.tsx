'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { FormField } from '@/components/unified/FormField'
import { PromptDisplay } from '@/components/unified/PromptDisplay'
import { generatePrompt } from '@/lib/prompt-generator'
import { Network, Eye, Code, Zap, Database as DatabaseIcon } from 'lucide-react'
import mermaid from 'mermaid'

interface Step10DataFlowProps {
  stepNumber: number
  stepTitle: string
  stepIcon: React.ReactNode
  projectName: string
  projectType: string
  projectPath?: string
  prdPath?: string
  initialData?: Step10Data
  onComplete: (data: Step10Data, prompt: string) => void
  skipCondition?: {
    check: boolean
    message: string
  }
}

export interface Step10Data {
  clientToServer: string
  serverToDatabase: string
  cachingStrategy: {
    enabled: boolean
    type: 'redis' | 'cdn' | 'in-memory' | 'none'
    ttl: number
    invalidation: string
  }
  realtimeConfig: {
    enabled: boolean
    channels: string[]
    conflictResolution: 'last-write-wins' | 'custom' | 'none'
  }
  sequenceDiagram: string
  notes: string
}

const CACHING_TYPES = [
  { value: 'none', label: '캐싱 없음' },
  { value: 'in-memory', label: 'In-Memory (빠름, 휘발성)' },
  { value: 'redis', label: 'Redis (영구, 분산)' },
  { value: 'cdn', label: 'CDN (정적 콘텐츠)' }
]

const CONFLICT_RESOLUTION = [
  { value: 'none', label: '없음' },
  { value: 'last-write-wins', label: 'Last Write Wins (기본)' },
  { value: 'custom', label: 'Custom Logic (수동 해결)' }
]

export function Step10DataFlow({
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
}: Step10DataFlowProps) {
  const [data, setData] = useState<Step10Data>(
    initialData || {
      clientToServer: '',
      serverToDatabase: '',
      cachingStrategy: {
        enabled: false,
        type: 'none',
        ttl: 300,
        invalidation: ''
      },
      realtimeConfig: {
        enabled: false,
        channels: [],
        conflictResolution: 'last-write-wins'
      },
      sequenceDiagram: '',
      notes: ''
    }
  )

  const [showPreview, setShowPreview] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDiagram, setShowDiagram] = useState(false)
  const [newChannel, setNewChannel] = useState('')

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      sequence: { useMaxWidth: true }
    })
  }, [])

  // Generate default sequence diagram
  useEffect(() => {
    if (!data.sequenceDiagram) {
      const defaultDiagram = `sequenceDiagram
    participant Client
    participant Server
    participant Cache
    participant Database

    Client->>Server: Request
    Server->>Cache: Check Cache
    alt Cache Hit
        Cache-->>Server: Cached Data
    else Cache Miss
        Server->>Database: Query
        Database-->>Server: Data
        Server->>Cache: Update Cache
    end
    Server-->>Client: Response`

      setData({ ...data, sequenceDiagram: defaultDiagram })
    }
  }, [])

  // Render diagram
  useEffect(() => {
    if (data.sequenceDiagram && showDiagram) {
      const renderDiagram = async () => {
        try {
          const element = document.getElementById('sequence-diagram-container')
          if (element) {
            element.innerHTML = data.sequenceDiagram
            await mermaid.run({ nodes: [element] })
          }
        } catch (error) {
          console.error('Failed to render sequence diagram:', error)
        }
      }
      renderDiagram()
    }
  }, [data.sequenceDiagram, showDiagram])

  const addChannel = useCallback(() => {
    if (newChannel.trim() && !data.realtimeConfig.channels.includes(newChannel.trim())) {
      setData((prev) => ({
        ...prev,
        realtimeConfig: {
          ...prev.realtimeConfig,
          channels: [...prev.realtimeConfig.channels, newChannel.trim()]
        }
      }))
      setNewChannel('')
    }
  }, [newChannel, data.realtimeConfig.channels])

  const removeChannel = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      realtimeConfig: {
        ...prev.realtimeConfig,
        channels: prev.realtimeConfig.channels.filter((_, i) => i !== index)
      }
    }))
  }, [])

  const generateMarkdown = useCallback((): string => {
    let markdown = `# ${projectName} - Data Flow Design\n\n`

    markdown += `## 📊 Client → Server Flow\n${data.clientToServer || 'Not specified'}\n\n`

    markdown += `## 💾 Server → Database Flow\n${data.serverToDatabase || 'Not specified'}\n\n`

    if (data.cachingStrategy.enabled) {
      markdown += `## ⚡ Caching Strategy\n`
      markdown += `- **Type**: ${data.cachingStrategy.type}\n`
      markdown += `- **TTL**: ${data.cachingStrategy.ttl} seconds\n`
      if (data.cachingStrategy.invalidation) {
        markdown += `- **Invalidation**: ${data.cachingStrategy.invalidation}\n`
      }
      markdown += `\n`
    }

    if (data.realtimeConfig.enabled) {
      markdown += `## 🔄 Realtime Configuration\n`
      markdown += `- **Channels**: ${data.realtimeConfig.channels.join(', ')}\n`
      markdown += `- **Conflict Resolution**: ${data.realtimeConfig.conflictResolution}\n\n`
    }

    if (data.sequenceDiagram) {
      markdown += `## 🔀 Sequence Diagram\n\`\`\`mermaid\n${data.sequenceDiagram}\n\`\`\`\n\n`
    }

    if (data.notes) {
      markdown += `## 📝 Implementation Notes\n${data.notes}\n\n`
    }

    markdown += `---\n*Generated with Unified Workflow System*\n`

    return markdown
  }, [projectName, data])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!data.clientToServer || data.clientToServer.length < 20) {
      newErrors.clientToServer = 'Client→Server 플로우를 최소 20자 이상 작성해주세요'
    }
    if (!data.serverToDatabase || data.serverToDatabase.length < 20) {
      newErrors.serverToDatabase = 'Server→Database 플로우를 최소 20자 이상 작성해주세요'
    }
    if (data.cachingStrategy.enabled && !data.cachingStrategy.invalidation) {
      newErrors.cachingInvalidation = '캐시 무효화 전략을 작성해주세요'
    }
    if (data.realtimeConfig.enabled && data.realtimeConfig.channels.length === 0) {
      newErrors.realtimeChannels = '최소 1개 이상의 채널을 추가해주세요'
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
      <div className="flex items-center justify-between gap-3 bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          {stepIcon}
          <div>
            <p className="font-medium text-cyan-900">
              Step {stepNumber}: {stepTitle}
            </p>
            <p className="text-sm text-cyan-700">
              시퀀스 다이어그램, 캐싱 전략, 실시간 구독 설정
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowDiagram(!showDiagram)}
            disabled={!data.sequenceDiagram}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="h-4 w-4" />
            {showDiagram ? '편집 모드' : '다이어그램'}
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showPreview ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? '편집 모드' : 'Markdown'}
          </button>
        </div>
      </div>

      {showDiagram ? (
        /* Sequence Diagram */
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-600" />
              Sequence Diagram
            </h3>
          </div>
          <div
            id="sequence-diagram-container"
            className="mermaid bg-gray-50 p-4 rounded-lg overflow-x-auto"
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mermaid 코드 편집
            </label>
            <textarea
              value={data.sequenceDiagram}
              onChange={(e) => setData({ ...data, sequenceDiagram: e.target.value })}
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      ) : showPreview ? (
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
        /* Edit Mode - Data Flow Form */
        <div className="space-y-6">
          {/* Client to Server Flow */}
          <FormField
            label="Client → Server 데이터 플로우"
            required
            error={errors.clientToServer}
            hint="클라이언트에서 서버로의 요청 처리 과정을 설명하세요"
          >
            <textarea
              value={data.clientToServer}
              onChange={(e) => setData({ ...data, clientToServer: e.target.value })}
              placeholder="예: 사용자가 폼을 제출하면, React Query가 POST 요청을 보내고, Next.js API Route에서 검증..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </FormField>

          {/* Server to Database Flow */}
          <FormField
            label="Server → Database 데이터 플로우"
            required
            error={errors.serverToDatabase}
            hint="서버에서 데이터베이스로의 쿼리 및 응답 과정을 설명하세요"
          >
            <textarea
              value={data.serverToDatabase}
              onChange={(e) => setData({ ...data, serverToDatabase: e.target.value })}
              placeholder="예: Supabase 클라이언트로 데이터를 쿼리하고, RLS 정책이 적용되며, 결과를 직렬화..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </FormField>

          {/* Caching Strategy */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-cyan-600" />
                캐싱 전략
              </h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.cachingStrategy.enabled}
                  onChange={(e) =>
                    setData({
                      ...data,
                      cachingStrategy: {
                        ...data.cachingStrategy,
                        enabled: e.target.checked
                      }
                    })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">캐싱 활성화</span>
              </label>
            </div>

            {data.cachingStrategy.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    캐싱 타입
                  </label>
                  <select
                    value={data.cachingStrategy.type}
                    onChange={(e) =>
                      setData({
                        ...data,
                        cachingStrategy: {
                          ...data.cachingStrategy,
                          type: e.target.value as Step10Data['cachingStrategy']['type']
                        }
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {CACHING_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TTL (Time To Live) - 초
                  </label>
                  <input
                    type="number"
                    value={data.cachingStrategy.ttl}
                    onChange={(e) =>
                      setData({
                        ...data,
                        cachingStrategy: {
                          ...data.cachingStrategy,
                          ttl: parseInt(e.target.value) || 0
                        }
                      })
                    }
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    캐시 무효화 전략
                  </label>
                  <textarea
                    value={data.cachingStrategy.invalidation}
                    onChange={(e) =>
                      setData({
                        ...data,
                        cachingStrategy: {
                          ...data.cachingStrategy,
                          invalidation: e.target.value
                        }
                      })
                    }
                    placeholder="언제 캐시를 무효화할지 설명 (예: 데이터 업데이트 시, 사용자 로그아웃 시)"
                    className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                  {errors.cachingInvalidation && (
                    <p className="text-sm text-red-600 mt-1">{errors.cachingInvalidation}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Realtime Configuration */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5 text-cyan-600" />
                실시간 구독 설정
              </h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.realtimeConfig.enabled}
                  onChange={(e) =>
                    setData({
                      ...data,
                      realtimeConfig: {
                        ...data.realtimeConfig,
                        enabled: e.target.checked
                      }
                    })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">실시간 구독 활성화</span>
              </label>
            </div>

            {data.realtimeConfig.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    채널 목록
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newChannel}
                      onChange={(e) => setNewChannel(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addChannel()}
                      placeholder="채널 이름 (예: public:posts)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={addChannel}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                    >
                      추가
                    </button>
                  </div>

                  {data.realtimeConfig.channels.length > 0 && (
                    <div className="space-y-2">
                      {data.realtimeConfig.channels.map((channel, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
                        >
                          <span className="text-gray-900">{channel}</span>
                          <button
                            onClick={() => removeChannel(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.realtimeChannels && (
                    <p className="text-sm text-red-600 mt-2">{errors.realtimeChannels}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    충돌 해결 전략
                  </label>
                  <select
                    value={data.realtimeConfig.conflictResolution}
                    onChange={(e) =>
                      setData({
                        ...data,
                        realtimeConfig: {
                          ...data.realtimeConfig,
                          conflictResolution: e.target
                            .value as Step10Data['realtimeConfig']['conflictResolution']
                        }
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {CONFLICT_RESOLUTION.map((strategy) => (
                      <option key={strategy.value} value={strategy.value}>
                        {strategy.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <FormField
            label="구현 노트 (선택사항)"
            hint="데이터 플로우 설계 의도나 주의사항을 메모하세요"
          >
            <textarea
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              placeholder="성능 최적화 포인트, 에러 처리 전략 등"
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </FormField>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleGeneratePrompt}
          className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
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
