'use client'

import { useState } from 'react'
import { Code, Save, Edit2, Trash2, Plus, ArrowRight, FileCode } from 'lucide-react'

interface CodeEntry {
  id: string
  menuName: string
  feature: string
  description: string
  generatedCode: string
  usageType: 'temporary' | 'permanent'
  createdAt: string
}

interface EnhancedCodeGeneratorProps {
  spreadsheetId: string
  spreadsheetTitle: string
  onGenerateCode?: (description: string, options?: any) => Promise<string>
  onTransferToLibrary?: (entry: CodeEntry) => void
}

export function EnhancedCodeGenerator({
  spreadsheetId,
  spreadsheetTitle,
  onGenerateCode,
  onTransferToLibrary
}: EnhancedCodeGeneratorProps) {
  const [menuName, setMenuName] = useState('')
  const [feature, setFeature] = useState('')
  const [description, setDescription] = useState('')
  const [usageType, setUsageType] = useState<'temporary' | 'permanent'>('temporary')
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [entries, setEntries] = useState<CodeEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!menuName || !feature || !description) {
      alert('메뉴명, 기능, 설명을 모두 입력해주세요.')
      return
    }

    setIsGenerating(true)
    try {
      const fullDescription = `
메뉴명: ${menuName}
기능: ${feature}
상세 설명: ${description}
스프레드시트: ${spreadsheetTitle}
`
      const code = await onGenerateCode?.(fullDescription) || '// 코드 생성 중...'
      setGeneratedCode(code)
    } catch (error) {
      console.error('코드 생성 실패:', error)
      alert('코드 생성에 실패했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    if (!generatedCode) {
      alert('먼저 코드를 생성해주세요.')
      return
    }

    const newEntry: CodeEntry = {
      id: editingId || `entry_${Date.now()}`,
      menuName,
      feature,
      description,
      generatedCode,
      usageType,
      createdAt: new Date().toISOString()
    }

    if (editingId) {
      // 수정
      setEntries(prev => prev.map(entry => entry.id === editingId ? newEntry : entry))
      setEditingId(null)
    } else {
      // 새로 저장
      setEntries(prev => [...prev, newEntry])
    }

    // 저장 위치 선택에 따라 처리
    if (usageType === 'permanent') {
      localStorage.setItem(`code_entry_${newEntry.id}`, JSON.stringify(newEntry))
    } else {
      sessionStorage.setItem(`code_entry_${newEntry.id}`, JSON.stringify(newEntry))
    }

    // 폼 초기화
    setMenuName('')
    setFeature('')
    setDescription('')
    setGeneratedCode('')
    setUsageType('temporary')

    alert('저장되었습니다!')
  }

  const handleEdit = (entry: CodeEntry) => {
    setEditingId(entry.id)
    setMenuName(entry.menuName)
    setFeature(entry.feature)
    setDescription(entry.description)
    setGeneratedCode(entry.generatedCode)
    setUsageType(entry.usageType)
  }

  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setEntries(prev => prev.filter(entry => entry.id !== id))
    localStorage.removeItem(`code_entry_${id}`)
    sessionStorage.removeItem(`code_entry_${id}`)

    alert('삭제되었습니다.')
  }

  const handleTransferToLibrary = (entry: CodeEntry) => {
    onTransferToLibrary?.(entry)
    alert('코드 라이브러리로 이동되었습니다!')
  }

  // 메뉴명별 그룹화
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.menuName]) {
      acc[entry.menuName] = []
    }
    acc[entry.menuName].push(entry)
    return acc
  }, {} as Record<string, CodeEntry[]>)

  return (
    <div className="space-y-6">
      {/* 코드 생성 폼 */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code className="h-5 w-5" />
          {editingId ? '코드 수정' : '자연어 코드 생성'}
        </h3>

        <div className="space-y-4">
          {/* 메뉴명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메뉴명 *
            </label>
            <input
              type="text"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 데이터 정리"
            />
          </div>

          {/* 기능 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              기능 *
            </label>
            <input
              type="text"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 중복 데이터 제거 및 빈 행 삭제"
            />
          </div>

          {/* 자연어 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상세 설명 (자연어) *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="원하는 기능을 자세히 설명해주세요. 예: '시트1에서 A열 기준으로 중복된 행을 제거하고, 모든 시트에서 완전히 비어있는 행을 삭제해주세요.'"
            />
          </div>

          {/* 사용 방식 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용 방식 *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="temporary"
                  checked={usageType === 'temporary'}
                  onChange={(e) => setUsageType(e.target.value as 'temporary' | 'permanent')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">임시 사용 (세션 종료 시 삭제)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="permanent"
                  checked={usageType === 'permanent'}
                  onChange={(e) => setUsageType(e.target.value as 'temporary' | 'permanent')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">계속 사용 (영구 저장)</span>
              </label>
            </div>
          </div>

          {/* 생성/수정 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !menuName || !feature || !description}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? '생성 중...' : editingId ? '코드 재생성' : '코드 생성'}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null)
                  setMenuName('')
                  setFeature('')
                  setDescription('')
                  setGeneratedCode('')
                  setUsageType('temporary')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
            )}
          </div>

          {/* 생성된 코드 미리보기 */}
          {generatedCode && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">생성된 코드</h4>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  저장
                </button>
              </div>
              <pre className="bg-white border rounded p-3 text-sm overflow-x-auto">
                <code>{generatedCode}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 저장된 코드 목록 */}
      {Object.keys(groupedEntries).length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            저장된 코드 목록
          </h3>

          <div className="space-y-4">
            {Object.entries(groupedEntries).map(([menuName, items]) => (
              <div key={menuName} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                    {menuName}
                  </span>
                  <span className="text-sm text-gray-500">({items.length}개)</span>
                </h4>

                <div className="space-y-2">
                  {items.map((entry) => (
                    <div key={entry.id} className="bg-gray-50 rounded-lg p-3 border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{entry.feature}</div>
                          <div className="text-sm text-gray-600 mt-1">{entry.description}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              entry.usageType === 'permanent'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {entry.usageType === 'permanent' ? '영구' : '임시'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                            title="수정"
                          >
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                          <button
                            onClick={() => handleTransferToLibrary(entry)}
                            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                            title="라이브러리로 이동"
                          >
                            <ArrowRight className="h-4 w-4 text-purple-600" />
                          </button>
                        </div>
                      </div>

                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                          코드 보기
                        </summary>
                        <pre className="bg-white border rounded p-2 text-xs mt-2 overflow-x-auto">
                          <code>{entry.generatedCode}</code>
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      {entries.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 위 폼을 작성하고 '코드 생성' 버튼을 클릭하면 AI가 자동으로 Apps Script 코드를 생성합니다.
            생성된 코드는 '저장' 버튼을 눌러 메뉴별로 관리할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  )
}
