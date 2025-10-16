import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { spawn } from 'child_process'

// HWP 추출을 위한 헬퍼 함수
async function extractHWP(hwpPath: string, action: string = 'extract') {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      '..',
      'src',
      'integrations',
      'hwp-extractor.js'
    )

    // Node.js로 hwp-extractor 실행
    const proc = spawn('node', ['-e', `
      const { createHWPExtractor } = require('${scriptPath.replace(/\\/g, '\\\\')}');
      const extractor = createHWPExtractor({ verbose: true });

      (async () => {
        try {
          // 서비스 시작
          const started = await extractor.startService();
          if (!started) {
            throw new Error('Failed to start HWP Parser service');
          }

          let result;
          if ('${action}' === 'extract') {
            result = await extractor.extractFromHWP('${hwpPath.replace(/\\/g, '\\\\')}');
          } else if ('${action}' === 'to-text') {
            result = await extractor.extractToTextFile('${hwpPath.replace(/\\/g, '\\\\')}');
          }

          // 서비스 중지
          extractor.stopService();

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

    // 타임아웃 설정 (HWP 서비스 시작 시간 포함)
    setTimeout(() => {
      proc.kill()
      reject(new Error('HWP extraction timeout'))
    }, 60000) // 60초
  })
}

// HWP 서비스 상태 확인
async function checkServiceHealth() {
  try {
    const response = await fetch('http://localhost:5001/health', {
      method: 'GET',
      signal: AbortSignal.timeout(1000)
    })
    const data = await response.json()
    return data.status === 'ok'
  } catch (error) {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const action = formData.get('action') as string || 'extract'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // HWP 파일 확인
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.hwp') && !fileName.endsWith('.hwpx')) {
      return NextResponse.json(
        { success: false, error: 'Only HWP/HWPX files are supported' },
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
      // HWP 추출 실행
      const result = await extractHWP(tmpFilePath, action)

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

// HWP 서비스 상태 확인 엔드포인트
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'health') {
      const isHealthy = await checkServiceHealth()
      return NextResponse.json({
        success: true,
        serviceRunning: isHealthy,
        serviceUrl: 'http://localhost:5001'
      })
    }

    // 디렉토리 스캔 (일괄 처리용)
    const directory = searchParams.get('directory')
    if (directory) {
      const { readdir } = await import('fs/promises')
      const files = await readdir(directory)
      const hwpFiles = files.filter(file => {
        const lower = file.toLowerCase()
        return lower.endsWith('.hwp') || lower.endsWith('.hwpx')
      })

      return NextResponse.json({
        success: true,
        files: hwpFiles,
        directory
      })
    }

    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
