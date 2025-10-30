'use client'

import { useState } from 'react'
import { X, ArrowLeftRight, Copy, Check } from 'lucide-react'
import type { CodeVersion } from '@/types/code-menu'

interface CodeVersionCompareProps {
  /** 비교할 두 버전 */
  version1: CodeVersion
  version2: CodeVersion
  /** 닫기 콜백 */
  onClose: () => void
}

export function CodeVersionCompare({ version1, version2, onClose }: CodeVersionCompareProps) {
  const [copied, setCopied] = useState<'v1' | 'v2' | null>(null)
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side')

  const handleCopy = async (code: string, version: 'v1' | 'v2') => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(version)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    return status === 'draft'
      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
      : 'bg-green-100 text-green-700 border-green-300'
  }

  const getStatusLabel = (status: string) => {
    return status === 'draft' ? '초안' : '완성'
  }

  // 간단한 라인 단위 diff 계산
  const calculateDiff = () => {
    const lines1 = version1.code.split('\n')
    const lines2 = version2.code.split('\n')
    const maxLines = Math.max(lines1.length, lines2.length)

    const diff: Array<{
      line1: string | null
      line2: string | null
      isDifferent: boolean
      lineNumber: number
    }> = []

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || null
      const line2 = lines2[i] || null
      diff.push({
        line1,
        line2,
        isDifferent: line1 !== line2,
        lineNumber: i + 1
      })
    }

    return diff
  }

  const diff = viewMode === 'unified' ? calculateDiff() : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              버전 비교
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'side-by-side'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                좌우 비교
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'unified'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                통합 보기
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 버전 정보 헤더 */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border-b">
            {[version1, version2].map((version, idx) => (
              <div key={version.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{version.versionName}</h3>
                  <span className={`px-2 py-0.5 text-xs border rounded ${getStatusColor(version.status)}`}>
                    {getStatusLabel(version.status)}
                  </span>
                  {version.isActive && (
                    <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded">
                      활성
                    </span>
                  )}
                </div>
                {version.description && (
                  <p className="text-sm text-gray-600">{version.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">생성: {formatDate(version.createdAt)}</p>
                  <button
                    onClick={() => handleCopy(version.code, idx === 0 ? 'v1' : 'v2')}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                  >
                    {copied === (idx === 0 ? 'v1' : 'v2') ? (
                      <>
                        <Check className="h-3 w-3" />
                        복사됨
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
            ))}
          </div>
        )}

        {/* 코드 비교 영역 */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'side-by-side' ? (
            // 좌우 비교 모드
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-gray-900 text-gray-100 rounded p-4 overflow-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  <code>{version1.code}</code>
                </pre>
              </div>
              <div className="bg-gray-900 text-gray-100 rounded p-4 overflow-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  <code>{version2.code}</code>
                </pre>
              </div>
            </div>
          ) : (
            // 통합 보기 모드 (diff 하이라이팅)
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span>{version1.versionName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>{version2.versionName}</span>
                </div>
              </div>
              <div className="bg-gray-900 text-gray-100 rounded overflow-auto">
                <table className="w-full text-sm font-mono">
                  <tbody>
                    {diff?.map((item, idx) => (
                      <tr
                        key={idx}
                        className={
                          item.isDifferent
                            ? 'bg-yellow-900/20'
                            : ''
                        }
                      >
                        <td className="text-gray-500 text-right px-2 py-0.5 select-none w-12">
                          {item.lineNumber}
                        </td>
                        <td className="px-2 py-0.5">
                          {item.line1 !== null && item.line2 !== null && item.isDifferent ? (
                            <div className="space-y-1">
                              <div className="bg-red-900/30 px-2 py-0.5 rounded">
                                <span className="text-red-400">- </span>
                                {item.line1}
                              </div>
                              <div className="bg-green-900/30 px-2 py-0.5 rounded">
                                <span className="text-green-400">+ </span>
                                {item.line2}
                              </div>
                            </div>
                          ) : item.line1 === null ? (
                            <div className="bg-green-900/30 px-2 py-0.5 rounded">
                              <span className="text-green-400">+ </span>
                              {item.line2}
                            </div>
                          ) : item.line2 === null ? (
                            <div className="bg-red-900/30 px-2 py-0.5 rounded">
                              <span className="text-red-400">- </span>
                              {item.line1}
                            </div>
                          ) : (
                            <div className="px-2 py-0.5">
                              <span className="text-gray-500">  </span>
                              {item.line1}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 통계 정보 */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-6">
              <span className="text-gray-600">
                {version1.versionName} 크기: <span className="font-mono">{version1.code.length}</span> 문자
              </span>
              <span className="text-gray-600">
                {version2.versionName} 크기: <span className="font-mono">{version2.code.length}</span> 문자
              </span>
              <span className="text-gray-600">
                차이: <span className="font-mono">{Math.abs(version1.code.length - version2.code.length)}</span> 문자
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
