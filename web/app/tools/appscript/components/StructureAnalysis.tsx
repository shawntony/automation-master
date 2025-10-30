'use client'

import { useEffect, useRef, useState } from 'react'
import { Network, Lightbulb, GitBranch, Zap, AlertCircle, CheckCircle2, Info, FileText, GitCompare, TrendingUp, Target, Code, ArrowRight, Database } from 'lucide-react'
import mermaid from 'mermaid'
import { AssistantChat } from './AssistantChat'
import { CodeLibraryBrowser } from './CodeLibraryBrowser'

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
  analysis?: {
    sheets: Array<{
      name: string
      rowCount: number
      columnCount: number
      formulas: any[]
      formulaTypes: Record<string, number>
    }>
    totalFormulas: number
    formulaTypes: Record<string, number>
  }
  spreadsheetId?: string
  spreadsheetTitle?: string
  analysisResult?: any
  onGenerateCode?: (params: any) => void
  onModifyCode?: (params: any) => void
  onSelectCode?: (item: any) => void
}

export function StructureAnalysis({
  structureAnalysis,
  analysis,
  spreadsheetId,
  spreadsheetTitle,
  analysisResult,
  onGenerateCode,
  onModifyCode,
  onSelectCode
}: StructureAnalysisProps) {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'diagram' | 'sheets' | 'patterns' | 'recommendations'>('overview')

  useEffect(() => {
    let isMounted = true

    if (activeTab === 'diagram' && mermaidRef.current && structureAnalysis?.diagram?.mermaid) {
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = '<p class="text-gray-500">다이어그램 로딩 중...</p>'
      }

      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        }
      })

      const renderDiagram = async () => {
        try {
          const uniqueId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const result = await mermaid.render(uniqueId, structureAnalysis.diagram.mermaid)
          const svgContent = typeof result === 'string' ? result : result.svg

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
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = ''
      }
    }

    return () => {
      isMounted = false
    }
  }, [activeTab, structureAnalysis?.diagram?.mermaid])

  const { description, structure } = structureAnalysis

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
        {/* 전체 개요 탭 - 핵심 요약만 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 핵심 요약 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Network className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📊 스프레드시트 요약
                  </h3>
                  <p className="text-gray-700 mb-3">{description.overview}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white/70 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-600 mb-1">주요 목적</p>
                      <p className="text-gray-800">{description.purpose}</p>
                    </div>
                    <div className={`rounded-lg p-3 ${complexityColors[description.complexity.level]}`}>
                      <p className="text-sm font-medium mb-1">복잡도</p>
                      <p className="font-semibold">{complexityLabels[description.complexity.level]}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 빠른 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">총 시트</div>
                <div className="text-2xl font-bold text-gray-900">{analysis?.sheets.length || 0}</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">총 수식</div>
                <div className="text-2xl font-bold text-blue-600">{analysis?.totalFormulas || 0}</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">시트 간 연결</div>
                <div className="text-2xl font-bold text-purple-600">{structure.sheetRelationships.length}</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">수식 종류</div>
                <div className="text-2xl font-bold text-green-600">{Object.keys(analysis?.formulaTypes || {}).length}</div>
              </div>
            </div>
          </div>
        )}

        {/* 관계 다이어그램 탭 - 다이어그램 + 관계 설명 */}
        {activeTab === 'diagram' && (
          <div className="space-y-4">
            {/* 다이어그램 */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">시트 간 관계 다이어그램</h3>
              </div>
              <div
                ref={mermaidRef}
                className="mermaid-container overflow-x-auto bg-gray-50 rounded-lg p-4"
              />
              <div className="mt-3 text-sm text-gray-500">
                <Info className="h-4 w-4 inline mr-1" />
                파란색: 데이터 시트 | 주황색: 복잡한 계산 시트 | 보라색: 일반 시트
                <br />
                화살표 방향: 데이터 제공자 → 데이터 사용자
              </div>
            </div>

            {/* 관계 상세 설명 */}
            {structure.sheetRelationships.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">시트 간 연결 상세</h3>
                <div className="space-y-3">
                  {structure.sheetRelationships.map((rel, index) => (
                    <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                      <ArrowRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{rel.to}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium text-blue-600">{rel.from}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            rel.type === 'lookup' ? 'bg-purple-100 text-purple-700' :
                            rel.type === 'formula-dependency' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {rel.type === 'lookup' ? '데이터 조회' :
                             rel.type === 'formula-dependency' ? '수식 의존' : '데이터 참조'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{rel.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 데이터 흐름 */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">데이터 흐름 분석</h3>
              </div>
              <p className="text-gray-700">{description.dataFlow}</p>
            </div>
          </div>
        )}

        {/* 시트 상세 탭 - 시트별 분석 + 수식 상세 */}
        {activeTab === 'sheets' && (
          <div className="space-y-4">
            {description.sheetDescriptions.map((sheet, index) => {
              const sheetData = analysis?.sheets.find(s => s.name === sheet.sheetName)
              return (
                <div key={index} className="bg-white border rounded-lg p-6">
                  {/* 시트 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Database className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{sheet.sheetName}</h3>
                        <span className="text-sm px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {sheet.role}
                        </span>
                      </div>
                    </div>
                    {sheetData && (
                      <div className="text-sm text-gray-500">
                        {sheetData.rowCount}행 × {sheetData.columnCount}열
                      </div>
                    )}
                  </div>

                  {/* 주요 특징 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">주요 특징</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sheet.keyFeatures.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 수식 상세 분석 */}
                  {sheetData && sheetData.formulas.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        수식 분석 ({sheetData.formulas.length}개)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {Object.entries(sheetData.formulaTypes)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 8)
                          .map(([type, count]) => (
                            <div key={type} className="bg-white rounded px-3 py-2 text-sm">
                              <div className="font-medium text-gray-900">{type}</div>
                              <div className="text-gray-600">{count}개</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* 데이터 패턴 탭 - 패턴 + 워크플로우 + 비즈니스 로직 */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            {/* 워크플로우 설계 */}
            {description.creatorIntent && (
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">워크플로우 설계</h3>
                </div>
                <p className="text-gray-700 bg-purple-50 rounded-lg p-4">
                  {description.creatorIntent.workflowDesign}
                </p>
              </div>
            )}

            {/* 데이터 패턴 */}
            {structure.dataPatterns.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">감지된 데이터 패턴</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {structure.dataPatterns.map((pattern, index) => (
                    <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-purple-100 rounded">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">
                            {pattern.description}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            관련 시트: {pattern.sheets.join(', ')}
                          </div>
                          <div className="text-xs px-2 py-1 bg-white/70 rounded inline-block">
                            {pattern.pattern}
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
                    <div key={index} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-orange-100 rounded">
                          <Zap className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{logic.description}</span>
                            <span className="text-xs px-2 py-0.5 bg-white rounded font-mono">
                              {logic.location}
                            </span>
                          </div>
                          <div className="text-xs px-2 py-1 bg-white/70 rounded inline-block">
                            {logic.logic}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 해결하려는 문제점 */}
            {description.creatorIntent?.painPoints && description.creatorIntent.painPoints.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">해결하려는 문제점</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {description.creatorIntent.painPoints.map((point: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 개선 제안 탭 - 실행 가능한 구체적 제안 */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {/* 복잡도 평가 */}
            <div className={`border rounded-lg p-6 ${complexityColors[description.complexity.level]}`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  현재 복잡도: {complexityLabels[description.complexity.level]}
                </h3>
              </div>
              <ul className="space-y-2">
                {description.complexity.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI 추천 사항 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    💡 실행 가능한 개선 방안
                  </h3>
                  <div className="space-y-3">
                    {description.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white/70 rounded-lg p-4">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-gray-800">{rec}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            {/* AI 어시스턴트 채팅 */}
            {spreadsheetId && analysisResult && (
              <div className="mt-8">
                <AssistantChat
                  spreadsheetId={spreadsheetId}
                  spreadsheetTitle={spreadsheetTitle || '스프레드시트'}
                  analysisResult={analysisResult}
                  onGenerateCode={onGenerateCode}
                  onModifyCode={onModifyCode}
                />
              </div>
            )}

            {/* 코드 라이브러리 */}
            <div className="mt-8">
              <CodeLibraryBrowser
                onSelectCode={onSelectCode}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
