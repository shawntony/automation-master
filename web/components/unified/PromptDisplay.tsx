'use client'

import { Copy, Check, RotateCcw } from 'lucide-react'
import { useState } from 'react'

interface PromptDisplayProps {
  prompt: string
  onRegenerate?: () => void
}

export function PromptDisplay({ prompt, onRegenerate }: PromptDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-indigo-900">
          🤖 Claude Code 프롬프트
        </h4>
        <div className="flex gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="px-3 py-1 text-xs bg-white border border-indigo-300 text-indigo-700 rounded hover:bg-indigo-50 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              재생성
            </button>
          )}
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                복사됨!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                복사
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prompt Content */}
      <div className="p-4 bg-gray-50 max-h-96 overflow-y-auto">
        <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words font-mono leading-relaxed">
          {prompt}
        </pre>
      </div>

      {/* Footer */}
      <div className="bg-indigo-50 px-4 py-2 border-t border-indigo-200">
        <p className="text-xs text-indigo-700">
          💡 이 프롬프트를 Claude Code에 붙여넣어 작업을 실행하세요
        </p>
      </div>
    </div>
  )
}
