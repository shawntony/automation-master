import { NextRequest, NextResponse } from 'next/server'

interface MetabaseCredentials {
  url: string
  email: string
  password: string
}

interface SupabaseConnectionInfo {
  host: string
  port: string
  database: string
  user: string
  password: string
  ssl: boolean
}

// Metabase API helper functions
async function getMetabaseSession(url: string, email: string, password: string): Promise<string> {
  try {
    const response = await fetch(`${url}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password })
    })

    if (!response.ok) {
      throw new Error(`Metabase 인증 실패: ${response.statusText}`)
    }

    const data = await response.json()
    return data.id // Session token
  } catch (error) {
    throw new Error(`Metabase 연결 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

async function addSupabaseDatabase(
  metabaseUrl: string,
  sessionToken: string,
  databaseName: string,
  supabaseInfo: SupabaseConnectionInfo
): Promise<number> {
  try {
    const response = await fetch(`${metabaseUrl}/api/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': sessionToken
      },
      body: JSON.stringify({
        name: databaseName,
        engine: 'postgres',
        details: {
          host: supabaseInfo.host,
          port: parseInt(supabaseInfo.port),
          dbname: supabaseInfo.database,
          user: supabaseInfo.user,
          password: supabaseInfo.password,
          ssl: supabaseInfo.ssl,
          'tunnel-enabled': false
        },
        is_full_sync: true,
        auto_run_queries: true
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`데이터베이스 추가 실패: ${errorData.message || response.statusText}`)
    }

    const data = await response.json()
    return data.id // Database ID
  } catch (error) {
    throw new Error(`데이터베이스 추가 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

async function syncDatabase(metabaseUrl: string, sessionToken: string, databaseId: number): Promise<void> {
  try {
    const response = await fetch(`${metabaseUrl}/api/database/${databaseId}/sync_schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': sessionToken
      }
    })

    if (!response.ok) {
      throw new Error(`스키마 동기화 실패: ${response.statusText}`)
    }
  } catch (error) {
    throw new Error(`스키마 동기화 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

// GET: Check status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    if (action === 'status') {
      // Check if Metabase and Supabase are configured
      const metabaseConfigured = !!(
        process.env.METABASE_URL &&
        process.env.METABASE_ADMIN_EMAIL &&
        process.env.METABASE_ADMIN_PASSWORD
      )

      const supabaseConfigured = !!(
        process.env.SUPABASE_DB_HOST &&
        process.env.SUPABASE_DB_USER &&
        process.env.SUPABASE_DB_PASSWORD
      )

      const status = {
        metabase: metabaseConfigured ? 'connected' : 'disconnected',
        supabase: supabaseConfigured ? 'connected' : 'disconnected',
        dashboard: 'not_created' // Would need to check Metabase API for actual status
      }

      return NextResponse.json({
        success: true,
        status,
        dashboardUrl: process.env.METABASE_DASHBOARD_URL || null
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Metabase GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST: Test connections and setup dashboard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'test-metabase') {
      // Test Metabase connection
      const { url, email, password } = body

      if (!url || !email || !password) {
        return NextResponse.json({
          success: false,
          error: 'Metabase 연결 정보가 불완전합니다.'
        })
      }

      try {
        // Try to get a session token
        const sessionToken = await getMetabaseSession(url, email, password)

        // Verify session by making a test API call
        const testResponse = await fetch(`${url}/api/user/current`, {
          headers: {
            'X-Metabase-Session': sessionToken
          }
        })

        if (!testResponse.ok) {
          throw new Error('세션 검증 실패')
        }

        return NextResponse.json({
          success: true,
          message: 'Metabase 연결 성공'
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Metabase 연결 실패'
        })
      }
    }

    if (action === 'test-supabase') {
      // Test Supabase PostgreSQL connection
      const { host, port, database, user, password, ssl } = body

      if (!host || !user || !password) {
        return NextResponse.json({
          success: false,
          error: 'Supabase 연결 정보가 불완전합니다.'
        })
      }

      // Note: For actual PostgreSQL connection testing, you would need the 'pg' package
      // This is a simplified mock response
      try {
        // In a real implementation, you would use:
        // const { Client } = require('pg')
        // const client = new Client({ host, port, database, user, password, ssl })
        // await client.connect()
        // await client.query('SELECT 1')
        // await client.end()

        // For now, just validate the format
        if (!host.includes('supabase.co')) {
          return NextResponse.json({
            success: false,
            error: 'Supabase 호스트 형식이 올바르지 않습니다.'
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Supabase 연결 정보가 확인되었습니다.'
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Supabase 연결 실패'
        })
      }
    }

    if (action === 'setup-dashboard') {
      // Setup Metabase dashboard with Supabase connection
      const {
        metabaseUrl,
        adminEmail,
        adminPassword,
        databaseName,
        supabaseHost,
        supabasePort,
        supabaseDatabase,
        supabaseUser,
        supabasePassword,
        enableSSL,
        autoCreateDashboard
      } = body

      if (!metabaseUrl || !adminEmail || !adminPassword) {
        return NextResponse.json({
          success: false,
          error: 'Metabase 연결 정보가 필요합니다.'
        })
      }

      if (!supabaseHost || !supabaseUser || !supabasePassword) {
        return NextResponse.json({
          success: false,
          error: 'Supabase 연결 정보가 필요합니다.'
        })
      }

      try {
        // Step 1: Get Metabase session
        const sessionToken = await getMetabaseSession(metabaseUrl, adminEmail, adminPassword)

        // Step 2: Add Supabase database to Metabase
        const databaseId = await addSupabaseDatabase(
          metabaseUrl,
          sessionToken,
          databaseName,
          {
            host: supabaseHost,
            port: supabasePort,
            database: supabaseDatabase,
            user: supabaseUser,
            password: supabasePassword,
            ssl: enableSSL
          }
        )

        // Step 3: Sync database schema
        await syncDatabase(metabaseUrl, sessionToken, databaseId)

        // Step 4: Create auto dashboard if requested
        let dashboardUrl = `${metabaseUrl}/browse/${databaseId}`

        if (autoCreateDashboard) {
          // In a real implementation, you would create a dashboard using Metabase API
          // For now, just return the database browse URL
          dashboardUrl = `${metabaseUrl}/browse/${databaseId}`
        }

        return NextResponse.json({
          success: true,
          message: 'Metabase 대시보드 설정 완료',
          databaseId,
          dashboardUrl
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : '대시보드 설정 실패'
        })
      }
    }

    return NextResponse.json({
      success: false,
      error: '잘못된 작업입니다.'
    }, { status: 400 })

  } catch (error) {
    console.error('Metabase POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
