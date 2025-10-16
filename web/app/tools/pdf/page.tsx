'use client'

import { useState, useRef } from 'react'
import { FileText, Upload, Eye, FileSpreadsheet, Search, Download, Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function PDFToolPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile)
        setError(null)
      } else {
        setError('PDF 파일만 업로드 가능합니다')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('PDF 파일만 업로드 가능합니다')
      }
    }
  }

  const handleAction = async (action: 'analyze' | 'preview' | 'detect') => {
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
      formData.append('action', action)

      const response = await fetch('/api/tools/pdf', {
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
          <FileText className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold">PDF 추출 도구</h1>
        </div>
        <p className="text-gray-600">
          PDF 파일에서 구조화된 데이터를 추출하고 분석합니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 파일 업로드 및 액션 */}
        <div className="space-y-6">
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
                accept="application/pdf"
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
                    PDF 파일을 드래그하거나 클릭하여 선택
                  </p>
                  <p className="text-xs text-gray-400">
                    최대 10MB
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

          {/* 액션 버튼들 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4">작업 선택</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleAction('preview')}
                disabled={!file || loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                미리보기
              </button>

              <button
                onClick={() => handleAction('analyze')}
                disabled={!file || loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                데이터 분석
              </button>

              <button
                onClick={() => handleAction('detect')}
                disabled={!file || loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                타입 감지
              </button>
            </div>
          </div>

          {/* 지원하는 PDF 타입 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">📋 지원하는 PDF 타입</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 매출 보고서 (sales_report)</li>
              <li>• 제품 카탈로그 (product_catalog)</li>
              <li>• 거래 내역 (transaction_log)</li>
            </ul>
          </div>
        </div>

        {/* 오른쪽: 결과 표시 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-4">결과</h3>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">PDF 처리 중...</p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">파일을 선택하고 작업을 실행하세요</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {/* 성공 메시지 */}
              <div className="p-3 bg-green-50 border border-green-200 rounded flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">처리 완료</p>
                  <p className="text-xs text-green-600">{result.filename}</p>
                </div>
              </div>

              {/* 결과 데이터 */}
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>

              {/* 다운로드 버튼 */}
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(result.data, null, 2)], {
                    type: 'application/json'
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${result.filename.replace('.pdf', '')}_result.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                결과 다운로드 (JSON)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
