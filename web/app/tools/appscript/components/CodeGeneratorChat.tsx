'use client'

import { useState } from 'react'
import { Send, Copy, Check, Loader2, Code2, Sparkles, Download, Play } from 'lucide-react'
import type {
  GeneratedCode,
  CodeGenerationResponse,
  CodeExecutionResponse,
  CodeExecutionResult
} from '@/types/roadmap'
import { CodeExecutionPreview } from './CodeExecutionPreview'
import { CodeLibraryStorage } from '@/lib/assistant/code-library-storage'

interface CodeGeneratorChatProps {
  /** 분석 결과 (컨텍스트 제공용) */
  analysisResult: any
  /** 관련 로드맵 단계 ID (선택사항) */
  relatedStepId?: string
  /** 코드 생성 완료 콜백 */
  onCodeGenerated?: (code: GeneratedCode) => void
}

/**
 * 자연어 기반 코드 생성 채팅 인터페이스
 *
 * 사용자가 한국어/영어로 원하는 작업을 설명하면
 * AI가 Apps Script 코드를 자동으로 생성해줍니다.
 */
export function CodeGeneratorChat({
  analysisResult,
  relatedStepId,
  onCodeGenerated
}: CodeGeneratorChatProps) {
  const [userInput, setUserInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null)
  const [explanation, setExplanation] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null)

  // 코드 생성 요청
  const handleGenerate = async () => {
    if (!userInput.trim()) return

    setIsGenerating(true)
    setError(null)
    setGeneratedCode(null)
    setExplanation('')

    try {
      const response = await fetch('/api/ssa/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRequest: userInput,
          analysisResult,
          relatedStepId
        })
      })

      const data: CodeGenerationResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || '코드 생성에 실패했습니다')
      }

      setGeneratedCode(data.code!)
      setExplanation(data.explanation || '')
      onCodeGenerated?.(data.code!)
    } catch (err: any) {
      console.error('코드 생성 오류:', err)
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // 코드 복사
  const handleCopy = async () => {
    if (!generatedCode) return

    try {
      await navigator.clipboard.writeText(generatedCode.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  // 코드 다운로드
  const handleDownload = () => {
    if (!generatedCode) return

    const blob = new Blob([generatedCode.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedCode.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gs`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 코드 실행 (시뮬레이션)
  const handleExecute = async () => {
    if (!generatedCode) return

    setIsExecuting(true)
    setError(null)

    try {
      const response = await fetch('/api/ssa/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: generatedCode.code,
          codeId: generatedCode.id,
          spreadsheetId: analysisResult?.spreadsheetId || 'demo',
          targetSheets: generatedCode.targetSheets,
          simulationMode: true
        })
      })

      const data: CodeExecutionResponse = await response.json()

      if (!data.success || !data.result) {
        throw new Error(data.error || '코드 실행에 실패했습니다')
      }

      setExecutionResult(data.result)
    } catch (err: any) {
      console.error('코드 실행 오류:', err)
      setError(err.message)
    } finally {
      setIsExecuting(false)
    }
  }

  // 실행 결과 저장 및 실제 적용
  const handleSaveExecution = () => {
    // TODO: 실제 스프레드시트에 적용하는 로직 구현
    alert('코드가 실제로 적용되었습니다!')
    setExecutionResult(null)
  }

  // 실행 결과 취소
  const handleCancelExecution = () => {
    setExecutionResult(null)
  }

  // 엔터키로 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  // 예시 프롬프트
  const examplePrompts = [
    '중복된 행을 제거해줘',
    '빈 행과 빈 열을 제거해줘',
    '모든 수식을 값으로 변환해줘',
    '데이터의 앞뒤 공백을 제거해줘',
    '데이터 형식을 검증해줘'
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">자연어 코드 생성기</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        원하는 작업을 한국어나 영어로 설명하면 Apps Script 코드를 자동으로 생성해드립니다.
      </p>

      {/* 예시 프롬프트 */}
      {!generatedCode && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">💡 예시:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setUserInput(prompt)}
                className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition border border-purple-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="mb-4">
        <div className="flex gap-2">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="예: '중복된 행을 제거해줘' 또는 'Remove duplicate rows'"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !userInput.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                생성
              </>
            )}
          </button>
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 실행 결과 미리보기 */}
      {executionResult && (
        <div className="mb-4">
          <CodeExecutionPreview
            result={executionResult}
            onSave={handleSaveExecution}
            onCancel={handleCancelExecution}
            onRerun={handleExecute}
          />
        </div>
      )}

      {/* 생성된 코드 */}
      {generatedCode && !executionResult && (
        <div className="space-y-4">
          {/* 코드 정보 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-purple-900">{generatedCode.title}</h4>
                <p className="text-sm text-purple-700 mt-1">{generatedCode.description}</p>
              </div>
              <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded font-semibold">
                {generatedCode.type.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {generatedCode.targetSheets.length > 0 && (
              <p className="text-xs text-purple-600 mt-2">
                대상 시트: {generatedCode.targetSheets.join(', ')}
              </p>
            )}
          </div>

          {/* 코드 블록 */}
          <div className="relative">
            <div className="absolute right-2 top-2 flex gap-2">
              <button
                onClick={handleCopy}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                title="복사"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                title="다운로드"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generatedCode.code}</code>
            </pre>
          </div>

          {/* AI 설명 */}
          {explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Code2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-semibold text-blue-900 mb-2">코드 설명</h5>
                  <div className="text-sm text-blue-800 whitespace-pre-line">{explanation}</div>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setUserInput('')
                setGeneratedCode(null)
                setExplanation('')
                setError(null)
                setExecutionResult(null)
              }}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              새 코드 생성
            </button>
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  실행 중...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  미리보기
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (generatedCode) {
                  const savedItem = CodeLibraryStorage.save(generatedCode)
                  alert(`코드가 라이브러리에 저장되었습니다!\n카테고리: ${savedItem.category}\n태그: ${savedItem.tags.join(', ')}`)
                }
              }}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              라이브러리에 저장
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
