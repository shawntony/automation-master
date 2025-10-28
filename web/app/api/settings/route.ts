import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      googleServiceAccountEmail,
      googleServiceAccountPrivateKey,
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceKey
    } = body

    // .env.local 파일 경로 (프로젝트 루트의 web 디렉토리)
    const envPath = join(process.cwd(), '.env.local')

    // 기존 .env.local 내용 읽기 (있다면)
    let existingEnv = ''
    if (existsSync(envPath)) {
      existingEnv = readFileSync(envPath, 'utf-8')
    }

    // 환경 변수 생성
    const envContent = `# AutomationMaster Environment Variables
# Generated on ${new Date().toLocaleString('ko-KR')}

# Google Sheets API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL="${googleServiceAccountEmail || ''}"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="${googleServiceAccountPrivateKey || ''}"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="${supabaseUrl || ''}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${supabaseAnonKey || ''}"
SUPABASE_SERVICE_ROLE_KEY="${supabaseServiceKey || ''}"
`

    // 파일 저장
    writeFileSync(envPath, envContent, 'utf-8')

    return NextResponse.json({
      success: true,
      message: '환경 변수가 .env.local 파일에 저장되었습니다. 서버를 재시작해주세요.',
      path: envPath
    })
  } catch (error: any) {
    console.error('Failed to save environment variables:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '환경 변수 저장에 실패했습니다'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 현재 환경 변수 상태 확인
    const config = {
      googleSheets: {
        configured: !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '설정됨' : '미설정',
        privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ? '설정됨' : '미설정'
      },
      supabase: {
        configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '미설정',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '미설정'
      }
    }

    return NextResponse.json({
      success: true,
      config,
      overall: config.googleSheets.configured && config.supabase.configured
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
