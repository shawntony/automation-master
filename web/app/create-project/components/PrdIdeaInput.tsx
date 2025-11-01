'use client'

import { useState } from 'react'
import { Lightbulb, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'

interface PrdIdeaInputProps {
  projectName: string
  projectType: string
  onIdeaSubmit: (idea: string) => void
}

export function PrdIdeaInput({ projectName, projectType, onIdeaSubmit }: PrdIdeaInputProps) {
  const [idea, setIdea] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrd, setGeneratedPrd] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  const handleGenerate = async () => {
    if (!idea || idea.trim().length < 20) {
      setError('아이디어를 최소 20자 이상 입력해주세요')
      return
    }

    setError('')
    setIsGenerating(true)

    try {
      // PRD 생성 (클라이언트 측에서 템플릿 사용)
      const { ideaToPrdMarkdown } = await import('@/lib/prd-templates')
      const prd = ideaToPrdMarkdown(projectName, idea)

      setGeneratedPrd(prd)
      onIdeaSubmit(idea)
    } catch (err: any) {
      setError('PRD 생성 중 오류가 발생했습니다: ' + err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const wordCount = idea.trim().split(/\s+/).filter(Boolean).length
  const charCount = idea.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <Lightbulb className="h-6 w-6 text-yellow-600 flex-shrink-0" />
        <div>
          <p className="font-medium text-yellow-900">아이디어를 입력하세요</p>
          <p className="text-sm text-yellow-700">
            간단한 아이디어나 요구사항을 작성하면 자동으로 PRD 문서를 생성합니다
          </p>
        </div>
      </div>

      {/* Idea Input */}
      {!generatedPrd ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 아이디어 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={`예시:
- 업무 자동화를 위한 데이터 수집 및 분석 도구
- 사용자가 Google Sheets에서 데이터를 입력하면 자동으로 처리
- 주기적으로 리포트를 생성하고 이메일로 전송
- 관리자 대시보드에서 진행상황 모니터링

자유롭게 아이디어를 작성해주세요...`}
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              disabled={isGenerating}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {charCount}자 / {wordCount}단어
              </p>
              <p className="text-xs text-gray-500">
                {charCount < 20 ? `최소 ${20 - charCount}자 더 입력하세요` : '✓ 입력 완료'}
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || charCount < 20}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-5 w-5 animate-spin" />
                PRD 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                AI로 PRD 자동 생성
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">💡 좋은 아이디어 작성 팁</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>문제 정의</strong>: 어떤 문제를 해결하고 싶은지 명확히 작성</li>
              <li>• <strong>주요 기능</strong>: 필요한 핵심 기능들을 나열</li>
              <li>• <strong>사용자</strong>: 누가 사용할 것인지 설명</li>
              <li>• <strong>목표</strong>: 프로젝트를 통해 얻고자 하는 결과</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Generated PRD Preview */
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900">PRD 생성 완료!</p>
              <p className="text-sm text-green-700">
                프로젝트 생성 시 자동으로 docs/PRD.md에 저장됩니다
              </p>
            </div>
            <button
              onClick={() => {
                setGeneratedPrd(null)
                setIdea('')
              }}
              className="px-4 py-2 text-sm bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
            >
              다시 작성
            </button>
          </div>

          {/* Original Idea */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">입력한 아이디어</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{idea}</p>
          </div>

          {/* Generated PRD Preview */}
          <div className="bg-white rounded-lg p-6 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700">생성된 PRD 미리보기</p>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                {projectType}
              </span>
            </div>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words font-mono overflow-auto max-h-96 bg-gray-50 p-4 rounded border border-gray-200">
              {generatedPrd}
            </pre>
          </div>

          {/* Next Steps */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm font-medium text-indigo-900 mb-2">📋 다음 단계</p>
            <p className="text-sm text-indigo-800">
              생성된 PRD는 프로젝트 생성 후 <code className="bg-white px-1.5 py-0.5 rounded text-xs">docs/PRD.md</code>에 저장됩니다.
              프로젝트 생성을 완료하려면 "다음" 버튼을 클릭하세요.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
