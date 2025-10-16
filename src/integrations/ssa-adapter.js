/**
 * SSA (Smart Sheet Assistant) Adapter
 *
 * AutomationMaster와 SSA 생성기들을 연결하는 어댑터 레이어
 * SSA의 강력한 코드 생성 엔진을 automationmaster 워크플로우에서 사용할 수 있게 합니다.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SSA 프로젝트 루트 경로
const SSA_ROOT = join(__dirname, '../../../ssa');

/**
 * SSA 어댑터 클래스
 */
export class SSAAdapter {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.outputDir = options.outputDir || process.cwd();
  }

  /**
   * SSA 풀스택 생성기 실행
   * 5분 안에 완전한 Next.js 14 애플리케이션 생성
   *
   * @param {Object} options - 생성 옵션
   * @param {string} options.schemaFile - Supabase SQL 스키마 파일 경로
   * @param {string} options.projectName - 프로젝트 이름
   * @param {boolean} options.autoSetup - 자동 설정 (npm install, git init 등)
   * @param {boolean} options.deploy - 배포 설정 포함
   * @param {boolean} options.wizard - 대화형 마법사 모드
   * @returns {Promise<Object>} 생성 결과
   */
  async generateFullstack(options) {
    this.log('🚀 SSA 풀스택 생성기 시작...');

    const args = ['generate'];

    if (options.wizard) {
      args.push('--wizard');
    } else {
      if (options.schemaFile) args.push(options.schemaFile);
      if (options.projectName) args.push(`"${options.projectName}"`);
      if (options.autoSetup) args.push('--auto-setup');
      if (options.deploy) args.push('--deploy');
    }

    const result = await this.runSSACommand('fullstack-generator/masterCli.js', args);

    this.log('✅ 풀스택 생성 완료!');
    return result;
  }

  /**
   * SSA 백엔드 생성기 실행
   * V0/React 코드를 분석하여 Supabase 백엔드 자동 생성
   *
   * @param {Object} options - 생성 옵션
   * @param {string} options.codeFile - 프론트엔드 코드 파일 경로
   * @param {string} options.projectName - 프로젝트 이름
   * @param {string} options.securityLevel - 보안 레벨 (basic/standard/strict)
   * @param {boolean} options.realtime - 실시간 기능 포함
   * @param {boolean} options.performance - 성능 최적화 포함
   * @returns {Promise<Object>} 생성 결과
   */
  async generateBackend(options) {
    this.log('🔧 SSA 백엔드 생성기 시작...');

    const args = [];

    if (options.codeFile) {
      args.push('--file', options.codeFile);
    }
    if (options.projectName) {
      args.push('--name', `"${options.projectName}"`);
    }
    if (options.securityLevel) {
      args.push('--security', options.securityLevel);
    }
    if (options.realtime) {
      args.push('--realtime');
    }
    if (options.performance) {
      args.push('--performance');
    }

    const result = await this.runSSACommand('backend-generator/cli.js', args);

    this.log('✅ 백엔드 생성 완료!');
    return result;
  }

  /**
   * SSA 프론트엔드 생성기 실행
   * Supabase 스키마에서 완전한 React/Next.js 애플리케이션 생성
   *
   * @param {Object} options - 생성 옵션
   * @param {string} options.schemaFile - Supabase SQL 스키마 파일
   * @param {string} options.projectName - 프로젝트 이름
   * @param {string} options.uiLibrary - UI 라이브러리 (shadcn/mui/chakra)
   * @param {boolean} options.realtime - 실시간 기능 포함
   * @param {boolean} options.autoSetup - 자동 설정
   * @returns {Promise<Object>} 생성 결과
   */
  async generateFrontend(options) {
    this.log('🎨 SSA 프론트엔드 생성기 시작...');

    const args = [];

    if (options.schemaFile) {
      args.push('--file', options.schemaFile);
    }
    if (options.projectName) {
      args.push('--name', `"${options.projectName}"`);
    }
    if (options.uiLibrary) {
      args.push('--ui', options.uiLibrary);
    }
    if (options.realtime) {
      args.push('--realtime');
    }
    if (options.autoSetup) {
      args.push('--auto-setup');
    }

    const result = await this.runSSACommand('frontend-generator/cli.js', args);

    this.log('✅ 프론트엔드 생성 완료!');
    return result;
  }

  /**
   * SSA 마이그레이션 시스템 실행
   * Google Sheets를 Supabase PostgreSQL로 자동 마이그레이션
   *
   * @param {Object} options - 마이그레이션 옵션
   * @param {string} options.sheetId - Google Sheets ID
   * @param {boolean} options.analyze - 구조 분석만 수행
   * @param {boolean} options.migrate - 데이터 마이그레이션 실행
   * @returns {Promise<Object>} 마이그레이션 결과
   */
  async migrateGoogleSheets(options) {
    this.log('📊 SSA Google Sheets 마이그레이션 시작...');

    let result;

    if (options.analyze) {
      // 구조 분석
      result = await this.runSSACommand('migration/analyze_sheets.js', []);
      this.log('✅ 구조 분석 완료!');
    }

    if (options.migrate) {
      // 데이터 마이그레이션
      result = await this.runSSACommand('migrate_to_normalized_tables.js', []);
      this.log('✅ 데이터 마이그레이션 완료!');
    }

    return result;
  }

  /**
   * SSA 명령어 실행 헬퍼
   *
   * @param {string} scriptPath - SSA 스크립트 상대 경로
   * @param {Array<string>} args - 명령줄 인자
   * @returns {Promise<Object>} 실행 결과
   */
  async runSSACommand(scriptPath, args = []) {
    const fullPath = join(SSA_ROOT, 'src', scriptPath);

    // 파일 존재 확인
    try {
      await fs.access(fullPath);
    } catch (error) {
      throw new Error(`SSA 스크립트를 찾을 수 없습니다: ${fullPath}`);
    }

    return new Promise((resolve, reject) => {
      const child = spawn('node', [fullPath, ...args], {
        cwd: SSA_ROOT,
        stdio: this.verbose ? 'inherit' : 'pipe',
        shell: true
      });

      let stdout = '';
      let stderr = '';

      if (!this.verbose) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`SSA 명령어 실행 실패 (exit code ${code})\n${stderr}`));
        } else {
          resolve({
            success: true,
            output: stdout,
            error: stderr
          });
        }
      });

      child.on('error', (error) => {
        reject(new Error(`SSA 명령어 실행 오류: ${error.message}`));
      });
    });
  }

  /**
   * SSA 설치 상태 확인
   *
   * @returns {Promise<boolean>} 설치 여부
   */
  async checkSSAInstalled() {
    try {
      await fs.access(SSA_ROOT);
      await fs.access(join(SSA_ROOT, 'package.json'));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * SSA 버전 정보 가져오기
   *
   * @returns {Promise<string>} 버전 정보
   */
  async getSSAVersion() {
    try {
      const packageJson = await fs.readFile(join(SSA_ROOT, 'package.json'), 'utf-8');
      const pkg = JSON.parse(packageJson);
      return pkg.version || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * 로그 출력 헬퍼
   */
  log(message) {
    if (this.verbose) {
      console.log(`[SSA Adapter] ${message}`);
    }
  }
}

/**
 * 편의 함수: SSA 어댑터 인스턴스 생성
 */
export function createSSAAdapter(options) {
  return new SSAAdapter(options);
}

export default SSAAdapter;
