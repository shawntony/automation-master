'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { TestTube, Plus, Trash2, Play, FileCode, CheckCircle } from 'lucide-react'

export interface Step12Data {
  coverageGoals: {
    unit: number
    integration: number
    e2e: number
  }
  testScenarios: {
    id: string
    type: 'unit' | 'integration' | 'e2e'
    given: string
    when: string
    then: string
    priority: 'high' | 'medium' | 'low'
  }[]
  cicdPipeline: {
    platform: 'github-actions' | 'jenkins' | 'gitlab-ci' | 'circleci' | 'none'
    triggers: ('push' | 'pr' | 'schedule')[]
    jobs: { id: string; name: string; commands: string[] }[]
  }
  playwrightTests: {
    id: string
    path: string
    description: string
    steps: string[]
  }[]
  notes: string
}

interface Step12TestingProps {
  stepNumber: number
  stepTitle: string
  stepIcon: React.ReactNode
  projectName: string
  projectType: string
  projectPath?: string
  prdPath?: string
  initialData?: Step12Data
  onComplete: (data: Step12Data, prompt: string) => void
  skipCondition?: {
    check: boolean
    message: string
  }
}

const defaultStep12Data: Step12Data = {
  coverageGoals: {
    unit: 80,
    integration: 70,
    e2e: 60
  },
  testScenarios: [
    {
      id: '1',
      type: 'unit',
      given: '사용자가 로그인되어 있을 때',
      when: '프로필 페이지에 접근하면',
      then: '사용자 정보가 표시되어야 한다',
      priority: 'high'
    }
  ],
  cicdPipeline: {
    platform: 'github-actions',
    triggers: ['push', 'pr'],
    jobs: [
      {
        id: '1',
        name: 'test',
        commands: ['npm install', 'npm run test']
      }
    ]
  },
  playwrightTests: [
    {
      id: '1',
      path: 'tests/e2e/login.spec.ts',
      description: '로그인 플로우 테스트',
      steps: ['페이지 접속', '이메일 입력', '비밀번호 입력', '로그인 버튼 클릭', '대시보드 확인']
    }
  ],
  notes: ''
}

