import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: POST /api/proposal/import
 *
 * 직접 임포트 방식
 * - Canva 템플릿 선택
 * - 콘텐츠 매핑
 * - 내용을 템플릿에 자동 배치
 * - PDF/PPTX 형식으로 다운로드
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, templateId, content, mapping } = body

    // Action 1: Canva 템플릿 검색
    if (action === 'search') {
      const { query, category } = body

      // TODO: Implement actual Canva MCP template search
      // For now, return mock templates
      const templates = [
        {
          id: 'canva_template_001',
          name: '비즈니스 제안서 - 모던',
          category: 'business',
          thumbnail: '/templates/business-modern.jpg',
          slides: 15,
          style: 'modern',
          language: 'ko'
        },
        {
          id: 'canva_template_002',
          name: '비즈니스 제안서 - 클래식',
          category: 'business',
          thumbnail: '/templates/business-classic.jpg',
          slides: 20,
          style: 'classic',
          language: 'ko'
        },
        {
          id: 'canva_template_003',
          name: '마케팅 제안서',
          category: 'marketing',
          thumbnail: '/templates/marketing-modern.jpg',
          slides: 12,
          style: 'modern',
          language: 'ko'
        }
      ]

      return NextResponse.json({
        success: true,
        templates: templates.filter(t =>
          !category || t.category === category
        ),
        total: templates.length
      })
    }

    // Action 2: 템플릿 상세 정보 조회
    if (action === 'template-details') {
      if (!templateId) {
        return NextResponse.json(
          { error: '템플릿 ID가 필요합니다.' },
          { status: 400 }
        )
      }

      // TODO: Implement actual Canva MCP template details
      const templateDetails = {
        id: templateId,
        name: '비즈니스 제안서 - 모던',
        slides: [
          {
            number: 1,
            type: 'title_slide',
            fields: ['title', 'subtitle', 'company'],
            preview: '/slides/slide-1.jpg'
          },
          {
            number: 2,
            type: 'problem_slide',
            fields: ['heading', 'bullet_points'],
            preview: '/slides/slide-2.jpg'
          },
          {
            number: 3,
            type: 'solution_slide',
            fields: ['heading', 'description', 'image'],
            preview: '/slides/slide-3.jpg'
          }
        ],
        totalSlides: 15,
        estimatedTime: '15분'
      }

      return NextResponse.json({
        success: true,
        template: templateDetails
      })
    }

    // Action 3: 콘텐츠 매핑 및 적용
    if (action === 'apply') {
      if (!templateId || !content || !mapping) {
        return NextResponse.json(
          { error: '템플릿 ID, 콘텐츠, 매핑 정보가 모두 필요합니다.' },
          { status: 400 }
        )
      }

      // TODO: Implement actual Canva MCP content application
      const result = {
        success: true,
        message: '콘텐츠가 성공적으로 적용되었습니다.',
        slides: mapping.map((m: any, idx: number) => ({
          number: idx + 1,
          type: m.slideType,
          applied: true,
          preview: `/slides/applied-${idx + 1}.jpg`
        })),
        downloadUrl: '/api/proposal/download/imported-proposal.pptx',
        estimatedTime: '10분'
      }

      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: '올바른 액션을 지정해주세요.' },
      { status: 400 }
    )

  } catch (error) {
    console.error('임포트 오류:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
