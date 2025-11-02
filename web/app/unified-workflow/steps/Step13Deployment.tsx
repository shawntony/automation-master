'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Rocket, Plus, Trash2, Server, Eye, EyeOff, CheckSquare, Square } from 'lucide-react'

export interface Step13Data {
  platform: {
    type: 'vercel' | 'netlify' | 'aws' | 'azure' | 'self-hosted'
    config: Record<string, string>
  }
  environmentVars: {
    id: string
    key: string
    value: string
    isSecret: boolean
    environment: 'dev' | 'staging' | 'production' | 'all'
  }[]
  monitoring: {
    errorTracking: {
      enabled: boolean
      service: string
      config: string
    }
    analytics: {
      enabled: boolean
      service: string
      config: string
    }
    uptime: {
      enabled: boolean
      service: string
      config: string
    }
    alerts: {
      email?: string
      slack?: string
      discord?: string
    }
  }
  deploymentChecklist: {
    id: string
    item: string
    completed: boolean
    notes: string
  }[]
  notes: string
}

interface Step13DeploymentProps {
  stepNumber: number
  stepTitle: string
  stepIcon: React.ReactNode
  projectName: string
  projectType: string
  projectPath?: string
  prdPath?: string
  initialData?: Step13Data
  onComplete: (data: Step13Data, prompt: string) => void
  skipCondition?: {
    check: boolean
    message: string
  }
}

const defaultStep13Data: Step13Data = {
  platform: {
    type: 'vercel',
    config: {}
  },
  environmentVars: [
    {
      id: '1',
      key: 'DATABASE_URL',
      value: '',
      isSecret: true,
      environment: 'all'
    },
    {
      id: '2',
      key: 'API_KEY',
      value: '',
      isSecret: true,
      environment: 'production'
    }
  ],
  monitoring: {
    errorTracking: {
      enabled: true,
      service: 'Sentry',
      config: ''
    },
    analytics: {
      enabled: true,
      service: 'Google Analytics',
      config: ''
    },
    uptime: {
      enabled: true,
      service: 'UptimeRobot',
      config: ''
    },
    alerts: {
      email: '',
      slack: '',
      discord: ''
    }
  },
  deploymentChecklist: [
    {
      id: '1',
      item: 'Environment variables 설정',
      completed: false,
      notes: ''
    },
    {
      id: '2',
      item: 'Database migration 실행',
      completed: false,
      notes: ''
    },
    {
      id: '3',
      item: 'SSL 인증서 설정',
      completed: false,
      notes: ''
    },
    {
      id: '4',
      item: 'Domain 연결',
      completed: false,
      notes: ''
    },
    {
      id: '5',
      item: '모니터링 도구 설정',
      completed: false,
      notes: ''
    }
  ],
  notes: ''
}

