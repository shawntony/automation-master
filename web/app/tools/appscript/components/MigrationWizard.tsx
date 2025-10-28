'use client'

import { useState, useEffect } from 'react'
import {
  Play, Pause, RotateCcw, CheckCircle2, AlertCircle, Clock,
  FileSpreadsheet, ArrowRight, Settings, Download, X, Loader2, BarChart3
} from 'lucide-react'
import type {
  MigrationConfig,
  MigrationState,
  PreprocessOptions,
  MigrationUIMode,
  SheetMigrationState
} from '@/types/migration'
import { BIToolSelector } from './BIToolSelector'

interface MigrationWizardProps {
  analysisResult: any
  onComplete: (result: MigrationState) => void
  onCancel: () => void
}

export function MigrationWizard({ analysisResult, onComplete, onCancel }: MigrationWizardProps) {
  const [step, setStep] = useState<'config' | 'running' | 'complete'>('config')
  const [migrationConfig, setMigrationConfig] = useState<MigrationConfig>({
    sourceSpreadsheetId: analysisResult.spreadsheetId,
    sourceSpreadsheetUrl: '',
    uiMode: 'dashboard',
    errorHandling: ['partial-rollback', 'manual-retry'],
    preprocessOptions: {
      convertFormulasToValues: false,
      validateData: true,
      standardizeNaming: true,
      remapReferences: true,
      removeEmptyRows: true,
      removeEmptyColumns: true,
      removeDuplicates: false
    },
    autoResolveDependencies: true
  })

  const [migrationState, setMigrationState] = useState<MigrationState | null>(null)
  const [isCreatingSheet, setIsCreatingSheet] = useState(false)

  // 새 스프레드시트 생성
  const handleCreateTargetSheet = async () => {
    setIsCreatingSheet(true)
    try {
      const response = await fetch('/api/ssa/migrate/create-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${analysisResult.spreadsheetTitle} (Migration)`,
          sourceSpreadsheetId: analysisResult.spreadsheetId
        })
      })

      const data = await response.json()

      if (data.success) {
        setMigrationConfig({
          ...migrationConfig,
          targetSpreadsheetId: data.spreadsheetId,
          targetSpreadsheetUrl: data.spreadsheetUrl
        })
        alert(`새 스프레드시트가 생성되었습니다!\n\n${data.spreadsheetUrl}`)
      } else {
        alert(`생성 실패: ${data.error}`)
      }
    } catch (error) {
      console.error('스프레드시트 생성 오류:', error)
      alert('스프레드시트 생성 중 오류가 발생했습니다')
    } finally {
      setIsCreatingSheet(false)
    }
  }

  // 마이그레이션 시작
  const handleStartMigration = () => {
    if (!migrationConfig.targetSpreadsheetId) {
      alert('먼저 새 스프레드시트를 생성해주세요')
      return
    }

    // 마이그레이션 상태 초기화
    const initialState: MigrationState = {
      id: `migration-${Date.now()}`,
      config: migrationConfig,
      totalSheets: analysisResult.sheets.length,
      completedSheets: 0,
      failedSheets: 0,
      skippedSheets: 0,
      sheets: {},
      dependencyGraph: {
        nodes: analysisResult.sheets.map((s: any) => s.name),
        edges: analysisResult.dependencies.map((d: any) => ({
          from: d.to,  // 데이터 제공자
          to: d.from   // 데이터 사용자
        }))
      },
      migrationOrder: calculateMigrationOrder(analysisResult),
      checkpoints: [],
      status: 'running',
      startTime: Date.now(),
      errors: []
    }

    // 각 시트 상태 초기화
    initialState.migrationOrder.forEach(sheetName => {
      initialState.sheets[sheetName] = {
        sheetName,
        status: 'pending',
        progress: 0
      }
    })

    setMigrationState(initialState)
    setStep('running')

    // 실제 마이그레이션 시작
    runMigration(initialState)
  }

  // 의존성 기반 마이그레이션 순서 계산
  const calculateMigrationOrder = (analysis: any): string[] => {
    // 간단한 위상 정렬 (Topological Sort)
    const graph: Record<string, string[]> = {}
    const inDegree: Record<string, number> = {}

    // 그래프 초기화
    analysis.sheets.forEach((sheet: any) => {
      graph[sheet.name] = []
      inDegree[sheet.name] = 0
    })

    // 의존성 추가 (데이터 제공 방향)
    analysis.dependencies.forEach((dep: any) => {
      graph[dep.to] = graph[dep.to] || []
      graph[dep.to].push(dep.from)
      inDegree[dep.from] = (inDegree[dep.from] || 0) + 1
    })

    // 위상 정렬
    const queue: string[] = []
    const result: string[] = []

    // 진입 차수가 0인 노드들 (데이터 시트들)
    Object.keys(inDegree).forEach(node => {
      if (inDegree[node] === 0) {
        queue.push(node)
      }
    })

    while (queue.length > 0) {
      const current = queue.shift()!
      result.push(current)

      // 현재 노드에서 나가는 간선들 처리
      if (graph[current]) {
        graph[current].forEach(next => {
          inDegree[next]--
          if (inDegree[next] === 0) {
            queue.push(next)
          }
        })
      }
    }

    return result
  }

  // 실제 마이그레이션 실행
  const runMigration = async (state: MigrationState) => {
    for (const sheetName of state.migrationOrder) {
      // 시트 복사 시작
      updateSheetStatus(sheetName, 'copying', 0)

      try {
        const response = await fetch('/api/ssa/migrate/copy-sheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceSpreadsheetId: state.config.sourceSpreadsheetId,
            targetSpreadsheetId: state.config.targetSpreadsheetId,
            sheetName,
            preprocessOptions: state.config.preprocessOptions
          })
        })

        const data = await response.json()

        if (data.success) {
          updateSheetStatus(sheetName, 'completed', 100)
          state.completedSheets++
        } else {
          updateSheetStatus(sheetName, 'failed', 0, {
            message: data.error || '복사 실패',
            code: 'COPY_ERROR'
          })
          state.failedSheets++
        }
      } catch (error) {
        console.error(`시트 복사 오류 (${sheetName}):`, error)
        updateSheetStatus(sheetName, 'failed', 0, {
          message: error instanceof Error ? error.message : '알 수 없는 오류',
          code: 'NETWORK_ERROR'
        })
        state.failedSheets++
      }

      // 잠시 대기 (API rate limit 방지)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // 마이그레이션 완료
    setMigrationState(prev => prev ? {
      ...prev,
      status: 'completed',
      endTime: Date.now()
    } : null)
    setStep('complete')
  }

  // 시트 상태 업데이트
  const updateSheetStatus = (
    sheetName: string,
    status: SheetMigrationState['status'],
    progress: number,
    error?: { message: string, code: string }
  ) => {
    setMigrationState(prev => {
      if (!prev) return null

      return {
        ...prev,
        sheets: {
          ...prev.sheets,
          [sheetName]: {
            ...prev.sheets[sheetName],
            status,
            progress,
            error,
            ...(status === 'completed' && { endTime: Date.now() }),
            ...(status === 'copying' && { startTime: Date.now() })
          }
        }
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold">점진적 마이그레이션</h2>
              <p className="text-sm text-gray-500">새 스프레드시트에 시트별로 복사하며 변환</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'config' && (
            <ConfigStep
              config={migrationConfig}
              onConfigChange={setMigrationConfig}
              onCreateSheet={handleCreateTargetSheet}
              onStart={handleStartMigration}
              isCreatingSheet={isCreatingSheet}
              analysisResult={analysisResult}
            />
          )}

          {step === 'running' && migrationState && (
            <RunningStep migrationState={migrationState} />
          )}

          {step === 'complete' && migrationState && (
            <CompleteStep
              migrationState={migrationState}
              onComplete={() => onComplete(migrationState)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// 설정 단계 컴포넌트
function ConfigStep({
  config,
  onConfigChange,
  onCreateSheet,
  onStart,
  isCreatingSheet,
  analysisResult
}: any) {
  return (
    <div className="space-y-6">
      {/* 1. 새 스프레드시트 생성 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
          새 스프레드시트 생성
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          원본을 보존하고 새 스프레드시트에 점진적으로 복사합니다
        </p>
        {!config.targetSpreadsheetId ? (
          <button
            onClick={onCreateSheet}
            disabled={isCreatingSheet}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isCreatingSheet ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4" />
                새 스프레드시트 생성
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">생성 완료</span>
            <a
              href={config.targetSpreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm ml-2"
            >
              열어보기 →
            </a>
          </div>
        )}
      </div>

      {/* 2. 전처리 옵션 */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <span className="bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
          전처리 옵션
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries({
            validateData: '데이터 검증 및 정제',
            standardizeNaming: '명명 규칙 표준화',
            remapReferences: '참조 관계 재매핑',
            removeEmptyRows: '빈 행 제거',
            removeEmptyColumns: '빈 열 제거',
            convertFormulasToValues: '수식을 값으로 변환'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.preprocessOptions[key as keyof PreprocessOptions]}
                onChange={e => onConfigChange({
                  ...config,
                  preprocessOptions: {
                    ...config.preprocessOptions,
                    [key]: e.target.checked
                  }
                })}
                className="rounded"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. 변환 순서 미리보기 */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <span className="bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
          변환 순서 (의존성 기반)
        </h3>
        <div className="text-sm text-gray-600 mb-2">
          데이터 시트부터 순차적으로 복사됩니다:
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {analysisResult.sheets.map((sheet: any, index: number) => (
            <div key={sheet.name} className="flex items-center gap-2 text-sm py-1">
              <span className="text-gray-400">{index + 1}.</span>
              <span className="font-medium">{sheet.name}</span>
              <span className="text-xs text-gray-500">
                ({sheet.formulas.length}개 수식)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 시작 버튼 */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onStart}
          disabled={!config.targetSpreadsheetId}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          마이그레이션 시작
        </button>
      </div>
    </div>
  )
}

// 실행 중 단계 컴포넌트
function RunningStep({ migrationState }: { migrationState: MigrationState }) {
  const progress = (migrationState.completedSheets / migrationState.totalSheets) * 100

  return (
    <div className="space-y-4">
      {/* 전체 진행률 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">전체 진행률</h3>
          <span className="text-2xl font-bold text-purple-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            완료: {migrationState.completedSheets}
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-red-600" />
            실패: {migrationState.failedSheets}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-600" />
            대기: {migrationState.totalSheets - migrationState.completedSheets - migrationState.failedSheets}
          </span>
        </div>
      </div>

      {/* 시트별 상태 */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">시트별 진행 상황</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {migrationState.migrationOrder.map(sheetName => {
            const sheetState = migrationState.sheets[sheetName]
            return (
              <SheetStatusItem key={sheetName} sheet={sheetState} />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 시트 상태 아이템
function SheetStatusItem({ sheet }: { sheet: SheetMigrationState }) {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: '대기 중' },
    preprocessing: { icon: Settings, color: 'text-blue-500', bg: 'bg-blue-100', label: '전처리 중' },
    copying: { icon: Loader2, color: 'text-purple-500', bg: 'bg-purple-100', label: '복사 중', spin: true },
    transforming: { icon: Loader2, color: 'text-orange-500', bg: 'bg-orange-100', label: '변환 중', spin: true },
    validating: { icon: Loader2, color: 'text-yellow-500', bg: 'bg-yellow-100', label: '검증 중', spin: true },
    completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100', label: '완료' },
    failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100', label: '실패' },
    skipped: { icon: ArrowRight, color: 'text-gray-400', bg: 'bg-gray-50', label: '건너뜀' }
  }

  const config = statusConfig[sheet.status]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bg}`}>
      <Icon className={`h-5 w-5 ${config.color} ${config.spin ? 'animate-spin' : ''}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{sheet.sheetName}</span>
          <span className={`text-sm ${config.color}`}>{config.label}</span>
        </div>
        {sheet.status !== 'pending' && sheet.status !== 'completed' && sheet.status !== 'failed' && (
          <div className="w-full bg-white rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`}
              style={{ width: `${sheet.progress}%` }}
            />
          </div>
        )}
        {sheet.error && (
          <p className="text-xs text-red-600 mt-1">{sheet.error.message}</p>
        )}
      </div>
    </div>
  )
}

// 완료 단계 컴포넌트
function CompleteStep({ migrationState, onComplete }: any) {
  const [showBISelector, setShowBISelector] = useState(false)
  const duration = migrationState.endTime - migrationState.startTime
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)

  return (
    <>
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-2">마이그레이션 완료!</h3>
          <p className="text-gray-600">
            {migrationState.completedSheets}개 시트가 성공적으로 복사되었습니다
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{migrationState.completedSheets}</div>
            <div className="text-sm text-gray-600">완료</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{migrationState.failedSheets}</div>
            <div className="text-sm text-gray-600">실패</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{minutes}:{seconds.toString().padStart(2, '0')}</div>
            <div className="text-sm text-gray-600">소요 시간</div>
          </div>
        </div>

        {/* 다음 단계 안내 */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">
                📊 데이터 시각화 도구로 연결하기
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                전처리된 데이터를 Looker Studio 또는 Metabase에 연결하여<br />
                대시보드와 리포트를 만들어보세요.
              </p>
              <button
                onClick={() => setShowBISelector(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
              >
                <BarChart3 className="h-4 w-4" />
                데이터 시각화 도구 선택
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <a
            href={migrationState.config.targetSpreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            새 스프레드시트 열기
          </a>
          <button
            onClick={onComplete}
            className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>

      {/* BI 도구 선택 모달 */}
      {showBISelector && (
        <BIToolSelector
          spreadsheetId={migrationState.config.targetSpreadsheetId || ''}
          spreadsheetUrl={migrationState.config.targetSpreadsheetUrl || ''}
          onClose={() => setShowBISelector(false)}
        />
      )}
    </>
  )
}
