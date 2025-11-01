import { NextRequest, NextResponse } from 'next/server'
import { loadProgress } from '@/lib/progress-storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectPath } = body

    if (!projectPath) {
      return NextResponse.json(
        { success: false, error: 'Project path is required' },
        { status: 400 }
      )
    }

    const result = await loadProgress(projectPath)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Progress file not found' ? 404 : 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Load progress API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
