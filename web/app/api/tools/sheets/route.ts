import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

/**
 * Create a new Google Spreadsheet or append data to existing one
 * Uses SSA Google Sheets service
 */

interface SheetsRequestBody {
  action: 'create' | 'append'
  spreadsheetId?: string
  sheetName: string
  data: any[]
  createIfNotExists?: boolean
}

/**
 * Create new spreadsheet via SSA service
 */
async function createSpreadsheet(sheetName: string, data: any[]) {
  return new Promise((resolve, reject) => {
    const ssaPath = path.join(process.cwd(), '..', '..', 'ssa')
    const scriptPath = path.join(ssaPath, 'create_spreadsheet.js')

    // Create temporary script to handle spreadsheet creation
    const fs = require('fs')
    const tempScriptPath = path.join(ssaPath, 'temp_create_sheet.js')

    // Generate script content
    const scriptContent = `
const { google } = require('googleapis');
const path = require('path');

async function createSpreadsheet() {
  try {
    // Load credentials
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
    if (!credentials.client_email) {
      throw new Error('Google Service Account credentials not configured');
    }

    // Setup auth
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // Parse data from stdin
    const data = JSON.parse(process.argv[2]);
    const sheetName = process.argv[3] || 'Sheet1';

    // Create spreadsheet
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: sheetName + '_' + new Date().toISOString().split('T')[0]
        },
        sheets: [{
          properties: {
            title: sheetName
          }
        }]
      }
    });

    const spreadsheetId = createResponse.data.spreadsheetId;
    const spreadsheetUrl = createResponse.data.spreadsheetUrl;

    // Prepare data for insertion
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    const rows = [headers, ...data.map(row => headers.map(h => row[h] || ''))];

    // Insert data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetName + '!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows
      }
    });

    // Output result
    console.log(JSON.stringify({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      sheetName,
      rowCount: data.length,
      message: 'Spreadsheet created and data inserted successfully'
    }));

  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: error.message
    }));
    process.exit(1);
  }
}

createSpreadsheet();
`

    // Write temporary script
    fs.writeFileSync(tempScriptPath, scriptContent)

    const proc = spawn('node', [tempScriptPath, JSON.stringify(data), sheetName], {
      cwd: ssaPath,
      shell: true,
      env: {
        ...process.env,
        GOOGLE_SERVICE_ACCOUNT: process.env.GOOGLE_SERVICE_ACCOUNT ||
          JSON.stringify({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')
          })
      }
    })

    let output = ''
    let errorOutput = ''

    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    proc.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempScriptPath)
      } catch (e) {
        // Ignore cleanup errors
      }

      if (code === 0) {
        try {
          const result = JSON.parse(output)
          resolve(result)
        } catch (parseError: any) {
          reject(new Error(`Failed to parse result: ${parseError.message}`))
        }
      } else {
        reject(new Error(errorOutput || `Process exited with code ${code}`))
      }
    })

    // Timeout (30 seconds)
    setTimeout(() => {
      proc.kill()
      reject(new Error('Spreadsheet creation timeout (30 seconds)'))
    }, 30000)
  })
}

/**
 * Append data to existing spreadsheet via SSA service
 */
async function appendToSpreadsheet(spreadsheetId: string, sheetName: string, data: any[]) {
  return new Promise((resolve, reject) => {
    const ssaPath = path.join(process.cwd(), '..', '..', 'ssa')
    const fs = require('fs')
    const tempScriptPath = path.join(ssaPath, 'temp_append_sheet.js')

    // Generate script content
    const scriptContent = `
const { google } = require('googleapis');

async function appendToSpreadsheet() {
  try {
    // Load credentials
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
    if (!credentials.client_email) {
      throw new Error('Google Service Account credentials not configured');
    }

    // Setup auth
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // Parse input
    const spreadsheetId = process.argv[2];
    const sheetName = process.argv[3];
    const data = JSON.parse(process.argv[4]);

    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId
    });

    let targetSheetExists = false;
    for (const sheet of spreadsheet.data.sheets) {
      if (sheet.properties.title === sheetName) {
        targetSheetExists = true;
        break;
      }
    }

    // Create sheet if doesn't exist
    if (!targetSheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName
              }
            }
          }]
        }
      });
    }

    // Get existing data to check if headers exist
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName + '!A1:ZZ1'
    });

    const hasHeaders = existingData.data.values && existingData.data.values.length > 0;

    // Prepare data
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    const rows = data.map(row => headers.map(h => row[h] || ''));

    // If no headers exist, add them
    if (!hasHeaders) {
      rows.unshift(headers);
    }

    // Append data
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetName + '!A:A',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows
      }
    });

    console.log(JSON.stringify({
      success: true,
      spreadsheetId,
      spreadsheetUrl: \`https://docs.google.com/spreadsheets/d/\${spreadsheetId}\`,
      sheetName,
      rowCount: data.length,
      updatedRange: appendResponse.data.updates?.updatedRange,
      message: 'Data appended successfully'
    }));

  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: error.message
    }));
    process.exit(1);
  }
}

appendToSpreadsheet();
`

    // Write temporary script
    fs.writeFileSync(tempScriptPath, scriptContent)

    const proc = spawn('node', [
      tempScriptPath,
      spreadsheetId,
      sheetName,
      JSON.stringify(data)
    ], {
      cwd: ssaPath,
      shell: true,
      env: {
        ...process.env,
        GOOGLE_SERVICE_ACCOUNT: process.env.GOOGLE_SERVICE_ACCOUNT ||
          JSON.stringify({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')
          })
      }
    })

    let output = ''
    let errorOutput = ''

    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    proc.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempScriptPath)
      } catch (e) {
        // Ignore cleanup errors
      }

      if (code === 0) {
        try {
          const result = JSON.parse(output)
          resolve(result)
        } catch (parseError: any) {
          reject(new Error(`Failed to parse result: ${parseError.message}`))
        }
      } else {
        reject(new Error(errorOutput || `Process exited with code ${code}`))
      }
    })

    // Timeout (30 seconds)
    setTimeout(() => {
      proc.kill()
      reject(new Error('Data append timeout (30 seconds)'))
    }, 30000)
  })
}

/**
 * POST endpoint: Create or append to Google Spreadsheet
 */
export async function POST(request: NextRequest) {
  try {
    const body: SheetsRequestBody = await request.json()
    const { action, spreadsheetId, sheetName, data, createIfNotExists } = body

    // Validate required fields
    if (!sheetName || !data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: sheetName and data array are required'
        },
        { status: 400 }
      )
    }

    // Check environment variables
    const hasGoogleCreds = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    if (!hasGoogleCreds) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Service Account credentials not configured'
        },
        { status: 500 }
      )
    }

    // Execute based on action
    if (action === 'append' && spreadsheetId) {
      // Append to existing spreadsheet
      const result = await appendToSpreadsheet(spreadsheetId, sheetName, data)
      return NextResponse.json(result)
    } else {
      // Create new spreadsheet
      const result = await createSpreadsheet(sheetName, data)
      return NextResponse.json(result)
    }

  } catch (error: any) {
    console.error('Google Sheets API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint: Check configuration status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'check-config') {
      const hasGoogleCreds = !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)

      return NextResponse.json({
        success: true,
        configured: hasGoogleCreds,
        environment: {
          serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✓ Configured' : '✗ Missing',
          privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ? '✓ Configured' : '✗ Missing'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Google Sheets API endpoint is ready',
      actions: ['create', 'append'],
      requiredEnv: ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY']
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
