'use client'

import { useState, useRef, useEffect } from 'react'
import { FileType, Upload, Download, Loader2, CheckCircle, XCircle, Server, Activity } from 'lucide-react'

export default function HWPToolPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'running' | 'stopped'>('checking')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 서비스 상태 확인
  useEffect(() => {
    checkServiceStatus()
  }, [])

  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/tools/hwp?action=health')
      const data = await response.json()
      setServiceStatus(data.serviceRunning ? 'running' : 'stopped')
    } catch (err) {
      setServiceStatus('stopped')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const fileName = droppedFile.name.toLowerCase()
      if (fileName.endsWith('.hwp') || fileName.endsWith('.hwpx')) {
        setFile(droppedFile)
        setError(null)
      } else {
        setError('HWP/HWPX 파일만 업로드 가능합니다')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const fileName = selectedFile.name.toLowerCase()
      if (fileName.endsWith('.hwp') || fileName.endsWith('.hwpx')) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('HWP/HWPX 파일만 업로드 가능합니다')
      }
    }
  }

  const handleExtract = async () => {
    if (!file) {
      setError('파일을 먼저 선택해주세요')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('action', 'extract')

      const response = await fetch('/api/tools/hwp', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || '처리 중 오류가 발생했습니다')
      }
    } catch (err: any) {
      setError(err.message || '네트워크 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileType className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">HWP 추출 도구</h1>
        </div>
        <p className="text-gray-600">
          HWP 파일에서 텍스트를 추출합니다 (Python 서비스 활용)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 파일 업로드 및 서비스 상태 */}
        <div className="space-y-6">
          {/* 서비스 상태 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Python 서비스 상태</h3>
              <button
                onClick={checkServiceStatus}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                새로고침
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`
                  w-3 h-3 rounded-full
                  ${serviceStatus === 'running' ? 'bg-green-500 animate-pulse' : ''}
                  ${serviceStatus === 'stopped' ? 'bg-red-500' : ''}
                  ${serviceStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : ''}
                `}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {serviceStatus === 'running' && '✅ 서비스 실행 중'}
                  {serviceStatus === 'stopped' && '❌ 서비스 중지됨'}
                  {serviceStatus === 'checking' && '🔄 상태 확인 중...'}
                </p>
                <p className="text-xs text-gray-500">http://localhost:5001</p>
              </div>
              {serviceStatus === 'running' && (
                <Activity className="w-5 h-5 text-green-600" />
              )}
              {serviceStatus === 'stopped' && (
                <Server className="w-5 h-5 text-red-600" />
              )}
            </div>

            {serviceStatus === 'stopped' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="text-yellow-800">
                  ℹ️ 첫 실행 시 Python 서비스가 자동으로 시작됩니다 (약 5초 소요)
                </p>
              </div>
            )}
          </div>

          {/* 파일 업로드 영역 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4">파일 업로드</h3>

            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${dragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".hwp,.hwpx"
                onChange={handleFileChange}
                className="hidden"
              />

              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

              {file ? (
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">✅ 파일 선택됨</p>
                  <p className="text-sm text-gray-600">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    HWP 파일을 드래그하거나 클릭하여 선택
                  </p>
                  <p className="text-xs text-gray-400">
                    최대 10MB (.hwp, .hwpx)
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* 텍스트 추출 버튼 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4">작업</h3>
            <button
              onClick={handleExtract}
              disabled={!file || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileType className="w-5 h-5" />}
              텍스트 추출
            </button>
          </div>

          {/* 안내 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">📋 지원 형식</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• HWP 5.0 이상 (.hwp)</li>
              <li>• HWPX 문서 (.hwpx)</li>
            </ul>
          </div>
        </div>

        {/* 오른쪽: 결과 표시 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-4">추출 결과</h3>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">HWP 처리 중...</p>
                <p className="text-xs text-gray-400 mt-1">
                  (첫 실행 시 Python 서비스 시작으로 시간이 더 걸릴 수 있습니다)
                </p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="text-center py-12 text-gray-400">
              <FileType className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">파일을 선택하고 텍스트 추출을 실행하세요</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {/* 성공 메시지 */}
              <div className="p-3 bg-green-50 border border-green-200 rounded flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">추출 완료</p>
                  <p className="text-xs text-green-600">{result.filename}</p>
                  {result.data?.sections && (
                    <p className="text-xs text-green-600 mt-1">
                      {result.data.sections}개 섹션
                    </p>
                  )}
                </div>
              </div>

              {/* 추출된 텍스트 */}
              {result.data?.text && (
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                  <pre className="text-sm whitespace-pre-wrap">
                    {result.data.text}
                  </pre>
                </div>
              )}

              {/* 다운로드 버튼 */}
              <button
                onClick={() => {
                  const blob = new Blob([result.data?.text || ''], {
                    type: 'text/plain;charset=utf-8'
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${result.filename.replace(/\.(hwp|hwpx)$/i, '')}_extracted.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                텍스트 다운로드
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
