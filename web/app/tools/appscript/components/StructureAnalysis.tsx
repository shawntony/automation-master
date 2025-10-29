'use client'

import { useEffect, useRef, useState } from 'react'
import { Network, Lightbulb, GitBranch, Zap, AlertCircle, CheckCircle2, Info, FileText, GitCompare, TrendingUp, Target } from 'lucide-react'
import mermaid from 'mermaid'

interface StructureAnalysisProps {
  structureAnalysis: {
    diagram: {
      mermaid: string
      type: 'flowchart' | 'graph'
    }
    description: {
      overview: string
      purpose: string
      creatorIntent?: {
        mainGoal: string
        businessContext: string
        workflowDesign: string
        painPoints: string[]
      }
      dataFlow: string
      sheetDescriptions: Array<{
        sheetName: string
        role: string
        keyFeatures: string[]
      }>
      complexity: {
        level: 'simple' | 'moderate' | 'complex' | 'very-complex'
        reasons: string[]
      }
      recommendations: string[]
    }
    structure: {
      sheetRelationships: Array<{
        from: string
        to: string
        type: string
        description: string
      }>
      dataPatterns: Array<{
        pattern: string
        sheets: string[]
        description: string
      }>
      businessLogic: Array<{
        logic: string
        location: string
        description: string
      }>
    }
  }
}

