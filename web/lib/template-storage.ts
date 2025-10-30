'use client'

import type {
  CodeTemplate,
  TemplateCategory,
  TemplateFilter,
  TemplateSortOptions
} from '@/types/code-template'

const STORAGE_KEY = 'code_templates'

/**
 * 기본 템플릿 데이터
 */
const DEFAULT_TEMPLATES: Omit<CodeTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isFavorite'>[] = [
  {
    name: '시트 데이터 읽기',
    description: '특정 시트의 데이터를 읽어오는 기본 템플릿',
    category: '데이터 읽기',
    tags: ['기본', '읽기', '시트'],
    code: `function readSheetData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('시트1');
  var data = sheet.getDataRange().getValues();

  Logger.log('총 ' + data.length + '행 읽음');
  return data;
}`
  },
  {
    name: '데이터 필터링',
    description: '조건에 맞는 데이터만 필터링',
    category: '데이터 처리',
    tags: ['필터', '조건', '배열'],
    code: `function filterData(data, columnIndex, value) {
  var filtered = data.filter(function(row) {
    return row[columnIndex] === value;
  });

  Logger.log('필터링 결과: ' + filtered.length + '행');
  return filtered;
}`
  },
  {
    name: '시트에 데이터 쓰기',
    description: '새 데이터를 시트에 추가하는 템플릿',
    category: '데이터 쓰기',
    tags: ['쓰기', '추가', '시트'],
    code: `function writeToSheet(data, sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.clear();
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  Logger.log(data.length + '행 작성 완료');
}`
  },
  {
    name: '데이터 정렬',
    description: '특정 열을 기준으로 데이터 정렬',
    category: '데이터 처리',
    tags: ['정렬', '배열', '순서'],
    code: `function sortData(data, columnIndex, ascending) {
  var sorted = data.slice(1).sort(function(a, b) {
    if (ascending) {
      return a[columnIndex] > b[columnIndex] ? 1 : -1;
    } else {
      return a[columnIndex] < b[columnIndex] ? 1 : -1;
    }
  });

  return [data[0]].concat(sorted);
}`
  },
  {
    name: '중복 제거',
    description: '중복된 행을 제거하는 템플릿',
    category: '데이터 정리',
    tags: ['중복', '정리', '유니크'],
    code: `function removeDuplicates(data, keyColumnIndex) {
  var seen = {};
  var unique = [];

  data.forEach(function(row) {
    var key = row[keyColumnIndex];
    if (!seen[key]) {
      seen[key] = true;
      unique.push(row);
    }
  });

  Logger.log('중복 제거: ' + (data.length - unique.length) + '행 삭제됨');
  return unique;
}`
  },
  {
    name: '이메일 발송',
    description: 'Gmail을 통해 이메일을 발송하는 템플릿',
    category: '자동화',
    tags: ['이메일', '알림', '자동화'],
    code: `function sendEmail(recipient, subject, body) {
  GmailApp.sendEmail(recipient, subject, body);
  Logger.log('이메일 발송 완료: ' + recipient);
}`
  },
  {
    name: '날짜 포맷팅',
    description: '날짜를 원하는 형식으로 변환',
    category: '유틸리티',
    tags: ['날짜', '포맷', '변환'],
    code: `function formatDate(date, format) {
  var year = date.getFullYear();
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var day = ('0' + date.getDate()).slice(-2);

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
}`
  },
  {
    name: 'CSV 내보내기',
    description: '데이터를 CSV 파일로 내보내기',
    category: '내보내기',
    tags: ['CSV', '파일', '내보내기'],
    code: `function exportToCSV(data, fileName) {
  var csv = data.map(function(row) {
    return row.join(',');
  }).join('\\n');

  var blob = Utilities.newBlob(csv, 'text/csv', fileName + '.csv');
  DriveApp.createFile(blob);
  Logger.log('CSV 파일 생성 완료: ' + fileName);
}`
  }
]

/**
 * LocalStorage에서 템플릿 불러오기
 */
