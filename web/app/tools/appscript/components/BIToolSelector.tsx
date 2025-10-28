'use client'

import { useState } from 'react'
import { X, BarChart3, Database, ChevronRight, ExternalLink } from 'lucide-react'
import { LookerStudioGuide } from './LookerStudioGuide'
import { MetabaseGuide } from './MetabaseGuide'

interface BIToolSelectorProps {
  spreadsheetId: string
  spreadsheetUrl: string
  onClose: () => void
}

type BITool = 'looker' | 'metabase' | null

export function BIToolSelector({ spreadsheetId, spreadsheetUrl, onClose }: BIToolSelectorProps) {
  const [selectedTool, setSelectedTool] = useState<BITool>(null)

  if (selectedTool === 'looker') {
    return (
      <LookerStudioGuide
        spreadsheetId={spreadsheetId}
        spreadsheetUrl={spreadsheetUrl}
        onBack={() => setSelectedTool(null)}
        onClose={onClose}
      />
    )
  }

  if (selectedTool === 'metabase') {
    return (
      <MetabaseGuide
        spreadsheetId={spreadsheetId}
        spreadsheetUrl={spreadsheetUrl}
        onBack={() => setSelectedTool(null)}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">📊 데이터 시각화 도구 선택</h2>
              <p className="text-purple-100">
                전처리된 데이터를 시각화할 BI 도구를 선택하세요
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-2">
                <strong>스프레드시트 정보:</strong>
              </p>
              <p className="text-sm text-blue-700 mb-1">
                <strong>ID:</strong> <code className="bg-white px-2 py-1 rounded">{spreadsheetId}</code>
              </p>
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                스프레드시트 열기
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Looker Studio 카드 */}
            <div
              onClick={() => setSelectedTool('looker')}
              className="border-2 border-gray-200 hover:border-purple-500 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 transition" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Looker Studio
              </h3>
              <p className="text-gray-600 mb-4">
                Google의 무료 BI 도구로 Google Sheets와 완벽하게 통합됩니다.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  무료 사용
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Google 계정으로 즉시 시작
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  드래그 앤 드롭 UI
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  실시간 데이터 연동
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                  단계별 가이드 보기 →
                </p>
              </div>
            </div>

            {/* Metabase 카드 */}
            <div
              onClick={() => setSelectedTool('metabase')}
              className="border-2 border-gray-200 hover:border-blue-500 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Metabase
              </h3>
              <p className="text-gray-600 mb-4">
                오픈소스 BI 도구로 강력한 쿼리와 대시보드 기능을 제공합니다.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  오픈소스 (무료)
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  SQL 쿼리 지원
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  고급 분석 기능
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  자체 호스팅 가능
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  단계별 가이드 보기 →
                </p>
              </div>
            </div>
          </div>

          {/* 비교표 */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 비교표
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      특징
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-purple-700">
                      Looker Studio
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-blue-700">
                      Metabase
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      가격
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      무료
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      무료 (오픈소스)
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      설치
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      불필요 (클라우드)
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      필요 (또는 클라우드)
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      Google Sheets 연동
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      완벽
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      좋음
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      학습 난이도
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      쉬움
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      보통
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      고급 기능
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      보통
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      강력
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                      추천 대상
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      빠른 시작, 간단한 대시보드
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                      복잡한 분석, SQL 사용자
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
