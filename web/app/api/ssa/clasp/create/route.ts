import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const execPromise = promisify(exec)

/**
 * clasp create 실행
 * POST /api/ssa/clasp/create
 */
export async function POST(request: NextRequest) {
  try {
    const { projectPath, projectName, projectType, parentId } = await request.json()

    if (!projectPath || !projectName) {
      return NextResponse.json(
        { error: '프로젝트 경로와 이름이 필요합니다' },
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

    // clasp create 명령어 구성
    let command = `clasp create --title "${projectName}" --type ${projectType || 'standalone'}`

    // Sheets 타입이고 parentId가 있으면 추가
    if (projectType === 'sheets' && parentId) {
      command += ` --parentId "${parentId}"`
    }

    // 명령어 실행
    const { stdout, stderr } = await execPromise(command, {
      cwd: projectPath,
      timeout: 30000
    })

    // .clasp.json 파일 읽기 (생성된 scriptId 확인)
    const claspJsonPath = join(projectPath, '.clasp.json')
    let scriptId = null

    if (existsSync(claspJsonPath)) {
      try {
        const claspJson = JSON.parse(readFileSync(claspJsonPath, 'utf-8'))
        scriptId = claspJson.scriptId

        // project.json 업데이트
        const projectJsonPath = join(projectPath, 'project.json')
        if (existsSync(projectJsonPath)) {
          const projectData = JSON.parse(readFileSync(projectJsonPath, 'utf-8'))
          projectData.scriptId = scriptId
          projectData.deployedAt = new Date().toISOString()
          writeFileSync(projectJsonPath, JSON.stringify(projectData, null, 2), 'utf-8')
        }
      } catch (err) {
        console.error('.clasp.json 파싱 오류:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Apps Script 프로젝트가 생성되었습니다',
      scriptId,
      output: stdout,
      command
    })

  } catch (error: any) {
    console.error('clasp create 오류:', error)

    // 에러 메시지 파싱
    let errorMessage = error.message || 'clasp create 실행 중 오류가 발생했습니다'
    let suggestions: string[] = []

    if (error.stderr) {
      errorMessage = error.stderr

      // 일반적인 에러 케이스별 안내
      if (errorMessage.includes('not logged in')) {
        suggestions.push('clasp에 로그인되어 있지 않습니다')
        suggestions.push('터미널에서 "clasp login"을 실행하세요')
      } else if (errorMessage.includes('permission')) {
        suggestions.push('Apps Script API가 활성화되지 않았을 수 있습니다')
        suggestions.push('https://script.google.com/home/usersettings 에서 API를 활성화하세요')
      } else if (errorMessage.includes('quota')) {
        suggestions.push('API 할당량을 초과했습니다')
        suggestions.push('잠시 후 다시 시도하세요')
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        command: error.cmd
      },
      { status: 500 }
    )
  }
}