export function getTemplates(): CodeTemplate[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    // 초기 템플릿 생성
    const initialTemplates = DEFAULT_TEMPLATES.map((template) => ({
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      isFavorite: false
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTemplates))
    return initialTemplates
  }

  const parsed = JSON.parse(stored)
  return parsed.map((t: any) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt)
  }))
}

/**
 * 템플릿 생성
 */
export function createTemplate(
  name: string,
  description: string,
  code: string,
  options?: {
    category?: string
    tags?: string[]
  }
): CodeTemplate {
  const templates = getTemplates()
  const newTemplate: CodeTemplate = {
    id: crypto.randomUUID(),
    name,
    description,
    category: options?.category || '기타',
    code,
    tags: options?.tags || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    isFavorite: false
  }

  templates.push(newTemplate)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  return newTemplate
}

/**
 * 템플릿 업데이트
 */
export function updateTemplate(
  id: string,
  updates: Partial<Omit<CodeTemplate, 'id' | 'createdAt' | 'usageCount'>>
): CodeTemplate | null {
  const templates = getTemplates()
  const index = templates.findIndex((t) => t.id === id)
  if (index === -1) return null

  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date()
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  return templates[index]
}

/**
 * 템플릿 삭제
 */
export function deleteTemplate(id: string): boolean {
  const templates = getTemplates()
  const filtered = templates.filter((t) => t.id !== id)
  if (filtered.length === templates.length) return false

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

/**
 * 템플릿 사용 횟수 증가
 */
export function incrementUsage(id: string): void {
  const templates = getTemplates()
  const template = templates.find((t) => t.id === id)
  if (!template) return

  template.usageCount++
  template.updatedAt = new Date()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

/**
 * 즐겨찾기 토글
 */
export function toggleFavorite(id: string): boolean {
  const templates = getTemplates()
  const template = templates.find((t) => t.id === id)
  if (!template) return false

  template.isFavorite = !template.isFavorite
  template.updatedAt = new Date()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  return template.isFavorite
}

/**
 * 템플릿 필터링
 */
export function filterTemplates(filter: TemplateFilter): CodeTemplate[] {
  let templates = getTemplates()

  if (filter.category) {
    templates = templates.filter((t) => t.category === filter.category)
  }

  if (filter.tags && filter.tags.length > 0) {
    templates = templates.filter((t) => filter.tags!.some((tag) => t.tags.includes(tag)))
  }

  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase()
    templates = templates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.code.toLowerCase().includes(query)
    )
  }

  if (filter.favoriteOnly) {
    templates = templates.filter((t) => t.isFavorite)
  }

  return templates
}

/**
 * 템플릿 정렬
 */
export function sortTemplates(templates: CodeTemplate[], options: TemplateSortOptions): CodeTemplate[] {
  return templates.slice().sort((a, b) => {
    let comparison = 0

    switch (options.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
        break
      case 'updatedAt':
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
        break
      case 'usageCount':
        comparison = a.usageCount - b.usageCount
        break
    }

    return options.order === 'asc' ? comparison : -comparison
  })
}

/**
 * 카테고리 목록 가져오기
 */
export function getCategories(): TemplateCategory[] {
  const templates = getTemplates()
  const categoryMap = new Map<string, number>()

  templates.forEach((t) => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + 1)
  })

  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    description: `${name} 관련 템플릿`,
    count
  }))
}

/**
 * 모든 태그 가져오기
 */
export function getAllTags(): string[] {
  const templates = getTemplates()
  const tagSet = new Set<string>()

  templates.forEach((t) => {
    t.tags.forEach((tag) => tagSet.add(tag))
  })

  return Array.from(tagSet).sort()
}

/**
 * 템플릿 통계
 */
export function getTemplateStats() {
  const templates = getTemplates()
  return {
    total: templates.length,
    favorites: templates.filter((t) => t.isFavorite).length,
    categories: getCategories().length,
    tags: getAllTags().length,
    mostUsed: templates.reduce((max, t) => (t.usageCount > max.usageCount ? t : max), templates[0])
  }
}
