'use client'

import { useState } from 'react'
import { Check, X, Eye, Play, Loader2, AlertTriangle, CheckCircle, Save } from 'lucide-react'
import type { CodeExecutionResult } from '@/types/roadmap'
import { addExecutionHistory } from '@/lib/execution-history-storage'

interface CodeExecutionPreviewProps {
  /** 실행 결과 */
  result: CodeExecutionResult
  /** 저장 버튼 클릭 핸들러 */
  onSave?: () => void
  /** 취소 버튼 클릭 핸들러 */
  onCancel?: () => void
  /** 재실행 버튼 클릭 핸들러 */
  onRerun?: () => void
  /** 코드 메뉴 ID (히스토리 저장용) */
  menuId?: string
  /** 버전 ID (히스토리 저장용) */
  versionId?: string
  /** 버전 이름 (히스토리 저장용) */
  versionName?: string
  /** 실행된 코드 (히스토리 저장용) */
  executedCode?: string
  /** 히스토리 저장 완료 콜백 */
  onHistorySaved?: () => void
}

/**
 * 코드 실행 결과 미리보기 컴포넌트
 *
 * 시뮬레이션된 실행 결과를 시각적으로 보여주고,
 * 사용자가 저장 또는 취소를 결정할 수 있습니다.
 */
export function CodeExecutionPreview({
  result,
  onSave,
  onCancel,
  onRerun,
  menuId,
  versionId,
  versionName,
  executedCode,
  onHistorySaved
}: CodeExecutionPreviewProps) {
  const [selectedSheet, setSelectedSheet] = useState(0)
  
  const handleSaveToHistory = () => {
    if (!menuId || !versionId || !versionName) {
      alert('메뉴 정보가 없어 히스토리에 저장할 수 없습니다.')
      return
    }

    try {
      addExecutionHistory(result, {
        menuId,
        versionId,
        versionName,
        code: executedCode || ''
      })
      alert('히스토리에 저장되었습니다!')
      onHistorySaved?.()
    } catch (error) {
      console.error('히스토리 저장 실패:', error)
      alert('히스토리 저장에 실패했습니다.')
    }
  }
  const currentChange = result.changes[selectedSheet]
  const totalAffected = result.changes.reduce((sum, c) => sum + c.rowsAffected, 0)
  const totalDeleted = result.changes.reduce((sum, c) => sum + (c.rowsDeleted || 0), 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">실행 시뮬레이션 완료</h3>
              <p className="text-sm text-green-50">
                실행 시간: {result.executionTimeMs}ms
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRerun}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              <Play className="h-4 w-4" />
              재실행
            </button>
          </div>
        </div>
      </div>

      {/* 요약 정보 */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">영향받은 시트</div>
            <div className="text-2xl font-bold text-gray-900">{result.changes.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">변경된 총 행 수</div>
            <div className="text-2xl font-bold text-blue-600">{totalAffected}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">삭제된 총 행 수</div>
            <div className="text-2xl font-bold text-red-600">{totalDeleted}</div>
          </div>
        </div>
      </div>

      {/* 시트 선택 탭 */}
      {result.changes.length > 1 && (
        <div className="px-6 pt-4 border-b">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {result.changes.map((change, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSheet(idx)}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                  selectedSheet === idx
                    ? 'bg-blue-50 text-blue-700 border-t-2 border-x-2 border-blue-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {change.sheetName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 변경 내용 미리보기 */}
      <div className="p-6">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {currentChange.sheetName} - 변경 내용
          </h4>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>변경: {currentChange.rowsAffected}행</span>
            {currentChange.rowsDeleted !== undefined && currentChange.rowsDeleted > 0 && (
              <span className="text-red-600">삭제: {currentChange.rowsDeleted}행</span>
            )}
            {currentChange.columnsDeleted !== undefined && currentChange.columnsDeleted > 0 && (
              <span className="text-red-600">삭제: {currentChange.columnsDeleted}열</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 변경 전 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <h5 className="font-semibold text-gray-900">변경 전</h5>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-red-50/30">
              <DataTable data={currentChange.before} />
            </div>
          </div>

          {/* 변경 후 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <h5 className="font-semibold text-gray-900">변경 후</h5>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-green-50/30">
              <DataTable data={currentChange.after} />
            </div>
          </div>
        </div>
      </div>

      {/* 실행 로그 */}
      <div className="px-6 pb-4">
        <details className="bg-gray-50 rounded-lg border border-gray-200">
          <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            실행 로그 보기 ({result.logs.length}개)
          </summary>
          <div className="px-4 py-3 max-h-48 overflow-y-auto">
            {result.logs.map((log, idx) => (
              <div
                key={idx}
                className="text-xs font-mono text-gray-600 py-1 border-b border-gray-200 last:border-0"
              >
                {log}
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* 경고 메시지 */}
      <div className="px-6 pb-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900 mb-1">시뮬레이션 결과입니다</p>
              <p className="text-sm text-yellow-800">
                실제 스프레드시트는 아직 변경되지 않았습니다.
                "저장 및 실행" 버튼을 클릭하면 실제로 변경이 적용됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <X className="h-5 w-5" />
            취소
          </button>
          {menuId && versionId && (
            <button
              onClick={handleSaveToHistory}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              히스토리에 저장
            </button>
          )}
          <button
            onClick={onSave}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Check className="h-5 w-5" />
            저장 및 실행
          </button>
      </div>
    </div>  
  )
}

/**
 * 데이터 테이블 컴포넌트
 */
function DataTable({ data }: { data: any[][] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        데이터가 없습니다
      </div>
    )
  }

  const maxRows = 10 // 최대 10행만 표시
  const displayData = data.slice(0, maxRows)
  const hasMore = data.length > maxRows

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            {data[0]?.map((cell, idx) => (
              <th
                key={idx}
                className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300 last:border-r-0"
              >
                {cell || <span className="text-gray-400">(빈 칸)</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.slice(1).map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-3 py-2 text-gray-800 border-r border-gray-200 last:border-r-0"
                >
                  {cell !== '' && cell !== null && cell !== undefined ? (
                    String(cell)
                  ) : (
                    <span className="text-gray-400 text-xs">(빈 칸)</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <div className="px-3 py-2 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-200">
          ... 그 외 {data.length - maxRows}행 더 있음
        </div>
      )}
    </div>
  )
}
