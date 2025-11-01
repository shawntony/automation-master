import { NextRequest, NextResponse } from 'next/server'
import { ProjectCreator } from '../../../../src/utils/project-creator.js'
import type { PrdOptions } from '../../../types/prd'

interface CreateProjectRequest {
  projectName: string
  projectType: 'fullstack' | 'frontend' | 'backend' | 'automation'
  prdOptions?: PrdOptions
}

/**
 * 프로젝트 생성 API
 *
 * POST /api/create-project
 *
 * 새로운 프로젝트 폴더를 생성하고 필요한 파일들을 복사/생성합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectRequest = await request.json()
    const { projectName, projectType, prdOptions } = body

    // Validation
    if (!projectName || !projectName.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: '프로젝트 이름을 입력해주세요'
        },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
      return NextResponse.json(
        {
          success: false,
          message:
            '프로젝트 이름은 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다'
        },
        { status: 400 }
      )
    }

    if (!['fullstack', 'frontend', 'backend', 'automation'].includes(projectType)) {
      return NextResponse.json(
        {
          success: false,
          message: '올바른 프로젝트 타입을 선택해주세요'
        },
        { status: 400 }
      )
    }

    // Create project using ProjectCreator with PRD options
    const creator = new ProjectCreator()
    const result = await creator.createProject(
      projectName.trim(),
      projectType,
      prdOptions
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        projectPath: result.projectPath,
        prdPath: result.prdPath,
        message: '프로젝트가 성공적으로 생성되었습니다'
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || '프로젝트 생성에 실패했습니다'
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('프로젝트 생성 API 오류:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || '처리 중 오류가 발생했습니다'
      },
      { status: 500 }
    )
  }
}

/**
 * GET 요청 처리 (선택사항)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: '프로젝트 생성은 POST 요청을 사용하세요',
    endpoint: '/api/create-project',
    method: 'POST',
    body: {
      projectName: 'string (영문, 숫자, -, _ 만 사용)',
      projectType: 'fullstack | frontend | backend | automation',
      prdOptions: {
        method: 'file | idea | form | skip',
        fileUpload: {
          fileName: 'string',
          content: 'string (markdown content)'
        },
        ideaInput: {
          idea: 'string (프로젝트 아이디어)'
        },
        formData: {
          purpose: 'string (필수)',
          background: 'string (선택)',
          features: 'string[] (필수)',
          targetUsers: 'string (필수)',
          techStack: 'string[] (필수)',
          successMetrics: 'string (선택)',
          constraints: 'string (선택)'
        }
      }
    }
  })
}
