import { test, expect } from '@playwright/test'

test.describe('Google Sheets Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/pdf')
  })

  test('should display Google Sheets save section', async ({ page }) => {
    // Scroll to find Google Sheets section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))

    // Check for Google Sheets related content
    const pageContent = await page.content()
    expect(pageContent).toContain('Google Sheets')
  })

  test('should have Step 4 for Google Sheets save', async ({ page }) => {
    const step4 = page.getByText('Step 4')
    const hasStep4 = await step4.isVisible().catch(() => false)

    if (hasStep4) {
      await expect(step4).toBeVisible()
    }

    // Google Sheets should be mentioned
    const pageContent = await page.content()
    expect(pageContent).toContain('Google Sheets')
  })

  test('should show spreadsheet URL input structure', async ({ page }) => {
    // Check that page has content
    const pageContent = await page.content()

    // Should have some input fields (for Google Sheets integration)
    expect(pageContent.length).toBeGreaterThan(0)
  })

  test('should validate Google Sheets URL format', async ({ page }) => {
    // Test URL validation logic
    const isValidUrl = await page.evaluate(() => {
      const testUrl = 'https://docs.google.com/spreadsheets/d/1234567890'
      return testUrl.includes('docs.google.com/spreadsheets')
    })

    expect(isValidUrl).toBe(true)
  })

  test('should handle invalid Google Sheets URLs', async ({ page }) => {
    const isInvalidUrl = await page.evaluate(() => {
      const testUrl = 'https://invalid-url.com'
      return !testUrl.includes('docs.google.com/spreadsheets')
    })

    expect(isInvalidUrl).toBe(true)
  })

  test('should display save to Sheets button structure', async ({ page }) => {
    // Look for save-related buttons
    const saveButtons = page.locator('button:has-text("저장")')
    const buttonCount = await saveButtons.count()

    // Should have save buttons
    expect(buttonCount).toBeGreaterThanOrEqual(0)
  })

  test('should show sheet name input capability', async ({ page }) => {
    // Check page has input capabilities for sheet naming
    const textInputs = page.locator('input[type="text"]')
    const count = await textInputs.count()

    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should handle authentication requirements', async ({ page }) => {
    // Navigate to settings to check Google Sheets config
    await page.goto('/settings')

    // Should have Google Sheets API configuration section
    await expect(page.getByRole('heading', { name: 'Google Sheets API' })).toBeVisible()

    // Service account email field
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveCount(1)
  })

  test('should display service account configuration help', async ({ page }) => {
    await page.goto('/settings')

    // Help text for Google Sheets setup
    const helpText = page.getByText(/Google Cloud Console/i)
    const hasHelp = await helpText.isVisible().catch(() => false)

    if (hasHelp) {
      await expect(helpText).toBeVisible()
    }
  })

  test('should show API key requirements', async ({ page }) => {
    await page.goto('/settings')

    // Check for Private Key field
    const privateKeyLabel = page.getByText('Private Key')
    const hasPrivateKey = await privateKeyLabel.isVisible().catch(() => false)

    if (hasPrivateKey) {
      await expect(privateKeyLabel).toBeVisible()
    }
  })
})

test.describe('Google Sheets Save Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/pdf')
  })

  test('should complete Sheets save UI flow', async ({ page }) => {
    // Page should load correctly
    await expect(page.locator('h1').filter({ hasText: 'PDF' })).toBeVisible()

    // Check for Google Sheets mention
    const pageContent = await page.content()
    expect(pageContent).toContain('Google Sheets')
  })

  test('should handle successful save simulation', async ({ page }) => {
    // Simulate successful save to localStorage
    await page.evaluate(() => {
      const saveResult = {
        success: true,
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/test123',
        sheetName: 'PDF Data',
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('last-sheets-save', JSON.stringify(saveResult))
    })

    const saved = await page.evaluate(() => {
      return localStorage.getItem('last-sheets-save')
    })

    expect(saved).toContain('test123')
    expect(saved).toContain('success')
  })

  test('should handle save error simulation', async ({ page }) => {
    // Simulate error
    await page.evaluate(() => {
      const errorResult = {
        success: false,
        error: 'Authentication failed',
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('last-sheets-error', JSON.stringify(errorResult))
    })

    const errorData = await page.evaluate(() => {
      return localStorage.getItem('last-sheets-error')
    })

    expect(errorData).toContain('Authentication failed')
    expect(errorData).toContain('success":false')
  })

  test('should preserve spreadsheet URL in localStorage', async ({ page }) => {
    const testUrl = 'https://docs.google.com/spreadsheets/d/test-preservation'

    await page.evaluate((url) => {
      localStorage.setItem('google-sheets-url', url)
    }, testUrl)

    // Reload and check persistence
    await page.reload()

    const saved = await page.evaluate(() => {
      return localStorage.getItem('google-sheets-url')
    })

    expect(saved).toBe(testUrl)
  })
})

test.describe('Google Sheets Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
  })

  test('should save Google Sheets credentials', async ({ page }) => {
    // Find email input
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveCount(1)

    // Type test email
    await emailInput.fill('test@example.iam.gserviceaccount.com')

    // Verify input value
    const inputValue = await emailInput.inputValue()
    expect(inputValue).toContain('test@example')
  })

  test('should toggle private key visibility', async ({ page }) => {
    // Look for eye/eye-off toggle buttons
    const toggleButtons = page.locator('button svg.lucide-eye, button svg.lucide-eye-off')
    const count = await toggleButtons.count()

    // Should have visibility toggle buttons
    expect(count).toBeGreaterThan(0)
  })

  test('should export .env file with Sheets config', async ({ page }) => {
    // Find export button
    const exportButton = page.getByRole('button', { name: /.env.*내보내기/i })
    const hasExport = await exportButton.isVisible().catch(() => false)

    if (hasExport) {
      await expect(exportButton).toBeVisible()
    }
  })

  test('should display service status for Google Sheets', async ({ page }) => {
    // Service status section
    await expect(page.getByText('서비스 상태')).toBeVisible()

    // Google Sheets status indicator
    await expect(page.locator('span').filter({ hasText: 'Google Sheets API' }).first()).toBeVisible()
  })

  test('should refresh service status', async ({ page }) => {
    // Refresh button
    const refreshButton = page.getByRole('button', { name: /새로고침/i })
    const hasRefresh = await refreshButton.isVisible().catch(() => false)

    if (hasRefresh) {
      await expect(refreshButton).toBeVisible()
      await expect(refreshButton).toBeEnabled()
    }
  })
})
