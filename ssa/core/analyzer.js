/**
 * Google Sheets 분석기
 * 스프레드시트의 구조, 수식, 참조 관계를 분석
 */

export class SheetAnalyzer {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.sheetData = null;
  }

  /**
   * 스프레드시트 전체 분석
   * @param {Object} spreadsheet - Google Sheets 데이터
   * @returns {Object} 분석 결과
   */
  async analyzeSpreadsheet(spreadsheet) {
    if (this.verbose) {
      console.log('📊 스프레드시트 분석 시작...');
    }

    const analysis = {
      sheets: [],
      totalFormulas: 0,
      formulaTypes: {},
      dependencies: [],
      dataFlow: [],
      complexity: 0
    };

    // 각 시트 분석
    for (const sheet of spreadsheet.sheets) {
      const sheetAnalysis = await this.analyzeSheet(sheet);
      analysis.sheets.push(sheetAnalysis);
      analysis.totalFormulas += sheetAnalysis.formulas.length;

      // 수식 타입 집계
      for (const [type, count] of Object.entries(sheetAnalysis.formulaTypes)) {
        analysis.formulaTypes[type] = (analysis.formulaTypes[type] || 0) + count;
      }
    }

    // 시트 간 의존성 분석
    analysis.dependencies = this.analyzeDependencies(analysis.sheets);

    // 데이터 흐름 분석
    analysis.dataFlow = this.analyzeDataFlow(analysis.sheets);

    // 복잡도 계산
    analysis.complexity = this.calculateComplexity(analysis);

    if (this.verbose) {
      console.log(`✅ 분석 완료: ${analysis.sheets.length}개 시트, ${analysis.totalFormulas}개 수식`);
    }

    return analysis;
  }

  /**
   * 개별 시트 분석
   * @param {Object} sheet - 시트 데이터
   * @returns {Object} 시트 분석 결과
   */
  async analyzeSheet(sheet) {
    const analysis = {
      name: sheet.name,
      formulas: [],
      formulaTypes: {},
      references: [],
      dataRanges: []
    };

    // 모든 셀 검사
    for (let row = 0; row < sheet.data.length; row++) {
      for (let col = 0; col < sheet.data[row].length; col++) {
        const cell = sheet.data[row][col];

        if (this.isFormula(cell)) {
          const formula = this.parseFormula(cell, row, col);
          analysis.formulas.push(formula);

          // 수식 타입 집계
          const type = formula.type;
          analysis.formulaTypes[type] = (analysis.formulaTypes[type] || 0) + 1;

          // 참조 추출
          const refs = this.extractReferences(formula);
          analysis.references.push(...refs);
        }
      }
    }

    // 데이터 범위 식별
    analysis.dataRanges = this.identifyDataRanges(sheet);

    return analysis;
  }

  /**
   * 수식 여부 확인
   * @param {string} cell - 셀 값
   * @returns {boolean}
   */
  isFormula(cell) {
    return typeof cell === 'string' && cell.startsWith('=');
  }

  /**
   * 수식 파싱
   * @param {string} formula - 수식 문자열
   * @param {number} row - 행 번호
   * @param {number} col - 열 번호
   * @returns {Object} 파싱된 수식 정보
   */
  parseFormula(formula, row, col) {
    const formulaStr = formula.substring(1); // '=' 제거

    return {
      original: formula,
      location: { row, col },
      type: this.detectFormulaType(formulaStr),
      function: this.extractFunction(formulaStr),
      arguments: this.extractArguments(formulaStr),
      complexity: this.calculateFormulaComplexity(formulaStr)
    };
  }

  /**
   * 수식 타입 감지
   * @param {string} formula - 수식 문자열
   * @returns {string} 수식 타입
   */
  detectFormulaType(formula) {
    const upperFormula = formula.toUpperCase();

    // 조회 함수
    if (upperFormula.includes('VLOOKUP') || upperFormula.includes('HLOOKUP')) {
      return 'LOOKUP';
    }
    if (upperFormula.includes('INDEX') && upperFormula.includes('MATCH')) {
      return 'INDEX_MATCH';
    }

    // 집계 함수
    if (upperFormula.match(/\b(SUM|AVERAGE|COUNT|MAX|MIN)IF/)) {
      return 'CONDITIONAL_AGGREGATION';
    }
    if (upperFormula.match(/\b(SUM|AVERAGE|COUNT|MAX|MIN)\b/)) {
      return 'AGGREGATION';
    }

    // 조건부 로직
    if (upperFormula.startsWith('IF(') || upperFormula.includes('IFS(')) {
      return 'CONDITIONAL';
    }
    if (upperFormula.includes('SWITCH(')) {
      return 'SWITCH';
    }

    // 배열 함수
    if (upperFormula.includes('ARRAYFORMULA')) {
      return 'ARRAY';
    }
    if (upperFormula.includes('FILTER(') || upperFormula.includes('UNIQUE(')) {
      return 'ARRAY_FILTER';
    }

    // 날짜/시간
    if (upperFormula.match(/\b(DATE|TIME|NOW|TODAY|YEAR|MONTH|DAY)\b/)) {
      return 'DATETIME';
    }

    // 텍스트 처리
    if (upperFormula.match(/\b(CONCATENATE|TEXTJOIN|LEFT|RIGHT|MID|TRIM)\b/)) {
      return 'TEXT';
    }

    // 기타
    return 'OTHER';
  }

  /**
   * 함수명 추출
   * @param {string} formula - 수식 문자열
   * @returns {string} 함수명
   */
  extractFunction(formula) {
    const match = formula.match(/^([A-Z_]+)\(/i);
    return match ? match[1].toUpperCase() : null;
  }

  /**
   * 함수 인자 추출
   * @param {string} formula - 수식 문자열
   * @returns {Array} 인자 배열
   */
  extractArguments(formula) {
    // 간단한 인자 추출 (중첩 함수는 향후 개선 필요)
    const match = formula.match(/\((.*)\)$/);
    if (!match) return [];

    const argsStr = match[1];
    const args = [];
    let depth = 0;
    let currentArg = '';

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];

      if (char === '(') depth++;
      else if (char === ')') depth--;
      else if (char === ',' && depth === 0) {
        args.push(currentArg.trim());
        currentArg = '';
        continue;
      }

      currentArg += char;
    }

    if (currentArg) {
      args.push(currentArg.trim());
    }

    return args;
  }

  /**
   * 참조 추출
   * @param {Object} formula - 파싱된 수식
   * @returns {Array} 참조 배열
   */
  extractReferences(formula) {
    const refs = [];
    const refPattern = /([A-Z]+\d+|[A-Z]+:[A-Z]+|\d+:\d+|[A-Z]+\d+:[A-Z]+\d+)/g;

    for (const arg of formula.arguments) {
      const matches = arg.match(refPattern);
      if (matches) {
        refs.push(...matches.map(ref => ({
          from: formula.location,
          to: ref,
          sheet: this.extractSheetName(arg)
        })));
      }
    }

    return refs;
  }

  /**
   * 시트명 추출
   * @param {string} reference - 참조 문자열
   * @returns {string|null} 시트명
   */
  extractSheetName(reference) {
    const match = reference.match(/^([^!]+)!/);
    return match ? match[1].replace(/'/g, '') : null;
  }

  /**
   * 데이터 범위 식별
   * @param {Object} sheet - 시트 데이터
   * @returns {Array} 데이터 범위 배열
   */
  identifyDataRanges(sheet) {
    const ranges = [];
    let startRow = null;

    for (let row = 0; row < sheet.data.length; row++) {
      const hasData = sheet.data[row].some(cell => cell !== null && cell !== '');

      if (hasData && startRow === null) {
        startRow = row;
      } else if (!hasData && startRow !== null) {
        ranges.push({
          start: startRow,
          end: row - 1,
          columns: this.getColumnCount(sheet.data.slice(startRow, row))
        });
        startRow = null;
      }
    }

    if (startRow !== null) {
      ranges.push({
        start: startRow,
        end: sheet.data.length - 1,
        columns: this.getColumnCount(sheet.data.slice(startRow))
      });
    }

    return ranges;
  }

  /**
   * 열 개수 계산
   * @param {Array} data - 데이터 배열
   * @returns {number} 열 개수
   */
  getColumnCount(data) {
    return Math.max(...data.map(row => row.length));
  }

  /**
   * 시트 간 의존성 분석
   * @param {Array} sheets - 시트 분석 결과 배열
   * @returns {Array} 의존성 배열
   */
  analyzeDependencies(sheets) {
    const dependencies = [];

    for (const sheet of sheets) {
      for (const ref of sheet.references) {
        if (ref.sheet && ref.sheet !== sheet.name) {
          dependencies.push({
            from: sheet.name,
            to: ref.sheet,
            reference: ref.to
          });
        }
      }
    }

    return dependencies;
  }

  /**
   * 데이터 흐름 분석
   * @param {Array} sheets - 시트 분석 결과 배열
   * @returns {Array} 데이터 흐름 배열
   */
  analyzeDataFlow(sheets) {
    // 의존성 그래프를 기반으로 데이터 흐름 추적
    const flow = [];
    const visited = new Set();

    const traverse = (sheetName, path = []) => {
      if (visited.has(sheetName)) return;
      visited.add(sheetName);

      const sheet = sheets.find(s => s.name === sheetName);
      if (!sheet) return;

      const currentPath = [...path, sheetName];

      for (const ref of sheet.references) {
        if (ref.sheet && ref.sheet !== sheetName) {
          flow.push({
            path: currentPath,
            to: ref.sheet,
            type: 'reference'
          });

          traverse(ref.sheet, currentPath);
        }
      }
    };

    // 각 시트에서 시작
    for (const sheet of sheets) {
      if (!visited.has(sheet.name)) {
        traverse(sheet.name);
      }
    }

    return flow;
  }

  /**
   * 수식 복잡도 계산
   * @param {string} formula - 수식 문자열
   * @returns {number} 복잡도 점수
   */
  calculateFormulaComplexity(formula) {
    let complexity = 1;

    // 중첩 함수 개수
    const nestedFunctions = (formula.match(/\(/g) || []).length;
    complexity += nestedFunctions * 2;

    // 조건문 개수
    const conditionals = (formula.match(/\bIF\b/gi) || []).length;
    complexity += conditionals * 3;

    // 배열 함수
    if (formula.toUpperCase().includes('ARRAYFORMULA')) {
      complexity += 5;
    }

    return complexity;
  }

  /**
   * 전체 복잡도 계산
   * @param {Object} analysis - 분석 결과
   * @returns {number} 복잡도 점수
   */
  calculateComplexity(analysis) {
    let complexity = 0;

    // 수식 개수
    complexity += analysis.totalFormulas * 1;

    // 시트 간 참조
    complexity += analysis.dependencies.length * 3;

    // 수식 타입별 가중치
    const weights = {
      LOOKUP: 3,
      INDEX_MATCH: 4,
      CONDITIONAL_AGGREGATION: 3,
      ARRAY: 5,
      CONDITIONAL: 2
    };

    for (const [type, count] of Object.entries(analysis.formulaTypes)) {
      const weight = weights[type] || 1;
      complexity += count * weight;
    }

    return complexity;
  }

  /**
   * 분석 결과 리포트 생성
   * @param {Object} analysis - 분석 결과
   * @returns {string} 리포트 텍스트
   */
  generateReport(analysis) {
    const lines = [];

    lines.push('📊 Google Sheets 분석 리포트');
    lines.push('='.repeat(50));
    lines.push('');

    lines.push(`📋 시트 목록 (${analysis.sheets.length}개)`);
    for (const sheet of analysis.sheets) {
      lines.push(`  - ${sheet.name}: ${sheet.formulas.length}개 수식`);
    }
    lines.push('');

    lines.push(`📝 총 수식 개수: ${analysis.totalFormulas}개`);
    lines.push('');

    lines.push('📊 수식 유형별 분류:');
    for (const [type, count] of Object.entries(analysis.formulaTypes)) {
      lines.push(`  - ${type}: ${count}개`);
    }
    lines.push('');

    if (analysis.dependencies.length > 0) {
      lines.push(`🔗 시트 간 참조 관계 (${analysis.dependencies.length}개)`);
      for (const dep of analysis.dependencies) {
        lines.push(`  ${dep.from} → ${dep.to}`);
      }
      lines.push('');
    }

    lines.push(`🎯 복잡도 점수: ${analysis.complexity}`);
    lines.push('');

    return lines.join('\n');
  }
}

export function createAnalyzer(options) {
  return new SheetAnalyzer(options);
}
