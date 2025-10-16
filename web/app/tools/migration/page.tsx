'use client'

import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'

export default function MigrationToolsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileSpreadsheet className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold">Google Sheets 마이그레이션</h1>
        </div>
        <p className="text-gray-600">
          Google Sheets를 Supabase PostgreSQL로 자동 마이그레이션합니다
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4">마이그레이션 단계</h3>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
              1
            </span>
            <div>
              <h4 className="font-semibold">환경변수 설정</h4>
              <p className="text-sm text-gray-600">
                Google Sheets API 및 Supabase 연결 정보 설정
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
              2
            </span>
            <div>
              <h4 className="font-semibold">CLI에서 실행</h4>
              <code className="block mt-2 bg-gray-100 p-3 rounded text-sm">
                npm run ssa:migrate
              </code>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
              3
            </span>
            <div>
              <h4 className="font-semibold">자동 처리</h4>
              <p className="text-sm text-gray-600">
                구조 분석 → 정규화 → Supabase 마이그레이션
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold mb-3">✨ 자동으로 생성되는 것들</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ 정규화된 테이블 (차원 + 팩트 테이블)</li>
          <li>✅ 외래키 관계</li>
          <li>✅ 성능 최적화 (인덱스, Materialized View)</li>
          <li>✅ 실시간 분석 뷰 (월별, 담당자별, 제품별)</li>
          <li>✅ 한국어 지원 (한글 시트명 → 영문 테이블명)</li>
        </ul>
      </div>
    </div>
  )
}
