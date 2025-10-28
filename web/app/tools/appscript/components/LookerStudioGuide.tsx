'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, CheckCircle2, ExternalLink, Copy, BarChart3 } from 'lucide-react'

interface LookerStudioGuideProps {
  spreadsheetId: string
  spreadsheetUrl: string
  onBack: () => void
  onClose: () => void
}

const steps = [
  {
    title: 'Looker Studio 접속',
    description: 'Google Looker Studio 웹사이트에 접속합니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>1단계:</strong> Looker Studio 웹사이트에 접속합니다.
          </p>
          <a
            href="https://lookerstudio.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ExternalLink className="h-4 w-4" />
            Looker Studio 열기
          </a>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 mb-2">
            <strong>참고:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Google 계정으로 로그인이 필요합니다</li>
            <li>스프레드시트와 동일한 계정을 사용하는 것을 권장합니다</li>
            <li>처음 사용하는 경우 약관 동의가 필요할 수 있습니다</li>
          </ul>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Looker Studio 홈페이지가 열리면<br />
            다음 단계로 진행하세요
          </p>
        </div>
      </div>
    )
  },
  {
    title: '새 보고서 만들기',
    description: '빈 보고서를 생성하여 시작합니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>2단계:</strong> 새 보고서를 생성합니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>Looker Studio 홈 화면에서 <strong>"만들기"</strong> 버튼을 클릭합니다</li>
            <li><strong>"보고서"</strong>를 선택합니다</li>
            <li><strong>"빈 보고서"</strong> 옵션을 선택합니다</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-2">
            <strong>💡 팁:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            <li>템플릿도 사용할 수 있지만, 처음에는 빈 보고서가 더 이해하기 쉽습니다</li>
            <li>나중에 언제든지 템플릿을 적용할 수 있습니다</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>예상 화면:</strong>
          </p>
          <div className="bg-gray-100 rounded p-4 text-center text-sm text-gray-500">
            [Looker Studio 편집 화면이 나타남]<br />
            좌측: 도구 모음<br />
            중앙: 캔버스 (빈 보고서)<br />
            우측: 속성 패널
          </div>
        </div>
      </div>
    )
  },
  {
    title: '데이터 소스 연결',
    description: 'Google Sheets 스프레드시트를 데이터 소스로 추가합니다',
    content: (spreadsheetId: string, spreadsheetUrl: string) => {
      const [copied, setCopied] = useState(false)

      const copySpreadsheetId = () => {
        navigator.clipboard.writeText(spreadsheetId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }

      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 mb-3">
              <strong>3단계:</strong> 스프레드시트를 데이터 소스로 연결합니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
              <li><strong>"데이터 추가"</strong> 버튼을 클릭합니다 (우측 상단)</li>
              <li><strong>"Google Sheets"</strong>를 선택합니다</li>
              <li>스프레드시트 목록에서 아래 스프레드시트를 찾습니다</li>
              <li>원하는 시트를 선택하고 <strong>"추가"</strong> 버튼을 클릭합니다</li>
            </ol>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800 mb-3">
              <strong>📋 연결할 스프레드시트:</strong>
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-purple-700 mb-1">스프레드시트 ID:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded text-sm border border-purple-200 overflow-x-auto">
                    {spreadsheetId}
                  </code>
                  <button
                    onClick={copySpreadsheetId}
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center gap-1 text-sm"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        복사
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  스프레드시트 직접 열기
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 mb-2">
              <strong>참고:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>스프레드시트가 목록에 나타나지 않으면 검색창에 ID를 붙여넣으세요</li>
              <li>여러 시트를 선택할 수 있습니다 (필요한 경우)</li>
              <li>연결 후에도 언제든지 다른 시트를 추가할 수 있습니다</li>
            </ul>
          </div>
        </div>
      )
    }
  },
  {
    title: '차트 추가하기',
    description: '데이터를 시각화할 차트를 캔버스에 추가합니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>4단계:</strong> 차트를 추가하여 데이터를 시각화합니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>상단 도구 모음에서 <strong>"차트 추가"</strong>를 클릭합니다</li>
            <li>원하는 차트 유형을 선택합니다 (표, 막대 차트, 선 차트 등)</li>
            <li>캔버스에 차트를 드래그하여 배치합니다</li>
            <li>우측 속성 패널에서 차트를 설정합니다</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 mb-3">
            <strong>✅ 추천 차트 유형:</strong>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded p-3">
              <p className="font-semibold text-sm text-gray-800 mb-1">📊 표</p>
              <p className="text-xs text-gray-600">
                원본 데이터를 표 형태로 표시
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="font-semibold text-sm text-gray-800 mb-1">📈 시계열 차트</p>
              <p className="text-xs text-gray-600">
                시간에 따른 데이터 변화
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="font-semibold text-sm text-gray-800 mb-1">📊 막대 차트</p>
              <p className="text-xs text-gray-600">
                카테고리별 비교
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="font-semibold text-sm text-gray-800 mb-1">🥧 원형 차트</p>
              <p className="text-xs text-gray-600">
                구성 비율 표시
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-2">
            <strong>💡 차트 설정 팁:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            <li><strong>측정기준:</strong> 카테고리 필드 (이름, 날짜 등)</li>
            <li><strong>측정항목:</strong> 숫자 필드 (금액, 수량 등)</li>
            <li><strong>필터:</strong> 특정 조건의 데이터만 표시</li>
            <li><strong>정렬:</strong> 데이터 정렬 기준 설정</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: '대시보드 꾸미기',
    description: '텍스트, 이미지, 도형 등을 추가하여 대시보드를 완성합니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>5단계:</strong> 대시보드를 보기 좋게 꾸밉니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li><strong>"삽입"</strong> 메뉴에서 텍스트, 이미지, 도형 등을 추가합니다</li>
            <li>제목과 설명을 추가하여 대시보드 목적을 명확히 합니다</li>
            <li>색상 테마를 일관되게 적용합니다</li>
            <li>차트와 요소들을 정렬하여 깔끔하게 배치합니다</li>
          </ol>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 mb-3">
            <strong>🎨 디자인 요소:</strong>
          </p>
          <div className="space-y-2 text-sm text-purple-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <strong>텍스트:</strong> 제목, 부제목, 설명문 추가
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <strong>이미지:</strong> 로고, 아이콘 삽입
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <strong>도형:</strong> 배경, 구분선, 강조 영역
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <strong>필터 컨트롤:</strong> 사용자가 데이터를 필터링할 수 있는 드롭다운
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <strong>날짜 범위 선택기:</strong> 기간별 데이터 조회
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 mb-2">
            <strong>배치 팁:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>중요한 차트는 상단에 배치</li>
            <li>관련된 차트끼리 그룹화</li>
            <li>충분한 여백 확보</li>
            <li>일관된 크기와 정렬 유지</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: '공유 및 완료',
    description: '보고서를 저장하고 다른 사람들과 공유합니다',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 mb-3">
            <strong>6단계:</strong> 보고서를 저장하고 공유합니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>좌측 상단의 <strong>"제목 없는 보고서"</strong>를 클릭하여 이름을 변경합니다</li>
            <li>우측 상단의 <strong>"공유"</strong> 버튼을 클릭합니다</li>
            <li>공유할 사람의 이메일을 입력하거나 링크를 복사합니다</li>
            <li><strong>"완료"</strong>를 클릭하여 저장합니다</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 mb-3">
            <strong>✅ 공유 옵션:</strong>
          </p>
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>뷰어 액세스:</strong> 보고서만 볼 수 있음 (권장)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>편집자 액세스:</strong> 보고서를 수정할 수 있음
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>링크로 공유:</strong> 링크를 아는 사람은 누구나 볼 수 있음
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>PDF 다운로드:</strong> 보고서를 PDF 파일로 내보내기
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-lg font-bold text-gray-900">
                완료! 🎉
              </p>
              <p className="text-sm text-gray-600">
                Looker Studio 대시보드가 성공적으로 생성되었습니다
              </p>
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>다음 단계:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>정기적으로 데이터를 확인하고 인사이트를 도출하세요</li>
              <li>필요에 따라 차트를 추가하거나 수정하세요</li>
              <li>팀원들과 공유하여 협업하세요</li>
              <li>자동 새로고침을 설정하여 항상 최신 데이터를 확인하세요</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 mb-2">
            <strong>💡 추가 리소스:</strong>
          </p>
          <div className="space-y-2">
            <a
              href="https://support.google.com/looker-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-900"
            >
              <ExternalLink className="h-4 w-4" />
              Looker Studio 공식 도움말
            </a>
            <a
              href="https://www.youtube.com/results?search_query=looker+studio+tutorial+korean"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-900"
            >
              <ExternalLink className="h-4 w-4" />
              YouTube 튜토리얼 (한국어)
            </a>
          </div>
        </div>
      </div>
    )
  }
]

