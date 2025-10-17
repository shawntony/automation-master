'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { postData, getData, ApiError } from '@/lib/utils/api'
import { useToast } from '@/components/ui/toast'

interface MetabaseConfig {
  metabaseUrl: string
  adminEmail: string
  adminPassword: string
  databaseName: string
  supabaseHost: string
  supabasePort: string
  supabaseDatabase: string
  supabaseUser: string
  supabasePassword: string
  enableSSL: boolean
  autoCreateDashboard: boolean
}

interface ConnectionStatus {
  metabase: 'disconnected' | 'connecting' | 'connected' | 'error'
  supabase: 'disconnected' | 'connecting' | 'connected' | 'error'
  dashboard: 'not_created' | 'creating' | 'created' | 'error'
}

export default function MetabasePage() {
  const [config, setConfig] = useLocalStorage<MetabaseConfig>('metabase-config', {
    metabaseUrl: 'http://localhost:3000',
    adminEmail: '',
    adminPassword: '',
    databaseName: 'Supabase Production',
    supabaseHost: '',
    supabasePort: '5432',
    supabaseDatabase: 'postgres',
    supabaseUser: '',
    supabasePassword: '',
    enableSSL: true,
    autoCreateDashboard: true
  })

  const [status, setStatus] = useState<ConnectionStatus>({
    metabase: 'disconnected',
    supabase: 'disconnected',
    dashboard: 'not_created'
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [dashboardUrl, setDashboardUrl] = useState('')
  const [activeTab, setActiveTab] = useState<'metabase' | 'supabase' | 'dashboard'>('metabase')
  const { success: showSuccess, error: showError, warning: showWarning } = useToast()

  useEffect(() => {
    checkStatus()
  }, [])

  const saveConfig = () => {
    showSuccess('설정 저장', '설정이 저장되었습니다.')
  }

  const checkStatus = async () => {
    try {
      const data = await getData('/api/tools/metabase?action=status')
      if (data.success) {
        setStatus(data.status)
        if (data.dashboardUrl) {
          setDashboardUrl(data.dashboardUrl)
        }
      }
    } catch (error) {
      console.error('상태 확인 실패:', error)
    }
  }

  const testMetabaseConnection = async () => {
    if (!config.metabaseUrl || !config.adminEmail || !config.adminPassword) {
      showWarning('연결 정보 필요', 'Metabase 연결 정보를 모두 입력해주세요.')
      return
    }

    setStatus(prev => ({ ...prev, metabase: 'connecting' }))
    setIsProcessing(true)
    setProcessingStep('Metabase 연결 확인 중...')

    try {
      const data = await postData('/api/tools/metabase', {
        action: 'test-metabase',
        url: config.metabaseUrl,
        email: config.adminEmail,
        password: config.adminPassword
      })

      if (data.success) {
        setStatus(prev => ({ ...prev, metabase: 'connected' }))
        setProcessingStep('✅ Metabase 연결 성공!')
        showSuccess('연결 성공', 'Metabase 연결이 확인되었습니다.')
        setTimeout(() => setProcessingStep(''), 2000)
      } else {
        throw new Error(data.error || 'Metabase 연결 실패')
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, metabase: 'error' }))
      setProcessingStep('')
      const errorMessage = error instanceof ApiError ? error.message : error instanceof Error ? error.message : '알 수 없는 오류'
      showError('Metabase 연결 오류', errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const testSupabaseConnection = async () => {
    if (!config.supabaseHost || !config.supabaseUser || !config.supabasePassword) {
      showWarning('연결 정보 필요', 'Supabase 연결 정보를 모두 입력해주세요.')
      return
    }

    setStatus(prev => ({ ...prev, supabase: 'connecting' }))
    setIsProcessing(true)
    setProcessingStep('Supabase 연결 확인 중...')

    try {
      const data = await postData('/api/tools/metabase', {
        action: 'test-supabase',
        host: config.supabaseHost,
        port: config.supabasePort,
        database: config.supabaseDatabase,
        user: config.supabaseUser,
        password: config.supabasePassword,
        ssl: config.enableSSL
      })

      if (data.success) {
        setStatus(prev => ({ ...prev, supabase: 'connected' }))
        setProcessingStep('✅ Supabase 연결 성공!')
        showSuccess('연결 성공', 'Supabase 연결이 확인되었습니다.')
        setTimeout(() => setProcessingStep(''), 2000)
      } else {
        throw new Error(data.error || 'Supabase 연결 실패')
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, supabase: 'error' }))
      setProcessingStep('')
      const errorMessage = error instanceof ApiError ? error.message : error instanceof Error ? error.message : '알 수 없는 오류'
      showError('Supabase 연결 오류', errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const setupMetabaseDashboard = async () => {
    if (status.metabase !== 'connected' || status.supabase !== 'connected') {
      showWarning('연결 확인 필요', 'Metabase와 Supabase 연결을 먼저 확인해주세요.')
      return
    }

    setStatus(prev => ({ ...prev, dashboard: 'creating' }))
    setIsProcessing(true)

    try {
      // Step 1: Add Supabase database to Metabase
      setProcessingStep('1/4: Supabase 데이터베이스 추가 중...')

      const data = await postData('/api/tools/metabase', {
        action: 'setup-dashboard',
        metabaseUrl: config.metabaseUrl,
        adminEmail: config.adminEmail,
        adminPassword: config.adminPassword,
        databaseName: config.databaseName,
        supabaseHost: config.supabaseHost,
        supabasePort: config.supabasePort,
        supabaseDatabase: config.supabaseDatabase,
        supabaseUser: config.supabaseUser,
        supabasePassword: config.supabasePassword,
        enableSSL: config.enableSSL,
        autoCreateDashboard: config.autoCreateDashboard
      })

      if (data.success) {
        setProcessingStep('2/4: 데이터베이스 스키마 동기화 중...')
        await new Promise(resolve => setTimeout(resolve, 1500))

        setProcessingStep('3/4: 컬렉션 및 대시보드 생성 중...')
        await new Promise(resolve => setTimeout(resolve, 1500))

        setProcessingStep('4/4: 권한 설정 중...')
        await new Promise(resolve => setTimeout(resolve, 1000))

        setStatus(prev => ({ ...prev, dashboard: 'created' }))
        setDashboardUrl(data.dashboardUrl || `${config.metabaseUrl}/dashboard/1`)
        setProcessingStep('✅ 대시보드 설정 완료!')

        setTimeout(() => {
          setProcessingStep('')
          showSuccess('대시보드 설정 완료', 'Metabase 대시보드가 성공적으로 설정되었습니다!')
        }, 1500)
      } else {
        throw new Error(data.error || '대시보드 설정 실패')
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, dashboard: 'error' }))
      setProcessingStep('')
      const errorMessage = error instanceof ApiError ? error.message : error instanceof Error ? error.message : '알 수 없는 오류'
      showError('대시보드 설정 오류', errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case 'connected':
      case 'created':
        return <Badge variant="default">✅ 연결됨</Badge>
      case 'connecting':
      case 'creating':
        return <Badge variant="outline">🔄 처리 중</Badge>
      case 'error':
        return <Badge variant="destructive">❌ 오류</Badge>
      default:
        return <Badge variant="secondary">⚠️ 미연결</Badge>
    }
  }

  const handleExportConfig = () => {
    const envContent = `# Metabase Configuration
METABASE_URL="${config.metabaseUrl}"
METABASE_ADMIN_EMAIL="${config.adminEmail}"
METABASE_ADMIN_PASSWORD="${config.adminPassword}"
METABASE_DATABASE_NAME="${config.databaseName}"

# Supabase Database for Metabase
SUPABASE_DB_HOST="${config.supabaseHost}"
SUPABASE_DB_PORT="${config.supabasePort}"
SUPABASE_DB_DATABASE="${config.supabaseDatabase}"
SUPABASE_DB_USER="${config.supabaseUser}"
SUPABASE_DB_PASSWORD="${config.supabasePassword}"
SUPABASE_DB_SSL="${config.enableSSL}"
`

    const blob = new Blob([envContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.env.metabase'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showSuccess('파일 다운로드', '환경 변수 파일이 다운로드되었습니다.')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Metabase 대시보드 연동</h1>
          <p className="text-muted-foreground mt-1">
            Metabase와 Supabase를 연결하여 강력한 데이터 시각화 대시보드 구축
          </p>
        </div>
        <Badge variant="outline">대시보드 & 분석</Badge>
      </div>

      {/* 상태 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Metabase 연결</div>
                {getStatusBadge(status.metabase)}
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Supabase 연결</div>
                {getStatusBadge(status.supabase)}
              </div>
              <div className="text-3xl">🗄️</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">대시보드 상태</div>
                {getStatusBadge(status.dashboard)}
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 진행 상태 */}
      {processingStep && (
        <Alert>
          <AlertTitle>🔄 진행 중</AlertTitle>
          <AlertDescription>{processingStep}</AlertDescription>
        </Alert>
      )}

      {/* 대시보드 링크 */}
      {dashboardUrl && status.dashboard === 'created' && (
        <Alert>
          <AlertTitle>✅ 대시보드가 생성되었습니다!</AlertTitle>
          <AlertDescription>
            <div className="flex items-center justify-between mt-2">
              <span>Metabase에서 데이터 시각화를 확인하세요</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(dashboardUrl, '_blank')}
              >
                🔗 대시보드 열기
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'metabase' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('metabase')}
        >
          📊 Metabase
        </Button>
        <Button
          variant={activeTab === 'supabase' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('supabase')}
        >
          🗄️ Supabase
        </Button>
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('dashboard')}
        >
          📈 대시보드 설정
        </Button>
      </div>

      {/* Metabase 탭 */}
      {activeTab === 'metabase' && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Metabase 설정</CardTitle>
            <CardDescription>Metabase 인스턴스 연결 정보를 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>💡 Metabase 설치 안내</AlertTitle>
              <AlertDescription>
                Metabase가 없다면{' '}
                <a
                  href="https://www.metabase.com/start/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  metabase.com/start
                </a>
                에서 설치하세요 (무료 오픈소스)
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="metabase-url">
                Metabase URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="metabase-url"
                placeholder="http://localhost:3000"
                value={config.metabaseUrl}
                onChange={(e) => setConfig({ ...config, metabaseUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Metabase 인스턴스 주소 (포트 포함)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">
                관리자 이메일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@company.com"
                value={config.adminEmail}
                onChange={(e) => setConfig({ ...config, adminEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">
                관리자 비밀번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={config.adminPassword}
                onChange={(e) => setConfig({ ...config, adminPassword: e.target.value })}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={testMetabaseConnection} disabled={isProcessing}>
                {status.metabase === 'connecting'
                  ? '연결 확인 중...'
                  : status.metabase === 'connected'
                  ? '✅ 연결 확인됨'
                  : '🔌 Metabase 연결 테스트'}
              </Button>
              <Button onClick={saveConfig} variant="outline">
                💾 설정 저장
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supabase 탭 */}
      {activeTab === 'supabase' && (
        <Card>
          <CardHeader>
            <CardTitle>🗄️ Supabase 데이터베이스 설정</CardTitle>
            <CardDescription>Metabase에서 연결할 Supabase PostgreSQL 정보</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>📋 연결 정보 확인</AlertTitle>
              <AlertDescription>
                Supabase 프로젝트 설정 → Database → Connection info에서 확인 가능
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="supabase-host">
                호스트 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supabase-host"
                placeholder="db.your-project.supabase.co"
                value={config.supabaseHost}
                onChange={(e) => setConfig({ ...config, supabaseHost: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supabase-port">포트</Label>
                <Input
                  id="supabase-port"
                  placeholder="5432"
                  value={config.supabasePort}
                  onChange={(e) => setConfig({ ...config, supabasePort: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabase-database">데이터베이스</Label>
                <Input
                  id="supabase-database"
                  placeholder="postgres"
                  value={config.supabaseDatabase}
                  onChange={(e) => setConfig({ ...config, supabaseDatabase: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabase-user">
                사용자명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supabase-user"
                placeholder="postgres"
                value={config.supabaseUser}
                onChange={(e) => setConfig({ ...config, supabaseUser: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supabase-password">
                비밀번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="supabase-password"
                type="password"
                placeholder="••••••••"
                value={config.supabasePassword}
                onChange={(e) => setConfig({ ...config, supabasePassword: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-ssl"
                checked={config.enableSSL}
                onChange={(e) => setConfig({ ...config, enableSSL: (e.target as HTMLInputElement).checked })}
              />
              <Label htmlFor="enable-ssl" className="cursor-pointer">
                SSL 연결 사용 (권장)
              </Label>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={testSupabaseConnection} disabled={isProcessing}>
                {status.supabase === 'connecting'
                  ? '연결 확인 중...'
                  : status.supabase === 'connected'
                  ? '✅ 연결 확인됨'
                  : '🔌 Supabase 연결 테스트'}
              </Button>
              <Button onClick={saveConfig} variant="outline">
                💾 설정 저장
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 대시보드 설정 탭 */}
      {activeTab === 'dashboard' && (
        <Card>
          <CardHeader>
            <CardTitle>📈 대시보드 설정</CardTitle>
            <CardDescription>
              Metabase에서 Supabase 데이터를 활용한 대시보드를 자동 생성합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="database-name">데이터베이스 표시명</Label>
              <Input
                id="database-name"
                placeholder="Supabase Production"
                value={config.databaseName}
                onChange={(e) => setConfig({ ...config, databaseName: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Metabase에 표시될 데이터베이스 이름
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-dashboard"
                checked={config.autoCreateDashboard}
                onChange={(e) =>
                  setConfig({ ...config, autoCreateDashboard: (e.target as HTMLInputElement).checked })
                }
              />
              <Label htmlFor="auto-dashboard" className="cursor-pointer">
                자동 대시보드 생성 (테이블별 기본 차트 생성)
              </Label>
            </div>

            <Button
              onClick={setupMetabaseDashboard}
              disabled={
                isProcessing ||
                status.metabase !== 'connected' ||
                status.supabase !== 'connected'
              }
              className="w-full"
              size="lg"
            >
              {status.dashboard === 'creating'
                ? '🔄 대시보드 설정 중...'
                : status.dashboard === 'created'
                ? '✅ 대시보드 생성 완료'
                : '🚀 Metabase 대시보드 설정'}
            </Button>

            <div className="flex space-x-2">
              <Button onClick={handleExportConfig} variant="outline" className="flex-1">
                📥 .env 파일 내보내기
              </Button>
              <Button onClick={checkStatus} variant="outline" className="flex-1">
                🔄 상태 새로고침
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 기능 안내 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-medium mb-1">자동 대시보드</h3>
            <p className="text-sm text-muted-foreground">
              데이터 모델 기반으로 차트와 대시보드 자동 생성
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl mb-2">🔄</div>
            <h3 className="font-medium mb-1">실시간 동기화</h3>
            <p className="text-sm text-muted-foreground">
              Supabase 데이터 변경사항 실시간 반영
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-medium mb-1">보안 연결</h3>
            <p className="text-sm text-muted-foreground">
              SSL 암호화 및 안전한 데이터베이스 연결
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-medium mb-1">권한 관리</h3>
            <p className="text-sm text-muted-foreground">
              사용자별 대시보드 접근 권한 설정
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 시작 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>📖 빠른 시작 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1️⃣ Metabase 설치</h4>
              <p className="text-sm text-muted-foreground">
                Docker: <code className="px-2 py-1 bg-muted rounded text-xs">docker run -d -p 3000:3000 metabase/metabase</code>
                <br />또는{' '}
                <a
                  href="https://www.metabase.com/start/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  metabase.com/start
                </a>
                에서 다운로드
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">2️⃣ Metabase 연결</h4>
              <p className="text-sm text-muted-foreground">
                Metabase URL과 관리자 계정 정보를 입력하고 연결 테스트
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">3️⃣ Supabase 연결</h4>
              <p className="text-sm text-muted-foreground">
                Supabase 프로젝트의 PostgreSQL 연결 정보를 입력하고 연결 테스트
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">4️⃣ 대시보드 생성</h4>
              <p className="text-sm text-muted-foreground">
                자동 대시보드 생성 옵션을 활성화하고 "대시보드 설정" 클릭
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">5️⃣ 대시보드 활용</h4>
              <p className="text-sm text-muted-foreground">
                생성된 대시보드에서 데이터를 시각화하고 커스텀 차트 추가
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