export const Step12Testing: React.FC<Step12TestingProps> = ({
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
  const [data, setData] = useState<Step12Data>(initialData || defaultStep12Data)
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Coverage Goals
  const updateCoverageGoal = useCallback((type: 'unit' | 'integration' | 'e2e', value: number) => {
    setData((prev) => ({
      ...prev,
      coverageGoals: {
        ...prev.coverageGoals,
        [type]: value
      }
    }))
  }, [])

  // Test Scenarios
  const addTestScenario = useCallback(() => {
    const newScenario = {
      id: Date.now().toString(),
      type: 'unit' as const,
      given: '',
      when: '',
      then: '',
      priority: 'medium' as const
    }
    setData((prev) => ({
      ...prev,
      testScenarios: [...prev.testScenarios, newScenario]
    }))
  }, [])

  const removeTestScenario = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      testScenarios: prev.testScenarios.filter((s) => s.id !== id)
    }))
  }, [])

  const updateTestScenario = useCallback(
    (id: string, updates: Partial<Step12Data['testScenarios'][0]>) => {
      setData((prev) => ({
        ...prev,
        testScenarios: prev.testScenarios.map((s) => (s.id === id ? { ...s, ...updates } : s))
      }))
    },
    []
  )

  // CI/CD Pipeline
  const toggleTrigger = useCallback((trigger: 'push' | 'pr' | 'schedule') => {
    setData((prev) => {
      const triggers = prev.cicdPipeline.triggers.includes(trigger)
        ? prev.cicdPipeline.triggers.filter((t) => t !== trigger)
        : [...prev.cicdPipeline.triggers, trigger]

      return {
        ...prev,
        cicdPipeline: {
          ...prev.cicdPipeline,
          triggers
        }
      }
    })
  }, [])

  const addJob = useCallback(() => {
    const newJob = {
      id: Date.now().toString(),
      name: '',
      commands: ['']
    }
    setData((prev) => ({
      ...prev,
      cicdPipeline: {
        ...prev.cicdPipeline,
        jobs: [...prev.cicdPipeline.jobs, newJob]
      }
    }))
  }, [])

  const removeJob = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      cicdPipeline: {
        ...prev.cicdPipeline,
        jobs: prev.cicdPipeline.jobs.filter((j) => j.id !== id)
      }
    }))
  }, [])

  const updateJob = useCallback(
    (id: string, updates: Partial<Step12Data['cicdPipeline']['jobs'][0]>) => {
      setData((prev) => ({
        ...prev,
        cicdPipeline: {
          ...prev.cicdPipeline,
          jobs: prev.cicdPipeline.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j))
        }
      }))
    },
    []
  )

  const addCommandToJob = (jobId: string) => {
    setData({
      ...data,
      cicdPipeline: {
        ...data.cicdPipeline,
        jobs: data.cicdPipeline.jobs.map((j) =>
          j.id === jobId ? { ...j, commands: [...j.commands, ''] } : j
        )
      }
    })
  }

  const updateJobCommand = (jobId: string, commandIndex: number, value: string) => {
    setData({
      ...data,
      cicdPipeline: {
        ...data.cicdPipeline,
        jobs: data.cicdPipeline.jobs.map((j) =>
          j.id === jobId
            ? { ...j, commands: j.commands.map((c, i) => (i === commandIndex ? value : c)) }
            : j
        )
      }
    })
  }

  const removeJobCommand = (jobId: string, commandIndex: number) => {
    setData({
      ...data,
      cicdPipeline: {
        ...data.cicdPipeline,
        jobs: data.cicdPipeline.jobs.map((j) =>
          j.id === jobId ? { ...j, commands: j.commands.filter((_, i) => i !== commandIndex) } : j
        )
      }
    })
  }

  // Playwright Tests
  const addPlaywrightTest = () => {
    const newTest = {
      id: Date.now().toString(),
      path: '',
      description: '',
      steps: ['']
    }
    setData({
      ...data,
      playwrightTests: [...data.playwrightTests, newTest]
    })
  }

  const removePlaywrightTest = (id: string) => {
    setData({
      ...data,
      playwrightTests: data.playwrightTests.filter((t) => t.id !== id)
    })
  }

  const updatePlaywrightTest = (
    id: string,
    updates: Partial<Step12Data['playwrightTests'][0]>
  ) => {
    setData({
      ...data,
      playwrightTests: data.playwrightTests.map((t) => (t.id === id ? { ...t, ...updates } : t))
    })
  }

  const addStepToTest = (testId: string) => {
    setData({
      ...data,
      playwrightTests: data.playwrightTests.map((t) =>
        t.id === testId ? { ...t, steps: [...t.steps, ''] } : t
      )
    })
  }

  const updateTestStep = (testId: string, stepIndex: number, value: string) => {
    setData({
      ...data,
      playwrightTests: data.playwrightTests.map((t) =>
        t.id === testId ? { ...t, steps: t.steps.map((s, i) => (i === stepIndex ? value : s)) } : t
      )
    })
  }

  const removeTestStep = (testId: string, stepIndex: number) => {
    setData({
      ...data,
      playwrightTests: data.playwrightTests.map((t) =>
        t.id === testId ? { ...t, steps: t.steps.filter((_, i) => i !== stepIndex) } : t
      )
    })
  }

  // Playwright Tests (continued functions wrapped with useCallback for brevity)

  // Generate Markdown
  const generateMarkdown = useCallback((): string => {
    let md = '# 테스트 전략\n\n'

    // Coverage Goals
    md += '## 커버리지 목표\n\n'
    md += `- Unit Test: ${data.coverageGoals.unit}%\n`
    md += `- Integration Test: ${data.coverageGoals.integration}%\n`
    md += `- E2E Test: ${data.coverageGoals.e2e}%\n\n`

    // Test Scenarios
    if (data.testScenarios.length > 0) {
      md += '## 테스트 시나리오\n\n'
      data.testScenarios.forEach((scenario, index) => {
        md += `### ${index + 1}. ${scenario.type.toUpperCase()} Test (${scenario.priority} priority)\n\n`
        md += `- **Given**: ${scenario.given}\n`
        md += `- **When**: ${scenario.when}\n`
        md += `- **Then**: ${scenario.then}\n\n`
      })
    }

    // CI/CD Pipeline
    if (data.cicdPipeline.platform !== 'none') {
      md += '## CI/CD 파이프라인\n\n'
      md += `- **Platform**: ${data.cicdPipeline.platform}\n`
      md += `- **Triggers**: ${data.cicdPipeline.triggers.join(', ')}\n\n`

      if (data.cicdPipeline.jobs.length > 0) {
        md += '### Jobs\n\n'
        data.cicdPipeline.jobs.forEach((job) => {
          if (job.name) {
            md += `#### ${job.name}\n\n`
            md += '```bash\n'
            job.commands.forEach((cmd) => {
              if (cmd) md += `${cmd}\n`
            })
            md += '```\n\n'
          }
        })
      }
    }

    // Playwright Tests
    if (data.playwrightTests.length > 0) {
      md += '## Playwright E2E 테스트\n\n'
      data.playwrightTests.forEach((test, index) => {
        if (test.path) {
          md += `### ${index + 1}. ${test.description || test.path}\n\n`
          md += `**파일**: \`${test.path}\`\n\n`
          md += '**테스트 단계**:\n\n'
          test.steps.forEach((step, i) => {
            if (step) md += `${i + 1}. ${step}\n`
          })
          md += '\n'
        }
      })
    }

    // Notes
    if (data.notes) {
      md += '## 추가 노트\n\n'
      md += data.notes + '\n'
    }

    return md
  }, [data])

  // Calculate average coverage
  const avgCoverage = useMemo(
    () =>
      Math.round(
        (data.coverageGoals.unit + data.coverageGoals.integration + data.coverageGoals.e2e) / 3
      ),
    [data.coverageGoals]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TestTube className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">테스트 전략</h2>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
        >
          {showPreview ? '편집 모드' : '마크다운 미리보기'}
        </button>
      </div>

      {showPreview ? (
        <div className="bg-white border border-orange-200 rounded-lg p-6">
          <pre className="whitespace-pre-wrap text-sm text-gray-800">{generateMarkdown()}</pre>
        </div>
      ) : (
        <>
          {/* Coverage Goals */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              커버리지 목표
            </h3>

            <div className="mb-4 p-4 bg-white rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">평균 커버리지</span>
                <span className="text-2xl font-bold text-orange-600">{avgCoverage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${avgCoverage}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Unit Tests */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Unit Test</label>
                  <span className="text-lg font-semibold text-orange-600">
                    {data.coverageGoals.unit}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={data.coverageGoals.unit}
                  onChange={(e) => updateCoverageGoal('unit', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
              </div>

              {/* Integration Tests */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Integration Test</label>
                  <span className="text-lg font-semibold text-orange-600">
                    {data.coverageGoals.integration}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={data.coverageGoals.integration}
                  onChange={(e) => updateCoverageGoal('integration', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
              </div>

              {/* E2E Tests */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">E2E Test</label>
                  <span className="text-lg font-semibold text-orange-600">
                    {data.coverageGoals.e2e}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={data.coverageGoals.e2e}
                  onChange={(e) => updateCoverageGoal('e2e', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
              </div>
            </div>
          </div>

          {/* Test Scenarios */}
          <div className="bg-white border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orange-900 flex items-center">
                <FileCode className="h-5 w-5 mr-2" />
                테스트 시나리오 (Given/When/Then)
              </h3>
              <button
                onClick={addTestScenario}
                className="flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                시나리오 추가
              </button>
            </div>

            <div className="space-y-4">
              {data.testScenarios.map((scenario) => (
                <div key={scenario.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <select
                        value={scenario.type}
                        onChange={(e) =>
                          updateTestScenario(scenario.id, {
                            type: e.target.value as 'unit' | 'integration' | 'e2e'
                          })
                        }
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="unit">Unit</option>
                        <option value="integration">Integration</option>
                        <option value="e2e">E2E</option>
                      </select>
                      <select
                        value={scenario.priority}
                        onChange={(e) =>
                          updateTestScenario(scenario.id, {
                            priority: e.target.value as 'high' | 'medium' | 'low'
                          })
                        }
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeTestScenario(scenario.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Given (전제조건)
                      </label>
                      <input
                        type="text"
                        value={scenario.given}
                        onChange={(e) => updateTestScenario(scenario.id, { given: e.target.value })}
                        placeholder="예: 사용자가 로그인되어 있을 때"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        When (행동)
                      </label>
                      <input
                        type="text"
                        value={scenario.when}
                        onChange={(e) => updateTestScenario(scenario.id, { when: e.target.value })}
                        placeholder="예: 프로필 페이지에 접근하면"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Then (예상 결과)
                      </label>
                      <input
                        type="text"
                        value={scenario.then}
                        onChange={(e) => updateTestScenario(scenario.id, { then: e.target.value })}
                        placeholder="예: 사용자 정보가 표시되어야 한다"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CI/CD Pipeline */}
          <div className="bg-white border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
              <Play className="h-5 w-5 mr-2" />
              CI/CD 파이프라인
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">플랫폼</label>
                <select
                  value={data.cicdPipeline.platform}
                  onChange={(e) =>
                    setData({
                      ...data,
                      cicdPipeline: {
                        ...data.cicdPipeline,
                        platform: e.target.value as Step12Data['cicdPipeline']['platform']
                      }
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="github-actions">GitHub Actions</option>
                  <option value="jenkins">Jenkins</option>
                  <option value="gitlab-ci">GitLab CI</option>
                  <option value="circleci">CircleCI</option>
                  <option value="none">없음</option>
                </select>
              </div>

              {data.cicdPipeline.platform !== 'none' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">트리거</label>
                    <div className="flex flex-wrap gap-2">
                      {(['push', 'pr', 'schedule'] as const).map((trigger) => (
                        <label key={trigger} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.cicdPipeline.triggers.includes(trigger)}
                            onChange={() => toggleTrigger(trigger)}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {trigger === 'push' ? 'Push' : trigger === 'pr' ? 'Pull Request' : 'Schedule'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Jobs</label>
                      <button
                        onClick={addJob}
                        className="flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Job 추가
                      </button>
                    </div>

                    <div className="space-y-3">
                      {data.cicdPipeline.jobs.map((job) => (
                        <div key={job.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <input
                              type="text"
                              value={job.name}
                              onChange={(e) => updateJob(job.id, { name: e.target.value })}
                              placeholder="Job 이름 (예: test)"
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm mr-2"
                            />
                            <button
                              onClick={() => removeJob(job.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-600">명령어</label>
                            {job.commands.map((cmd, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={cmd}
                                  onChange={(e) => updateJobCommand(job.id, idx, e.target.value)}
                                  placeholder="명령어 입력"
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <button
                                  onClick={() => removeJobCommand(job.id, idx)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addCommandToJob(job.id)}
                              className="flex items-center px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              명령어 추가
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Playwright Tests */}
          <div className="bg-white border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orange-900 flex items-center">
                <TestTube className="h-5 w-5 mr-2" />
                Playwright E2E 테스트
              </h3>
              <button
                onClick={addPlaywrightTest}
                className="flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                테스트 추가
              </button>
            </div>

            <div className="space-y-4">
              {data.playwrightTests.map((test) => (
                <div key={test.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={test.path}
                        onChange={(e) => updatePlaywrightTest(test.id, { path: e.target.value })}
                        placeholder="테스트 파일 경로 (예: tests/e2e/login.spec.ts)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={test.description}
                        onChange={(e) =>
                          updatePlaywrightTest(test.id, { description: e.target.value })
                        }
                        placeholder="테스트 설명"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <button
                      onClick={() => removePlaywrightTest(test.id)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">테스트 단계</label>
                    {test.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 w-6">{idx + 1}.</span>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => updateTestStep(test.id, idx, e.target.value)}
                          placeholder="단계 설명"
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => removeTestStep(test.id, idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addStepToTest(test.id)}
                      className="flex items-center px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      단계 추가
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-orange-200 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">추가 노트</label>
            <textarea
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              placeholder="테스트 전략에 대한 추가 설명이나 특이사항을 기록하세요..."
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
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? '처리 중...' : '다음 단계로'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Step12Testing
