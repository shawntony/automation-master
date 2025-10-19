'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { postData, getData, ApiError } from '@/lib/utils/api'
import { useToast } from '@/components/ui/toast'

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
  lastUpdate?: string
}

interface CommandInfo {
  command: string
  description: string
  usage?: string
  category: 'basic' | 'report' | 'ai' | 'system'
}

const commands: CommandInfo[] = [
  {
    command: '/start',
    description: '봇 시작 및 환영 메시지',
    usage: '/start',
    category: 'basic'
  },
  {
    command: '/help',
    description: '전체 명령어 도움말 표시',
    usage: '/help',
    category: 'basic'
  },
  {
    command: '/report',
    description: '실시간 매출 분석 리포트',
    usage: '/report',
    category: 'basic'
  },
  {
    command: '/predict',
    description: 'AI 기반 매출 예측 (30일)',
    usage: '/predict',
    category: 'ai'
  },
  {
    command: '/generate_report',
    description: 'PDF 리포트 생성 및 다운로드',
    usage: '/generate_report',
    category: 'report'
  },
  {
    command: '/send_report',
    description: '리포트 이메일 발송',
    usage: '/send_report user@example.com',
    category: 'report'
  },
  {
    command: '/schedule_report',
    description: '정기 리포트 스케줄 안내',
    usage: '/schedule_report',
    category: 'report'
  },
  {
    command: '/status',
    description: '시스템 상태 확인',
    usage: '/status',
    category: 'system'
  }
]

