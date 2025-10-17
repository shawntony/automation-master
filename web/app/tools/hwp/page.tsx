'use client'

import { useState, useRef, useEffect } from 'react'
import {
  FileType, Upload, Download, Loader2, CheckCircle, XCircle,
  Server, Activity, Table, Settings, Save, Trash2, FileSpreadsheet,
  AlertCircle, Eye, EyeOff, ChevronDown, ChevronUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { uploadFile, postData, getData, ApiError } from '@/lib/utils/api'
import { useToast } from '@/components/ui/toast'
import { useDialog } from '@/components/ui/dialog'
import { ParseTemplate } from '@/lib/types/common'

export default function HWPToolPage() {
  // Toast 시스템
  const { success: showSuccess, error: showError, warning: showWarning } = useToast()

  // Dialog 시스템
  const { showDialog, DialogComponent } = useDialog()

  // File and extraction state
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [extractedText, setExtractedText] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'running' | 'stopped'>('checking')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse mode and settings
  const [parseMode, setParseMode] = useState<'simple' | 'keyvalue' | 'table'>('simple')
  const [separator, setSeparator] = useState<string>(':')
  const [dataDirection, setDataDirection] = useState<'row' | 'column'>('row')
  const [useFirstRowAsHeader, setUseFirstRowAsHeader] = useState(true)
  const [columnSeparator, setColumnSeparator] = useState<string>('auto')

  // Table preview
  const [parsedTableData, setParsedTableData] = useState<any[]>([])
  const [showTablePreview, setShowTablePreview] = useState(false)

  // Google Sheets
  const [spreadsheetId, setSpreadsheetId] = useState<string>('')
  const [sheetName, setSheetName] = useState<string>('HWP_Data')
  const [saveToSheetsLoading, setSaveToSheetsLoading] = useState(false)

  // Template system - useLocalStorage 훅 사용
  const [templates, setTemplates] = useLocalStorage<ParseTemplate[]>('hwp-parse-templates', [])
  const [showTemplateSave, setShowTemplateSave] = useState(false)
  const [templateName, setTemplateName] = useState<string>('')

  // UI state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)

  // Check service status
  useEffect(() => {
    checkServiceStatus()
  }, [])

  const checkServiceStatus = async () => {
    try {
      const data = await getData('/api/tools/hwp?action=health')
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
        setCurrentStep(2)
      } else {
        const errorMsg = 'HWP/HWPX 파일만 업로드 가능합니다'
        setError(errorMsg)
        showError('파일 형식 오류', errorMsg)
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
        setCurrentStep(2)
      } else {
        const errorMsg = 'HWP/HWPX 파일만 업로드 가능합니다'
        setError(errorMsg)
        showError('파일 형식 오류', errorMsg)
      }
    }
  }

  const handleExtract = async () => {
    if (!file) {
      setError('파일을 먼저 선택해주세요')
      showWarning('파일 필요', '파일을 먼저 선택해주세요')
      return
    }

    setLoading(true)
    setError(null)
    setExtractedText('')

    try {
      const result = await uploadFile('/api/tools/hwp', file, { action: 'extract' })

      if (result.success && result.data?.text) {
        setExtractedText(result.data.text)
        setCurrentStep(3)
        showSuccess('추출 완료', 'HWP 텍스트가 성공적으로 추출되었습니다.')

        // Auto-parse if table mode
        if (parseMode === 'table') {
          const parsed = parseTableStructure(result.data.text)
          setParsedTableData(parsed)
          setShowTablePreview(true)
        }
      } else {
        const errorMsg = result.error || '처리 중 오류가 발생했습니다'
        setError(errorMsg)
        showError('추출 실패', errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : '네트워크 오류가 발생했습니다'
      setError(errorMsg)
      showError('연결 오류', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // AI Table Structure Parsing
  const parseTableStructure = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    if (lines.length === 0) return []

    // Auto-detect separator
    const detectSeparator = (line: string) => {
      if (line.includes('\t')) return '\t'
      if (line.match(/\s{3,}/)) return /\s{3,}/ // 3+ spaces
      if (line.match(/\s{2,}/)) return /\s{2,}/ // 2+ spaces
      return /\s+/ // single space
    }

    const sep = columnSeparator === 'auto'
      ? detectSeparator(lines[0])
      : columnSeparator === 'tab'
        ? '\t'
        : columnSeparator === 'space'
          ? /\s+/
          : columnSeparator === 'comma'
            ? ','
            : columnSeparator === 'pipe'
              ? '|'
              : /\s+/

    // Parse headers
    const headers = lines[0].split(sep).map(h => h.trim()).filter(h => h)
    const dataStartIndex = useFirstRowAsHeader ? 1 : 0

    // Parse data rows
    const data = lines.slice(dataStartIndex).map((line, index) => {
      const values = line.split(sep).map(v => v.trim()).filter(v => v)
      const row: any = {}

      if (dataDirection === 'row') {
        // Each line is a row
        headers.forEach((header, i) => {
          row[header] = values[i] || ''
        })
      } else {
        // Each line is a column (transpose)
        row['필드'] = headers[index] || `필드${index + 1}`
        values.forEach((value, i) => {
          row[`값${i + 1}`] = value
        })
      }

      return row
    })

    return data
  }

  const handleSaveToSheets = async () => {
    if (!extractedText) {
      showWarning('데이터 없음', '추출된 텍스트가 없습니다')
      return
    }

    setSaveToSheetsLoading(true)
    setError(null)

    try {
      let data: any[] = []

      // Parse data based on mode
      if (parseMode === 'table') {
        data = parsedTableData.length > 0 ? parsedTableData : parseTableStructure(extractedText)
      } else if (parseMode === 'keyvalue') {
        const lines = extractedText.split('\n').filter(line => line.trim().length > 0)
        data = lines.map((line, index) => {
          const separatorIndex = line.indexOf(separator)
          if (separatorIndex === -1) {
            return {
              번호: index + 1,
              내용: line.trim(),
              추출일시: new Date().toLocaleString('ko-KR')
            }
          }

          if (dataDirection === 'row') {
            const key = line.substring(0, separatorIndex).trim()
            const value = line.substring(separatorIndex + separator.length).trim()
            return {
              번호: index + 1,
              키: key,
              값: value,
              추출일시: new Date().toLocaleString('ko-KR')
            }
          } else {
            const key = line.substring(0, separatorIndex).trim()
            const value = line.substring(separatorIndex + separator.length).trim()
            return {
              [key]: value
            }
          }
        })
      } else {
        // Simple mode
        const lines = extractedText.split('\n').filter(line => line.trim().length > 0)
        data = lines.slice(0, 100).map((line, index) => ({
          번호: index + 1,
          내용: line.trim(),
          추출일시: new Date().toLocaleString('ko-KR')
        }))
      }

      // Save to Google Sheets
      const result = await postData('/api/tools/sheets', {
        action: spreadsheetId ? 'append' : 'create',
        spreadsheetId: spreadsheetId || undefined,
        sheetName: sheetName,
        data: data
      })

      if (result.success) {
        setCurrentStep(4)
        showSuccess('저장 완료', `${result.data?.rowCount}개 행이 Google Sheets에 저장되었습니다!`)

        // Ask if user wants to migrate to Supabase
        showDialog({
          title: '✅ Google Sheets 저장 완료',
          description:
            `📊 스프레드시트 ID: ${result.data?.spreadsheetId}\n` +
            `📄 시트명: ${result.data?.sheetName}\n` +
            `📝 저장된 행: ${result.data?.rowCount}개\n\n` +
            `🔍 이 스프레드시트를 분석하고 Supabase로 마이그레이션 하시겠습니까?`,
          confirmText: '마이그레이션',
          cancelText: '나중에',
          onConfirm: () => {
            const migrationUrl = `/tools/migration?spreadsheetId=${result.data?.spreadsheetId}`
            window.location.href = migrationUrl
          }
        })
      } else {
        const errorMsg = result.error || 'Google Sheets 저장 실패'
        setError(errorMsg)
        showError('저장 실패', errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : '네트워크 오류가 발생했습니다'
      setError(errorMsg)
      showError('저장 오류', errorMsg)
    } finally {
      setSaveToSheetsLoading(false)
    }
  }

  // Template management
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      showWarning('템플릿 이름 필요', '템플릿 이름을 입력해주세요')
      return
    }

    const newTemplate: ParseTemplate = {
      name: templateName,
      parseMode,
      separator,
      dataDirection,
      useFirstRowAsHeader,
      columnSeparator
    }

    const updatedTemplates = [...templates, newTemplate]
    setTemplates(updatedTemplates)

    setTemplateName('')
    setShowTemplateSave(false)
    showSuccess('템플릿 저장 완료', `템플릿 "${templateName}"이(가) 저장되었습니다!`)
  }

  const handleLoadTemplate = (template: ParseTemplate) => {
    setParseMode(template.parseMode)
    setSeparator(template.separator)
    setDataDirection(template.dataDirection)
    setUseFirstRowAsHeader(template.useFirstRowAsHeader)
    setColumnSeparator(template.columnSeparator)
    showSuccess('템플릿 불러오기 완료', `템플릿 "${template.name}"을(를) 불러왔습니다!`)
  }

  const handleDeleteTemplate = (templateName: string) => {
    showDialog({
      title: '템플릿 삭제',
      description: `템플릿 "${templateName}"을(를) 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
      onConfirm: () => {
        const updatedTemplates = templates.filter(t => t.name !== templateName)
        setTemplates(updatedTemplates)
        showSuccess('템플릿 삭제 완료', `템플릿 "${templateName}"이(가) 삭제되었습니다.`)
      }
    })
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileType className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">HWP 추출 도구 (고급)</h1>
          <Badge variant="secondary">3가지 추출 모드</Badge>
        </div>
        <p className="text-gray-600">
          HWP 파일에서 텍스트를 추출하고 Google Sheets로 바로 저장합니다
        </p>
      </div>

      {/* 진행 단계 */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { num: 1, label: '파일 업로드' },
            { num: 2, label: '추출 설정' },
            { num: 3, label: '텍스트 추출' },
            { num: 4, label: 'Sheets 저장' }
          ].map((step, index) => (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${currentStep >= step.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <p className="text-xs mt-1 text-gray-600">{step.label}</p>
              </div>
              {index < 3 && (
                <div
                  className={`
                    w-16 h-1 mx-2 -mt-6
                    ${currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 파일 업로드 및 설정 */}
        <div className="lg:col-span-1 space-y-6">
          {/* Python 서비스 상태 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Python 서비스 상태</span>
                <button
                  onClick={checkServiceStatus}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  새로고침
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    {serviceStatus === 'running' && '✅ 실행 중'}
                    {serviceStatus === 'stopped' && '❌ 중지됨'}
                    {serviceStatus === 'checking' && '🔄 확인 중...'}
                  </p>
                  <p className="text-xs text-gray-500">localhost:5001</p>
                </div>
              </div>
              {serviceStatus === 'stopped' && (
                <Alert className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    첫 실행 시 자동 시작 (약 5초)
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 파일 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Step 1: 파일 업로드</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
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

                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />

                {file ? (
                  <div>
                    <p className="text-sm text-green-600 font-medium mb-1">✅ 선택됨</p>
                    <p className="text-sm text-gray-600">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      HWP 파일 드래그 또는 클릭
                    </p>
                    <p className="text-xs text-gray-400">
                      최대 10MB (.hwp, .hwpx)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 추출 모드 선택 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Step 2: 추출 모드</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">모드 선택</Label>
                <select
                  value={parseMode}
                  onChange={(e) => setParseMode(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="simple">📄 간단 추출 (줄별)</option>
                  <option value="keyvalue">🔑 키-값 구조</option>
                  <option value="table">📊 AI 표 인식</option>
                </select>
              </div>

              {parseMode === 'keyvalue' && (
                <>
                  <div>
                    <Label className="text-xs">구분자</Label>
                    <Input
                      value={separator}
                      onChange={(e) => setSeparator(e.target.value)}
                      placeholder="예: : 또는 ="
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">데이터 방향</Label>
                    <select
                      value={dataDirection}
                      onChange={(e) => setDataDirection(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="row">→ 가로 (행 단위)</option>
                      <option value="column">↓ 세로 (열 단위)</option>
                    </select>
                  </div>
                </>
              )}

              {parseMode === 'table' && (
                <>
                  <div>
                    <Label className="text-xs">열 구분자</Label>
                    <select
                      value={columnSeparator}
                      onChange={(e) => setColumnSeparator(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="auto">🤖 자동 감지</option>
                      <option value="tab">Tab</option>
                      <option value="space">공백</option>
                      <option value="comma">쉼표 (,)</option>
                      <option value="pipe">파이프 (|)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useHeader"
                      checked={useFirstRowAsHeader}
                      onChange={(e) => setUseFirstRowAsHeader(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="useHeader" className="text-xs">
                      첫 줄을 헤더로 사용
                    </Label>
                  </div>
                </>
              )}

              {/* 고급 설정 */}
              <div>
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  <Settings className="w-3 h-3" />
                  고급 설정
                  {showAdvancedSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showAdvancedSettings && (
                  <div className="mt-3 space-y-3">
                    {/* 템플릿 저장/불러오기 */}
                    <div>
                      <button
                        onClick={() => setShowTemplateSave(!showTemplateSave)}
                        className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        템플릿으로 저장
                      </button>

                      {showTemplateSave && (
                        <div className="mt-2 bg-blue-50 p-3 rounded space-y-2">
                          <Input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="템플릿 이름"
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveTemplate}
                            className="w-full"
                          >
                            저장
                          </Button>
                        </div>
                      )}
                    </div>

                    {templates.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs font-medium mb-2">
                          📚 저장된 템플릿 ({templates.length}개)
                        </p>
                        <div className="space-y-1">
                          {templates.map((template) => (
                            <div
                              key={template.name}
                              className="flex items-center justify-between bg-white p-2 rounded text-xs"
                            >
                              <button
                                onClick={() => handleLoadTemplate(template)}
                                className="flex-1 text-left hover:text-blue-600"
                              >
                                {template.name}
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {template.parseMode}
                                </Badge>
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(template.name)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 텍스트 추출 버튼 */}
              <Button
                onClick={handleExtract}
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    추출 중...
                  </>
                ) : (
                  <>
                    <FileType className="w-4 h-4 mr-2" />
                    텍스트 추출
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 안내 */}
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-sm mb-2">📋 지원 형식</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• HWP 5.0 이상 (.hwp)</li>
                <li>• HWPX 문서 (.hwpx)</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 추출 결과 및 Google Sheets */}
        <div className="lg:col-span-2 space-y-6">
          {/* 추출 결과 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Step 3: 추출 결과</CardTitle>
            </CardHeader>
            <CardContent>
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

              {!loading && !extractedText && (
                <div className="text-center py-12 text-gray-400">
                  <FileType className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">파일을 선택하고 텍스트 추출을 실행하세요</p>
                </div>
              )}

              {!loading && extractedText && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ 텍스트 추출 완료 ({extractedText.length.toLocaleString()} 글자)
                    </AlertDescription>
                  </Alert>

                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
                    <pre className="text-xs whitespace-pre-wrap">
                      {extractedText}
                    </pre>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const blob = new Blob([extractedText], {
                        type: 'text/plain;charset=utf-8'
                      })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${file?.name.replace(/\.(hwp|hwpx)$/i, '')}_extracted.txt`
                      a.click()
                      URL.revokeObjectURL(url)
                      showSuccess('다운로드 완료', '텍스트 파일이 다운로드되었습니다!')
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    텍스트 다운로드
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 표 구조 미리보기 (table 모드일 때만) */}
          {parseMode === 'table' && showTablePreview && parsedTableData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>표 구조 미리보기</span>
                  <Badge variant="secondary">{parsedTableData.length}개 행</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full border-collapse border border-gray-300 text-xs">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        {Object.keys(parsedTableData[0] || {}).map((key) => (
                          <th key={key} className="border border-gray-300 px-2 py-1 text-left font-semibold">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedTableData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value: any, i) => (
                            <td key={i} className="border border-gray-300 px-2 py-1">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedTableData.length > 10 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      ... 외 {parsedTableData.length - 10}개 행
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Google Sheets 저장 */}
          {extractedText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Step 4: Google Sheets 저장</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="spreadsheetId" className="text-xs">
                      스프레드시트 ID (선택)
                    </Label>
                    <Input
                      id="spreadsheetId"
                      value={spreadsheetId}
                      onChange={(e) => setSpreadsheetId(e.target.value)}
                      placeholder="기존 시트 ID (없으면 새로 생성)"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sheetName" className="text-xs">
                      시트명
                    </Label>
                    <Input
                      id="sheetName"
                      value={sheetName}
                      onChange={(e) => setSheetName(e.target.value)}
                      placeholder="시트 이름"
                      className="text-sm"
                    />
                  </div>
                </div>

                <Alert>
                  <FileSpreadsheet className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {parseMode === 'simple' && '📄 줄별로 순차 저장 (최대 100줄)'}
                    {parseMode === 'keyvalue' && '🔑 키-값 구조로 저장'}
                    {parseMode === 'table' && '📊 표 형식으로 저장'}
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleSaveToSheets}
                  disabled={saveToSheetsLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {saveToSheetsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Google Sheets에 저장
                    </>
                  )}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* 사용 가이드 */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">💡 사용 가이드</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-gray-700">
              <div>
                <p className="font-semibold mb-1">📄 간단 추출</p>
                <p className="text-gray-600">줄 단위로 순차적으로 추출 (보고서, 문서)</p>
              </div>
              <div>
                <p className="font-semibold mb-1">🔑 키-값 구조</p>
                <p className="text-gray-600">이름:홍길동, 나이:30 형식의 데이터</p>
              </div>
              <div>
                <p className="font-semibold mb-1">📊 AI 표 인식</p>
                <p className="text-gray-600">공백/탭으로 구분된 표를 자동 인식</p>
              </div>
              <div className="pt-2 border-t">
                <p className="font-semibold mb-1">🔄 워크플로우</p>
                <p className="text-gray-600">
                  HWP → Google Sheets → Supabase 마이그레이션 자동 연결
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Component */}
      <DialogComponent />
    </div>
  )
}
