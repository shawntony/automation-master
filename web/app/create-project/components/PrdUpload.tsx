'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'

interface PrdUploadProps {
  onFileSelect: (file: File, content: string) => void
  onClear: () => void
}

export function PrdUpload({ onFileSelect, onClear }: PrdUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>('')
  const [preview, setPreview] = useState<string>('')

  const validateFile = (file: File): boolean => {
    const validExtensions = ['.md', '.txt', '.markdown']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validExtensions.includes(ext)) {
      setError('지원하지 않는 파일 형식입니다. .md, .txt, .markdown 파일만 업로드 가능합니다.')
      return false
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.')
      return false
    }

    setError('')
    return true
  }

  const handleFile = useCallback(async (file: File) => {
    if (!validateFile(file)) {
      return
    }

    setSelectedFile(file)

    try {
      const content = await file.text()
      setPreview(content.substring(0, 500)) // 처음 500자만 미리보기
      onFileSelect(file, content)
    } catch (err) {
      setError('파일을 읽는 중 오류가 발생했습니다.')
      setSelectedFile(null)
    }
  }, [onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreview('')
    setError('')
    onClear()
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-indigo-400'
            }
          `}
        >
          <Upload
            className={`
              mx-auto h-12 w-12 mb-4
              ${isDragging ? 'text-indigo-600' : error ? 'text-red-500' : 'text-gray-400'}
            `}
          />
          <p className="text-lg font-medium text-gray-900 mb-2">
            PRD 파일을 드래그하여 업로드하세요
          </p>
          <p className="text-sm text-gray-600 mb-4">
            또는 클릭하여 파일을 선택하세요
          </p>

          <label className="inline-block">
            <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
              파일 선택
            </span>
            <input
              type="file"
              className="hidden"
              accept=".md,.txt,.markdown"
              onChange={handleFileInput}
            />
          </label>

          <p className="text-xs text-gray-500 mt-4">
            지원 형식: .md, .txt, .markdown (최대 5MB)
          </p>
        </div>
      ) : (
        /* Selected File Preview */
        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">파일 업로드 완료</p>
                <p className="text-sm text-gray-600">{selectedFile.name}</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
              title="파일 제거"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* File Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">파일 크기:</span>
              <span className="ml-2 font-medium">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </span>
            </div>
            <div>
              <span className="text-gray-600">타입:</span>
              <span className="ml-2 font-medium">{selectedFile.type || 'text/markdown'}</span>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">미리보기 (처음 500자)</p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words font-mono overflow-auto max-h-40">
                {preview}...
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">💡 PRD 파일 준비 팁</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 기존에 작성된 PRD.md 또는 요구사항 문서를 업로드하세요</li>
          <li>• Markdown 형식으로 작성된 문서를 권장합니다</li>
          <li>• 프로젝트 목적, 기능, 사용자 등이 포함되면 좋습니다</li>
        </ul>
      </div>
    </div>
  )
}
