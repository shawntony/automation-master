import { NextResponse } from 'next/server'
import Storage from '@/lib/storage'

// GET: 진행 상황 조회
export async function GET() {
  try {

    const storage = new Storage()
    const progress = await storage.loadProgress()

    return NextResponse.json({
      success: true,
      progress
    })
  } catch (error: any) {
    console.error('Progress load error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load progress' },
      { status: 500 }
    )
  }
}

// POST: 단계 완료 처리
export async function POST(request: Request) {
  try {
    const { stepNumber, action } = await request.json()
    const storage = new Storage()

    if (action === 'start') {
      await storage.startStep(stepNumber)
    } else if (action === 'complete') {
      await storage.completeStep(stepNumber)
    }

    const progress = await storage.loadProgress()

    return NextResponse.json({
      success: true,
      progress
    })
  } catch (error: any) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update progress' },
      { status: 500 }
    )
  }
}
