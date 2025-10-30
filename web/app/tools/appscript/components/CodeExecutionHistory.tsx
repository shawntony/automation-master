'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, Star, Trash2, Download, Upload, Search, Filter, ChevronDown, ChevronUp, Play } from 'lucide-react'
import type { ExecutionHistoryRecord, ExecutionHistoryFilter, ExecutionHistorySortOptions, ExecutionHistoryStats } from '@/types/execution-history'
import {
  getFilteredExecutionHistory,
  deleteExecutionHistory,
  toggleExecutionHistoryFavorite,
  updateExecutionHistory,
  getExecutionHistoryStats,
  clearExecutionHistory,
  exportExecutionHistory,
  importExecutionHistory
} from '@/lib/execution-history-storage'

interface CodeExecutionHistoryProps {
  /** 메뉴 ID 필터 (옵션) */
  menuId?: string
  /** 버전 ID 필터 (옵션) */
  versionId?: string
  /** 실행 버튼 클릭 콜백 */
  onReExecute?: (code: string, versionName: string) => void
  /** 상세 보기 콜백 */
  onViewDetails?: (record: ExecutionHistoryRecord) => void
}

export function CodeExecutionHistory({ menuId, versionId, onReExecute, onViewDetails }: CodeExecutionHistoryProps) {
  const [history, setHistory] = useState<ExecutionHistoryRecord[]>([])
  const [stats, setStats] = useState<ExecutionHistoryStats | null>(null)
  const [filter, setFilter] = useState<ExecutionHistoryFilter>({
    menuId,
    versionId
  })
  const [sort, setSort] = useState<ExecutionHistorySortOptions>({
    sortBy: 'savedAt',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())

  // 히스토리 로드
  useEffect(() => {
    loadHistory()
  }, [filter, sort, menuId, versionId])

  const loadHistory = () => {
    const currentFilter = { ...filter, menuId, versionId, searchTerm: searchTerm || undefined }
    const loaded = getFilteredExecutionHistory(currentFilter, sort)
    setHistory(loaded)

    const currentStats = getExecutionHistoryStats(currentFilter)
    setStats(currentStats)
  }

  const handleSearch = () => {
    setFilter({ ...filter, searchTerm: searchTerm || undefined })
  }

  const handleToggleFavorite = (id: string) => {
    toggleExecutionHistoryFavorite(id)
    loadHistory()
  }

  const handleDelete = (id: string) => {
    if (confirm('이 실행 기록을 삭제하시겠습니까?')) {
      deleteExecutionHistory(id)
      loadHistory()
    }
  }

  const handleClearAll = () => {
    if (confirm('모든 실행 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearExecutionHistory()
      loadHistory()
    }
  }

  const handleExport = () => {
    const json = exportExecutionHistory(filter)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `execution-history-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      const imported = importExecutionHistory(result)

      if (imported.success) {
        alert(`${imported.count}개의 실행 기록을 가져왔습니다.`)
        loadHistory()
      } else {
        alert(`가져오기 실패: ${imported.error}`)
      }
    }
    reader.readAsText(file)
  }

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRecords)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRecords(newExpanded)
  }

  const handleUpdateNote = (id: string, note: string) => {
    updateExecutionHistory(id, { note })
    loadHistory()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="space-y-4">
      {/* 헤더 및 통계 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            실행 히스토리
          </h3>
          {stats && (
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>총 {stats.totalExecutions}회</span>
              <span className="text-green-600">성공 {stats.successfulExecutions}회</span>
              <span className="text-red-600">실패 {stats.failedExecutions}회</span>
              <span>평균 {formatDuration(stats.avgExecutionTime)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm"
          >
            <Filter className="h-4 w-4" />
            필터
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm"
            disabled={history.length === 0}
          >
            <Download className="h-4 w-4" />
            내보내기
          </button>
          <label className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm cursor-pointer">
            <Upload className="h-4 w-4" />
            가져오기
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors text-sm"
            disabled={history.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            전체 삭제
          </button>
        </div>
      </div>

      {/* 필터 및 검색 */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">결과</label>
              <select
                value={filter.success === undefined ? 'all' : filter.success ? 'success' : 'failure'}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    success: e.target.value === 'all' ? undefined : e.target.value === 'success'
                  })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="success">성공만</option>
                <option value="failure">실패만</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">정렬</label>
              <select
                value={sort.sortBy}
                onChange={(e) => setSort({ ...sort, sortBy: e.target.value as any })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="savedAt">실행 시간</option>
                <option value="executionTime">실행 시간</option>
                <option value="versionName">버전 이름</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
              <select
                value={sort.sortOrder}
                onChange={(e) => setSort({ ...sort, sortOrder: e.target.value as any })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="버전 이름, 메모로 검색..."
                className="w-full px-3 py-2 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            <label className="flex items-center gap-2 px-3 py-2 border rounded bg-white cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={filter.favoritesOnly || false}
                onChange={(e) => setFilter({ ...filter, favoritesOnly: e.target.checked })}
              />
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">즐겨찾기만</span>
            </label>
          </div>
        </div>
      )}

      {/* 히스토리 목록 */}
      <div className="space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>실행 기록이 없습니다.</p>
          </div>
        ) : (
          history.map((record) => (
            <div key={record.id} className="border rounded-lg bg-white overflow-hidden">
              {/* 헤더 */}
              <div className="p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {record.result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <h4 className="font-medium">{record.versionName}</h4>
                    {record.isFavorite && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{formatDate(record.savedAt)}</span>
                    <span>실행 시간: {formatDuration(record.result.executionTime)}</span>
                    {record.spreadsheetTitle && <span>{record.spreadsheetTitle}</span>}
                  </div>
                  {record.note && (
                    <p className="mt-2 text-sm text-gray-600 italic">{record.note}</p>
                  )}
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleFavorite(record.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title={record.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  >
                    <Star className={`h-4 w-4 ${record.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                  </button>
                  {onReExecute && (
                    <button
                      onClick={() => onReExecute(record.code, record.versionName)}
                      className="p-1 hover:bg-green-100 rounded"
                      title="다시 실행"
                    >
                      <Play className="h-4 w-4 text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleExpand(record.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="상세 보기"
                  >
                    {expandedRecords.has(record.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-1 hover:bg-red-100 rounded"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* 확장 영역 */}
              {expandedRecords.has(record.id) && (
                <div className="border-t bg-gray-50 p-4 space-y-3">
                  {/* 실행 로그 */}
                  {record.result.logs && record.result.logs.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">실행 로그</h5>
                      <div className="bg-gray-900 text-gray-100 rounded p-3 max-h-40 overflow-y-auto">
                        {record.result.logs.map((log, idx) => (
                          <div
                            key={idx}
                            className={`text-xs font-mono ${
                              log.level === 'error'
                                ? 'text-red-400'
                                : log.level === 'warning'
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            [{log.level.toUpperCase()}] {log.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 에러 정보 */}
                  {record.result.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <h5 className="font-medium text-sm text-red-700 mb-1">에러</h5>
                      <p className="text-sm text-red-600">{record.result.error.message}</p>
                      {record.result.error.line && (
                        <p className="text-xs text-red-500 mt-1">
                          Line {record.result.error.line}
                          {record.result.error.column && `, Column ${record.result.error.column}`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 메모 추가/수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                    <textarea
                      value={record.note || ''}
                      onChange={(e) => handleUpdateNote(record.id, e.target.value)}
                      placeholder="이 실행에 대한 메모를 입력하세요..."
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={2}
                    />
                  </div>

                  {/* 코드 미리보기 */}
                  <div>
                    <h5 className="font-medium text-sm mb-2">실행된 코드</h5>
                    <div className="bg-gray-900 text-gray-100 rounded p-3 max-h-60 overflow-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        <code>{record.code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