export default function TelegramBotPage() {
  const [config, setConfig] = useLocalStorage<BotConfig>('telegram-bot-config', {})
  const [status, setStatus] = useState<BotStatus>({
    isRunning: false,
    isConfigured: false,
    servicesStatus: {
      googleSheets: false,
      aiPredictor: false,
      reportScheduler: false
    }
  })
  const [loading, setLoading] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'config' | 'commands' | 'test' | 'logs'>('config')
  const { success: showSuccess, error: showError, warning: showWarning } = useToast()

  useEffect(() => {
    checkBotStatus()
  }, [])

  const saveConfig = () => {
    showSuccess('설정 저장', '설정이 저장되었습니다.')
  }

  const checkBotStatus = async () => {
    try {
      const data: any = await getData('/api/tools/telegram?action=status')
      if (data.success) {
        setStatus(data.status)
      }
    } catch (error) {
      console.error('상태 확인 실패:', error)
    }
  }

  const handleStartBot = async () => {
    if (!config.botToken) {
      showWarning('봇 토큰 필요', '봇 토큰을 먼저 설정해주세요.')
      return
    }

    setLoading(true)
    try {
      const data = await postData('/api/tools/telegram', {
        action: 'start',
        config
      })

      if (data.success) {
        showSuccess('봇 시작', '텔레그램 봇이 시작되었습니다!')
        await checkBotStatus()
      } else {
        showError('봇 시작 실패', data.error || '알 수 없는 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('봇 시작 실패:', error)
      showError('봇 시작 오류', error instanceof ApiError ? error.message : '봇 시작 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleStopBot = async () => {
    setLoading(true)
    try {
      const data = await postData('/api/tools/telegram', {
        action: 'stop'
      })

      if (data.success) {
        showSuccess('봇 중지', '텔레그램 봇이 중지되었습니다.')
        await checkBotStatus()
      } else {
        showError('봇 중지 실패', data.error || '알 수 없는 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('봇 중지 실패:', error)
      showError('봇 중지 오류', error instanceof ApiError ? error.message : '봇 중지 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestBot = async () => {
    if (!config.adminChatId) {
      showWarning('관리자 ID 필요', '관리자 채팅 ID를 먼저 설정해주세요.')
      return
    }

    if (!testMessage.trim()) {
      showWarning('메시지 필요', '테스트 메시지를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const data = await postData('/api/tools/telegram', {
        action: 'test',
        chatId: config.adminChatId,
        message: testMessage
      })

      setTestResult({
        success: data.success,
        message: data.success ? '메시지가 성공적으로 전송되었습니다.' : `전송 실패: ${data.error || '알 수 없는 오류'}`
      })

      if (data.success) {
        showSuccess('메시지 전송', '메시지가 성공적으로 전송되었습니다.')
      } else {
        showError('전송 실패', data.error || '알 수 없는 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('테스트 실패:', error)
      const errorMessage = error instanceof ApiError ? error.message : '테스트 중 오류가 발생했습니다.'
      setTestResult({
        success: false,
        message: `전송 실패: ${errorMessage}`
      })
      showError('테스트 오류', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleExportConfig = () => {
    const envContent = `# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="${config.botToken || ''}"
BOT_POLLING="${config.botPolling !== false}"
TELEGRAM_ADMIN_CHAT_ID="${config.adminChatId || ''}"
SPREADSHEET_ID="${config.spreadsheetId || ''}"
DEFAULT_RECIPIENTS="${config.defaultRecipients || ''}"
`

    const blob = new Blob([envContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.env.telegram'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showSuccess('파일 다운로드', '환경 변수 파일이 다운로드되었습니다.')
  }

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      basic: 'default',
      report: 'secondary',
      ai: 'outline',
      system: 'destructive'
    }
    return variants[category] || 'default'
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      basic: '기본',
      report: '리포트',
      ai: 'AI',
      system: '시스템'
    }
    return labels[category] || category
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📱 Telegram 봇 관리</h1>
          <p className="text-muted-foreground mt-1">
            실시간 알림 및 리포트 자동화를 위한 텔레그램 봇 설정
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={status.isRunning ? 'default' : 'destructive'}>
            {status.isRunning ? '🟢 실행 중' : '🔴 중지됨'}
          </Badge>
          <Badge variant={status.isConfigured ? 'default' : 'outline'}>
            {status.isConfigured ? '✅ 설정됨' : '⚙️ 미설정'}
          </Badge>
        </div>
      </div>

      {/* 상태 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 시스템 상태</CardTitle>
          <CardDescription>봇 및 연동 서비스 상태</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Telegram 봇</div>
              <div className="flex items-center space-x-2">
                <Badge variant={status.isRunning ? 'default' : 'destructive'}>
                  {status.isRunning ? '✅' : '❌'}
                </Badge>
                <span className="text-sm font-medium">
                  {status.isRunning ? '실행 중' : '중지됨'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Google Sheets</div>
              <div className="flex items-center space-x-2">
                <Badge variant={status.servicesStatus.googleSheets ? 'default' : 'outline'}>
                  {status.servicesStatus.googleSheets ? '✅' : '⚠️'}
                </Badge>
                <span className="text-sm font-medium">
                  {status.servicesStatus.googleSheets ? '연결됨' : '미연결'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">AI 예측</div>
              <div className="flex items-center space-x-2">
                <Badge variant={status.servicesStatus.aiPredictor ? 'default' : 'outline'}>
                  {status.servicesStatus.aiPredictor ? '✅' : '⚠️'}
                </Badge>
                <span className="text-sm font-medium">
                  {status.servicesStatus.aiPredictor ? '활성화' : '비활성화'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">리포트 생성</div>
              <div className="flex items-center space-x-2">
                <Badge variant={status.servicesStatus.reportScheduler ? 'default' : 'outline'}>
                  {status.servicesStatus.reportScheduler ? '✅' : '⚠️'}
                </Badge>
                <span className="text-sm font-medium">
                  {status.servicesStatus.reportScheduler ? '활성화' : '비활성화'}
                </span>
              </div>
            </div>
          </div>

          {status.lastUpdate && (
            <div className="mt-4 text-xs text-muted-foreground">
              마지막 업데이트: {new Date(status.lastUpdate).toLocaleString('ko-KR')}
            </div>
          )}

          <div className="mt-4 flex space-x-2">
            <Button onClick={checkBotStatus} variant="outline" size="sm">
              🔄 상태 새로고침
            </Button>
            {!status.isRunning ? (
              <Button onClick={handleStartBot} disabled={loading || !config.botToken} size="sm">
                {loading ? '시작 중...' : '▶️ 봇 시작'}
              </Button>
            ) : (
              <Button onClick={handleStopBot} disabled={loading} variant="destructive" size="sm">
                {loading ? '중지 중...' : '⏹️ 봇 중지'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'config' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ 설정
        </Button>
        <Button
          variant={activeTab === 'commands' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('commands')}
        >
          📋 명령어
        </Button>
        <Button
          variant={activeTab === 'test' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('test')}
        >
          🧪 테스트
        </Button>
      </div>

      {/* 설정 탭 */}
      {activeTab === 'config' && (
        <Card>
          <CardHeader>
            <CardTitle>⚙️ 봇 설정</CardTitle>
            <CardDescription>텔레그램 봇 토큰 및 환경 설정</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>💡 설정 안내</AlertTitle>
              <AlertDescription>
                1. <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary underline">@BotFather</a>에서 봇을 생성하고 토큰을 받으세요.
                <br />
                2. 봇 토큰을 아래에 입력하고 저장하세요.
                <br />
                3. 봇을 시작한 후 /start 명령어로 관리자 채팅 ID를 확인하세요.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="botToken">
                봇 토큰 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="botToken"
                type="password"
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={config.botToken || ''}
                onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                @BotFather에서 받은 봇 토큰 (숫자:영문자 형태)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminChatId">관리자 채팅 ID</Label>
              <Input
                id="adminChatId"
                placeholder="123456789"
                value={config.adminChatId || ''}
                onChange={(e) => setConfig({ ...config, adminChatId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                봇에게 /start 명령을 보낸 후 콘솔에서 확인 가능
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spreadsheetId">Google 스프레드시트 ID</Label>
              <Input
                id="spreadsheetId"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={config.spreadsheetId || ''}
                onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                매출 데이터가 있는 스프레드시트 ID (URL의 /d/ 다음 부분)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultRecipients">기본 수신자 이메일</Label>
              <Input
                id="defaultRecipients"
                placeholder="user1@example.com,user2@example.com"
                value={config.defaultRecipients || ''}
                onChange={(e) => setConfig({ ...config, defaultRecipients: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                정기 리포트 수신자 (쉼표로 구분)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="botPolling"
                checked={config.botPolling !== false}
                onChange={(e) => setConfig({ ...config, botPolling: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="botPolling" className="cursor-pointer">
                폴링 모드 활성화 (권장)
              </Label>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={saveConfig}>
                💾 설정 저장
              </Button>
              <Button onClick={handleExportConfig} variant="outline">
                📥 .env 파일 내보내기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 명령어 탭 */}
      {activeTab === 'commands' && (
        <Card>
          <CardHeader>
            <CardTitle>📋 사용 가능한 명령어</CardTitle>
            <CardDescription>텔레그램 봇이 지원하는 모든 명령어 목록</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commands.map((cmd) => (
                <div key={cmd.command} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {cmd.command}
                      </code>
                      <Badge variant={getCategoryBadge(cmd.category)}>
                        {getCategoryLabel(cmd.category)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{cmd.description}</p>
                  {cmd.usage && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">사용법:</span>{' '}
                      <code className="px-1 py-0.5 bg-muted rounded">{cmd.usage}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Alert className="mt-6">
              <AlertTitle>📚 명령어 가이드</AlertTitle>
              <AlertDescription>
                <div className="space-y-1 mt-2">
                  <div>• <strong>기본</strong>: 봇의 기본 기능 및 정보 확인</div>
                  <div>• <strong>리포트</strong>: PDF 생성 및 이메일 발송</div>
                  <div>• <strong>AI</strong>: 인공지능 기반 예측 및 분석</div>
                  <div>• <strong>시스템</strong>: 봇 및 서비스 상태 확인</div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* 테스트 탭 */}
      {activeTab === 'test' && (
        <Card>
          <CardHeader>
            <CardTitle>🧪 봇 테스트</CardTitle>
            <CardDescription>메시지 전송 테스트 및 연결 확인</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!config.adminChatId ? (
              <Alert>
                <AlertTitle>⚠️ 관리자 채팅 ID 필요</AlertTitle>
                <AlertDescription>
                  테스트 메시지를 보내려면 먼저 관리자 채팅 ID를 설정해주세요.
                  <br />
                  봇을 시작하고 /start 명령을 보내면 콘솔에서 채팅 ID를 확인할 수 있습니다.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="testMessage">테스트 메시지</Label>
                  <Textarea
                    id="testMessage"
                    placeholder="테스트 메시지를 입력하세요..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    관리자 채팅 ID: {config.adminChatId}
                  </p>
                </div>

                <Button onClick={handleTestBot} disabled={loading || !testMessage.trim()}>
                  {loading ? '전송 중...' : '📤 메시지 전송'}
                </Button>

                {testResult && (
                  <Alert variant={testResult.success ? 'default' : 'destructive'}>
                    <AlertTitle>
                      {testResult.success ? '✅ 전송 성공' : '❌ 전송 실패'}
                    </AlertTitle>
                    <AlertDescription>{testResult.message}</AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-2">💡 테스트 팁</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>봇이 실행 중이어야 메시지를 받을 수 있습니다</li>
                <li>마크다운 형식을 사용할 수 있습니다 (*bold*, _italic_, `code`)</li>
                <li>명령어를 직접 테스트하려면 텔레그램 앱에서 봇과 대화하세요</li>
                <li>테스트 메시지는 실제 알림과 동일하게 전송됩니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 하단 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>📖 시작 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1️⃣ 봇 생성</h4>
              <p className="text-sm text-muted-foreground">
                텔레그램에서 <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary underline">@BotFather</a>를 찾아 /newbot 명령으로 새 봇을 생성하세요.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">2️⃣ 토큰 설정</h4>
              <p className="text-sm text-muted-foreground">
                받은 봇 토큰을 위의 설정 탭에 입력하고 저장하세요.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">3️⃣ 봇 시작</h4>
              <p className="text-sm text-muted-foreground">
                "봇 시작" 버튼을 클릭하여 봇을 활성화하세요.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">4️⃣ 채팅 ID 확인</h4>
              <p className="text-sm text-muted-foreground">
                텔레그램에서 봇을 찾아 /start 명령을 보내면 콘솔에 채팅 ID가 표시됩니다.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">5️⃣ 환경 변수 설정</h4>
              <p className="text-sm text-muted-foreground">
                ".env 파일 내보내기" 버튼으로 환경 변수를 다운로드하고 서버에 적용하세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
