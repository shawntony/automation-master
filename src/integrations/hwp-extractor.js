const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * HWP 추출 도구 래퍼
 * SSA의 Python Flask HWP Parser 서비스를 활용하여 HWP 파일에서 텍스트 추출
 */
class HWPExtractor {
  constructor(options = {}) {
    this.serviceUrl = options.serviceUrl || 'http://localhost:5001';
    this.verbose = options.verbose || false;
    this.pythonProcess = null;
    this.isServiceRunning = false;
  }

  /**
   * HWP Parser 서비스 시작
   * @returns {Promise<boolean>} 서비스 시작 성공 여부
   */
  async startService() {
    try {
      // 이미 실행 중인지 확인
      const isRunning = await this.checkServiceHealth();
      if (isRunning) {
        if (this.verbose) {
          console.log('✅ HWP Parser 서비스가 이미 실행 중입니다');
        }
        this.isServiceRunning = true;
        return true;
      }

      if (this.verbose) {
        console.log('🚀 HWP Parser 서비스 시작 중...');
      }

      // Python 서비스 경로
      const ssaRoot = path.join(__dirname, '..', '..', '..', 'ssa');
      const servicePath = path.join(ssaRoot, 'dev-tool', 'python-services', 'hwp_parser.py');

      if (!fs.existsSync(servicePath)) {
        throw new Error(`HWP Parser 서비스 파일을 찾을 수 없습니다: ${servicePath}`);
      }

      // Python 프로세스 시작
      this.pythonProcess = spawn('python', [servicePath], {
        cwd: path.dirname(servicePath),
        stdio: this.verbose ? 'inherit' : 'ignore',
        detached: false
      });

      // 프로세스 에러 처리
      this.pythonProcess.on('error', (error) => {
        console.error(`Python 프로세스 오류: ${error.message}`);
        this.isServiceRunning = false;
      });

      // 서비스가 시작될 때까지 대기 (최대 5초)
      for (let i = 0; i < 10; i++) {
        await this.sleep(500);
        const isHealthy = await this.checkServiceHealth();
        if (isHealthy) {
          this.isServiceRunning = true;
          if (this.verbose) {
            console.log('✅ HWP Parser 서비스 시작 완료');
          }
          return true;
        }
      }

      throw new Error('HWP Parser 서비스 시작 시간 초과');
    } catch (error) {
      console.error(`HWP Parser 서비스 시작 실패: ${error.message}`);
      return false;
    }
  }

  /**
   * HWP Parser 서비스 중지
   */
  stopService() {
    if (this.pythonProcess) {
      this.pythonProcess.kill();
      this.pythonProcess = null;
      this.isServiceRunning = false;
      if (this.verbose) {
        console.log('🛑 HWP Parser 서비스 중지됨');
      }
    }
  }

  /**
   * 서비스 상태 확인
   * @returns {Promise<boolean>} 서비스 실행 여부
   */
  async checkServiceHealth() {
    try {
      const response = await axios.get(`${this.serviceUrl}/health`, {
        timeout: 1000
      });
      return response.data.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  /**
   * HWP 파일에서 텍스트 추출
   * @param {string} hwpPath - HWP 파일 경로
   * @param {Object} options - 추출 옵션
   * @returns {Promise<Object>} 추출된 텍스트와 메타데이터
   */
  async extractFromHWP(hwpPath, options = {}) {
    try {
      // 파일 존재 확인
      if (!fs.existsSync(hwpPath)) {
        throw new Error(`HWP 파일을 찾을 수 없습니다: ${hwpPath}`);
      }

      // 서비스 실행 확인
      if (!this.isServiceRunning) {
        const started = await this.startService();
        if (!started) {
          throw new Error('HWP Parser 서비스를 시작할 수 없습니다');
        }
      }

      if (this.verbose) {
        console.log(`📄 HWP 파일 처리 중: ${hwpPath}`);
      }

      // FormData 생성
      const formData = new FormData();
      formData.append('file', fs.createReadStream(hwpPath));

      // HWP 파싱 요청
      const response = await axios.post(
        `${this.serviceUrl}/parse-hwp`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000 // 30초 타임아웃
        }
      );

      if (response.data.success) {
        if (this.verbose) {
          console.log(`✅ HWP 추출 완료: ${response.data.sections}개 섹션`);
        }

        return {
          success: true,
          text: response.data.text,
          sections: response.data.sections,
          source: hwpPath
        };
      } else {
        throw new Error(response.data.error || 'HWP 파싱 실패');
      }
    } catch (error) {
      console.error(`HWP 추출 실패: ${error.message}`);
      return {
        success: false,
        error: error.message,
        source: hwpPath
      };
    }
  }

  /**
   * HWP 파일을 텍스트 파일로 저장
   * @param {string} hwpPath - HWP 파일 경로
   * @param {string} outputPath - 출력 텍스트 파일 경로
   * @returns {Promise<Object>} 저장 결과
   */
  async extractToTextFile(hwpPath, outputPath = null) {
    try {
      const result = await this.extractFromHWP(hwpPath);

      if (!result.success) {
        return result;
      }

      // 출력 경로가 지정되지 않으면 입력 파일과 같은 디렉토리에 .txt로 저장
      if (!outputPath) {
        const parsed = path.parse(hwpPath);
        outputPath = path.join(parsed.dir, `${parsed.name}.txt`);
      }

      // 텍스트 파일로 저장
      fs.writeFileSync(outputPath, result.text, 'utf-8');

      if (this.verbose) {
        console.log(`💾 텍스트 파일 저장 완료: ${outputPath}`);
      }

      return {
        success: true,
        outputPath,
        textLength: result.text.length,
        sections: result.sections
      };
    } catch (error) {
      console.error(`텍스트 파일 저장 실패: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 디렉토리의 모든 HWP 파일 일괄 처리
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
      const hwpFiles = files.filter(file =>
        ['.hwp', '.hwpx'].includes(path.extname(file).toLowerCase())
      );

      if (hwpFiles.length === 0) {
        return {
          success: false,
          message: 'HWP 파일이 없습니다',
          directory
        };
      }

      if (this.verbose) {
        console.log(`📚 ${hwpFiles.length}개 HWP 파일 일괄 처리 시작`);
      }

      const results = [];
      for (const hwpFile of hwpFiles) {
        const hwpPath = path.join(directory, hwpFile);
        const result = await this.extractFromHWP(hwpPath, options);
        results.push({
          file: hwpFile,
          ...result
        });
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      return {
        success: true,
        processedFiles: hwpFiles.length,
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
   * Sleep 헬퍼 함수
   * @param {number} ms - 대기 시간 (밀리초)
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * HWPExtractor 인스턴스 생성 헬퍼 함수
 * @param {Object} options - 옵션
 * @returns {HWPExtractor} HWPExtractor 인스턴스
 */
function createHWPExtractor(options = {}) {
  return new HWPExtractor(options);
}

module.exports = {
  HWPExtractor,
  createHWPExtractor
};
