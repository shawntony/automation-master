'use client'

import { useState } from 'react'
import { Code2, Upload, Download, Play, FileSpreadsheet, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function AppsScriptGeneratorPage() {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [generatedCode, setGeneratedCode] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('analyze')

  const handleAnalyze = async () => {
    if (!spreadsheetUrl) {
      alert('스프레드시트 URL을 입력해주세요')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ssa/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: spreadsheetUrl })
      })

      const data = await response.json()
      setAnalysisResult(data)
      setActiveTab('result')
    } catch (error) {
      console.error('분석 실패:', error)
      alert('스프레드시트 분석에 실패했습니다')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerate = async () => {
    if (!analysisResult) {
      alert('먼저 스프레드시트를 분석해주세요')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ssa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: analysisResult })
      })

      const data = await response.json()
      setGeneratedCode(data)
      setActiveTab('code')
    } catch (error) {
      console.error('코드 생성 실패:', error)
      alert('Apps Script 코드 생성에 실패했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedCode) return

    // ZIP 파일로 다운로드
    const blob = new Blob([JSON.stringify(generatedCode, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'apps-script-project.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Code2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Apps Script 생성기</h1>
              <p className="text-gray-600">Google Sheets 수식을 Apps Script로 자동 변환</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analyze'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                1. 분석
              </button>
              <button
                onClick={() => setActiveTab('result')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'result'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                disabled={!analysisResult}
              >
                2. 분석 결과
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'code'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                disabled={!generatedCode}
              >
                3. 생성된 코드
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Analyze Tab */}
            {activeTab === 'analyze' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">스프레드시트 정보 입력</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Sheets URL
                      </label>
                      <input
                        type="text"
                        value={spreadsheetUrl}
                        onChange={(e) => setSpreadsheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        공유 설정이 '링크가 있는 모든 사용자'로 되어 있어야 합니다
                      </p>
                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !spreadsheetUrl}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          분석 중...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5" />
                          스프레드시트 분석 시작
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <FileSpreadsheet className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold mb-1">전체 수식 분석</h3>
                    <p className="text-sm text-gray-600">모든 시트의 수식을 자동으로 분석하고 분류합니다</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Zap className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-semibold mb-1">자동 변환</h3>
                    <p className="text-sm text-gray-600">수식을 최적화된 Apps Script 코드로 변환합니다</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Code2 className="h-8 w-8 text-purple-600 mb-2" />
                    <h3 className="font-semibold mb-1">모듈화 구조</h3>
                    <p className="text-sm text-gray-600">유지보수가 쉬운 모듈화된 코드를 생성합니다</p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Tab */}
            {activeTab === 'result' && analysisResult && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">분석 결과</h2>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Apps Script 코드 생성
                      </>
                    )}
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">총 시트 수</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.sheets?.length || 0}
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">총 수식 수</div>
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResult.totalFormulas || 0}
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">시트 간 참조</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.dependencies?.length || 0}
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">복잡도 점수</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {analysisResult.complexity || 0}
                    </div>
                  </div>
                </div>

                {/* Formula Types */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">수식 유형별 분류</h3>
                  <div className="space-y-2">
                    {Object.entries(analysisResult.formulaTypes || {}).map(([type, count]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">{type}</span>
                        </div>
                        <span className="text-sm text-gray-500">{count}개</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sheets List */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">시트 목록</h3>
                  <div className="space-y-3">
                    {analysisResult.sheets?.map((sheet: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{sheet.name}</div>
                          <div className="text-sm text-gray-500">
                            {sheet.formulas?.length || 0}개 수식 • {sheet.dataRanges?.length || 0}개 데이터 범위
                          </div>
                        </div>
                        <FileSpreadsheet className="h-5 w-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === 'code' && generatedCode && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">생성된 Apps Script 코드</h2>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Download className="h-5 w-5" />
                    프로젝트 다운로드
                  </button>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">
                        Apps Script 프로젝트가 성공적으로 생성되었습니다!
                      </h3>
                      <p className="text-sm text-green-700">
                        모듈화된 구조로 {Object.keys(generatedCode.files || {}).length}개의 파일이 생성되었습니다.
                        다운로드 후 Google Apps Script 에디터에 업로드하세요.
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Structure */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">생성된 파일 목록</h3>
                  <div className="space-y-2">
                    {Object.keys(generatedCode.files || {}).map((filename, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                        <Code2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-mono">{filename}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Setup Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">설치 가이드</h3>
                  <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex gap-2">
                      <span className="font-semibold">1.</span>
                      <span>Google Sheets에서 확장 프로그램 → Apps Script 열기</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">2.</span>
                      <span>다운로드한 파일들을 Apps Script 프로젝트에 추가</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">3.</span>
                      <span>Config.gs에서 스프레드시트 ID 등 설정 수정</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">4.</span>
                      <span>트리거 설정 (시간 기반/이벤트 기반)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">5.</span>
                      <span>메뉴에서 수동 실행으로 테스트</span>
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Apps Script 자동화 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">수식 자동 변환</h3>
                <p className="text-sm text-gray-600">VLOOKUP, SUMIF, IF 등 모든 수식을 Apps Script 함수로 변환</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">성능 최적화</h3>
                <p className="text-sm text-gray-600">배치 처리, 캐싱으로 실행 속도 50% 이상 향상</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">트리거 자동화</h3>
                <p className="text-sm text-gray-600">시간 기반, 이벤트 기반 자동 실행 설정</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">오류 처리 & 로깅</h3>
                <p className="text-sm text-gray-600">완벽한 에러 핸들링과 실행 로그 기록</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
