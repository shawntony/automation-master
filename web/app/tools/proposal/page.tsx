'use client'

import { useState } from 'react'
import { FileText, Sparkles, Upload, Wand2, CheckCircle2, ArrowRight, Download, Play, Zap } from 'lucide-react'

type Method = 'ai-learning' | 'direct-import' | 'diagnose-improve'

export default function ProposalGeneratorPage() {
  const [activeMethod, setActiveMethod] = useState<Method>('ai-learning')
  const [isProcessing, setIsProcessing] = useState(false)

  const methods = [
    {
      id: 'ai-learning' as Method,
      title: 'AI 스타일 학습',
      icon: Sparkles,
      badge: '권장',
      badgeColor: 'bg-green-500',
      description: '템플릿 스타일을 학습하여 동일한 디자인으로 생성',
      time: '25-30분',
      steps: ['템플릿 업로드', 'AI 스타일 학습', '콘텐츠 입력', '자동 생성']
    },
    {
      id: 'direct-import' as Method,
      title: '직접 임포트',
      icon: Wand2,
      badge: '빠름',
      badgeColor: 'bg-blue-500',
      description: 'Canva 템플릿을 직접 사용하여 빠르게 생성',
      time: '15-20분',
      steps: ['템플릿 선택', '콘텐츠 매핑', '자동 적용', '다운로드']
    },
    {
      id: 'diagnose-improve' as Method,
      title: 'PPT 진단/개선',
      icon: Upload,
      badge: '업그레이드',
      badgeColor: 'bg-purple-500',
      description: '기존 PPT를 진단하고 자동으로 개선',
      time: '30-40분',
      steps: ['PPT 업로드', 'AI 진단', '개선 제안', '자동 리뉴얼']
    }
  ]

  const currentMethod = methods.find(m => m.id === activeMethod)!

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-600 rounded-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">제안서 자동 생성</h1>
              <p className="text-gray-600">Claude + Canva로 전문 제안서를 자동으로 만드세요</p>
            </div>
          </div>
        </div>

        {/* Method Selection Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-2 px-4" aria-label="Methods">
              {methods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => setActiveMethod(method.id)}
                    className={`
                      flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition
                      ${activeMethod === method.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {method.title}
                    <span className={`ml-2 text-xs ${method.badgeColor} text-white px-2 py-0.5 rounded-full`}>
                      {method.badge}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Method Content */}
          <div className="p-8">
            {/* Method Overview */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentMethod.title}
                  </h2>
                  <p className="text-gray-600 text-lg mb-4">
                    {currentMethod.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-600">예상 시간: {currentMethod.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {currentMethod.steps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 text-center">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm font-medium text-gray-700">{step}</p>
                    </div>
                    {index < currentMethod.steps.length - 1 && (
                      <ArrowRight className="absolute top-1/2 -right-6 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Method-Specific Content */}
            {activeMethod === 'ai-learning' && <AILearningTab />}
            {activeMethod === 'direct-import' && <DirectImportTab />}
            {activeMethod === 'diagnose-improve' && <DiagnoseImproveTab />}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">제안서 자동 생성의 장점</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">시간 80% 절감</h4>
                <p className="text-sm text-gray-600">4시간 → 50분으로 단축</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">브랜드 일관성 100%</h4>
                <p className="text-sm text-gray-600">자동으로 스타일 유지</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">AI 최적화</h4>
                <p className="text-sm text-gray-600">자동 콘텐츠 배치 및 개선</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// AI 스타일 학습 탭
function AILearningTab() {
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [scenarioText, setScenarioText] = useState('')
  const [isLearning, setIsLearning] = useState(false)
  const [learnedStyle, setLearnedStyle] = useState<any>(null)

  return (
    <div className="space-y-6">
      {/* Step 1: Template Upload */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">1단계: 템플릿 업로드</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition cursor-pointer">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">PowerPoint 템플릿 파일을 드래그하거나 클릭하여 업로드</p>
          <input
            type="file"
            accept=".pptx,.ppt"
            className="hidden"
            onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
          />
          <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            파일 선택
          </button>
          {templateFile && (
            <p className="mt-4 text-sm text-green-600">✓ {templateFile.name}</p>
          )}
        </div>
      </div>

      {/* Step 2: Style Learning */}
      {templateFile && (
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">2단계: AI 스타일 학습</h3>
          <button
            onClick={() => setIsLearning(true)}
            disabled={isLearning}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition"
          >
            {isLearning ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                스타일 학습 중...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                스타일 학습 시작
              </>
            )}
          </button>

          {learnedStyle && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800 font-medium mb-2">✓ 스타일 학습 완료!</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">색상:</span>
                  <div className="flex gap-1 mt-1">
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">폰트:</span>
                  <p className="font-medium">Montserrat, Open Sans</p>
                </div>
                <div>
                  <span className="text-gray-600">레이아웃:</span>
                  <p className="font-medium">5개 패턴 감지</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Content Input */}
      {learnedStyle && (
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">3단계: 콘텐츠 입력</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제안서 내용 (자유 텍스트 또는 구조화 형식)
              </label>
              <textarea
                value={scenarioText}
                onChange={(e) => setScenarioText(e.target.value)}
                placeholder="예시:&#10;&#10;우리 회사의 AI 마케팅 자동화 솔루션을 ABC 기업에 제안하려고 해.&#10;&#10;주요 내용:&#10;- 현재 ABC는 수동 마케팅으로 시간 낭비&#10;- 우리 솔루션으로 80% 시간 절감 가능&#10;- 3개월 구축, 1년 ROI 300%&#10;&#10;대상: ABC 마케팅 팀장&#10;목표: 계약 체결&#10;분량: 15페이지"
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              <Play className="h-5 w-5" />
              제안서 생성 시작
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 직접 임포트 탭
function DirectImportTab() {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [scenario, setScenario] = useState('')

  const canvaTemplates = [
    { id: 'business-minimal', name: '비즈니스 미니멀', category: '기업용' },
    { id: 'creative-bold', name: '크리에이티브 볼드', category: '마케팅' },
    { id: 'tech-modern', name: '테크 모던', category: 'IT/기술' },
    { id: 'consulting-pro', name: '컨설팅 프로', category: '컨설팅' }
  ]

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">1단계: Canva 템플릿 선택</h3>
        <div className="grid grid-cols-2 gap-4">
          {canvaTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`
                border-2 rounded-lg p-6 cursor-pointer transition
                ${selectedTemplate === template.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-3"></div>
              <h4 className="font-medium">{template.name}</h4>
              <p className="text-sm text-gray-500">{template.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Input */}
      {selectedTemplate && (
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">2단계: 콘텐츠 입력</h3>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="제안서 내용을 입력하세요..."
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <button className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            <Wand2 className="h-5 w-5" />
            템플릿에 적용하기
          </button>
        </div>
      )}
    </div>
  )
}

// PPT 진단/개선 탭
function DiagnoseImproveTab() {
  const [pptFile, setPptFile] = useState<File | null>(null)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">1단계: 기존 PPT 업로드</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition cursor-pointer">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">개선이 필요한 PowerPoint 파일을 업로드하세요</p>
          <input
            type="file"
            accept=".pptx,.ppt"
            className="hidden"
            onChange={(e) => setPptFile(e.target.files?.[0] || null)}
          />
          <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            파일 선택
          </button>
          {pptFile && (
            <p className="mt-4 text-sm text-green-600">✓ {pptFile.name}</p>
          )}
        </div>
      </div>

      {/* Diagnosis */}
      {pptFile && (
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">2단계: AI 진단</h3>
          <button
            onClick={() => setDiagnosisResult({grade: 'D', issues: 12})}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Sparkles className="h-5 w-5" />
            진단 시작
          </button>

          {diagnosisResult && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">현재 등급</p>
                  <p className="text-3xl font-bold text-red-600">{diagnosisResult.grade}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">개선 필요</p>
                  <p className="text-3xl font-bold text-orange-600">{diagnosisResult.issues}개</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">목표 등급</p>
                  <p className="text-3xl font-bold text-green-600">A</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">주요 개선 사항</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">⚠️</span>
                    <span className="text-sm">구식 디자인 스타일 → 현대적 레이아웃으로 변경</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">⚠️</span>
                    <span className="text-sm">일관성 없는 폰트 사용 → 통일된 타이포그래피 적용</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">⚠️</span>
                    <span className="text-sm">낮은 가독성 → 콘텐츠 재배치 및 여백 최적화</span>
                  </li>
                </ul>
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <Wand2 className="h-5 w-5" />
                A등급으로 자동 개선
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