export function StructureAnalysis({ structureAnalysis }: StructureAnalysisProps) {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'diagram' | 'sheets' | 'patterns' | 'recommendations'>('overview')

  useEffect(() => {
    let isMounted = true

    // diagram 탭이 활성화되었을 때만 렌더링
    if (activeTab === 'diagram' && mermaidRef.current && structureAnalysis?.diagram?.mermaid) {
      // 초기 상태: 로딩 메시지 표시
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = '<p class="text-gray-500">다이어그램 로딩 중...</p>'
      }

      // Mermaid 초기화
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        }
      })

      // 다이어그램 렌더링
      const renderDiagram = async () => {
        try {
          // 고유 ID 생성 (중복 방지)
          const uniqueId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

          const result = await mermaid.render(
            uniqueId,
            structureAnalysis.diagram.mermaid
          )

          // Mermaid render()는 문자열을 직접 반환하거나 {svg: string} 객체를 반환할 수 있음
          const svgContent = typeof result === 'string' ? result : result.svg

          // 컴포넌트가 여전히 마운트되어 있을 때만 업데이트
          if (isMounted && mermaidRef.current && svgContent) {
            mermaidRef.current.innerHTML = svgContent
          }
        } catch (error) {
          console.error('[Mermaid] Rendering error:', error)
          if (isMounted && mermaidRef.current) {
            mermaidRef.current.innerHTML = '<p class="text-red-500">다이어그램을 렌더링할 수 없습니다</p>'
          }
        }
      }

      renderDiagram()
    } else {
      // 데이터가 없으면 빈 상태로
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = ''
      }
    }

    // 클린업 함수
    return () => {
      isMounted = false
    }
  }, [activeTab, structureAnalysis?.diagram?.mermaid])

  const { description, structure } = structureAnalysis

  // 복잡도 레벨에 따른 색상
  const complexityColors = {
    'simple': 'text-green-600 bg-green-50 border-green-200',
    'moderate': 'text-blue-600 bg-blue-50 border-blue-200',
    'complex': 'text-orange-600 bg-orange-50 border-orange-200',
    'very-complex': 'text-red-600 bg-red-50 border-red-200'
  }

  const complexityLabels = {
    'simple': '단순',
    'moderate': '보통',
    'complex': '복잡',
    'very-complex': '매우 복잡'
  }

  // 탭 설정
  const tabs = [
    { id: 'overview', label: '전체 개요', icon: FileText },
    { id: 'diagram', label: '관계 다이어그램', icon: GitBranch },
    { id: 'sheets', label: '시트 상세', icon: GitCompare },
    { id: 'patterns', label: '데이터 패턴', icon: TrendingUp },
    { id: 'recommendations', label: '개선 제안', icon: Target }
  ] as const

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* 전체 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* AI 구조 분석 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Network className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🤖 AI 구조 분석
                  </h3>
                  <p className="text-gray-700 mb-3">{description.overview}</p>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">스프레드시트 목적:</p>
                    <p className="text-gray-800">{description.purpose}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 제작자 의도 분석 */}
            {description.creatorIntent && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      🎯 제작자의 의도
                    </h3>

                    {/* 주요 목표 */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-purple-700">주요 목표</span>
                      </div>
                      <p className="text-gray-700 bg-white/70 rounded-lg p-3">
                        {description.creatorIntent.mainGoal}
                      </p>
                    </div>

                    {/* 비즈니스 맥락 */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-purple-700">비즈니스 맥락</span>
                      </div>
                      <p className="text-gray-700 bg-white/70 rounded-lg p-3">
                        {description.creatorIntent.businessContext}
                      </p>
                    </div>

                    {/* 워크플로우 설계 의도 */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-purple-700">워크플로우 설계 의도</span>
                      </div>
                      <p className="text-gray-700 bg-white/70 rounded-lg p-3">
                        {description.creatorIntent.workflowDesign}
                      </p>
                    </div>

                    {/* 해결하려는 문제점들 */}
                    {description.creatorIntent.painPoints && description.creatorIntent.painPoints.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-purple-700">해결하려는 문제점</span>
                        </div>
                        <div className="bg-white/70 rounded-lg p-3">
                          <ul className="space-y-2">
                            {description.creatorIntent.painPoints.map((point: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 복잡도 평가 */}
            <div className={`border rounded-lg p-4 ${complexityColors[description.complexity.level]}`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">
                  복잡도: {complexityLabels[description.complexity.level]}
                </span>
              </div>
              <ul className="space-y-1 text-sm">
                {description.complexity.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 데이터 흐름 */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">데이터 흐름</h3>
              </div>
              <p className="text-gray-700">{description.dataFlow}</p>
            </div>
          </div>
        )}

        {/* 관계 다이어그램 탭 */}
        {activeTab === 'diagram' && (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">시트 간 관계 다이어그램</h3>
              </div>
              <div
                ref={mermaidRef}
                className="mermaid-container overflow-x-auto bg-gray-50 rounded-lg p-4"
              >
                {/* Mermaid가 여기에 렌더링됩니다 */}
              </div>
              <div className="mt-3 text-sm text-gray-500">
                <Info className="h-4 w-4 inline mr-1" />
                파란색: 데이터 시트 | 주황색: 복잡한 계산 시트 | 보라색: 일반 시트
                <br />
                화살표 방향: 데이터 제공자 → 데이터 사용자 (코드 생성 시 데이터 시트부터 구현)
              </div>
            </div>
          </div>
        )}

        {/* 시트 상세 탭 */}
        {activeTab === 'sheets' && (
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">시트별 상세 분석</h3>
              <div className="space-y-4">
                {description.sheetDescriptions.map((sheet, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{sheet.sheetName}</span>
                      <span className="text-sm px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {sheet.role}
                      </span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {sheet.keyFeatures.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 데이터 패턴 탭 */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            {/* 데이터 패턴 */}
            {structure.dataPatterns.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">감지된 데이터 패턴</h3>
                <div className="space-y-3">
                  {structure.dataPatterns.map((pattern, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-purple-100 rounded">
                          <Network className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">
                            {pattern.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            시트: {pattern.sheets.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 비즈니스 로직 */}
            {structure.businessLogic.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">비즈니스 로직 분석</h3>
                <div className="space-y-3">
                  {structure.businessLogic.map((logic, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-orange-100 rounded">
                          <Zap className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{logic.description}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                              {logic.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 개선 제안 탭 */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    💡 AI 추천 사항
                  </h3>
                  <ul className="space-y-2">
                    {description.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
