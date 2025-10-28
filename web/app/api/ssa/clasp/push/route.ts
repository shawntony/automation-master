import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const execPromise = promisify(exec)

/**
 * clasp push 실행
 * POST /api/ssa/clasp/push
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

    // .clasp.json 파일 확인 (scriptId가 있어야 함)
    const claspJsonPath = join(projectPath, '.clasp.json')
    if (!existsSync(claspJsonPath)) {
      return NextResponse.json(
        { error: 'clasp create을 먼저 실행해주세요 (.clasp.json이 없습니다)' },
        { status: 400 }
      )
    }

    // clasp push 실행
    const { stdout, stderr } = await execPromise('clasp push', {
      cwd: projectPath,
      timeout: 60000 // 1분 타임아웃
    })

    // project.json 업데이트
    const projectJsonPath = join(projectPath, 'project.json')
    if (existsSync(projectJsonPath)) {
      try {
        const projectData = JSON.parse(readFileSync(projectJsonPath, 'utf-8'))
        projectData.lastPushedAt = new Date().toISOString()
        writeFileSync(projectJsonPath, JSON.stringify(projectData, null, 2), 'utf-8')
      } catch (err) {
        console.error('project.json 업데이트 오류:', err)
      }
    }

    // 업로드된 파일 목록 추출
    const uploadedFiles = stdout.match(/└─ (.+\.gs)/g)?.map(line => line.replace('└─ ', '').trim()) || []

    return NextResponse.json({
      success: true,
      message: '코드가 Apps Script에 업로드되었습니다',
      output: stdout,
      uploadedFiles
    })

  } catch (error: any) {
    console.error('clasp push 오류:', error)

    let errorMessage = error.message || 'clasp push 실행 중 오류가 발생했습니다'
    let suggestions: string[] = []

    if (error.stderr) {
      errorMessage = error.stderr

      if (errorMessage.includes('not logged in')) {
        suggestions.push('clasp에 로그인되어 있지 않습니다')
        suggestions.push('터미널에서 "clasp login"을 실행하세요')
      } else if (errorMessage.includes('No clasp project')) {
        suggestions.push('Apps Script 프로젝트가 생성되지 않았습니다')
        suggestions.push('먼저 "Create Project"를 실행하세요')
      } else if (errorMessage.includes('Push failed')) {
        suggestions.push('파일 업로드에 실패했습니다')
        suggestions.push('파일 문법 오류가 있는지 확인하세요')
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
