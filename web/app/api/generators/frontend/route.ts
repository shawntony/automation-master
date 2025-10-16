import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { schemaFile, projectName, uiLibrary, realtime, autoSetup } = body

    const ssaPath = path.join(process.cwd(), '..', '..', 'ssa')
    const scriptPath = path.join(ssaPath, 'src', 'frontend-generator', 'cli.js')

    const args = []
    if (schemaFile) args.push('--file', schemaFile)
    if (projectName) args.push('--name', `"${projectName}"`)
    if (uiLibrary) args.push('--ui', uiLibrary)
    if (realtime) args.push('--realtime')
    if (autoSetup) args.push('--auto-setup')

    const result = await runSSACommand(scriptPath, args, ssaPath)

    return NextResponse.json({
      success: true,
      message: 'React/Next.js 프론트엔드가 성공적으로 생성되었습니다!',
      output: result.output
    })
  } catch (error: any) {
    console.error('Frontend generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate frontend'
      },
      { status: 500 }
    )
  }
}

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
