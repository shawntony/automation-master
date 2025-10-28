import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

/**
 * clasp login 실행 (OAuth 인증 시작)
 * POST /api/ssa/clasp/login
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[clasp-login] Starting clasp login...')

    // clasp login 명령어 실행
    // 이 명령어는 자동으로 브라우저를 열어 Google OAuth 인증 페이지로 이동하고
    // 사용자가 인증을 완료할 때까지 기다립니다
    const { stdout, stderr } = await execPromise('clasp login', {
      timeout: 120000, // 2분 타임아웃 (사용자가 브라우저에서 인증할 시간)
      windowsHide: false // Windows에서 콘솔 창 표시
    })

    console.log('[clasp-login] stdout:', stdout)
    console.log('[clasp-login] stderr:', stderr)

    // 성공 메시지 확인
    if (stdout.includes('Authorization successful') ||
        stdout.includes('Logged in') ||
        stdout.includes('logged in')) {
      console.log('[clasp-login] ✓ Login successful')
      return NextResponse.json({
        success: true,
        message: '로그인이 완료되었습니다'
      })
    }

    // 일반적으로 여기까지 오면 성공한 것으로 간주
    console.log('[clasp-login] Login command completed, assuming success')
    return NextResponse.json({
      success: true,
      waiting: true,
      message: '브라우저에서 인증을 완료했습니다'
    })

  } catch (error: any) {
    console.error('[clasp-login] Error:', error)

    // 타임아웃은 정상적인 경우일 수 있음 (브라우저에서 인증 중)
    if (error.killed && error.signal === 'SIGTERM') {
      console.log('[clasp-login] Timeout - user may still be authenticating')
      return NextResponse.json({
        success: true,
        waiting: true,
        message: '브라우저에서 Google 계정으로 로그인해주세요'
      })
    }

    // 에러 메시지 파싱
    let errorMessage = error.message || 'clasp login 실행 중 오류가 발생했습니다'
    let suggestions: string[] = []

    if (error.stderr) {
      errorMessage = error.stderr

      if (errorMessage.includes('clasp: command not found')) {
        suggestions.push('clasp가 설치되지 않았습니다')
        suggestions.push('터미널에서 "npm install -g @google/clasp"를 실행하세요')
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      },
      { status: 500 }
    )
  }
}
