'use client'

import { useState } from 'react'
import { Sparkles, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { postData, ApiError } from '@/lib/utils/api'
import { useToast } from '@/components/ui/toast'

export default function FullstackGeneratorPage() {
  const { success, error: showError } = useToast()
  const [formData, setFormData] = useState({
    schemaFile: '',
    projectName: '',
    autoSetup: true,
    deploy: false
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setResult(null)

    try {
      const data = await postData('/api/generators/fullstack', formData)
      setResult(data)
      if (data.success) {
        success('생성 완료', data.message || '풀스택 앱이 성공적으로 생성되었습니다.')
      } else {
        showError('생성 실패', data.error || '생성 중 오류가 발생했습니다.')
      }
    } catch (err: any) {
      const errorMsg = err instanceof ApiError ? err.message : '네트워크 오류가 발생했습니다'
      setResult({ success: false, error: errorMsg })
      showError('생성 실패', errorMsg)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">풀스택 생성기</h1>
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">5분 완성</span>
        </div>
        <p className="text-gray-600">
          Supabase 스키마에서 완전한 Next.js 14 프로덕션 애플리케이션을 5분 안에 생성합니다
        </p>
      </div>

      {/* 특징 */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <Zap className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-semibold mb-1">AI 기반 분석</h3>
          <p className="text-sm text-gray-600">스키마 패턴 인식으로 앱 타입 자동 감지</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <CheckCircle2 className="w-6 h-6 text-purple-600 mb-2" />
          <h3 className="font-semibold mb-1">완벽한 CRUD</h3>
          <p className="text-sm text-gray-600">TypeScript + React Query + 실시간</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <Sparkles className="w-6 h-6 text-green-600 mb-2" />
          <h3 className="font-semibold mb-1">배포 준비</h3>
          <p className="text-sm text-gray-600">Vercel 원클릭 배포 설정</p>
        </div>
      </div>

      {/* 폼 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Supabase 스키마 파일 경로
            </label>
            <input
              type="text"
              value={formData.schemaFile}
              onChange={(e) => setFormData({ ...formData, schemaFile: e.target.value })}
              placeholder="./schema.sql 또는 ./supabase/schema.sql"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              placeholder="my-awesome-app"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.autoSetup}
                onChange={(e) => setFormData({ ...formData, autoSetup: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">자동 설정 (npm install, git init)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.deploy}
                onChange={(e) => setFormData({ ...formData, deploy: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">배포 설정 포함 (Vercel)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={generating}
            className={`
              w-full py-3 rounded-lg font-semibold text-white
              ${generating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span>
                생성 중... (최대 5분)
              </span>
            ) : (
              '🚀 풀스택 앱 생성 시작'
            )}
          </button>
        </form>
      </div>

      {/* 결과 */}
      {result && (
        <div className={`mt-6 p-6 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          {result.success ? (
            <div>
              <div className="flex items-center gap-2 text-green-800 mb-3">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="font-semibold text-lg">생성 완료!</h3>
              </div>
              <p className="text-green-700 mb-4">{result.message}</p>
              {result.output && (
                <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-64">
                  {result.output}
                </pre>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-red-800 mb-3">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-semibold text-lg">생성 실패</h3>
              </div>
              <p className="text-red-700">{result.error}</p>
            </div>
          )}
        </div>
      )}

      {/* 사용 예시 */}
      <div className="mt-8 bg-gray-100 rounded-lg p-6">
        <h3 className="font-semibold mb-3">💡 생성되는 것들</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ Next.js 14 App Router 프로젝트</li>
          <li>✅ Supabase 연동 및 인증 시스템 (소셜 로그인, MFA)</li>
          <li>✅ 관리자 대시보드 (KPI 자동 감지 + 차트)</li>
          <li>✅ 완벽한 CRUD 시스템 (TypeScript + React Query)</li>
          <li>✅ 실시간 기능 (자동 업데이트)</li>
          <li>✅ 배포 준비 (Vercel 원클릭)</li>
        </ul>
      </div>
    </div>
  )
}
