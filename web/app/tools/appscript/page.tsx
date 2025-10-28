'use client'

import { useState } from 'react'
import { Code2, Upload, Download, Play, FileSpreadsheet, Zap, CheckCircle2, AlertCircle, Loader2, Rocket } from 'lucide-react'
import { DeployWizard } from './components/DeployWizard'
import { StructureAnalysis } from './components/StructureAnalysis'

export default function AppsScriptGeneratorPage() {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('')
  const [projectType, setProjectType] = useState<'sheets' | 'standalone'>('sheets') // 기본값: 스프레드시트 귀속
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [generatedCode, setGeneratedCode] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('analyze')
  const [showDeployWizard, setShowDeployWizard] = useState(false)

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
        body: JSON.stringify({
          url: spreadsheetUrl,
          projectType // 프로젝트 타입 전달
        })
      })

      const data = await response.json()
      // 프로젝트 타입을 분석 결과에 포함
      setAnalysisResult({ ...data, projectType })
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

  const handleDownload = async () => {
    if (!generatedCode) return

    try {
      // ZIP 파일 생성을 위해 API 호출
      const response = await fetch('/api/ssa/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: generatedCode.files,
          spreadsheetTitle: analysisResult?.spreadsheetTitle || 'apps-script-project'
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'ZIP 파일 생성 실패')
      }

      // JSZip을 사용하여 클라이언트에서 ZIP 생성
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // 모든 파일을 ZIP에 추가
      Object.entries(data.files).forEach(([filename, content]) => {
        zip.file(filename, content as string)
      })

      // ZIP 파일 생성 및 다운로드
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.projectName}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('다운로드 실패:', error)
      alert('ZIP 파일 다운로드에 실패했습니다')
    }
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

                    {/* Project Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        프로젝트 타입 선택
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setProjectType('sheets')}
                          className={`p-4 border-2 rounded-lg text-left transition ${
                            projectType === 'sheets'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              projectType === 'sheets' ? 'border-blue-600' : 'border-gray-300'
                            }`}>
                              {projectType === 'sheets' && (
                                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 mb-1">
                                스프레드시트 귀속
                              </div>
                              <p className="text-sm text-gray-600">
                                선택한 스프레드시트에 직접 연결된 Apps Script 프로젝트를 생성합니다.
                                스프레드시트에서 바로 실행할 수 있습니다.
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setProjectType('standalone')}
                          className={`p-4 border-2 rounded-lg text-left transition ${
                            projectType === 'standalone'
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              projectType === 'standalone' ? 'border-blue-600' : 'border-gray-300'
                            }`}>
                              {projectType === 'standalone' && (
                                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 mb-1">
                                별도 파일
                              </div>
                              <p className="text-sm text-gray-600">
                                독립적인 Apps Script 프로젝트를 생성합니다.
                                여러 스프레드시트에서 재사용하거나 웹 앱으로 배포할 수 있습니다.
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        {projectType === 'sheets'
                          ? '💡 권장: 특정 스프레드시트 전용으로 사용하는 경우'
                          : '💡 권장: 여러 스프레드시트에서 사용하거나 웹 앱으로 배포하는 경우'
                        }
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

                {/* AI 구조 분석 (가장 먼저 표시) */}
                {analysisResult.structureAnalysis && (
                  <StructureAnalysis structureAnalysis={analysisResult.structureAnalysis} />
                )}

                {/* 샘플링 경고 메시지 */}
                {analysisResult.samplingInfo?.used && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-amber-900 mb-1">
                          샘플링 분석 수행됨
                        </div>
                        <p className="text-sm text-amber-800 mb-2">
                          {analysisResult.samplingInfo.reason}
                        </p>
                        <p className="text-xs text-amber-700">
                          분석 범위: 최대 {analysisResult.samplingInfo.limits.maxRows}행 × {analysisResult.samplingInfo.limits.maxColumns}열
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      <Download className="h-5 w-5" />
                      ZIP 다운로드
                    </button>
                    <button
                      onClick={() => setShowDeployWizard(true)}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Rocket className="h-5 w-5" />
                      자동 배포
                    </button>
                  </div>
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
                        ZIP 파일을 다운로드하여 clasp으로 배포하거나 수동으로 업로드하세요.
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
                  <h3 className="font-semibold text-blue-900 mb-3">📦 설치 가이드 (clasp 권장)</h3>
                  <div className="space-y-4 text-sm text-blue-800">
                    <div>
                      <div className="font-semibold mb-2">방법 1: clasp 사용 (권장)</div>
                      <ol className="space-y-2 ml-4 list-decimal">
                        <li>ZIP 파일 다운로드 및 압축 해제</li>
                        <li>터미널에서 프로젝트 폴더로 이동</li>
                        <li><code className="bg-blue-100 px-2 py-1 rounded">npm install -g @google/clasp</code></li>
                        <li><code className="bg-blue-100 px-2 py-1 rounded">clasp login</code> (처음 한 번만)</li>
                        <li><code className="bg-blue-100 px-2 py-1 rounded">clasp create --title "프로젝트명"</code></li>
                        <li><code className="bg-blue-100 px-2 py-1 rounded">clasp push</code> (코드 업로드)</li>
                        <li><code className="bg-blue-100 px-2 py-1 rounded">clasp open</code> (브라우저에서 열기)</li>
                      </ol>
                    </div>
                    <div className="border-t border-blue-300 pt-3">
                      <div className="font-semibold mb-2">방법 2: 수동 업로드</div>
                      <ol className="space-y-2 ml-4 list-decimal">
                        <li>Google Sheets에서 확장 프로그램 → Apps Script 열기</li>
                        <li>ZIP 파일의 각 .gs 파일을 Apps Script 에디터에 복사</li>
                        <li>프로젝트 설정에서 "appsscript.json 매니페스트 파일 표시" 체크</li>
                        <li>appsscript.json 내용 복사하여 붙여넣기</li>
                        <li>Config.gs에서 스프레드시트 ID 확인 및 설정</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deploy Wizard Modal */}
        {showDeployWizard && generatedCode && (
          <DeployWizard
            generatedCode={generatedCode}
            analysisResult={analysisResult}
            onClose={() => setShowDeployWizard(false)}
          />
        )}

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
