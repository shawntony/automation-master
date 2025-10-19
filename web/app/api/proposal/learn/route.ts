import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: POST /api/proposal/learn
 *
 * AI 스타일 학습 방식
 * - 기존 PPT 템플릿 업로드
 * - AI가 스타일 학습 (색상, 폰트, 레이아웃, 디자인 패턴)
 * - 콘텐츠 입력
 * - 학습한 스타일로 제안서 자동 생성
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const step = formData.get('step') as string

    // Step 1: 템플릿 업로드 및 스타일 학습
    if (step === 'learn') {
      const templateFile = formData.get('template') as File

      if (!templateFile) {
        return NextResponse.json(
          { error: '템플릿 파일이 필요합니다.' },
          { status: 400 }
        )
      }

      // TODO: Implement actual PPT parsing and style learning
      // For now, return mock analysis
      const styleProfile = {
        brand: '회사명',
        colors: {
          primary: '#0066CC',
          secondary: '#FF6600',
          accent: '#00CC66',
          background: '#FFFFFF',
          text: '#333333'
        },
        fonts: {
          heading: 'Montserrat Bold',
          subheading: 'Montserrat SemiBold',
          body: 'Open Sans Regular',
          sizes: {
            title: 32,
            heading: 24,
            body: 16
          }
        },
        layouts: [
          {
            type: 'title_slide',
            pattern: 'center_aligned',
            elements: ['title', 'subtitle', 'logo']
          },
          {
            type: 'content_slide',
            pattern: 'two_column',
            elements: ['heading', 'image', 'text']
          },
          {
            type: 'bullet_slide',
            pattern: 'single_column',
            elements: ['heading', 'bullet_points']
          }
        ],
        designElements: {
          shapes: ['rounded_rectangle', 'circle'],
          icons: true,
          images: 'full_width',
          charts: 'modern_style'
        },
        analysis: {
          totalSlides: 15,
          uniqueLayouts: 5,
          colorConsistency: 95,
          fontConsistency: 100,
          qualityGrade: 'A'
        }
      }

      return NextResponse.json({
        success: true,
        message: '스타일 학습이 완료되었습니다.',
        styleProfile,
        estimatedTime: '25-30분'
      })
    }

    // Step 2: 콘텐츠 입력 및 제안서 생성
    if (step === 'generate') {
      const styleProfile = JSON.parse(formData.get('styleProfile') as string)
      const contentType = formData.get('contentType') as string
      const content = formData.get('content') as string

      if (!content) {
        return NextResponse.json(
          { error: '콘텐츠가 필요합니다.' },
          { status: 400 }
        )
      }

      // TODO: Implement actual proposal generation with Canva MCP
      // For now, return mock generation result
      const slides = [
        {
          number: 1,
          type: 'title_slide',
          title: 'AI 마케팅 자동화 솔루션 제안서',
          subtitle: 'ABC 기업을 위한 맞춤 솔루션',
          generated: true
        },
        {
          number: 2,
          type: 'problem_slide',
          title: '현재의 과제',
          content: ['수동 프로세스로 인한 시간 낭비', '낮은 캠페인 효율성'],
          generated: true
        },
        {
          number: 3,
          type: 'solution_slide',
          title: '솔루션 개요',
          content: ['AI 기반 마케팅 자동화', '80% 시간 절감'],
          generated: true
        }
      ]

      return NextResponse.json({
        success: true,
        message: '제안서가 생성되었습니다.',
        slides,
        totalSlides: slides.length,
        downloadUrl: '/api/proposal/download/mock-proposal.pptx',
        estimatedTime: '30분'
      })
    }

    return NextResponse.json(
      { error: '올바른 단계를 지정해주세요.' },
      { status: 400 }
    )

  } catch (error) {
    console.error('AI 학습 오류:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
