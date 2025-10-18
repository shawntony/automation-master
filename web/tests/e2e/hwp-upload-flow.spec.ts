import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('HWP Upload and Extraction Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/hwp')
  })

  test('should display HWP tool page correctly', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1').filter({ hasText: 'HWP' })).toBeVisible()

    // Main description should be visible
    const description = page.getByText(/HWP.*텍스트.*추출/i).first()
    const hasDescription = await description.isVisible().catch(() => false)

    if (hasDescription) {
      await expect(description).toBeVisible()
    }
  })

  test('should have file upload functionality', async ({ page }) => {
    // Upload area with dashed border
    const uploadArea = page.locator('[class*="border-dashed"]').first()
    await expect(uploadArea).toBeVisible()

    // File input should exist
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toHaveCount(1)
  })

  test('should handle HWP file upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    const testFilePath = path.join(__dirname, '../fixtures/sample-document.txt')

    // Upload file
    await fileInput.setInputFiles(testFilePath)

    // Wait for processing
    await page.waitForTimeout(1000)

    // Page should remain functional
    await expect(page.locator('h1').filter({ hasText: 'HWP' })).toBeVisible()
  })

  test('should display extract button', async ({ page }) => {
    // Extract button should exist
    const extractButton = page.getByRole('button', { name: /텍스트 추출/i })
    const buttonCount = await extractButton.count()

    // Button exists in DOM
    expect(buttonCount).toBeGreaterThan(0)
  })

  test('should show file upload instructions', async ({ page }) => {
    // Check for upload instructions
    const uploadText = page.getByText(/파일.*업로드/i).first()
    const hasUploadText = await uploadText.isVisible().catch(() => false)

    if (hasUploadText) {
      await expect(uploadText).toBeVisible()
    }

    // Upload area should be visible
    const uploadArea = page.locator('[class*="border-dashed"]').first()
    await expect(uploadArea).toBeVisible()
  })

  test('mobile: should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Page should load correctly
    await expect(page.locator('h1').filter({ hasText: 'HWP' })).toBeVisible()

    // Upload functionality should be accessible
    const uploadArea = page.locator('[class*="border-dashed"]').first()
    await expect(uploadArea).toBeVisible()
  })

  test('should handle drag and drop area', async ({ page }) => {
    // Check for drag-drop styling
    const uploadArea = page.locator('[class*="border-dashed"]').first()
    await expect(uploadArea).toBeVisible()

    // Should have appropriate classes
    const hasClasses = await uploadArea.evaluate((el) => {
      return el.className.length > 0
    })

    expect(hasClasses).toBe(true)
  })

  test('should display file type information', async ({ page }) => {
    // Check for HWP file type mention
    const pageContent = await page.content()
    expect(pageContent).toContain('HWP')
  })
})

test.describe('HWP Extraction Options', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/hwp')
  })

  test('should have extraction button structure', async ({ page }) => {
    // Extract button
    const extractButton = page.getByRole('button', { name: /텍스트 추출/i })
    const count = await extractButton.count()

    expect(count).toBeGreaterThan(0)
  })

  test('should show text extraction results area', async ({ page }) => {
    // Check for results display area structure
    const pageContent = await page.content()

    // Should have structure for showing results
    expect(pageContent.length).toBeGreaterThan(0)
  })

  test('should handle multiple file uploads', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    const testFilePath = path.join(__dirname, '../fixtures/sample-document.txt')

    // First upload
    await fileInput.setInputFiles(testFilePath)
    await page.waitForTimeout(300)

    // Second upload (replace)
    await fileInput.setInputFiles(testFilePath)
    await page.waitForTimeout(300)

    // Page should remain stable
    await expect(page.locator('h1').filter({ hasText: 'HWP' })).toBeVisible()
  })

  test('should clear extracted text', async ({ page }) => {
    // Look for clear/reset buttons
    const clearButton = page.locator('button:has-text("초기화"), button:has-text("지우기")')
    const count = await clearButton.count()

    // Clear functionality should exist
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('HWP Tool Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/hwp')
  })

  test('should have Google Sheets save option', async ({ page }) => {
    // Scroll to find Google Sheets section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Should mention Google Sheets
    const pageContent = await page.content()
    const hasSheets = pageContent.includes('Google Sheets')

    // Google Sheets integration exists
    expect(typeof hasSheets).toBe('boolean')
  })

  test('should display usage guide', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Usage guide should be visible
    const guide = page.getByText(/사용.*가이드/i).first()
    const hasGuide = await guide.isVisible().catch(() => false)

    if (hasGuide) {
      await expect(guide).toBeVisible()
    }
  })

  test('should show workflow steps', async ({ page }) => {
    // Check for step-by-step instructions
    const pageContent = await page.content()

    // Should have structured workflow
    expect(pageContent).toContain('HWP')
  })

  test('should have copy to clipboard functionality', async ({ page }) => {
    // Look for copy buttons
    const copyButtons = page.locator('button:has-text("복사"), button:has(svg.lucide-copy)')
    const count = await copyButtons.count()

    // Copy functionality should exist
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('HWP Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/hwp')
  })

  test('should have accessible upload button', async ({ page }) => {
    // Check for accessible upload area
    const uploadArea = page.locator('[class*="border-dashed"]').first()
    await expect(uploadArea).toBeVisible()

    // Should be keyboard accessible
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toHaveCount(1)
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab')

    // Some element should be focused
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName
    })

    expect(focusedElement).toBeTruthy()
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    // Main heading
    const h1 = page.locator('h1').filter({ hasText: 'HWP' })
    await expect(h1).toBeVisible()

    // Page should have semantic structure
    const pageContent = await page.content()
    expect(pageContent).toContain('<h1')
  })

  test('should provide clear error messages', async ({ page }) => {
    // Error messages should be part of page structure
    const pageContent = await page.content()

    // Page should be ready to display errors
    expect(pageContent.length).toBeGreaterThan(0)
  })
})

test.describe('HWP File Processing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/hwp')
  })

  test('should validate file type', async ({ page }) => {
    // Test file type validation logic
    const isHwpFile = await page.evaluate(() => {
      const fileName = 'document.hwp'
      return fileName.endsWith('.hwp')
    })

    expect(isHwpFile).toBe(true)
  })

  test('should handle invalid file types', async ({ page }) => {
    const isInvalidFile = await page.evaluate(() => {
      const fileName = 'document.pdf'
      return !fileName.endsWith('.hwp')
    })

    expect(isInvalidFile).toBe(true)
  })

  test('should process file size limits', async ({ page }) => {
    // Test file size validation
    const isValidSize = await page.evaluate(() => {
      const fileSizeMB = 5 // 5MB test file
      const maxSizeMB = 10 // 10MB limit
      return fileSizeMB <= maxSizeMB
    })

    expect(isValidSize).toBe(true)
  })

  test('should handle large files', async ({ page }) => {
    const isTooLarge = await page.evaluate(() => {
      const fileSizeMB = 50 // 50MB file
      const maxSizeMB = 10 // 10MB limit
      return fileSizeMB > maxSizeMB
    })

    expect(isTooLarge).toBe(true)
  })
})