export function LookerStudioGuide({ spreadsheetId, spreadsheetUrl, onBack, onClose }: LookerStudioGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-2xl font-bold">📊 Looker Studio 연결 가이드</h2>
                <p className="text-purple-100 text-sm">
                  단계별로 따라하면서 대시보드를 만들어보세요
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 진행 표시기 */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex-1 h-2 rounded-full bg-white/30 overflow-hidden"
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-white' : 'bg-transparent'
                  }`}
                  style={{
                    width: index === currentStep ? '100%' : index < currentStep ? '100%' : '0%'
                  }}
                />
              </div>
            ))}
          </div>
          <p className="text-white/90 text-sm mt-2">
            단계 {currentStep + 1} / {steps.length}
          </p>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                {currentStep + 1}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {currentStepData.title}
              </h3>
            </div>
            <p className="text-gray-600 ml-13">
              {currentStepData.description}
            </p>
          </div>

          <div className="mb-6">
            {typeof currentStepData.content === 'function'
              ? currentStepData.content(spreadsheetId, spreadsheetUrl)
              : currentStepData.content}
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              이전
            </button>

            <div className="text-sm text-gray-600">
              {currentStep + 1} / {steps.length} 단계
            </div>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                다음
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <CheckCircle2 className="h-5 w-5" />
                완료
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
