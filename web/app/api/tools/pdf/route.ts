import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { spawn } from 'child_process'

// PDF 추출을 위한 헬퍼 함수
async function extractPDF(pdfPath: string, action: string = 'analyze') {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      '..',
      'src',
      'integrations',
      'pdf-extractor.js'
    )

    // Node.js로 pdf-extractor 실행
    const proc = spawn('node', ['-e', `
      const { createPDFExtractor } = require('${scriptPath.replace(/\\/g, '\\\\')}');
      const extractor = createPDFExtractor({ verbose: true });

      (async () => {
        try {
          let result;
          if ('${action}' === 'analyze') {
            result = await extractor.extractFromPDF('${pdfPath.replace(/\\/g, '\\\\')}');
          } else if ('${action}' === 'preview') {
            result = await extractor.previewPDF('${pdfPath.replace(/\\/g, '\\\\')}');
          } else if ('${action}' === 'detect') {
            result = await extractor.detectType('${pdfPath.replace(/\\/g, '\\\\')}');
          }
          console.log(JSON.stringify(result));
        } catch (error) {
          console.error(JSON.stringify({ success: false, error: error.message }));
        }
      })();
    `], { shell: true })

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
          // 마지막 JSON 라인 추출
          const lines = output.trim().split('\n')
          const jsonLine = lines[lines.length - 1]
          const result = JSON.parse(jsonLine)
          resolve(result)
        } catch (error) {
          reject(new Error(`Failed to parse output: ${output}`))
        }
      } else {
        reject(new Error(errorOutput || `Process exited with code ${code}`))
      }
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const action = formData.get('action') as string || 'analyze'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // 임시 디렉토리 생성
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true })
    }

    // 파일을 임시 디렉토리에 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tmpFilePath = path.join(tmpDir, file.name)
    await writeFile(tmpFilePath, buffer)

    try {
      // PDF 추출 실행
      const result = await extractPDF(tmpFilePath, action)

      // 임시 파일 삭제
      await unlink(tmpFilePath)

      return NextResponse.json({
        success: true,
        data: result,
        filename: file.name
      })
    } catch (error: any) {
      // 임시 파일 삭제
      try {
        await unlink(tmpFilePath)
      } catch (e) {
        // 파일 삭제 실패는 무시
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 일괄 처리를 위한 GET 엔드포인트 (디렉토리 스캔)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const directory = searchParams.get('directory')

    if (!directory) {
      return NextResponse.json(
        { success: false, error: 'No directory provided' },
        { status: 400 }
      )
    }

    // 디렉토리 내 PDF 파일 목록 반환
    const { readdir } = await import('fs/promises')
    const files = await readdir(directory)
    const pdfFiles = files.filter(file =>
      file.toLowerCase().endsWith('.pdf')
    )

    return NextResponse.json({
      success: true,
      files: pdfFiles,
      directory
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
