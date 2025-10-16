const { createSSAAdapter } = require('./ssa-adapter');
const path = require('path');
const fs = require('fs');

/**
 * PDF 추출 도구 래퍼
 * SSA의 PDF Parser를 활용하여 PDF에서 구조화된 데이터 추출
 */
class PDFExtractor {
  constructor(options = {}) {
    this.adapter = createSSAAdapter(options);
    this.verbose = options.verbose || false;
  }

  /**
   * PDF 파일 분석 및 데이터 추출
   * @param {string} pdfPath - PDF 파일 경로
   * @param {Object} options - 추출 옵션
   * @returns {Promise<Object>} 추출된 데이터
   */
  async extractFromPDF(pdfPath, options = {}) {
    try {
      // PDF 파일 존재 확인
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF 파일을 찾을 수 없습니다: ${pdfPath}`);
      }

      if (this.verbose) {
        console.log(`📄 PDF 분석 시작: ${pdfPath}`);
      }

      // SSA PDF parser 실행
      const result = await this.adapter.runSSACommand(
        'pdf/pdf_parser.js',
        ['analyze', pdfPath]
      );

      if (this.verbose) {
        console.log('✅ PDF 분석 완료');
      }

      return {
        success: true,
        data: result,
        source: pdfPath
      };
    } catch (error) {
      console.error(`PDF 추출 실패: ${error.message}`);
      return {
        success: false,
        error: error.message,
        source: pdfPath
      };
    }
  }

  /**
   * PDF 데이터를 Google Sheets로 마이그레이션
   * @param {string} pdfPath - PDF 파일 경로
   * @param {Object} options - 마이그레이션 옵션
   * @returns {Promise<Object>} 마이그레이션 결과
   */
  async extractAndMigrateToSheets(pdfPath, options = {}) {
    try {
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF 파일을 찾을 수 없습니다: ${pdfPath}`);
      }

      if (this.verbose) {
        console.log(`📄 PDF → Google Sheets 마이그레이션 시작`);
      }

      // SSA의 PDF to Sheets 통합 실행
      const result = await this.adapter.runSSACommand(
        '../process_pdf_to_sheets.js',
        [pdfPath]
      );

      if (this.verbose) {
        console.log('✅ 마이그레이션 완료');
      }

      return {
        success: true,
        result: result,
        source: pdfPath
      };
    } catch (error) {
      console.error(`PDF 마이그레이션 실패: ${error.message}`);
      return {
        success: false,
        error: error.message,
        source: pdfPath
      };
    }
  }

  /**
   * PDF 데이터 미리보기 (실제 추가하지 않고 파싱 결과만 확인)
   * @param {string} pdfPath - PDF 파일 경로
   * @returns {Promise<Object>} 미리보기 데이터
   */
  async previewPDF(pdfPath) {
    try {
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF 파일을 찾을 수 없습니다: ${pdfPath}`);
      }

      if (this.verbose) {
        console.log(`👁️ PDF 미리보기: ${pdfPath}`);
      }

      const result = await this.adapter.runSSACommand(
        'pdf/pdf_parser.js',
        ['preview', pdfPath]
      );

      return {
        success: true,
        preview: result,
        source: pdfPath
      };
    } catch (error) {
      console.error(`PDF 미리보기 실패: ${error.message}`);
      return {
        success: false,
        error: error.message,
        source: pdfPath
      };
    }
  }

  /**
   * 디렉토리의 모든 PDF 파일 일괄 처리
   * @param {string} directory - 디렉토리 경로
   * @param {Object} options - 처리 옵션
   * @returns {Promise<Object>} 일괄 처리 결과
   */
  async batchExtract(directory, options = {}) {
    try {
      if (!fs.existsSync(directory)) {
        throw new Error(`디렉토리를 찾을 수 없습니다: ${directory}`);
      }

      const files = fs.readdirSync(directory);
      const pdfFiles = files.filter(file =>
        path.extname(file).toLowerCase() === '.pdf'
      );

      if (pdfFiles.length === 0) {
        return {
          success: false,
          message: 'PDF 파일이 없습니다',
          directory
        };
      }

      if (this.verbose) {
        console.log(`📚 ${pdfFiles.length}개 PDF 파일 일괄 처리 시작`);
      }

      const results = [];
      for (const pdfFile of pdfFiles) {
        const pdfPath = path.join(directory, pdfFile);
        const result = await this.extractFromPDF(pdfPath, options);
        results.push({
          file: pdfFile,
          ...result
        });
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      return {
        success: true,
        processedFiles: pdfFiles.length,
        successCount,
        failCount,
        results
      };
    } catch (error) {
      console.error(`일괄 처리 실패: ${error.message}`);
      return {
        success: false,
        error: error.message,
        directory
      };
    }
  }

  /**
   * 지원하는 PDF 타입 목록
   * @returns {Array<string>} 지원하는 PDF 타입
   */
  getSupportedTypes() {
    return [
      'sales_report',      // 매출 보고서
      'product_catalog',   // 제품 카탈로그
      'transaction_log'    // 거래 내역
    ];
  }

  /**
   * PDF 타입 자동 감지
   * @param {string} pdfPath - PDF 파일 경로
   * @returns {Promise<Object>} PDF 타입 정보
   */
  async detectType(pdfPath) {
    try {
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF 파일을 찾을 수 없습니다: ${pdfPath}`);
      }

      const result = await this.adapter.runSSACommand(
        'pdf/pdf_parser.js',
        ['detect', pdfPath]
      );

      return {
        success: true,
        type: result.type,
        confidence: result.confidence,
        source: pdfPath
      };
    } catch (error) {
      console.error(`타입 감지 실패: ${error.message}`);
      return {
        success: false,
        error: error.message,
        source: pdfPath
      };
    }
  }
}

/**
 * PDFExtractor 인스턴스 생성 헬퍼 함수
 * @param {Object} options - 옵션
 * @returns {PDFExtractor} PDFExtractor 인스턴스
 */
function createPDFExtractor(options = {}) {
  return new PDFExtractor(options);
}

module.exports = {
  PDFExtractor,
  createPDFExtractor
};
