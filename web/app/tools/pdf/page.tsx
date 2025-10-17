'use client'

import { useState } from 'react'
import {
  FileText,
  Upload,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  FileSpreadsheet,
  Eye,
  Table
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { uploadFile, postData, ApiError } from '@/lib/utils/api'
import { useToast } from '@/components/ui/toast'
import { useDialog } from '@/components/ui/dialog'
import { ParseTemplate } from '@/lib/types/common'

export default function PDFToolPage() {
  // Toast 시스템
  const { success: showSuccess, error: showError, warning: showWarning } = useToast()

  // Dialog 시스템
  const { showDialog, DialogComponent } = useDialog()

  // 파일 및 상태
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // 추출 옵션
  const [parseMode, setParseMode] = useState<'simple' | 'keyvalue' | 'table'>('simple')
  const [separator, setSeparator] = useState(':')
  const [dataDirection, setDataDirection] = useState<'row' | 'column'>('column')

  // 표 파싱 옵션
  const [useFirstRowAsHeader, setUseFirstRowAsHeader] = useState(true)
  const [columnSeparator, setColumnSeparator] = useState('auto')
  const [parsedTableData, setParsedTableData] = useState<any[]>([])
  const [showTablePreview, setShowTablePreview] = useState(false)

  // Google Sheets 설정
  const [googleSheetUrl, setGoogleSheetUrl] = useState('')
  const [sheetName, setSheetName] = useState('PDF 데이터')
  const [savedSpreadsheetUrl, setSavedSpreadsheetUrl] = useState('')

  // 템플릿 관리 - useLocalStorage 훅 사용
  const [templates, setTemplates] = useLocalStorage<ParseTemplate[]>('pdf-parse-templates', [])
  const [templateName, setTemplateName] = useState('')
  const [showTemplateSave, setShowTemplateSave] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError('')
      setSuccess(false)
      setExtractedText('')
    } else {
      setError('PDF 파일만 업로드 가능합니다.')
      showError('파일 선택 오류', 'PDF 파일만 업로드 가능합니다.')
    }
  }

  const handleExtractText = async () => {
    if (!file) {
      setError('파일을 선택해주세요.')
      showWarning('파일 필요', '파일을 선택해주세요.')
      return
    }

    setIsProcessing(true)
    setError('')
    setSuccess(false)

    try {
      const result = await uploadFile('/api/tools/pdf/extract', file)

      if (result.success && result.data?.text) {
        setExtractedText(result.data.text)
        setSuccess(true)
        showSuccess('추출 완료', 'PDF 텍스트가 성공적으로 추출되었습니다.')
      } else {
        const errorMsg = result.error || 'PDF 처리 중 오류가 발생했습니다.'
        setError(errorMsg)
        showError('추출 실패', errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : '서버 연결 오류가 발생했습니다.'
      setError(errorMsg)
      showError('연결 오류', errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  // AI 자동 표 파싱
  const parseTableStructure = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length === 0) return []

    // 구분자 자동 감지
    const detectSeparator = (line: string) => {
      if (line.includes('\t')) return '\t'
      if (line.match(/\s{3,}/)) return /\s{3,}/ // 3칸 이상 공백
      if (line.match(/\s{2,}/)) return /\s{2,}/ // 2칸 이상 공백
      return /\s+/ // 일반 공백
    }

    const sep = columnSeparator === 'auto'
      ? detectSeparator(lines[0])
      : columnSeparator === 'tab' ? '\t'
      : columnSeparator === 'space' ? /\s+/
      : /\s{2,}/

    // 첫 번째 줄에서 헤더 추출
    const headers = lines[0].split(sep).map(h => h.trim()).filter(h => h)

    // 데이터 행 파싱
    const dataRows = []
    const startIndex = useFirstRowAsHeader ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]
      const values = line.split(sep).map(v => v.trim()).filter(v => v)

      if (values.length > 0) {
        const row: any = {}

        if (useFirstRowAsHeader) {
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
        } else {
          values.forEach((value, index) => {
            row[`컬럼${index + 1}`] = value
          })
        }

        dataRows.push(row)
      }
    }

    return dataRows
  }

  // 표 미리보기 생성
  const handleParseTable = () => {
    if (!extractedText) return

    const parsedData = parseTableStructure(extractedText)
    setParsedTableData(parsedData)
    setShowTablePreview(true)
    showSuccess('파싱 완료', `${parsedData.length}개 행이 파싱되었습니다.`)
  }

  const handleSaveToSheets = async () => {
    if (!extractedText) {
      setError('추출된 텍스트가 없습니다.')
      showWarning('데이터 없음', '추출된 텍스트가 없습니다.')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      let data: any[] = []

      if (parseMode === 'table') {
        // 표 모드
        data = parsedTableData.length > 0 ? parsedTableData : parseTableStructure(extractedText)
      } else if (parseMode === 'keyvalue') {
        // Key-Value 모드
        const lines = extractedText.split('\n').filter(line => line.trim())
        data = lines.map((line, index) => {
          const separatorIndex = line.indexOf(separator)
          if (separatorIndex > 0) {
            const key = line.substring(0, separatorIndex).trim()
            const value = line.substring(separatorIndex + 1).trim()

            if (dataDirection === 'row') {
              return { 제목: key, 내용: value }
            } else {
              return { [key]: value }
            }
          } else {
            if (dataDirection === 'row') {
              return { 제목: '내용', 내용: line.trim() }
            } else {
              return { [`항목_${index + 1}`]: line.trim() }
            }
          }
        })
      } else {
        // 단순 모드
        const lines = extractedText.split('\n').filter(line => line.trim())
        data = lines.slice(0, 100).map((line, index) => ({
          번호: index + 1,
          내용: line.trim(),
          추출일시: new Date().toLocaleString('ko-KR')
        }))
      }

      const result = await postData('/api/tools/pdf/save-to-sheets', {
        sheetUrl: googleSheetUrl,
        data: data,
        sheetName: sheetName
      })

      if (result.success) {
        setSuccess(true)
        const sheetUrl = result.data?.spreadsheetUrl || googleSheetUrl

        if (result.data?.spreadsheetUrl) {
          setGoogleSheetUrl(result.data.spreadsheetUrl)
          setSavedSpreadsheetUrl(result.data.spreadsheetUrl)
        } else {
          setSavedSpreadsheetUrl(sheetUrl)
        }

        // 저장 성공 알림 (마이그레이션 옵션 포함)
        showDialog({
          title: '✅ Google Sheets 저장 완료',
          description:
            `📊 스프레드시트 ID: ${result.data?.spreadsheetId}\n` +
            `📄 시트 이름: ${result.data?.sheetTitle}\n` +
            `📝 저장된 행 수: ${result.data?.rowsAdded}개\n\n` +
            `🔗 시트 URL:\n${sheetUrl}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `🔍 이 스프레드시트를 분석하고 Supabase로 마이그레이션 하시겠습니까?`,
          confirmText: '마이그레이션',
          cancelText: '나중에',
          onConfirm: () => {
            const migrationUrl = `/tools/migration?spreadsheetId=${result.data?.spreadsheetId}`
            window.location.href = migrationUrl
          }
        })

        showSuccess('저장 완료', `${result.data?.rowsAdded}개 행이 Google Sheets에 저장되었습니다.`)
      } else {
        const errorMsg = result.error || 'Google Sheets 저장 중 오류가 발생했습니다.'
        setError(errorMsg)
        showError('저장 실패', errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : '저장 중 오류가 발생했습니다.'
      setError(errorMsg)
      showError('저장 오류', errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  // 템플릿 저장
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      showWarning('템플릿 이름 필요', '템플릿 이름을 입력해주세요.')
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

  // 템플릿 불러오기
  const handleLoadTemplate = (template: ParseTemplate) => {
    setParseMode(template.parseMode)
    setSeparator(template.separator)
    setDataDirection(template.dataDirection)
    setUseFirstRowAsHeader(template.useFirstRowAsHeader)
    setColumnSeparator(template.columnSeparator)
    showSuccess('템플릿 불러오기 완료', `템플릿 "${template.name}"을(를) 불러왔습니다!`)
  }

  // 템플릿 삭제
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

  const handleReset = () => {
    setFile(null)
    setExtractedText('')
    setError('')
    setSuccess(false)
    setParsedTableData([])
    setShowTablePreview(false)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold">PDF 고급 추출 도구</h1>
        </div>
        <p className="text-gray-600">
          PDF에서 데이터를 추출하여 Google Sheets에 자동으로 저장하고 Supabase로 마이그레이션합니다
        </p>
      </div>

      {/* Step 1: PDF 파일 선택 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: PDF 파일 선택</CardTitle>
          <CardDescription>데이터를 추출할 PDF 파일을 업로드하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-file"
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('pdf-file')?.click()}
                disabled={isProcessing}
              >
                PDF 파일 선택
              </Button>

              {file && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <Badge variant="secondary">
                        {(file.size / 1024).toFixed(1)} KB
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleReset}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {file && !extractedText && (
              <Button
                onClick={handleExtractText}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    텍스트 추출 중...
                  </>
                ) : (
                  '텍스트 추출하기'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: 데이터 추출 옵션 */}
      {extractedText && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Step 2: 데이터 추출 옵션</span>
              <div className="flex gap-2">
                {templates.length > 0 && (
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    onChange={(e) => {
                      if (e.target.value) {
                        const template = templates.find(t => t.name === e.target.value)
                        if (template) handleLoadTemplate(template)
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">📋 템플릿 불러오기</option>
                    {templates.map((template) => (
                      <option key={template.name} value={template.name}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateSave(!showTemplateSave)}
                >
                  💾 현재 설정 저장
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Google Sheets 저장 시 데이터 구조를 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 템플릿 저장 UI */}
            {showTemplateSave && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-200">
                <div className="flex items-center gap-2">
                  <Label htmlFor="template-name" className="min-w-fit">템플릿 이름:</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="예: 회의록 표 형식"
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveTemplate} size="sm" className="flex-1">
                    ✅ 저장
                  </Button>
                  <Button
                    onClick={() => {
                      setShowTemplateSave(false)
                      setTemplateName('')
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    ❌ 취소
                  </Button>
                </div>
              </div>
            )}

            {/* 저장된 템플릿 목록 */}
            {templates.length > 0 && !showTemplateSave && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">📚 저장된 템플릿 ({templates.length}개):</p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((template) => (
                    <div
                      key={template.name}
                      className="flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm border"
                    >
                      <span>{template.name}</span>
                      <button
                        onClick={() => handleDeleteTemplate(template.name)}
                        className="ml-1 text-red-500 hover:text-red-700"
                        title="삭제"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 추출 모드 선택 */}
              <div>
                <Label htmlFor="parse-mode">추출 모드</Label>
                <select
                  id="parse-mode"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={parseMode}
                  onChange={(e) => setParseMode(e.target.value as 'simple' | 'keyvalue' | 'table')}
                >
                  <option value="simple">단순 텍스트</option>
                  <option value="keyvalue">Key-Value 구조</option>
                  <option value="table">표 구조 (AI 자동 인식)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {parseMode === 'simple'
                    ? '각 줄을 순서대로 저장합니다'
                    : parseMode === 'keyvalue'
                    ? '구분자 기준으로 제목과 내용을 분리합니다'
                    : 'AI가 자동으로 표 구조를 인식합니다'}
                </p>
              </div>

              {/* 구분자 설정 (Key-Value 모드일 때만) */}
              {parseMode === 'keyvalue' && (
                <div>
                  <Label htmlFor="separator">구분자</Label>
                  <Input
                    id="separator"
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    placeholder=":"
                    maxLength={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    제목과 내용을 구분하는 문자 (예: :, |, =)
                  </p>
                </div>
              )}

              {/* 데이터 방향 (Key-Value 모드일 때만) */}
              {parseMode === 'keyvalue' && (
                <div>
                  <Label htmlFor="direction">데이터 방향</Label>
                  <select
                    id="direction"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={dataDirection}
                    onChange={(e) => setDataDirection(e.target.value as 'row' | 'column')}
                  >
                    <option value="row">행 방향 (세로)</option>
                    <option value="column">열 방향 (가로)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {dataDirection === 'row'
                      ? '각 항목이 한 행으로 배치됩니다'
                      : '각 항목이 한 열로 배치됩니다'}
                  </p>
                </div>
              )}

              {/* 표 모드 옵션 */}
              {parseMode === 'table' && (
                <>
                  <div>
                    <Label htmlFor="column-separator">열 구분자</Label>
                    <select
                      id="column-separator"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      value={columnSeparator}
                      onChange={(e) => setColumnSeparator(e.target.value)}
                    >
                      <option value="auto">자동 감지 (AI)</option>
                      <option value="tab">탭 (Tab)</option>
                      <option value="space">공백 (Space)</option>
                      <option value="multi-space">여러 공백</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      열을 구분하는 방법을 선택하세요
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 mt-8">
                    <input
                      type="checkbox"
                      id="use-header"
                      checked={useFirstRowAsHeader}
                      onChange={(e) => setUseFirstRowAsHeader(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="use-header" className="cursor-pointer">
                      첫 번째 줄을 헤더로 사용
                    </Label>
                  </div>
                </>
              )}
            </div>

            {/* 표 모드 미리보기 버튼 */}
            {parseMode === 'table' && (
              <Button
                onClick={handleParseTable}
                variant="outline"
                className="w-full"
              >
                <Eye className="mr-2 h-4 w-4" />
                표 구조 미리보기
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: 추출된 텍스트 확인 */}
      {extractedText && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 3: 추출된 텍스트 확인 및 편집</CardTitle>
            <CardDescription>
              PDF에서 추출된 텍스트입니다. 필요시 수정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={10}
              className="font-mono text-sm"
              placeholder="추출된 텍스트가 여기에 표시됩니다..."
            />
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(extractedText)
                  showSuccess('복사 완료', '클립보드에 복사되었습니다!')
                }}
              >
                텍스트 복사
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([extractedText], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'extracted-text.txt'
                  a.click()
                  URL.revokeObjectURL(url)
                  showSuccess('다운로드 완료', '텍스트 파일이 다운로드되었습니다!')
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                TXT로 다운로드
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 표 미리보기 */}
      {parseMode === 'table' && showTablePreview && parsedTableData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span><Table className="inline mr-2 h-5 w-5" />표 구조 미리보기</span>
              <Badge variant="secondary">{parsedTableData.length}개 행</Badge>
            </CardTitle>
            <CardDescription>
              AI가 인식한 표 구조입니다. 잘못된 부분이 있으면 옵션을 조정하고 다시 미리보기하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    {Object.keys(parsedTableData[0] || {}).map((header, index) => (
                      <th key={index} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedTableData.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {Object.values(row).map((cell: any, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedTableData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  ...외 {parsedTableData.length - 10}개 행 (미리보기는 최대 10개 행만 표시)
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleParseTable}
                variant="outline"
                size="sm"
              >
                🔄 다시 파싱
              </Button>
              <Button
                onClick={() => {
                  setShowTablePreview(false)
                  setParsedTableData([])
                }}
                variant="outline"
                size="sm"
              >
                ❌ 미리보기 닫기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Google Sheets 저장 */}
      {extractedText && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle><FileSpreadsheet className="inline mr-2 h-5 w-5" />Step 4: Google Sheets 저장</CardTitle>
            <CardDescription>
              설정한 옵션에 따라 추출된 텍스트를 Google Sheets에 저장합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sheet-url">Google Sheets URL (선택사항)</Label>
                  <Input
                    id="sheet-url"
                    type="url"
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    placeholder="비워두면 자동 생성됩니다"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL을 비워두면 새 Google Sheets가 자동으로 생성됩니다
                  </p>
                </div>

                <div>
                  <Label htmlFor="sheet-name">시트 탭 이름</Label>
                  <Input
                    id="sheet-name"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="PDF 데이터"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    데이터가 저장될 시트 탭의 이름을 지정합니다
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSaveToSheets}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {googleSheetUrl ? 'Google Sheets에 저장' : '새 Google Sheets 생성 및 저장'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 알림 메시지 */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>작업이 성공적으로 완료되었습니다!</AlertDescription>
        </Alert>
      )}

      {/* 사용 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>💡 사용 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">✨ 주요 기능</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• 3가지 추출 모드 (단순/Key-Value/표)</li>
                <li>• AI 자동 표 인식 및 파싱</li>
                <li>• 실시간 미리보기 기능</li>
                <li>• 템플릿 저장 및 불러오기</li>
                <li>• Google Sheets 직접 연동</li>
                <li>• Supabase 마이그레이션 연동</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🚀 워크플로우</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Step 1: PDF 파일 업로드</li>
                <li>• Step 2: 추출 옵션 설정</li>
                <li>• Step 3: 텍스트 확인 및 편집</li>
                <li>• Step 4: Google Sheets 저장</li>
                <li>• Step 5: Supabase 마이그레이션 (선택)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Component */}
      <DialogComponent />
    </div>
  )
}
