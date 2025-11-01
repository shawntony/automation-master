import { NextRequest, NextResponse } from 'next/server'
import { hasProgress } from '@/lib/progress-storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectPath } = body

    if (!projectPath) {
      return NextResponse.json(
        { exists: false, error: 'Project path is required' },
        { status: 400 }
      )
    }

    const exists = await hasProgress(projectPath)

    return NextResponse.json({ exists })
  } catch (error) {
    console.error('Has progress API error:', error)
    return NextResponse.json(
      {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
