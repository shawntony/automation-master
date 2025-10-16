import Link from 'next/link'
import { ArrowRight, Rocket, CheckCircle2, BarChart3, Bot, FileText, Workflow } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Rocket className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Automation Master
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition">
              대시보드
            </Link>
            <Link href="/workflow" className="text-gray-600 hover:text-blue-600 transition">
              워크플로우
            </Link>
            <Link href="/guide" className="text-gray-600 hover:text-blue-600 transition">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            자동화 툴 개발을
            <br />
            10단계로 완성하세요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            아이디어부터 배포까지, AI 기반 대화형 워크플로우로
            <br />
            체계적으로 프로젝트를 완성하는 가장 스마트한 방법
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/workflow"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
            >
              <Workflow className="mr-2 h-6 w-6" />
              워크플로우 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition shadow-lg hover:shadow-xl border border-gray-200"
            >
              <BarChart3 className="mr-2 h-6 w-6" />
              대시보드 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">주요 기능</h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Workflow className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3">대화형 워크플로우</h4>
            <p className="text-gray-600">
              단계별 정보 입력 → 프롬프트 생성 → 결과 확인 → 승인하는 완전 자동화된 프로세스
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3">AI 기반 분석</h4>
            <p className="text-gray-600">
              프로젝트 폴더를 분석하고 현재 단계를 진단하며 다음 액션을 추천합니다
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3">MCP 프롬프트 생성</h4>
            <p className="text-gray-600">
              각 단계별로 실행 가능한 Claude Code 프롬프트를 자동으로 생성합니다
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-yellow-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3">진행상황 추적</h4>
            <p className="text-gray-600">
              각 단계별 체크리스트와 진행률을 실시간으로 관리하고 추적합니다
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3">프로젝트 대시보드</h4>
            <p className="text-gray-600">
              전체 프로젝트 진행 현황과 통계를 한눈에 확인할 수 있습니다
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Rocket className="h-6 w-6 text-indigo-600" />
            </div>
            <h4 className="text-xl font-semibold mb-3">10단계 가이드</h4>
            <p className="text-gray-600">
              아이디어부터 배포까지 체계적인 단계별 개발 프로세스를 제공합니다
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="container mx-auto px-4 py-20 bg-white/50 rounded-3xl">
        <h3 className="text-3xl font-bold text-center mb-12">10단계 개발 프로세스</h3>

        <div className="max-w-4xl mx-auto space-y-4">
          {[
            { step: 1, title: "아이디어 발굴 및 정의", duration: "1-2주" },
            { step: 2, title: "PDR 작성", duration: "3-5일" },
            { step: 3, title: "시스템 기획서 작성", duration: "1주" },
            { step: 4, title: "UI/UX 설계 + Playwright 벤치마킹", duration: "1-2주" },
            { step: 5, title: "기술 스택 선정", duration: "2-3일" },
            { step: 6, title: "프론트엔드 개발", duration: "2-4주" },
            { step: 7, title: "백엔드 개발", duration: "2-4주" },
            { step: 8, title: "테스트 시나리오 및 테스팅", duration: "1-2주" },
            { step: 9, title: "배포 준비", duration: "3-5일" },
            { step: 10, title: "배포 및 운영", duration: "지속" }
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-center justify-between p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.duration}</p>
                </div>
              </div>
              <CheckCircle2 className="h-6 w-6 text-gray-300" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h3 className="text-4xl font-bold mb-6">
            지금 바로 시작하세요
          </h3>
          <p className="text-xl mb-8 opacity-90">
            AI 기반 대화형 워크플로우로 프로젝트를 체계적으로 완성하세요
          </p>
          <Link
            href="/workflow"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition shadow-lg"
          >
            <Workflow className="mr-2 h-6 w-6" />
            워크플로우 시작하기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Automation Master. All rights reserved.</p>
          <p className="text-sm mt-2">
            단계별 자동화 툴 개발 가이드 시스템
          </p>
        </div>
      </footer>
    </div>
  )
}
