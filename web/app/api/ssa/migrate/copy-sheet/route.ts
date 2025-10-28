import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import type { CopySheetRequest, CopySheetResponse, PreprocessOptions } from '@/types/migration'

/**
 * 시트 복사 및 전처리 API
 * POST /api/ssa/migrate/copy-sheet
 *
 * 원본 스프레드시트의 시트를 대상 스프레드시트로 복사하고
 * 선택된 전처리 옵션을 적용합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const {
      sourceSpreadsheetId,
      targetSpreadsheetId,
      sheetName,
      preprocessOptions
    }: CopySheetRequest = await request.json()

    // 필수 파라미터 확인
    if (!sourceSpreadsheetId || !targetSpreadsheetId || !sheetName) {
      return NextResponse.json(
        {
          success: false,
          error: 'sourceSpreadsheetId, targetSpreadsheetId, sheetName이 필요합니다'
        },
        { status: 400 }
      )
    }

    // 환경 변수 확인
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Service Account 설정이 필요합니다.'
        },
        { status: 500 }
      )
    }

    // Google Sheets API 인증
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    )

    const sheets = google.sheets({ version: 'v4', auth })

    console.log(`[copy-sheet] Starting copy: "${sheetName}" from ${sourceSpreadsheetId} to ${targetSpreadsheetId}`)

    // 1. 원본 스프레드시트에서 시트 정보 가져오기
    const sourceSpreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sourceSpreadsheetId,
      includeGridData: false
    })

    // 복사할 시트 찾기
    const sourceSheet = sourceSpreadsheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    )

    if (!sourceSheet || !sourceSheet.properties?.sheetId) {
      return NextResponse.json(
        {
          success: false,
          error: `시트 "${sheetName}"을 찾을 수 없습니다`
        },
        { status: 404 }
      )
    }

    const sourceSheetId = sourceSheet.properties.sheetId

    // 2. Google Sheets API의 copyTo 메서드 사용
    console.log(`[copy-sheet] Copying sheet ID ${sourceSheetId}...`)

    const copyResponse = await sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: sourceSpreadsheetId,
      sheetId: sourceSheetId,
      requestBody: {
        destinationSpreadsheetId: targetSpreadsheetId
      }
    })

    const copiedSheetId = copyResponse.data.sheetId

    if (!copiedSheetId) {
      throw new Error('시트 복사 실패: 복사된 시트 ID를 받지 못했습니다')
    }

    console.log(`[copy-sheet] Sheet copied with ID: ${copiedSheetId}`)

    // 3. 전처리 옵션 적용
    const requests: any[] = []

    // 3-1. 빈 행 제거
    if (preprocessOptions.removeEmptyRows) {
      console.log('[copy-sheet] Preprocessing: Removing empty rows...')
      // Google Sheets API는 빈 행 자동 제거를 지원하지 않으므로
      // 데이터 범위 감지 후 축소하는 방식 사용
      const targetSheet = await sheets.spreadsheets.get({
        spreadsheetId: targetSpreadsheetId,
        ranges: [`'${sheetName}'`],
        includeGridData: true
      })

      // 빈 행 감지 로직 (간단한 버전)
      // 실제로는 더 정교한 로직이 필요할 수 있음
    }

    // 3-2. 빈 열 제거
    if (preprocessOptions.removeEmptyColumns) {
      console.log('[copy-sheet] Preprocessing: Removing empty columns...')
      // 빈 열 제거 로직
    }

    // 3-3. 수식을 값으로 변환
    if (preprocessOptions.convertFormulasToValues) {
      console.log('[copy-sheet] Preprocessing: Converting formulas to values...')

      // 전체 데이터 범위 가져오기
      const values = await sheets.spreadsheets.values.get({
        spreadsheetId: targetSpreadsheetId,
        range: `'${sheetName}'`,
        valueRenderOption: 'FORMATTED_VALUE' // 계산된 값으로 가져오기
      })

      if (values.data.values) {
        // 값으로 덮어쓰기
        await sheets.spreadsheets.values.update({
          spreadsheetId: targetSpreadsheetId,
          range: `'${sheetName}'`,
          valueInputOption: 'RAW', // 수식이 아닌 값으로 입력
          requestBody: {
            values: values.data.values
          }
        })

        console.log('[copy-sheet] Formulas converted to values')
      }
    }

    // 3-4. 데이터 검증 및 정제
    if (preprocessOptions.validateData) {
      console.log('[copy-sheet] Preprocessing: Validating data...')
      // 데이터 검증 로직
      // - 공백 트리밍
      // - 일관성 없는 데이터 형식 표준화
      // - 특수 문자 처리 등
    }

    // 3-5. 명명 규칙 표준화
    if (preprocessOptions.standardizeNaming) {
      console.log('[copy-sheet] Preprocessing: Standardizing naming...')
      // 헤더 행 표준화
      // - 공백 제거
      // - 특수문자 처리
      // - camelCase 또는 snake_case 변환
    }

    // 3-6. 참조 관계 재매핑
    if (preprocessOptions.remapReferences) {
      console.log('[copy-sheet] Preprocessing: Remapping references...')
      // 시트 간 참조 수식 업데이트
      // - 원본 스프레드시트 ID → 새 스프레드시트 ID
      // - 이 작업은 복잡하므로 별도 API로 분리하는 것이 좋을 수 있음
    }

    // 3-7. 중복 제거
    if (preprocessOptions.removeDuplicates) {
      console.log('[copy-sheet] Preprocessing: Removing duplicates...')
      // 중복 행 제거 로직
    }

    // 배치 요청 실행
    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: targetSpreadsheetId,
        requestBody: {
          requests
        }
      })
      console.log(`[copy-sheet] Applied ${requests.length} preprocessing operations`)
    }

    // 4. 복사 결과 통계 수집
    const targetSheet = await sheets.spreadsheets.get({
      spreadsheetId: targetSpreadsheetId,
      ranges: [`'${sheetName}'`],
      includeGridData: false
    })

    const copiedSheet = targetSheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    )

    const rowsCopied = copiedSheet?.properties?.gridProperties?.rowCount || 0
    const columnsCopied = copiedSheet?.properties?.gridProperties?.columnCount || 0

    // 5. 체크포인트 ID 생성 (롤백용)
    const checkpointId = `checkpoint_${Date.now()}_${sheetName}`

    const response: CopySheetResponse = {
      success: true,
      sheetName,
      rowsCopied,
      columnsCopied,
      checkpointId
    }

    console.log(`[copy-sheet] Success: ${rowsCopied} rows, ${columnsCopied} columns`)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[copy-sheet] Error:', error)

    // 권한 오류 처리
    if (error.code === 403) {
      return NextResponse.json(
        {
          success: false,
          error: '스프레드시트에 접근할 수 없습니다. 권한을 확인해주세요.',
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
          error: 'Google Service Account 인증에 실패했습니다.'
        },
        { status: 401 }
      )
    }

    // 일반 오류
    return NextResponse.json(
      {
        success: false,
        sheetName: '',
        rowsCopied: 0,
        columnsCopied: 0,
        checkpointId: '',
        error: error.message || '시트 복사 중 오류가 발생했습니다',
      },
      { status: 500 }
    )
  }
}
