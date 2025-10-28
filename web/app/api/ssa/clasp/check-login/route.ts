import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const execPromise = promisify(exec)

/**
 * clasp 로그인 상태 확인
 * GET /api/ssa/clasp/check-login
 */
export async function GET(request: NextRequest) {
  try {
    // .clasprc.json 파일 확인 (가장 신뢰할 수 있는 방법)
    const clasprcPath = join(homedir(), '.clasprc.json')

    console.log('[check-login] Checking .clasprc.json at:', clasprcPath)
    console.log('[check-login] File exists:', existsSync(clasprcPath))

    if (existsSync(clasprcPath)) {
      try {
        const clasprcContent = readFileSync(clasprcPath, 'utf-8')
        const clasprc = JSON.parse(clasprcContent)

        console.log('[check-login] clasprc structure:', {
          hasToken: !!clasprc.token,
          hasTokens: !!clasprc.tokens,
          tokenKeys: clasprc.token ? Object.keys(clasprc.token) : [],
          tokensKeys: clasprc.tokens ? Object.keys(clasprc.tokens) : []
        })

        // Check for both "token" and "tokens" structure
        let accessToken = null
        let email = null

        // Try "token" (singular) structure
        if (clasprc.token && clasprc.token.access_token) {
          accessToken = clasprc.token.access_token
          email = clasprc.token.email
        }
        // Try "tokens" (plural) structure
        else if (clasprc.tokens && clasprc.tokens.default && clasprc.tokens.default.access_token) {
          accessToken = clasprc.tokens.default.access_token
          email = clasprc.tokens.default.email
        }

        if (accessToken) {
          console.log('[check-login] ✓ Login detected via .clasprc.json')
          return NextResponse.json({
            loggedIn: true,
            method: 'clasprc-file',
            email: email || 'unknown',
            message: '로그인되어 있습니다'
          })
        } else {
          console.log('[check-login] ✗ No valid access_token in .clasprc.json')
        }
      } catch (parseError) {
        console.error('[check-login] .clasprc.json 파싱 오류:', parseError)
      }
    }

    // 로그인되지 않음
    return NextResponse.json({
      loggedIn: false,
      message: 'clasp에 로그인되어 있지 않습니다',
      instructions: [
        '터미널에서 다음 명령어를 실행하세요:',
        '  clasp login',
        '',
        '브라우저가 열리면 Google 계정으로 로그인하고 권한을 승인하세요.'
      ].join('\n')
    })

  } catch (error: any) {
    console.error('로그인 확인 오류:', error)

    // clasp이 설치되지 않은 경우
    if (error.message && error.message.includes('clasp')) {
      return NextResponse.json({
        loggedIn: false,
        claspNotInstalled: true,
        message: 'clasp이 설치되어 있지 않습니다',
        instructions: [
          'clasp을 설치하려면 터미널에서 다음 명령어를 실행하세요:',
          '  npm install -g @google/clasp',
          '',
          '설치 후 로그인하세요:',
          '  clasp login'
        ].join('\n')
      }, { status: 200 }) // 200으로 반환 (에러가 아닌 상태 정보)
    }

    return NextResponse.json(
      {
        error: error.message || '로그인 상태 확인 중 오류가 발생했습니다',
        loggedIn: false
      },
      { status: 500 }
    )
  }
}
