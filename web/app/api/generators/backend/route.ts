import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { codeFile, projectName, securityLevel, realtime, performance } = body

    const ssaPath = path.join(process.cwd(), '..', '..', 'ssa')
    const scriptPath = path.join(ssaPath, 'backend-generator.js')

    const args = []
    if (codeFile) args.push('--file', codeFile)
    if (projectName) args.push('--name', `"${projectName}"`)
    if (securityLevel) args.push('--security', securityLevel)
    if (realtime) args.push('--realtime')
    if (performance) args.push('--performance')

    const result = await runSSACommand(scriptPath, args, ssaPath)

    return NextResponse.json({
      success: true,
      message: 'Supabase 백엔드가 성공적으로 생성되었습니다!',
      output: result.output
    })
  } catch (error: any) {
    console.error('Backend generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate backend'
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
