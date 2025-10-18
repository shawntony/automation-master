# 🎭 Playwright E2E Testing Suite

Comprehensive end-to-end and component testing for Automation Master Web Application.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## 🎯 Overview

This test suite provides comprehensive coverage for:

- ✅ **E2E Tests**: Full user journeys and workflows
- ✅ **Component Tests**: UI component behavior and interactions
- ✅ **Accessibility Tests**: WCAG compliance with axe-core
- ✅ **Cross-Browser Tests**: Chrome, Firefox, Safari, Mobile
- ✅ **Visual Tests**: Screenshot and layout validation

## 📁 Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── pdf-tool.spec.ts   # PDF extraction tool tests
│   └── ...
├── component/              # Component tests
│   ├── toast.spec.ts      # Toast notification tests
│   ├── dialog.spec.ts     # Dialog component tests
│   └── ...
└── fixtures/               # Test data and helpers
```

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Interactive UI Mode
```bash
npm run test:ui
```

### With Browser Visible (Headed Mode)
```bash
npm run test:headed
```

### Chromium Only
```bash
npm run test:chromium
```

### Debug Mode
```bash
npm run test:debug
```

### View Test Report
```bash
npm run test:report
```

### Specific Test File
```bash
npx playwright test pdf-tool.spec.ts
```

### Specific Test Case
```bash
npx playwright test -g "should display PDF tool page correctly"
```

## 📝 Test Coverage

### E2E Tests

#### PDF Tool (`e2e/pdf-tool.spec.ts`)
- ✅ Page display and layout
- ✅ Progress steps visualization
- ✅ Parsing mode selection (simple, keyvalue, table)
- ✅ File upload workflow
- ✅ Template management (save, load, delete)
- ✅ Advanced settings
- ✅ Accessibility compliance
- ✅ Mobile responsiveness

### Component Tests

#### Toast Notifications (`component/toast.spec.ts`)
- ✅ Success/Error/Warning/Info types
- ✅ Auto-dismiss behavior
- ✅ Manual close functionality
- ✅ Multiple toast stacking
- ✅ Toast animations
- ✅ Accessibility attributes
- ✅ Mobile display

#### Dialog Component (`component/dialog.spec.ts`)
- ✅ Open/Close functionality
- ✅ ESC key handling
- ✅ Backdrop click to close
- ✅ Confirm/Cancel actions
- ✅ Variant styling (default, danger)
- ✅ Scroll blocking
- ✅ Focus management
- ✅ Mobile responsiveness

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page')
  })

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.locator('button:has-text("Click Me")')

    // Act
    await button.click()

    // Assert
    await expect(page.locator('.result')).toContainText('Success')
  })
})
```

### Accessibility Testing

```typescript
import { injectAxe, checkA11y } from '@axe-core/playwright'

test('should be accessible', async ({ page }) => {
  await page.goto('/your-page')
  await injectAxe(page)

  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true,
    },
  })
})
```

### Mobile Testing

```typescript
test('mobile: should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })

  // Your mobile-specific tests
})
```

## 🔧 Configuration

### playwright.config.ts

Key configuration options:

- **baseURL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile Devices**: Pixel 5, iPhone 12
- **Timeouts**: 10s action timeout
- **Screenshots**: On failure only
- **Video**: Retain on failure
- **Traces**: On first retry

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm test

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

The report includes:
- ✅ Pass/Fail status
- 📸 Screenshots on failure
- 🎥 Videos of failed tests
- 📋 Detailed traces
- ⏱️ Execution times

## 🎯 Best Practices

### 1. Use Descriptive Test Names
```typescript
// ✅ Good
test('should show success toast when saving settings')

// ❌ Bad
test('toast test')
```

### 2. Follow AAA Pattern
```typescript
test('example', async ({ page }) => {
  // Arrange - Setup
  await page.goto('/page')

  // Act - Perform action
  await page.click('button')

  // Assert - Verify result
  await expect(page.locator('.result')).toBeVisible()
})
```

### 3. Use Specific Locators
```typescript
// ✅ Good - Specific and stable
page.locator('button:has-text("Submit")')
page.locator('[data-testid="submit-button"]')

// ❌ Bad - Fragile
page.locator('button').nth(2)
```

### 4. Wait for Elements Properly
```typescript
// ✅ Good - Auto-waiting
await expect(page.locator('.result')).toBeVisible()

// ❌ Bad - Arbitrary timeout
await page.waitForTimeout(5000)
```

### 5. Clean Up After Tests
```typescript
test.afterEach(async ({ page }) => {
  // Clean up localStorage, cookies, etc.
  await page.evaluate(() => localStorage.clear())
})
```

## 🐛 Debugging Tests

### Run in Debug Mode
```bash
npm run test:debug
```

### Add Debug Breakpoint
```typescript
test('debug example', async ({ page }) => {
  await page.goto('/page')
  await page.pause() // Debugger will pause here
  await page.click('button')
})
```

### View Test Execution
```bash
npm run test:headed
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Axe-core Playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [Test Examples](https://playwright.dev/docs/test-assertions)

## 🤝 Contributing

When adding new features, please:

1. Write corresponding tests
2. Ensure all tests pass locally
3. Update this README if needed
4. Follow the established patterns

## 📈 Coverage Goals

Target coverage:
- ✅ E2E Critical Paths: 100%
- ✅ Component Interactions: 90%+
- ✅ Accessibility: All public pages
- ✅ Cross-Browser: Chrome, Firefox, Safari
- ✅ Mobile: iOS & Android viewports

---

**Last Updated**: 2025-10-17
**Test Framework**: Playwright v1.56.1
**Accessibility**: axe-core v4.10.2
