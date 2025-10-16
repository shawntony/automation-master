import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { schemaFile, projectName, autoSetup, deploy, wizard } = body

    // SSA fullstack generator 경로
    const ssaPath = path.join(process.cwd(), '..', '..', 'ssa')
    const scriptPath = path.join(ssaPath, 'src', 'fullstack-generator', 'masterCli.js')

    const args = ['generate']

    if (wizard) {
      args.push('--wizard')
    } else {
      if (schemaFile) args.push(schemaFile)
      if (projectName) args.push(`"${projectName}"`)
      if (autoSetup) args.push('--auto-setup')
      if (deploy) args.push('--deploy')
    }

    // SSA 생성기 실행
    const result = await runSSACommand(scriptPath, args, ssaPath)

    return NextResponse.json({
      success: true,
      message: '풀스택 애플리케이션이 성공적으로 생성되었습니다!',
      output: result.output
    })
  } catch (error: any) {
    console.error('Fullstack generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate fullstack app'
      },
      { status: 500 }
    )
  }
}

// SSA 명령어 실행 헬퍼 함수
function runSSACommand(scriptPath: string, args: string[], cwd: string): Promise<{ output: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath, ...args], {
      cwd,
      shell: true
    })

    let output = ''
    let errorOutput = ''

    child.stdout.on('data', (data) => {
      output += data.toString()
    })

    child.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}: ${errorOutput}`))
      } else {
        resolve({ output })
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}
