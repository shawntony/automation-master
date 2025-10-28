import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Apps Script 프로젝트를 로컬에 저장
 * POST /api/ssa/deploy
 */
export async function POST(request: NextRequest) {
  try {
    const { files, projectName, spreadsheetId, spreadsheetTitle, analysis } = await request.json()

    if (!files || !projectName) {
      return NextResponse.json(
        { error: '파일 데이터와 프로젝트명이 필요합니다' },
        { status: 400 }
      )
    }

    // 프로젝트 저장 경로: web/projects/{projectName}
    const projectPath = join(process.cwd(), 'projects', sanitizeProjectName(projectName))

    // 디렉토리 생성 (이미 존재하면 에러)
    if (existsSync(projectPath)) {
      return NextResponse.json(
        { error: '같은 이름의 프로젝트가 이미 존재합니다' },
        { status: 409 }
      )
    }

    mkdirSync(projectPath, { recursive: true })

    // 모든 파일 저장
    let savedFiles: string[] = []
    Object.entries(files).forEach(([filePath, content]) => {
      // 디렉토리 구조 제거 (Core/Main.gs → Main.gs)
      const fileName = filePath.split('/').pop() || filePath
      const fullPath = join(projectPath, fileName)
      writeFileSync(fullPath, content as string, 'utf-8')
      savedFiles.push(fileName)
    })

    // appsscript.json 추가
    const appsscriptJson = {
      timeZone: 'Asia/Seoul',
      dependencies: {},
      exceptionLogging: 'STACKDRIVER',
      runtimeVersion: 'V8',
      oauthScopes: [
        'https://www.googleapis.com/auth/spreadsheets.currentonly',
        'https://www.googleapis.com/auth/script.container.ui'
      ]
    }
    writeFileSync(
      join(projectPath, 'appsscript.json'),
      JSON.stringify(appsscriptJson, null, 2),
      'utf-8'
    )
    savedFiles.push('appsscript.json')

    // 프로젝트 메타데이터 저장
    const metadata = {
      name: projectName,
      spreadsheetId: spreadsheetId || null,
      spreadsheetTitle: spreadsheetTitle || null,
      type: spreadsheetId ? 'sheets' : 'standalone',
      createdAt: new Date().toISOString(),
      files: savedFiles,
      analysis: analysis || null
    }
    writeFileSync(
      join(projectPath, 'project.json'),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    )

    return NextResponse.json({
      success: true,
      message: '프로젝트가 저장되었습니다',
      projectPath,
      projectName: sanitizeProjectName(projectName),
      metadata
    })

  } catch (error: any) {
    console.error('프로젝트 저장 오류:', error)
    return NextResponse.json(
      { error: error.message || '프로젝트 저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * 프로젝트명 정리 (파일시스템 안전)
 */
function sanitizeProjectName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9가-힣\s-_]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
}
