import { NextRequest, NextResponse } from 'next/server'
import { saveProgress } from '@/lib/progress-storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectPath, state } = body

    if (!projectPath) {
      return NextResponse.json(
        { success: false, error: 'Project path is required' },
        { status: 400 }
      )
    }

    if (!state) {
      return NextResponse.json(
        { success: false, error: 'State is required' },
        { status: 400 }
      )
    }

    const result = await saveProgress(projectPath, state)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Save progress API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
