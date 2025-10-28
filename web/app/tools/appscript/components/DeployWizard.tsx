'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2, AlertCircle, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface DeployWizardProps {
  generatedCode: any
  analysisResult: any
  onClose: () => void
}

type DeployStep = 'login' | 'project-info' | 'save' | 'create' | 'push' | 'complete'

export function DeployWizard({ generatedCode, analysisResult, onClose }: DeployWizardProps) {
  const [currentStep, setCurrentStep] = useState<DeployStep>('login')
  const [loginStatus, setLoginStatus] = useState<any>(null)
  const [projectName, setProjectName] = useState('')
  const [projectPath, setProjectPath] = useState('')
  const [scriptId, setScriptId] = useState('')
  const [scriptUrl, setScriptUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 1단계: 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/ssa/clasp/check-login')
      const data = await response.json()
      setLoginStatus(data)

      if (data.loggedIn) {
        setCurrentStep('project-info')
      } else {
        setError(data.instructions || 'clasp 로그인이 필요합니다')
      }
    } catch (err: any) {
      setError(err.message || '로그인 상태 확인 실패')
    } finally {
      setLoading(false)
    }
  }

  // clasp login 실행
  const handleClaspLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/ssa/clasp/login', {
        method: 'POST'
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'clasp login 실행 실패')
      }

      // 로그인 대기 중 - 자동으로 상태 확인 시작
      setError('브라우저에서 Google 계정으로 로그인 중입니다...')

      // 3초마다 로그인 상태 확인 (최대 10번 = 30초)
      let attempts = 0
      const maxAttempts = 10
      const pollInterval = setInterval(async () => {
        attempts++

        try {
          const checkResponse = await fetch('/api/ssa/clasp/check-login')
          const checkData = await checkResponse.json()

          if (checkData.loggedIn) {
            // 로그인 완료!
            clearInterval(pollInterval)
            setLoginStatus(checkData)
            setCurrentStep('project-info')
            setError('')
            setLoading(false)
          } else if (attempts >= maxAttempts) {
            // 타임아웃
            clearInterval(pollInterval)
            setError('로그인 대기 시간이 초과되었습니다. "다시 확인" 버튼을 눌러주세요.')
            setLoading(false)
          }
        } catch (err) {
          console.error('로그인 상태 확인 중 오류:', err)
        }
      }, 3000) // 3초마다 확인

    } catch (err: any) {
      setError(err.message || 'clasp login 실행 중 오류 발생')
      setLoading(false)
    }
  }

  // 2단계: 프로젝트 저장
  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      setError('프로젝트명을 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/ssa/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: generatedCode.files,
          projectName: projectName,
          spreadsheetId: analysisResult?.spreadsheetId,
          spreadsheetTitle: analysisResult?.spreadsheetTitle,
          analysis: analysisResult
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || '프로젝트 저장 실패')
      }

      setProjectPath(data.projectPath)
      setCurrentStep('create')
    } catch (err: any) {
      setError(err.message || '프로젝트 저장 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  // 3단계: clasp create
  const handleCreateProject = async () => {
    setLoading(true)
    setError('')
    try {
      const projectType = analysisResult?.spreadsheetId ? 'sheets' : 'standalone'
      const response = await fetch('/api/ssa/clasp/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath,
          projectName,
          projectType,
          parentId: projectType === 'sheets' ? analysisResult.spreadsheetId : undefined
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Apps Script 프로젝트 생성 실패')
      }

      setScriptId(data.scriptId)
      setCurrentStep('push')
    } catch (err: any) {
      setError(err.message || '프로젝트 생성 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  // 4단계: clasp push
  const handlePushCode = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/ssa/clasp/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || '코드 업로드 실패')
      }

      setCurrentStep('complete')
    } catch (err: any) {
      setError(err.message || '코드 업로드 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  // 5단계: 브라우저에서 열기
  const handleOpenInBrowser = async () => {
    try {
      const response = await fetch('/api/ssa/clasp/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath })
      })

      const data = await response.json()

      if (data.scriptUrl) {
        setScriptUrl(data.scriptUrl)
        window.open(data.scriptUrl, '_blank')
      }
    } catch (err: any) {
      console.error('브라우저 열기 실패:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🚀 Apps Script 자동 배포</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 진행 단계 */}
          <div className="space-y-4">
            {/* Step 1: 로그인 확인 */}
            <div className={`p-4 rounded-lg border-2 ${currentStep === 'login' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                {loginStatus?.loggedIn ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : currentStep === 'login' && loading ? (
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">1. clasp 로그인 확인</h3>
                  {loginStatus?.loggedIn ? (
                    <p className="text-sm text-green-700">✓ 로그인됨: {loginStatus.email}</p>
                  ) : loginStatus && !loginStatus.loggedIn ? (
                    <div>
                      <p className="text-sm text-red-700 mb-2">{loginStatus.message}</p>
                      {loginStatus.claspNotInstalled ? (
                        <pre className="text-xs bg-gray-800 text-white p-3 rounded mt-2 overflow-x-auto">
                          npm install -g @google/clasp
                        </pre>
                      ) : (
                        <div className="space-y-2 mt-3">
                          <Button
                            onClick={handleClaspLogin}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            clasp 로그인하기
                          </Button>
                          <p className="text-xs text-gray-500 text-center">
                            버튼 클릭 시 브라우저에서 Google 계정 로그인 페이지가 열립니다
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={checkLoginStatus}
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full"
                      >
                        다시 확인
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">확인 중...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: 프로젝트 정보 */}
            <div className={`p-4 rounded-lg border-2 ${currentStep === 'project-info' ? 'border-blue-500 bg-blue-50' : currentStep === 'login' ? 'border-gray-200 opacity-50' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                {currentStep === 'save' || currentStep === 'create' || currentStep === 'push' || currentStep === 'complete' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">2. 프로젝트 설정</h3>
                  {currentStep === 'project-info' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">프로젝트명</label>
                        <Input
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="예: budget-automation"
                          className="mb-1"
                        />
                        <p className="text-xs text-gray-500">영문, 숫자, 하이픈(-) 사용 가능</p>
                      </div>
                      <div className="text-sm">
                        <p><strong>타입:</strong> {analysisResult?.spreadsheetId ? '🔗 Sheets 바인딩' : '📄 독립형'}</p>
                        <p><strong>저장 위치:</strong> web/projects/{projectName || '...'}</p>
                      </div>
                      <Button onClick={handleSaveProject} disabled={loading || !projectName.trim()} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        프로젝트 저장하기
                      </Button>
                    </div>
                  ) : currentStep !== 'login' ? (
                    <p className="text-sm text-gray-600">✓ {projectName}</p>
                  ) : (
                    <p className="text-sm text-gray-400">대기 중...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Apps Script 생성 */}
            <div className={`p-4 rounded-lg border-2 ${currentStep === 'create' ? 'border-blue-500 bg-blue-50' : (currentStep === 'push' || currentStep === 'complete') ? 'border-gray-200' : 'border-gray-200 opacity-50'}`}>
              <div className="flex items-start gap-3">
                {currentStep === 'push' || currentStep === 'complete' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : currentStep === 'create' && loading ? (
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">3. Apps Script 프로젝트 생성</h3>
                  {currentStep === 'create' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Google Apps Script 프로젝트를 생성합니다</p>
                      <Button onClick={handleCreateProject} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Create Project
                      </Button>
                    </div>
                  ) : currentStep === 'push' || currentStep === 'complete' ? (
                    <p className="text-sm text-gray-600">✓ 프로젝트 생성 완료</p>
                  ) : (
                    <p className="text-sm text-gray-400">대기 중...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 4: 코드 업로드 */}
            <div className={`p-4 rounded-lg border-2 ${currentStep === 'push' ? 'border-blue-500 bg-blue-50' : currentStep === 'complete' ? 'border-gray-200' : 'border-gray-200 opacity-50'}`}>
              <div className="flex items-start gap-3">
                {currentStep === 'complete' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : currentStep === 'push' && loading ? (
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">4. 코드 업로드</h3>
                  {currentStep === 'push' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">모든 파일을 Apps Script에 업로드합니다</p>
                      <Button onClick={handlePushCode} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Push to Apps Script
                      </Button>
                    </div>
                  ) : currentStep === 'complete' ? (
                    <p className="text-sm text-gray-600">✓ 코드 업로드 완료</p>
                  ) : (
                    <p className="text-sm text-gray-400">대기 중...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 5: 완료 */}
            {currentStep === 'complete' && (
              <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">🎉 배포 완료!</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Apps Script 프로젝트가 성공적으로 배포되었습니다
                    </p>
                    <Button onClick={handleOpenInBrowser} className="w-full" variant="default">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      브라우저에서 열기
                    </Button>
                    {scriptUrl && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-xs text-gray-500 mb-1">Script URL:</p>
                        <a href={scriptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all">
                          {scriptUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 whitespace-pre-wrap">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 닫기 버튼 */}
          {currentStep === 'complete' && (
            <div className="mt-6 text-center">
              <Button onClick={onClose} variant="outline">
                닫기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
