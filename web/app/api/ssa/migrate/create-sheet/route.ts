import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import type { CreateSheetRequest, CreateSheetResponse } from '@/types/migration'

/**
 * 새 스프레드시트 생성 API
 * POST /api/ssa/migrate/create-sheet
 *
 * 마이그레이션을 위한 빈 스프레드시트를 생성하고
 * 원본 스프레드시트의 공유 권한을 복사합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const { title, sourceSpreadsheetId }: CreateSheetRequest = await request.json()

    if (!title || !sourceSpreadsheetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'title과 sourceSpreadsheetId가 필요합니다'
        },
        { status: 400 }
      )
    }

    // 환경 변수 확인
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Service Account 설정이 필요합니다. 환경 설정 페이지에서 설정해주세요.'
        },
        { status: 500 }
      )
    }

    // Google Sheets API 인증 (읽기 전용에서 쓰기 권한으로 변경)
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ]
    )

    const sheets = google.sheets({ version: 'v4', auth })
    const drive = google.drive({ version: 'v3', auth })

    console.log(`[create-sheet] Creating new spreadsheet: "${title}"`)

    // 1. 새 스프레드시트 생성
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
          locale: 'ko_KR',
          timeZone: 'Asia/Seoul'
        }
      }
    })

    const newSpreadsheetId = createResponse.data.spreadsheetId
    const newSpreadsheetUrl = createResponse.data.spreadsheetUrl

    if (!newSpreadsheetId || !newSpreadsheetUrl) {
      throw new Error('스프레드시트 생성 실패: ID 또는 URL을 받지 못했습니다')
    }

    console.log(`[create-sheet] Created spreadsheet: ${newSpreadsheetId}`)

    // 2. 원본 스프레드시트의 공유 권한 복사 (선택사항)
    try {
      // 원본 스프레드시트의 권한 가져오기
      const sourcePermissions = await drive.permissions.list({
        fileId: sourceSpreadsheetId,
        fields: 'permissions(id,type,role,emailAddress)'
      })

      console.log(`[create-sheet] Found ${sourcePermissions.data.permissions?.length || 0} permissions on source`)

      // 원본의 권한을 새 스프레드시트에 복사
      if (sourcePermissions.data.permissions) {
        for (const permission of sourcePermissions.data.permissions) {
          // 서비스 계정 자신의 권한은 건너뜀
          if (permission.emailAddress === process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
            continue
          }

          try {
            // 이메일 기반 권한만 복사 (anyone 권한 제외)
            if (permission.type === 'user' || permission.type === 'group') {
              await drive.permissions.create({
                fileId: newSpreadsheetId,
                requestBody: {
                  type: permission.type,
                  role: permission.role,
                  emailAddress: permission.emailAddress
                },
                sendNotificationEmail: false
              })
              console.log(`[create-sheet] Copied permission: ${permission.emailAddress} (${permission.role})`)
            }
          } catch (permError: any) {
            // 권한 복사 실패는 무시 (중요하지 않음)
            console.warn(`[create-sheet] Failed to copy permission for ${permission.emailAddress}:`, permError.message)
          }
        }
      }
    } catch (permError: any) {
      // 권한 복사 실패는 무시하고 계속 진행
      console.warn('[create-sheet] Failed to copy permissions:', permError.message)
    }

    const response: CreateSheetResponse = {
      success: true,
      spreadsheetId: newSpreadsheetId,
      spreadsheetUrl: newSpreadsheetUrl
    }

    console.log(`[create-sheet] Success: ${newSpreadsheetUrl}`)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[create-sheet] Error:', error)

    // 권한 오류 처리
    if (error.code === 403) {
      return NextResponse.json(
        {
          success: false,
          error: '스프레드시트 생성 권한이 없습니다. 서비스 계정 설정을 확인해주세요.',
          serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
        },
        { status: 403 }
      )
    }

    // 인증 오류 처리
    if (error.code === 401) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Service Account 인증에 실패했습니다. 환경 설정을 확인해주세요.'
        },
        { status: 401 }
      )
    }

    // 일반 오류
    return NextResponse.json(
      {
        success: false,
        error: error.message || '스프레드시트 생성 중 오류가 발생했습니다',
        details: error.errors?.[0]?.message
      },
      { status: 500 }
    )
  }
}
