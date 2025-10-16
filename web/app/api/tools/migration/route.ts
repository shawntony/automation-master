import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

// Google Sheets 구조 분석 (마이그레이션하지 않음)
async function runAnalysis(spreadsheetId: string, sheetName?: string) {
  return new Promise((resolve, reject) => {
    const ssaPath = path.join(process.cwd(), '..', '..', 'ssa')
    const scriptPath = path.join(ssaPath, 'analyze_migration.js')

    const args = sheetName
      ? [scriptPath, spreadsheetId, sheetName]
      : [scriptPath, spreadsheetId]

    const proc = spawn('node', args, {
      cwd: ssaPath,
      shell: true
    })

    let output = ''
    let errorOutput = ''

    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          // JSON 파싱
          const analysis = JSON.parse(output)
          resolve(analysis)
        } catch (parseError: any) {
          reject(new Error(`Failed to parse analysis result: ${parseError.message}`))
        }
      } else {
        reject(new Error(errorOutput || `Process exited with code ${code}`))
      }
    })

    // 타임아웃 설정 (2분)
    setTimeout(() => {
      proc.kill()
      reject(new Error('Analysis timeout (2 minutes)'))
    }, 120000)
  })
}

// Google Sheets 마이그레이션 실행
async function runMigration(spreadsheetId?: string) {
  return new Promise((resolve, reject) => {
    const ssaPath = path.join(process.cwd(), '..', '..', 'ssa')
    const scriptPath = path.join(ssaPath, 'migrate_to_normalized_tables.js')

    const args = spreadsheetId ? [scriptPath, spreadsheetId] : [scriptPath]

    const proc = spawn('node', args, {
      cwd: ssaPath,
      shell: true
    })

    let output = ''
    let errorOutput = ''

    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          output,
          message: '마이그레이션이 성공적으로 완료되었습니다'
        })
      } else {
        reject(new Error(errorOutput || `Process exited with code ${code}`))
      }
    })

    // 타임아웃 설정 (5분)
    setTimeout(() => {
      proc.kill()
      reject(new Error('Migration timeout (5 minutes)'))
    }, 300000)
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { spreadsheetId, action, sheetName } = body

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'Spreadsheet ID is required' },
        { status: 400 }
      )
    }

    // 액션에 따라 분석 또는 마이그레이션 실행
    if (action === 'analyze') {
      // 구조 분석만 수행
      const result = await runAnalysis(spreadsheetId, sheetName)
      return NextResponse.json(result)
    } else {
      // 전체 마이그레이션 실행
      const result = await runMigration(spreadsheetId)
      return NextResponse.json(result)
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 마이그레이션 상태 확인 (선택사항)
export async function GET(request: NextRequest) {
  try {
    // Supabase 연결 상태 확인
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'check-env') {
      // 환경 변수 확인
      const hasGoogleCreds = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? true : false
      const hasSupabase = process.env.SUPABASE_URL ? true : false

      return NextResponse.json({
        success: true,
        environment: {
          googleCredentials: hasGoogleCreds,
          supabaseConfig: hasSupabase,
          ready: hasGoogleCreds && hasSupabase
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Migration API is ready'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
