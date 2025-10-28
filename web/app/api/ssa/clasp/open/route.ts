import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const execPromise = promisify(exec)

/**
 * clasp open 실행 (브라우저에서 Apps Script 열기)
 * POST /api/ssa/clasp/open
 */
export async function POST(request: NextRequest) {
  try {
    const { projectPath } = await request.json()

    if (!projectPath) {
      return NextResponse.json(
        { error: '프로젝트 경로가 필요합니다' },
        { status: 400 }
      )
    }

    // 프로젝트 경로 확인
    if (!existsSync(projectPath)) {
      return NextResponse.json(
        { error: '프로젝트 폴더가 존재하지 않습니다' },
        { status: 404 }
      )
    }

    // .clasp.json에서 scriptId 가져오기
    const claspJsonPath = join(projectPath, '.clasp.json')
    if (!existsSync(claspJsonPath)) {
      return NextResponse.json(
        { error: 'clasp create을 먼저 실행해주세요' },
        { status: 400 }
      )
    }

    let scriptId: string
    try {
      const claspJson = JSON.parse(readFileSync(claspJsonPath, 'utf-8'))
      scriptId = claspJson.scriptId

      if (!scriptId) {
        throw new Error('scriptId가 없습니다')
      }
    } catch (err) {
      return NextResponse.json(
        { error: '.clasp.json 파일을 읽을 수 없습니다' },
        { status: 500 }
      )
    }

    // Apps Script URL 생성
    const scriptUrl = `https://script.google.com/d/${scriptId}/edit`

    // clasp open 실행 (백그라운드, 에러 무시)
    try {
      execPromise('clasp open', {
        cwd: projectPath,
        timeout: 5000
      }).catch(() => {
        // 브라우저 열기 실패는 무시 (URL만 반환)
      })
    } catch (err) {
      // 백그라운드 실행이므로 에러 무시
    }

    return NextResponse.json({
      success: true,
      message: 'Apps Script 에디터를 열 수 있습니다',
      scriptId,
      scriptUrl,
      instructions: '아래 URL을 클릭하거나 복사하여 브라우저에서 열어주세요'
    })

  } catch (error: any) {
    console.error('clasp open 오류:', error)

    return NextResponse.json(
      {
        error: error.message || 'clasp open 실행 중 오류가 발생했습니다'
      },
      { status: 500 }
    )
  }
}