export const Step13Deployment: React.FC<Step13DeploymentProps> = ({
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
}) => {
  const [data, setData] = useState<Step13Data>(initialData || defaultStep13Data)
  const [showPreview, setShowPreview] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Platform
  const updatePlatformConfig = useCallback((key: string, value: string) => {
    setData((prev) => ({
      ...prev,
      platform: {
        ...prev.platform,
        config: {
          ...prev.platform.config,
          [key]: value
        }
      }
    }))
  }, [])

  const removePlatformConfig = useCallback((key: string) => {
    setData((prev) => {
      const newConfig = { ...prev.platform.config }
      delete newConfig[key]
      return {
        ...prev,
        platform: {
          ...prev.platform,
          config: newConfig
        }
      }
    })
  }, [])

  // Environment Variables
  const addEnvVar = useCallback(() => {
    const newVar = {
      id: Date.now().toString(),
      key: '',
      value: '',
      isSecret: false,
      environment: 'all' as const
    }
    setData((prev) => ({
      ...prev,
      environmentVars: [...prev.environmentVars, newVar]
    }))
  }, [])

  const removeEnvVar = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      environmentVars: prev.environmentVars.filter((v) => v.id !== id)
    }))
  }, [])

  const updateEnvVar = useCallback(
    (id: string, updates: Partial<Step13Data['environmentVars'][0]>) => {
      setData((prev) => ({
        ...prev,
        environmentVars: prev.environmentVars.map((v) => (v.id === id ? { ...v, ...updates } : v))
      }))
    },
    []
  )

  const toggleSecretVisibility = useCallback((id: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }, [])

  // Monitoring
  const updateMonitoring = useCallback(
    (
      category: 'errorTracking' | 'analytics' | 'uptime',
      updates: Partial<Step13Data['monitoring']['errorTracking']>
    ) => {
      setData((prev) => ({
        ...prev,
        monitoring: {
          ...prev.monitoring,
          [category]: {
            ...prev.monitoring[category],
            ...updates
          }
        }
      }))
    },
    []
  )

  const updateAlerts = useCallback((updates: Partial<Step13Data['monitoring']['alerts']>) => {
    setData((prev) => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        alerts: {
          ...prev.monitoring.alerts,
          ...updates
        }
      }
    }))
  }, [])

  // Deployment Checklist
  const addChecklistItem = useCallback(() => {
    const newItem = {
      id: Date.now().toString(),
      item: '',
      completed: false,
      notes: ''
    }
    setData((prev) => ({
      ...prev,
      deploymentChecklist: [...prev.deploymentChecklist, newItem]
    }))
  }, [])

  const removeChecklistItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      deploymentChecklist: prev.deploymentChecklist.filter((item) => item.id !== id)
    }))
  }, [])

  const updateChecklistItem = useCallback(
    (id: string, updates: Partial<Step13Data['deploymentChecklist'][0]>) => {
      setData((prev) => ({
        ...prev,
        deploymentChecklist: prev.deploymentChecklist.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      }))
    },
    []
  )

  const toggleChecklistItem = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        deploymentChecklist: prev.deploymentChecklist.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      }))
    },
    []
  )

  // Generate Markdown
  const generateMarkdown = useCallback((): string => {
    let md = '# 배포 및 모니터링\n\n'

    // Platform
    md += '## 배포 플랫폼\n\n'
    md += `- **Type**: ${data.platform.type}\n\n`

    if (Object.keys(data.platform.config).length > 0) {
      md += '### 플랫폼 설정\n\n'
      Object.entries(data.platform.config).forEach(([key, value]) => {
        md += `- **${key}**: ${value}\n`
      })
      md += '\n'
    }

    // Environment Variables
    if (data.environmentVars.length > 0) {
      md += '## 환경 변수\n\n'
      md += '| Key | Environment | Secret |\n'
      md += '|-----|-------------|--------|\n'
      data.environmentVars.forEach((envVar) => {
        if (envVar.key) {
          const secretIndicator = envVar.isSecret ? '🔒 Yes' : 'No'
          md += `| ${envVar.key} | ${envVar.environment} | ${secretIndicator} |\n`
        }
      })
      md += '\n'
    }

    // Monitoring
    md += '## 모니터링\n\n'

    if (data.monitoring.errorTracking.enabled) {
      md += `### Error Tracking: ${data.monitoring.errorTracking.service}\n\n`
      if (data.monitoring.errorTracking.config) {
        md += `\`\`\`\n${data.monitoring.errorTracking.config}\n\`\`\`\n\n`
      }
    }

    if (data.monitoring.analytics.enabled) {
      md += `### Analytics: ${data.monitoring.analytics.service}\n\n`
      if (data.monitoring.analytics.config) {
        md += `\`\`\`\n${data.monitoring.analytics.config}\n\`\`\`\n\n`
      }
    }

    if (data.monitoring.uptime.enabled) {
      md += `### Uptime Monitoring: ${data.monitoring.uptime.service}\n\n`
      if (data.monitoring.uptime.config) {
        md += `\`\`\`\n${data.monitoring.uptime.config}\n\`\`\`\n\n`
      }
    }

    // Alerts
    const alerts = []
    if (data.monitoring.alerts.email) alerts.push(`Email: ${data.monitoring.alerts.email}`)
    if (data.monitoring.alerts.slack) alerts.push(`Slack: ${data.monitoring.alerts.slack}`)
    if (data.monitoring.alerts.discord) alerts.push(`Discord: ${data.monitoring.alerts.discord}`)

    if (alerts.length > 0) {
      md += '### 알림 채널\n\n'
      alerts.forEach((alert) => {
        md += `- ${alert}\n`
      })
      md += '\n'
    }

    // Deployment Checklist
    if (data.deploymentChecklist.length > 0) {
      md += '## 배포 체크리스트\n\n'
      const completed = data.deploymentChecklist.filter((item) => item.completed).length
      const total = data.deploymentChecklist.length
      md += `**진행률**: ${completed}/${total} (${Math.round((completed / total) * 100)}%)\n\n`

      data.deploymentChecklist.forEach((item) => {
        if (item.item) {
          const checkbox = item.completed ? '[x]' : '[ ]'
          md += `- ${checkbox} ${item.item}\n`
          if (item.notes) {
            md += `  - ${item.notes}\n`
          }
        }
      })
      md += '\n'
    }

    // Notes
    if (data.notes) {
      md += '## 추가 노트\n\n'
      md += data.notes + '\n'
    }

    return md
  }, [data])

  // Calculate checklist completion
  const completedCount = useMemo(
    () => data.deploymentChecklist.filter((item) => item.completed).length,
    [data.deploymentChecklist]
  )
  const totalCount = useMemo(() => data.deploymentChecklist.length, [data.deploymentChecklist])
  const completionPercentage = useMemo(
    () => (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0),
    [completedCount, totalCount]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Rocket className="h-6 w-6 text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-900">배포 및 모니터링</h2>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
        >
          {showPreview ? '편집 모드' : '마크다운 미리보기'}
        </button>
      </div>

      {showPreview ? (
        <div className="bg-white border border-teal-200 rounded-lg p-6">
          <pre className="whitespace-pre-wrap text-sm text-gray-800">{generateMarkdown()}</pre>
        </div>
      ) : (
        <>
          {/* Platform Selection */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-teal-900 mb-4 flex items-center">
              <Server className="h-5 w-5 mr-2" />
              배포 플랫폼
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">플랫폼 선택</label>
                <select
                  value={data.platform.type}
                  onChange={(e) =>
                    setData({
                      ...data,
                      platform: {
                        ...data.platform,
                        type: e.target.value as Step13Data['platform']['type']
                      }
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                  <option value="aws">AWS</option>
                  <option value="azure">Azure</option>
                  <option value="self-hosted">Self-Hosted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  플랫폼 설정 (선택사항)
                </label>
                <div className="space-y-2">
                  {Object.entries(data.platform.config).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={key}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updatePlatformConfig(key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={() => removePlatformConfig(key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const key = prompt('설정 키 입력:')
                      if (key) updatePlatformConfig(key, '')
                    }}
                    className="flex items-center px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    설정 추가
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-white border border-teal-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-teal-900">환경 변수</h3>
              <button
                onClick={addEnvVar}
                className="flex items-center px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                변수 추가
              </button>
            </div>

            <div className="space-y-3">
              {data.environmentVars.map((envVar) => (
                <div key={envVar.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start space-x-2 mb-2">
                    <input
                      type="text"
                      value={envVar.key}
                      onChange={(e) => updateEnvVar(envVar.id, { key: e.target.value })}
                      placeholder="KEY"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <div className="relative flex-1">
                      <input
                        type={envVar.isSecret && !showSecrets[envVar.id] ? 'password' : 'text'}
                        value={envVar.value}
                        onChange={(e) => updateEnvVar(envVar.id, { value: e.target.value })}
                        placeholder="value"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono pr-10"
                      />
                      {envVar.isSecret && (
                        <button
                          onClick={() => toggleSecretVisibility(envVar.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showSecrets[envVar.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => removeEnvVar(envVar.id)}
                      className="text-red-600 hover:text-red-800 mt-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={envVar.isSecret}
                        onChange={(e) => updateEnvVar(envVar.id, { isSecret: e.target.checked })}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">🔒 Secret</span>
                    </label>

                    <select
                      value={envVar.environment}
                      onChange={(e) =>
                        updateEnvVar(envVar.id, {
                          environment: e.target.value as Step13Data['environmentVars'][0]['environment']
                        })
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="dev">Dev</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring */}
          <div className="bg-white border border-teal-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-teal-900 mb-4">모니터링</h3>

            <div className="space-y-4">
              {/* Error Tracking */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.monitoring.errorTracking.enabled}
                      onChange={(e) =>
                        updateMonitoring('errorTracking', { enabled: e.target.checked })
                      }
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Error Tracking</span>
                  </label>
                </div>

                {data.monitoring.errorTracking.enabled && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={data.monitoring.errorTracking.service}
                      onChange={(e) =>
                        updateMonitoring('errorTracking', { service: e.target.value })
                      }
                      placeholder="Service (예: Sentry, Rollbar)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <textarea
                      value={data.monitoring.errorTracking.config}
                      onChange={(e) =>
                        updateMonitoring('errorTracking', { config: e.target.value })
                      }
                      placeholder="설정 (DSN, API Key 등)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Analytics */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.monitoring.analytics.enabled}
                      onChange={(e) => updateMonitoring('analytics', { enabled: e.target.checked })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Analytics</span>
                  </label>
                </div>

                {data.monitoring.analytics.enabled && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={data.monitoring.analytics.service}
                      onChange={(e) => updateMonitoring('analytics', { service: e.target.value })}
                      placeholder="Service (예: Google Analytics, Mixpanel)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <textarea
                      value={data.monitoring.analytics.config}
                      onChange={(e) => updateMonitoring('analytics', { config: e.target.value })}
                      placeholder="설정 (Tracking ID 등)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Uptime Monitoring */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.monitoring.uptime.enabled}
                      onChange={(e) => updateMonitoring('uptime', { enabled: e.target.checked })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Uptime Monitoring</span>
                  </label>
                </div>

                {data.monitoring.uptime.enabled && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={data.monitoring.uptime.service}
                      onChange={(e) => updateMonitoring('uptime', { service: e.target.value })}
                      placeholder="Service (예: UptimeRobot, Pingdom)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <textarea
                      value={data.monitoring.uptime.config}
                      onChange={(e) => updateMonitoring('uptime', { config: e.target.value })}
                      placeholder="설정 (API Key, Monitor URL 등)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Alert Channels */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">알림 채널</h4>
                <div className="space-y-2">
                  <input
                    type="email"
                    value={data.monitoring.alerts.email || ''}
                    onChange={(e) => updateAlerts({ email: e.target.value })}
                    placeholder="Email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={data.monitoring.alerts.slack || ''}
                    onChange={(e) => updateAlerts({ slack: e.target.value })}
                    placeholder="Slack Webhook URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={data.monitoring.alerts.discord || ''}
                    onChange={(e) => updateAlerts({ discord: e.target.value })}
                    placeholder="Discord Webhook URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Checklist */}
          <div className="bg-white border border-teal-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-teal-900">배포 체크리스트</h3>
              <button
                onClick={addChecklistItem}
                className="flex items-center px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                항목 추가
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">진행률</span>
                <span className="text-sm font-semibold text-teal-600">
                  {completedCount}/{totalCount} ({completionPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-teal-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {data.deploymentChecklist.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className="mt-1 text-teal-600 hover:text-teal-700"
                    >
                      {item.completed ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => updateChecklistItem(item.id, { item: e.target.value })}
                        placeholder="체크리스트 항목"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${
                          item.completed ? 'line-through text-gray-500' : ''
                        }`}
                      />
                      <textarea
                        value={item.notes}
                        onChange={(e) => updateChecklistItem(item.id, { notes: e.target.value })}
                        placeholder="노트 (선택사항)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-16 resize-none"
                      />
                    </div>

                    <button
                      onClick={() => removeChecklistItem(item.id)}
                      className="mt-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-teal-200 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">추가 노트</label>
            <textarea
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              placeholder="배포 및 모니터링에 대한 추가 설명이나 특이사항을 기록하세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => {
                const markdown = generateMarkdown()
                const prompt = `# Step ${stepNumber}: ${stepTitle}\n\n${markdown}`
                onComplete(data, prompt)
              }}
              disabled={isSubmitting}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? '처리 중...' : '다음 단계로'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Step13Deployment
