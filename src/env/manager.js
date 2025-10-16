/**
 * 환경변수 관리자
 * 중앙에서 환경변수 템플릿을 관리하고 프로젝트에 적용
 */

import fs from 'fs/promises';
import path from 'path';

class EnvManager {
  constructor() {
    this.templatePath = path.join(process.cwd(), 'templates', 'env.template.json');
    this.configPath = path.join(process.cwd(), 'config', 'env-config.json');
  }

  /**
   * 템플릿 로드
   */
  async loadTemplate() {
    try {
      const data = await fs.readFile(this.templatePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`템플릿 로드 실패: ${error.message}`);
    }
  }

  /**
   * 환경변수 설정 저장
   */
  async saveConfig(config) {
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`설정 저장 실패: ${error.message}`);
    }
  }

  /**
   * 환경변수 설정 로드
   */
  async loadConfig() {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw new Error(`설정 로드 실패: ${error.message}`);
    }
  }

  /**
   * 프리셋 가져오기
   */
  async getPresets() {
    const template = await this.loadTemplate();
    return template.presets;
  }

  /**
   * 특정 프리셋의 변수 목록 가져오기
   */
  async getPresetVariables(presetName) {
    const template = await this.loadTemplate();
    const preset = template.presets[presetName];

    if (!preset) {
      throw new Error(`프리셋 '${presetName}'을 찾을 수 없습니다.`);
    }

    const variables = {};
    for (const templateName of preset) {
      const templateVars = template.templates[templateName];
      if (templateVars) {
        Object.assign(variables, templateVars.variables);
      }
    }

    return variables;
  }

  /**
   * .env 파일 생성
   */
  async generateEnvFile(targetPath, config, options = {}) {
    const {
      includeComments = true,
      includeExamples = true,
      environment = 'development'
    } = options;

    let content = '';

    // 헤더
    if (includeComments) {
      content += `# 환경변수 설정\n`;
      content += `# 환경: ${environment}\n`;
      content += `# 생성일: ${new Date().toISOString()}\n`;
      content += `\n`;
    }

    // 프리셋별로 그룹화
    const template = await this.loadTemplate();
    const presetTemplates = template.presets[config.preset] || [];

    for (const templateName of presetTemplates) {
      const templateData = template.templates[templateName];
      if (!templateData) continue;

      if (includeComments) {
        content += `# ${templateData.description}\n`;
      }

      for (const [key, varData] of Object.entries(templateData.variables)) {
        const value = config.values[key] || '';

        if (includeComments) {
          content += `# ${varData.description}\n`;
          if (includeExamples && varData.example) {
            content += `# 예시: ${varData.example}\n`;
          }
          if (varData.required) {
            content += `# 필수\n`;
          }
        }

        content += `${key}=${value}\n`;
        if (includeComments) {
          content += `\n`;
        }
      }

      if (includeComments) {
        content += `\n`;
      }
    }

    // 파일 쓰기
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, content);

    return targetPath;
  }

  /**
   * .env 파일에서 환경변수 읽기
   */
  async readEnvFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const values = {};

      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          values[key.trim()] = valueParts.join('=').trim();
        }
      }

      return values;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      }
      throw error;
    }
  }

  /**
   * 여러 환경에 대한 .env 파일 생성
   */
  async generateMultipleEnvFiles(baseDir, config) {
    const environments = ['development', 'staging', 'production'];
    const results = {};

    for (const env of environments) {
      const filename = env === 'development' ? '.env' : `.env.${env}`;
      const targetPath = path.join(baseDir, filename);

      await this.generateEnvFile(targetPath, config, {
        environment: env,
        includeComments: true,
        includeExamples: env === 'development'
      });

      results[env] = targetPath;
    }

    return results;
  }

  /**
   * 환경변수 검증
   */
  async validateConfig(config) {
    const template = await this.loadTemplate();
    const presetTemplates = template.presets[config.preset] || [];
    const errors = [];

    for (const templateName of presetTemplates) {
      const templateData = template.templates[templateName];
      if (!templateData) continue;

      for (const [key, varData] of Object.entries(templateData.variables)) {
        if (varData.required && !config.values[key]) {
          errors.push(`필수 변수 '${key}'가 설정되지 않았습니다.`);
        }

        // 옵션 검증
        if (varData.options && config.values[key]) {
          if (!varData.options.includes(config.values[key])) {
            errors.push(`변수 '${key}'의 값은 [${varData.options.join(', ')}] 중 하나여야 합니다.`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 템플릿에 새 변수 추가
   */
  async addVariable(templateName, variableName, variableData) {
    const template = await this.loadTemplate();

    if (!template.templates[templateName]) {
      template.templates[templateName] = {
        description: '',
        variables: {}
      };
    }

    template.templates[templateName].variables[variableName] = variableData;

    await fs.writeFile(this.templatePath, JSON.stringify(template, null, 2));
  }

  /**
   * 프로젝트 환경변수 상태 확인
   */
  async checkProjectEnv(projectPath) {
    const envFiles = ['.env', '.env.development', '.env.staging', '.env.production'];
    const status = {};

    for (const file of envFiles) {
      const filePath = path.join(projectPath, file);
      try {
        await fs.access(filePath);
        const values = await this.readEnvFile(filePath);
        status[file] = {
          exists: true,
          variableCount: Object.keys(values).length,
          values: Object.keys(values)
        };
      } catch {
        status[file] = {
          exists: false,
          variableCount: 0,
          values: []
        };
      }
    }

    return status;
  }
}

export default EnvManager;
