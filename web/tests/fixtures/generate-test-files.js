/**
 * Generate test fixture files for E2E testing
 * Simple text-based files that mimic PDF/HWP structure
 */

const fs = require('fs');
const path = require('path');

const fixturesDir = __dirname;

// Create a simple PDF-like text file (for testing file upload mechanism)
const samplePdfContent = `
%PDF-1.4
Sample Invoice Document

Customer: John Doe
Invoice Number: INV-2024-001
Date: 2024-01-15

Items:
- Product A: $100.00
- Product B: $50.00
- Tax: $15.00

Total: $165.00

Thank you for your business!
`;

// Create a simple HWP-like text file
const sampleHwpContent = `
한글 문서 샘플

제목: 테스트 문서
작성일: 2024-01-15
작성자: 홍길동

본문:
이것은 테스트용 한글 문서입니다.
Playwright 테스트를 위한 샘플 파일입니다.

- 항목 1
- 항목 2
- 항목 3

감사합니다.
`;

// Save files
fs.writeFileSync(path.join(fixturesDir, 'sample-invoice.txt'), samplePdfContent);
fs.writeFileSync(path.join(fixturesDir, 'sample-document.txt'), sampleHwpContent);

// Create a JSON file with expected extraction results
const expectedResults = {
  pdf: {
    simpleText: [
      'Sample Invoice Document',
      'Customer: John Doe',
      'Invoice Number: INV-2024-001',
      'Date: 2024-01-15',
      'Total: $165.00'
    ],
    keyValue: {
      'Customer': 'John Doe',
      'Invoice Number': 'INV-2024-001',
      'Date': '2024-01-15',
      'Total': '$165.00'
    }
  },
  hwp: {
    simpleText: [
      '제목: 테스트 문서',
      '작성일: 2024-01-15',
      '작성자: 홍길동'
    ]
  }
};

fs.writeFileSync(
  path.join(fixturesDir, 'expected-results.json'),
  JSON.stringify(expectedResults, null, 2)
);

console.log('✅ Test fixture files generated successfully!');
console.log('📁 Files created:');
console.log('  - sample-invoice.txt (mock PDF)');
console.log('  - sample-document.txt (mock HWP)');
console.log('  - expected-results.json');
