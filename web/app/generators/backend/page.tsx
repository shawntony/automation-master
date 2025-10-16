'use client'

import { useState } from 'react'
import { Database } from 'lucide-react'

export default function BackendGeneratorPage() {
  const [formData, setFormData] = useState({
    codeFile: '',
    projectName: '',
    securityLevel: 'standard',
    realtime: true,
    performance: true
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)

    try {
      const response = await fetch('/api/generators/backend', {
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
          <Database className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold">백엔드 생성기</h1>
        </div>
        <p className="text-gray-600">
          V0/React 코드를 분석하여 Supabase 백엔드를 자동으로 생성합니다
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              프론트엔드 코드 파일
            </label>
            <input
              type="text"
              value={formData.codeFile}
              onChange={(e) => setFormData({ ...formData, codeFile: e.target.value })}
              placeholder="./app.tsx 또는 ./components/App.tsx"
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
              placeholder="my-backend"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              보안 레벨
            </label>
            <select
              value={formData.securityLevel}
              onChange={(e) => setFormData({ ...formData, securityLevel: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="basic">Basic - 기본 보안</option>
              <option value="standard">Standard - 표준 보안 (추천)</option>
              <option value="strict">Strict - 엄격한 보안</option>
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
                checked={formData.performance}
                onChange={(e) => setFormData({ ...formData, performance: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">성능 최적화 (인덱스, View)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={generating}
            className={`
              w-full py-3 rounded-lg font-semibold text-white
              ${generating ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}
            `}
          >
            {generating ? '생성 중...' : '🔧 백엔드 생성'}
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
