'use client'

import { useState, useEffect } from 'react'
import { FileSpreadsheet, Loader2, CheckCircle, XCircle, Play, Settings, Search, Database } from 'lucide-react'
import { getData, postData, ApiError } from '@/lib/utils/api'
import { useToast } from '@/components/ui/toast'

export default function MigrationToolsPage() {
  const { success, error: showError } = useToast()
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [envStatus, setEnvStatus] = useState<any>(null)

  // 환경 변수 상태 확인
  useEffect(() => {
    checkEnvironment()
  }, [])

  const checkEnvironment = async () => {
    try {
      const data = await getData('/api/tools/migration?action=check-env')
      setEnvStatus(data.environment)
    } catch (err) {
      setEnvStatus(null)
    }
  }

  const handleAnalysis = async () => {
    if (!spreadsheetId.trim()) {
      setError('Spreadsheet ID를 입력해주세요')
      return
    }

    setAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      const data = await postData('/api/tools/migration', {
        spreadsheetId: spreadsheetId.trim(),
        action: 'analyze'
      })

      if (data.success) {
        setAnalysis(data)
        success('분석 완료', '스프레드시트 구조 분석이 완료되었습니다.')
      } else {
        const errorMsg = data.error || '구조 분석 중 오류가 발생했습니다'
        setError(errorMsg)
        showError('분석 실패', errorMsg)
      }
    } catch (err: any) {
      const errorMsg = err instanceof ApiError ? err.message : '네트워크 오류가 발생했습니다'
      setError(errorMsg)
      showError('분석 실패', errorMsg)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleMigration = async () => {
    if (!spreadsheetId.trim()) {
      setError('Spreadsheet ID를 입력해주세요')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await postData('/api/tools/migration', {
        spreadsheetId: spreadsheetId.trim()
      })

      if (data.success) {
        setResult(data)
        success('마이그레이션 완료', '데이터가 Supabase로 성공적으로 마이그레이션되었습니다.')
      } else {
        const errorMsg = data.error || '마이그레이션 중 오류가 발생했습니다'
        setError(errorMsg)
        showError('마이그레이션 실패', errorMsg)
      }
    } catch (err: any) {
      const errorMsg = err instanceof ApiError ? err.message : '네트워크 오류가 발생했습니다'
      setError(errorMsg)
      showError('마이그레이션 실패', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileSpreadsheet className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold">Google Sheets 마이그레이션</h1>
        </div>
        <p className="text-gray-600">
          Google Sheets를 Supabase PostgreSQL로 자동 마이그레이션합니다
        </p>
      </div>

      {/* 환경 변수 상태 */}
      {envStatus && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold">환경 설정 상태</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {envStatus.googleCredentials ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Google Sheets API 인증</span>
            </div>
            <div className="flex items-center gap-2">
              {envStatus.supabaseConfig ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Supabase 연결 설정</span>
            </div>
          </div>
          {!envStatus.ready && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              ⚠️ 환경 변수를 먼저 설정해주세요
            </div>
          )}
        </div>
      )}

      {/* Step 1: 구조 분석 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4">Step 1: 구조 분석</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Spreadsheet ID
            </label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="예: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={analyzing || loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Sheets URL에서 /d/ 뒤의 ID 부분을 입력하세요
            </p>
          </div>

          <button
            onClick={handleAnalysis}
            disabled={analyzing || loading || !spreadsheetId.trim() || !envStatus?.ready}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                구조 분석 중...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                구조 분석
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* 분석 결과 표시 */}
      {analysis && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold">분석 결과</h3>
          </div>

          <div className="space-y-4">
            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-gray-600">총 레코드</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analysis.analysis.totalRecords.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-xs text-gray-600">예상 소요 시간</p>
                <p className="text-2xl font-bold text-green-600">
                  {analysis.analysis.estimatedTime}
                </p>
              </div>
            </div>

            {/* 생성될 테이블 */}
            <div>
              <h4 className="text-sm font-semibold mb-2">생성될 테이블</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(analysis.analysis.tablesToCreate).map(([table, count]) => (
                  <div key={table} className="bg-gray-50 p-2 rounded text-xs">
                    <p className="font-medium">{table}</p>
                    <p className="text-gray-600">{count as string}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 데이터 샘플 */}
            <div>
              <h4 className="text-sm font-semibold mb-2">데이터 샘플 (처음 5개)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-left">날짜</th>
                      <th className="px-2 py-1 text-left">상품</th>
                      <th className="px-2 py-1 text-left">카테고리</th>
                      <th className="px-2 py-1 text-right">수량</th>
                      <th className="px-2 py-1 text-right">단가</th>
                      <th className="px-2 py-1 text-right">매출액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.analysis.dataSample.map((row: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="px-2 py-1">{row.date}</td>
                        <td className="px-2 py-1">{row.product_name}</td>
                        <td className="px-2 py-1">{row.category}</td>
                        <td className="px-2 py-1 text-right">{row.quantity}</td>
                        <td className="px-2 py-1 text-right">{row.unit_price?.toLocaleString()}</td>
                        <td className="px-2 py-1 text-right">{row.sales_amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: 마이그레이션 실행 */}
      {analysis && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold mb-4">Step 2: 마이그레이션 실행</h3>

          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
              <p className="text-yellow-800">
                ⚠️ 위의 분석 결과를 확인하셨나요? 마이그레이션을 실행하면 Supabase에 테이블이 생성됩니다.
              </p>
            </div>

            <button
              onClick={handleMigration}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  마이그레이션 진행 중...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  마이그레이션 실행
                </>
              )}
            </button>

            {result && (
              <div className="p-3 bg-green-50 border border-green-200 rounded flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{result.message}</p>
                  {result.output && (
                    <pre className="mt-2 text-xs text-green-700 whitespace-pre-wrap overflow-x-auto max-h-40">
                      {result.output}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 마이그레이션 단계 안내 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold mb-4">마이그레이션 프로세스</h3>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
              1
            </span>
            <div>
              <h4 className="font-semibold text-sm">구조 분석</h4>
              <p className="text-xs text-gray-600">
                Google Sheets의 데이터 구조를 자동으로 분석
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
              2
            </span>
            <div>
              <h4 className="font-semibold text-sm">데이터 정규화</h4>
              <p className="text-xs text-gray-600">
                차원 테이블과 팩트 테이블로 정규화
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
              3
            </span>
            <div>
              <h4 className="font-semibold text-sm">Supabase 마이그레이션</h4>
              <p className="text-xs text-gray-600">
                PostgreSQL 테이블 생성 및 데이터 삽입
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* 자동 생성 항목 */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold mb-3">✨ 자동으로 생성되는 것들</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ 정규화된 테이블 (차원 + 팩트 테이블)</li>
          <li>✅ 외래키 관계</li>
          <li>✅ 성능 최적화 (인덱스, Materialized View)</li>
          <li>✅ 실시간 분석 뷰 (월별, 담당자별, 제품별)</li>
          <li>✅ 한국어 지원 (한글 시트명 → 영문 테이블명)</li>
        </ul>
      </div>
    </div>
  )
}
