import { NextResponse } from 'next/server'
const Storage = require('@/lib/storage')

export async function POST(request: Request) {
  try {
    const { projectName } = await request.json()

    if (!projectName || typeof projectName !== 'string') {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const storage = new Storage()

    // 프로젝트 이름 설정
    await storage.setProjectName(projectName)

    // 진행 상황 로드
    const progress = await storage.loadProgress()

    return NextResponse.json({
      success: true,
      projectName,
      progress
    })
  } catch (error: any) {
    console.error('Project creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    )
  }
}
