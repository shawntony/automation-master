'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { getData } from '@/lib/utils/api'

interface EnvironmentConfig {
  googleServiceAccountEmail?: string
  googleServiceAccountPrivateKey?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
  supabaseServiceKey?: string
}

export default function SettingsPage() {
  const [config, setConfig] = useLocalStorage<EnvironmentConfig>('automation-master-config', {})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showSecrets, setShowSecrets] = useState({
    privateKey: false,
    supabaseAnonKey: false,
    supabaseServiceKey: false
  })
  const [configStatus, setConfigStatus] = useState<any>(null)

  useEffect(() => {
    checkServicesStatus()
  }, [])

  const checkServicesStatus = async () => {
    try {
      // Check Google Sheets configuration
      const sheetsData: any = await getData('/api/tools/sheets?action=check-config')

      // Check Migration configuration
      const migrationData: any = await getData('/api/tools/migration?action=check-env')

      setConfigStatus({
        googleSheets: sheetsData.configured || false,
        googleSheetsDetail: sheetsData.environment || {},
        supabase: migrationData.environment?.supabaseConfig || false,
        overall: (sheetsData.configured && migrationData.environment?.supabaseConfig) || false
      })
    } catch (error) {
      console.error('Failed to check services status:', error)
      setConfigStatus({
        googleSheets: false,
        supabase: false,
        overall: false
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      setMessage({
        type: 'success',
        text: '설정이 저장되었습니다. 환경 변수를 적용하려면 서버를 재시작해주세요.'
      })

      // Recheck status after save
      setTimeout(() => {
        checkServicesStatus()
      }, 1000)

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || '설정 저장 중 오류가 발생했습니다'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExportEnv = () => {
    const envContent = `# AutomationMaster Environment Variables
# Generated on ${new Date().toLocaleString('ko-KR')}

# Google Sheets API Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL="${config.googleServiceAccountEmail || ''}"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="${config.googleServiceAccountPrivateKey || ''}"

# Supabase Configuration
SUPABASE_URL="${config.supabaseUrl || ''}"
SUPABASE_ANON_KEY="${config.supabaseAnonKey || ''}"
SUPABASE_SERVICE_ROLE_KEY="${config.supabaseServiceKey || ''}"
`

    const blob = new Blob([envContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.env.local'
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSecret = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">환경 설정</h1>
        </div>
        <p className="text-gray-600">
          AutomationMaster의 API 키 및 환경 변수를 관리합니다
        </p>
      </div>

      {/* 서비스 상태 */}
      {configStatus && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">서비스 상태</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkServicesStatus}
                className="h-8"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {configStatus.googleSheets ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-medium">Google Sheets API</span>
              </div>
              <Badge variant={configStatus.googleSheets ? "default" : "destructive"}>
                {configStatus.googleSheets ? '연결됨' : '미설정'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {configStatus.supabase ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-medium">Supabase</span>
              </div>
              <Badge variant={configStatus.supabase ? "default" : "destructive"}>
                {configStatus.supabase ? '연결됨' : '미설정'}
              </Badge>
            </div>

            {configStatus.overall ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800">
                  ✅ 모든 서비스가 정상적으로 설정되어 있습니다
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  ⚠️ 일부 서비스 설정이 필요합니다. 아래 양식을 작성해주세요.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Google Sheets 설정 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Google Sheets API</CardTitle>
          <CardDescription>
            Google Sheets 연동에 필요한 서비스 계정 정보를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="googleEmail">서비스 계정 이메일</Label>
            <Input
              id="googleEmail"
              type="email"
              value={config.googleServiceAccountEmail || ''}
              onChange={(e) => setConfig({ ...config, googleServiceAccountEmail: e.target.value })}
              placeholder="your-service-account@project-id.iam.gserviceaccount.com"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Google Cloud Console에서 생성한 서비스 계정의 이메일 주소
            </p>
          </div>

          <div>
            <Label htmlFor="googlePrivateKey">서비스 계정 Private Key</Label>
            <div className="relative">
              <Textarea
                id="googlePrivateKey"
                value={config.googleServiceAccountPrivateKey || ''}
                onChange={(e) => setConfig({ ...config, googleServiceAccountPrivateKey: e.target.value })}
                placeholder="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"
                className="font-mono text-xs resize-none"
                rows={6}
                type={showSecrets.privateKey ? 'text' : 'password'}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSecret('privateKey')}
                className="absolute top-2 right-2"
              >
                {showSecrets.privateKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              JSON 키 파일의 private_key 값 (줄바꿈 포함)
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Google Sheets API 설정 방법:</strong>
              <ol className="mt-2 space-y-1 ml-4 list-decimal">
                <li>Google Cloud Console에서 프로젝트 생성</li>
                <li>Google Sheets API 활성화</li>
                <li>서비스 계정 생성 및 JSON 키 다운로드</li>
                <li>위의 이메일과 Private Key를 입력</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Supabase 설정 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase</CardTitle>
          <CardDescription>
            Supabase 프로젝트 연동 정보를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="supabaseUrl">Project URL</Label>
            <Input
              id="supabaseUrl"
              type="url"
              value={config.supabaseUrl || ''}
              onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
              placeholder="https://your-project.supabase.co"
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="supabaseAnonKey">Anon Public Key</Label>
            <div className="relative">
              <Input
                id="supabaseAnonKey"
                type={showSecrets.supabaseAnonKey ? 'text' : 'password'}
                value={config.supabaseAnonKey || ''}
                onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="font-mono text-xs pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSecret('supabaseAnonKey')}
                className="absolute top-0 right-0 h-full"
              >
                {showSecrets.supabaseAnonKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              클라이언트 앱에서 사용하는 공개 키 (읽기 전용)
            </p>
          </div>

          <div>
            <Label htmlFor="supabaseServiceKey">Service Role Key (선택)</Label>
            <div className="relative">
              <Input
                id="supabaseServiceKey"
                type={showSecrets.supabaseServiceKey ? 'text' : 'password'}
                value={config.supabaseServiceKey || ''}
                onChange={(e) => setConfig({ ...config, supabaseServiceKey: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="font-mono text-xs pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSecret('supabaseServiceKey')}
                className="absolute top-0 right-0 h-full"
              >
                {showSecrets.supabaseServiceKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              서버 사이드에서 사용하는 관리자 키 (마이그레이션 시 필요)
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Supabase 프로젝트 정보:</strong>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                <li>Supabase 대시보드 &gt; Settings &gt; API에서 확인 가능</li>
                <li>Project URL: API endpoint 주소</li>
                <li>Anon Key: 공개적으로 사용 가능한 클라이언트 키</li>
                <li>Service Role Key: 서버 전용 관리자 키 (민감정보)</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 저장 및 내보내기 */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              설정 저장
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleExportEnv}
          className="flex-1"
        >
          .env 파일로 내보내기
        </Button>
      </div>

      {message && (
        <Alert
          className={`mt-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* 사용 안내 */}
      <Card className="mt-6 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">💡 환경 변수 적용 방법</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-gray-700">
          <div>
            <p className="font-semibold mb-1">1. 여기서 설정 저장 (localStorage)</p>
            <p className="text-gray-600">브라우저에 일시적으로 저장됩니다</p>
          </div>
          <div>
            <p className="font-semibold mb-1">2. .env 파일로 내보내기 (권장)</p>
            <p className="text-gray-600">
              프로젝트 루트에 <code className="bg-white px-1 py-0.5 rounded">.env.local</code> 파일로 저장하고 서버 재시작
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">3. 서버 재시작</p>
            <p className="text-gray-600">
              환경 변수를 적용하려면 개발 서버 재시작 필요: <code className="bg-white px-1 py-0.5 rounded">npm run dev</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
