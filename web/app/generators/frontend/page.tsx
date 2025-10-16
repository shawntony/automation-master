'use client'

import { useState } from 'react'
import { Layout } from 'lucide-react'

export default function FrontendGeneratorPage() {
  const [formData, setFormData] = useState({
    schemaFile: '',
    projectName: '',
    uiLibrary: 'shadcn',
    realtime: true,
    autoSetup: true
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)

    try {
      const response = await fetch('/api/generators/frontend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Layout className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold">프론트엔드 생성기</h1>
        </div>
        <p className="text-gray-600">
          Supabase 스키마에서 React/Next.js 애플리케이션을 생성합니다
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Supabase 스키마 파일
            </label>
            <input
              type="text"
              value={formData.schemaFile}
              onChange={(e) => setFormData({ ...formData, schemaFile: e.target.value })}
              placeholder="./schema.sql"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              프로젝트 이름
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="my-frontend"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              UI 라이브러리
            </label>
            <select
              value={formData.uiLibrary}
              onChange={(e) => setFormData({ ...formData, uiLibrary: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="shadcn">shadcn/ui (추천)</option>
              <option value="mui">Material-UI</option>
              <option value="chakra">Chakra UI</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.realtime}
                onChange={(e) => setFormData({ ...formData, realtime: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">실시간 기능 포함</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.autoSetup}
                onChange={(e) => setFormData({ ...formData, autoSetup: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">자동 설정 (npm install)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={generating}
            className={`
              w-full py-3 rounded-lg font-semibold text-white
              ${generating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}
            `}
          >
            {generating ? '생성 중...' : '🎨 프론트엔드 생성'}
          </button>
        </form>
      </div>

      {result && (
        <div className={`mt-6 p-6 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.success ? result.message : result.error}
          </p>
        </div>
      )}
    </div>
  )
}
