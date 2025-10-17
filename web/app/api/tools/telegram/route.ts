import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

// Global bot process reference
let botProcess: any = null

interface BotConfig {
  botToken?: string
  botPolling?: boolean
  adminChatId?: string
  spreadsheetId?: string
  defaultRecipients?: string
}

interface BotStatus {
  isRunning: boolean
  isConfigured: boolean
  servicesStatus: {
    googleSheets: boolean
    aiPredictor: boolean
    reportScheduler: boolean
  }
  lastUpdate: string
}

// Check if bot is configured
function checkConfiguration(): { configured: boolean; missing: string[] } {
  const missing: string[] = []

  if (!process.env.TELEGRAM_BOT_TOKEN) missing.push('TELEGRAM_BOT_TOKEN')
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) missing.push('GOOGLE_SERVICE_ACCOUNT')
  if (!process.env.SPREADSHEET_ID) missing.push('SPREADSHEET_ID')

  return {
    configured: missing.length === 0,
    missing
  }
}

// Check service statuses
function checkServiceStatuses() {
  return {
    googleSheets: !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
    aiPredictor: !!process.env.OPENAI_API_KEY,
    reportScheduler: true // Always available
  }
}

// GET: Check bot status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    if (action === 'status') {
      const configCheck = checkConfiguration()
      const servicesStatus = checkServiceStatuses()

      const status: BotStatus = {
        isRunning: botProcess !== null && !botProcess.killed,
        isConfigured: configCheck.configured,
        servicesStatus,
        lastUpdate: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        status,
        configMissing: configCheck.missing
      })
    }

    if (action === 'check-config') {
      const configCheck = checkConfiguration()
      return NextResponse.json({
        success: true,
        configured: configCheck.configured,
        missing: configCheck.missing
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Telegram bot GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST: Control bot (start, stop, test)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config, chatId, message } = body

    if (action === 'start') {
      // Check if bot is already running
      if (botProcess && !botProcess.killed) {
        return NextResponse.json({
          success: false,
          error: '봇이 이미 실행 중입니다.'
        })
      }

      // Validate configuration
      const botConfig = config as BotConfig
      if (!botConfig.botToken) {
        return NextResponse.json({
          success: false,
          error: '봇 토큰이 필요합니다.'
        })
      }

      // Set environment variables for bot
      if (botConfig.botToken) process.env.TELEGRAM_BOT_TOKEN = botConfig.botToken
      if (botConfig.botPolling !== undefined) process.env.BOT_POLLING = botConfig.botPolling.toString()
      if (botConfig.adminChatId) process.env.TELEGRAM_ADMIN_CHAT_ID = botConfig.adminChatId
      if (botConfig.spreadsheetId) process.env.SPREADSHEET_ID = botConfig.spreadsheetId
      if (botConfig.defaultRecipients) process.env.DEFAULT_RECIPIENTS = botConfig.defaultRecipients

      // Start bot process
      const ssaPath = path.resolve(process.cwd(), '..', 'ssa')
      const botScriptPath = path.join(ssaPath, 'src', 'telegram', 'runBot.js')

      // Check if bot script exists
      if (!fs.existsSync(botScriptPath)) {
        return NextResponse.json({
          success: false,
          error: `봇 스크립트를 찾을 수 없습니다: ${botScriptPath}`
        })
      }

      // Spawn bot process
      botProcess = spawn('node', [botScriptPath], {
        cwd: ssaPath,
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe']
      })

      // Capture output
      let startupOutput = ''

      botProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString()
        console.log('[Telegram Bot]', output)
        startupOutput += output
      })

      botProcess.stderr.on('data', (data: Buffer) => {
        const error = data.toString()
        console.error('[Telegram Bot Error]', error)
        startupOutput += error
      })

      botProcess.on('error', (error: Error) => {
        console.error('봇 프로세스 오류:', error)
        botProcess = null
      })

      botProcess.on('exit', (code: number) => {
        console.log(`봇 프로세스 종료됨 (코드: ${code})`)
        botProcess = null
      })

      // Wait for bot to initialize (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Check if bot is still running
      if (!botProcess || botProcess.killed) {
        return NextResponse.json({
          success: false,
          error: '봇 시작에 실패했습니다. 설정을 확인해주세요.',
          output: startupOutput
        })
      }

      return NextResponse.json({
        success: true,
        message: '텔레그램 봇이 시작되었습니다.',
        output: startupOutput
      })
    }

    if (action === 'stop') {
      if (!botProcess || botProcess.killed) {
        return NextResponse.json({
          success: false,
          error: '실행 중인 봇이 없습니다.'
        })
      }

      // Kill bot process
      botProcess.kill('SIGTERM')

      // Wait for process to terminate
      await new Promise(resolve => setTimeout(resolve, 1000))

      botProcess = null

      return NextResponse.json({
        success: true,
        message: '텔레그램 봇이 중지되었습니다.'
      })
    }

    if (action === 'test') {
      if (!chatId || !message) {
        return NextResponse.json({
          success: false,
          error: '채팅 ID와 메시지가 필요합니다.'
        })
      }

      // Check if bot is configured
      if (!process.env.TELEGRAM_BOT_TOKEN) {
        return NextResponse.json({
          success: false,
          error: '봇 토큰이 설정되지 않았습니다.'
        })
      }

      // Send test message using node-telegram-bot-api
      // This requires the package to be installed
      try {
        // Dynamic import to avoid errors if package is not installed
        const TelegramBot = require('node-telegram-bot-api')
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })

        await bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        })

        return NextResponse.json({
          success: true,
          message: '테스트 메시지가 전송되었습니다.'
        })
      } catch (error) {
        console.error('Test message error:', error)
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : '메시지 전송 실패'
        })
      }
    }

    return NextResponse.json({
      success: false,
      error: '잘못된 작업입니다.'
    }, { status: 400 })

  } catch (error) {
    console.error('Telegram bot POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE: Force stop bot
export async function DELETE(request: NextRequest) {
  try {
    if (botProcess && !botProcess.killed) {
      botProcess.kill('SIGKILL')
      botProcess = null

      return NextResponse.json({
        success: true,
        message: '봇이 강제 종료되었습니다.'
      })
    }

    return NextResponse.json({
      success: false,
      error: '실행 중인 봇이 없습니다.'
    })

  } catch (error) {
    console.error('Telegram bot DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
