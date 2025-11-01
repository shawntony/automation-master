'use client'

import { useState } from 'react'
import { History, Copy, Check, ChevronDown, ChevronRight, Sparkles, FileText } from 'lucide-react'

interface PromptHistoryProps {
  prompts: Record<number, string>
  stepTitles: Record<number, string>
}

export function PromptHistory({ prompts, stepTitles }: PromptHistoryProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const promptEntries = Object.entries(prompts)
    .map(([stepNum, prompt]) => ({ stepNum: Number(stepNum), prompt }))
    .sort((a, b) => a.stepNum - b.stepNum)

  const toggleExpand = (stepNum: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepNum)) {
        next.delete(stepNum)
      } else {
        next.add(stepNum)
      }
      return next
    })
  }

  const handleCopy = async (stepNum: number, prompt: string) => {
    await navigator.clipboard.writeText(prompt)
    setCopiedStep(stepNum)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const handleCopyAll = async () => {
    const allPrompts = promptEntries
      .map(({ stepNum, prompt }) => {
        const title = stepTitles[stepNum] || `Step ${stepNum}`
        return `# ${title}\n\n${prompt}\n\n---\n`
      })
      .join('\n')

    await navigator.clipboard.writeText(allPrompts)
    setCopiedStep(-1) // Use -1 to indicate "all copied"
    setTimeout(() => setCopiedStep(null), 2000)
  }

  if (promptEntries.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">프롬프트 기록이 없습니다</p>
        <p className="text-sm text-gray-500 mt-2">
          워크플로우 단계를 완료하면 생성된 프롬프트가 여기에 표시됩니다
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-indigo-900">프롬프트 히스토리</h3>
            <p className="text-sm text-indigo-700">
              {promptEntries.length}개의 프롬프트가 생성되었습니다
            </p>
          </div>
        </div>
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          {copiedStep === -1 ? (
            <>
              <Check className="h-4 w-4" />
              <span>복사됨!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>모두 복사</span>
            </>
          )}
        </button>
      </div>

      {/* Prompt List */}
      <div className="space-y-3">
        {promptEntries.map(({ stepNum, prompt }) => {
          const isExpanded = expandedSteps.has(stepNum)
          const title = stepTitles[stepNum] || `Step ${stepNum}`
          const isCopied = copiedStep === stepNum

          return (
            <div
              key={stepNum}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition-colors"
            >
              {/* Step Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <button
                  onClick={() => toggleExpand(stepNum)}
                  className="flex items-center gap-3 flex-1 text-left group"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  )}
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      Step {stepNum}: {title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {prompt.split('\n').length} 줄 · {prompt.length.toLocaleString()} 글자
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleCopy(stepNum, prompt)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>복사</span>
                    </>
                  )}
                </button>
              </div>

              {/* Expanded Prompt Content */}
              {isExpanded && (
                <div className="p-4 bg-gray-900 border-t border-gray-200">
                  <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap break-words overflow-x-auto">
                    <code>{prompt}</code>
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">💡 프롬프트 사용 팁</p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• 각 프롬프트를 클릭하면 전체 내용을 볼 수 있습니다</li>
              <li>• 복사 버튼으로 Claude Code에 바로 붙여넣을 수 있습니다</li>
              <li>• "모두 복사"로 전체 워크플로우 프롬프트를 한 번에 복사하세요</li>
              <li>• MCP 도구 참조와 에이전트 지시사항이 포함되어 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
