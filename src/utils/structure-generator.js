import fs from 'fs/promises'
import path from 'path'

/**
 * Structure Generator - PRD 기반 자동 폴더 구조 생성
 *
 * PRD의 기능 목록을 분석하여 적절한 폴더 구조와 placeholder 파일을 자동 생성합니다.
 */
export class StructureGenerator {
  /**
   * PRD 내용으로부터 프로젝트 구조 생성
   * @param {string} projectPath - 프로젝트 경로
   * @param {string} prdContent - PRD 마크다운 내용
   * @param {string} projectType - 프로젝트 타입
   * @returns {Promise<{success: boolean, structurePath: string, filesCreated: string[]}>}
   */
  async generateStructure(projectPath, prdContent, projectType) {
    try {
      // 1. PRD에서 기능 추출
      const features = this.extractFeatures(prdContent)

      // 2. 기술 스택 분석
      const techStack = this.analyzeTechStack(prdContent)

      // 3. 프로젝트 타입별 기본 구조 결정
      const baseStructure = this.getBaseStructure(projectType, techStack)

      // 4. 기능 기반 폴더 구조 생성
      const featureStructure = this.mapFeaturesToFolders(features, techStack)

      // 5. 구조 병합
      const finalStructure = this.mergeStructures(baseStructure, featureStructure)

      // 6. 폴더 및 파일 생성
      const filesCreated = await this.createStructure(projectPath, finalStructure, techStack)

      // 7. 구조 문서 생성
      const structurePath = await this.generateStructureDoc(projectPath, finalStructure, features)

      return {
        success: true,
        structurePath,
        filesCreated,
        message: `${filesCreated.length}개 파일/폴더 생성 완료`
      }
    } catch (error) {
      console.error('구조 생성 실패:', error)
      return {
        success: false,
        structurePath: null,
        filesCreated: [],
        message: `구조 생성 중 오류: ${error.message}`
      }
    }
  }

  /**
   * PRD에서 기능 목록 추출
   */
  extractFeatures(prdContent) {
    const features = []

    // "주요 기능" 또는 "Features" 섹션 찾기
    const featureSectionMatch = prdContent.match(
      /##\s*(주요\s*기능|기능|Features|요구사항)[\s\S]*?(?=##|$)/i
    )

    if (!featureSectionMatch) {
      return features
    }

    const sectionContent = featureSectionMatch[0]

    // ### 기능명 추출
    const headingMatches = sectionContent.matchAll(/^###\s+(?:\d+\.\s+)?(.+)$/gm)
    for (const match of headingMatches) {
      const featureName = match[1].trim()

      // 기능 설명 추출 (다음 ### 또는 ## 전까지)
      const descMatch = sectionContent.match(
        new RegExp(`###\\s+(?:\\d+\\.\\s+)?${featureName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=###|##|$)`, 'i')
      )

      let description = ''
      let priority = 'medium'

      if (descMatch) {
        const content = descMatch[0]

        // 설명 추출
        const descLine = content.match(/[-*]\s*\*\*설명\*\*:\s*(.+)/i)
        if (descLine) {
          description = descLine[1].trim()
        }

        // 우선순위 추출
        const priorityLine = content.match(/[-*]\s*\*\*우선순위\*\*:\s*(.+)/i)
        if (priorityLine) {
          const p = priorityLine[1].toLowerCase()
          if (p.includes('high') || p.includes('높음') || p.includes('🔴')) {
            priority = 'high'
          } else if (p.includes('low') || p.includes('낮음') || p.includes('🟢')) {
            priority = 'low'
          }
        }
      }

      features.push({
        name: featureName,
        description,
        priority,
        slug: this.slugify(featureName)
      })
    }

    // - 또는 * 로 시작하는 항목도 추출 (하위 기능)
    const listItems = sectionContent.match(/^[\s]*[-*]\s+(?!\*\*)((?!우선순위|설명).+)$/gm)
    if (listItems) {
      for (const item of listItems) {
        const featureName = item.replace(/^[\s]*[-*]\s+/, '').trim()
        if (featureName && !features.some(f => f.name === featureName)) {
          features.push({
            name: featureName,
            description: '',
            priority: 'low',
            slug: this.slugify(featureName)
          })
        }
      }
    }

    return features
  }

  /**
   * 기술 스택 분석
   */
  analyzeTechStack(prdContent) {
    const techStack = {
      frontend: [],
      backend: [],
      database: [],
      other: []
    }

    // "기술 스택" 섹션 찾기
    const techMatch = prdContent.match(/##\s*(기술\s*스택|Tech\s*Stack)[\s\S]*?(?=##|$)/i)
    if (!techMatch) {
      return techStack
    }

    const content = techMatch[0].toLowerCase()

    // Frontend 감지
    if (content.includes('react')) techStack.frontend.push('react')
    if (content.includes('vue')) techStack.frontend.push('vue')
    if (content.includes('angular')) techStack.frontend.push('angular')
    if (content.includes('next')) techStack.frontend.push('nextjs')
    if (content.includes('typescript')) techStack.frontend.push('typescript')
    if (content.includes('tailwind')) techStack.frontend.push('tailwind')

    // Backend 감지
    if (content.includes('node')) techStack.backend.push('nodejs')
    if (content.includes('express')) techStack.backend.push('express')
    if (content.includes('fastapi')) techStack.backend.push('fastapi')
    if (content.includes('django')) techStack.backend.push('django')
    if (content.includes('flask')) techStack.backend.push('flask')
    if (content.includes('nest')) techStack.backend.push('nestjs')

    // Database 감지
    if (content.includes('postgres') || content.includes('postgresql')) {
      techStack.database.push('postgresql')
    }
    if (content.includes('mongo')) techStack.database.push('mongodb')
    if (content.includes('mysql')) techStack.database.push('mysql')
    if (content.includes('redis')) techStack.database.push('redis')
    if (content.includes('supabase')) techStack.database.push('supabase')

    return techStack
  }

  /**
   * 프로젝트 타입별 기본 구조
   */
  getBaseStructure(projectType, techStack) {
    const structures = {
      fullstack: {
        'src': {
          'components': {},
          'pages': {},
          'api': {},
          'utils': {},
          'hooks': {},
          'types': {},
          'styles': {}
        },
        'server': {
          'routes': {},
          'controllers': {},
          'models': {},
          'middleware': {},
          'services': {}
        },
        'public': {},
        'tests': {
          'unit': {},
          'integration': {},
          'e2e': {}
        }
      },

      frontend: {
        'src': {
          'components': {},
          'pages': {},
          'hooks': {},
          'utils': {},
          'types': {},
          'styles': {},
          'assets': {}
        },
        'public': {},
        'tests': {}
      },

      backend: {
        'src': {
          'routes': {},
          'controllers': {},
          'models': {},
          'middleware': {},
          'services': {},
          'utils': {},
          'types': {}
        },
        'tests': {
          'unit': {},
          'integration': {}
        },
        'config': {}
      },

      automation: {
        'scripts': {},
        'config': {},
        'logs': {},
        'data': {},
        'tests': {}
      }
    }

    let base = structures[projectType] || structures.fullstack

    // 기술 스택에 따라 조정
    if (techStack.frontend.includes('nextjs')) {
      base = {
        'app': {
          '(routes)': {},
          'api': {},
          'components': {}
        },
        'components': {
          'ui': {},
          'layout': {}
        },
        'lib': {},
        'public': {},
        'types': {},
        'tests': {}
      }
    }

    return base
  }

  /**
   * 기능을 폴더 구조로 매핑
   */
  mapFeaturesToFolders(features, techStack) {
    const structure = {}

    // 우선순위 높은 기능부터 처리
    const sortedFeatures = features.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 }
      return priorities[b.priority] - priorities[a.priority]
    })

    for (const feature of sortedFeatures) {
      const slug = feature.slug

      // Frontend 구조
      if (techStack.frontend.length > 0) {
        if (!structure.components) structure.components = {}
        structure.components[slug] = {}

        if (techStack.frontend.includes('nextjs')) {
          if (!structure.app) structure.app = {}
          if (!structure.app[slug]) structure.app[slug] = {}
        } else {
          if (!structure.pages) structure.pages = {}
          structure.pages[slug] = {}
        }
      }

      // Backend 구조
      if (techStack.backend.length > 0) {
        if (!structure.routes) structure.routes = {}
        structure.routes[`${slug}.js`] = 'file'

        if (!structure.controllers) structure.controllers = {}
        structure.controllers[`${slug}.controller.js`] = 'file'

        if (!structure.services) structure.services = {}
        structure.services[`${slug}.service.js`] = 'file'
      }

      // Database 모델
      if (techStack.database.length > 0) {
        if (!structure.models) structure.models = {}
        structure.models[`${slug}.model.js`] = 'file'
      }

      // 테스트 파일
      if (!structure.tests) structure.tests = {}
      structure.tests[`${slug}.test.js`] = 'file'
    }

    return structure
  }

  /**
   * 구조 병합
   */
  mergeStructures(base, feature) {
    const merged = JSON.parse(JSON.stringify(base))

    for (const [key, value] of Object.entries(feature)) {
      if (typeof value === 'object' && value !== null && value !== 'file') {
        if (merged[key]) {
          merged[key] = this.mergeStructures(merged[key], value)
        } else {
          merged[key] = value
        }
      } else {
        merged[key] = value
      }
    }

    return merged
  }

  /**
   * 실제 폴더/파일 생성
   */
  async createStructure(basePath, structure, techStack, currentPath = '') {
    const filesCreated = []

    for (const [name, value] of Object.entries(structure)) {
      const fullPath = path.join(basePath, currentPath, name)

      if (value === 'file') {
        // 파일 생성
        const content = this.generatePlaceholderContent(name, techStack)
        await fs.writeFile(fullPath, content, 'utf-8')
        filesCreated.push(fullPath)
      } else if (typeof value === 'object') {
        // 폴더 생성
        await fs.mkdir(fullPath, { recursive: true })
        filesCreated.push(fullPath)

        // 하위 구조 재귀 생성
        const subFiles = await this.createStructure(
          basePath,
          value,
          techStack,
          path.join(currentPath, name)
        )
        filesCreated.push(...subFiles)
      }
    }

    return filesCreated
  }

  /**
   * Placeholder 파일 내용 생성
   */
  generatePlaceholderContent(filename, techStack) {
    const ext = path.extname(filename)
    const basename = path.basename(filename, ext)

    // TypeScript vs JavaScript
    const isTS = techStack.frontend.includes('typescript') || ext === '.ts' || ext === '.tsx'

    if (ext === '.tsx' || ext === '.jsx') {
      // React 컴포넌트
      return `${isTS ? "import React from 'react'\n\n" : ''}export ${isTS ? 'const' : 'function'} ${this.capitalize(basename)}${isTS ? ': React.FC' : ''} ${isTS ? '=' : ''} (${isTS ? ')' : ''} => {
  return (
    <div>
      <h1>${this.capitalize(basename)}</h1>
      {/* TODO: Implement ${basename} component */}
    </div>
  )
}${isTS ? '' : '\n\nexport default ' + this.capitalize(basename)}
`
    } else if (filename.includes('controller')) {
      // Controller
      return `/**
 * ${this.capitalize(basename)} Controller
 *
 * TODO: Implement controller logic
 */

export class ${this.capitalize(basename.replace('.controller', ''))}Controller {
  async index(req, res) {
    // TODO: List all items
    res.json({ message: 'Not implemented' })
  }

  async show(req, res) {
    // TODO: Get single item
    res.json({ message: 'Not implemented' })
  }

  async create(req, res) {
    // TODO: Create new item
    res.json({ message: 'Not implemented' })
  }

  async update(req, res) {
    // TODO: Update item
    res.json({ message: 'Not implemented' })
  }

  async delete(req, res) {
    // TODO: Delete item
    res.json({ message: 'Not implemented' })
  }
}
`
    } else if (filename.includes('service')) {
      // Service
      return `/**
 * ${this.capitalize(basename)} Service
 *
 * TODO: Implement business logic
 */

export class ${this.capitalize(basename.replace('.service', ''))}Service {
  async findAll() {
    // TODO: Implement find all logic
    throw new Error('Not implemented')
  }

  async findById(id) {
    // TODO: Implement find by ID logic
    throw new Error('Not implemented')
  }

  async create(data) {
    // TODO: Implement create logic
    throw new Error('Not implemented')
  }

  async update(id, data) {
    // TODO: Implement update logic
    throw new Error('Not implemented')
  }

  async delete(id) {
    // TODO: Implement delete logic
    throw new Error('Not implemented')
  }
}
`
    } else if (filename.includes('model')) {
      // Model
      if (techStack.database.includes('mongodb')) {
        return `import mongoose from 'mongoose'

const ${basename.replace('.model', '')}Schema = new mongoose.Schema({
  // TODO: Define schema fields
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const ${this.capitalize(basename.replace('.model', ''))} = mongoose.model('${this.capitalize(basename.replace('.model', ''))}', ${basename.replace('.model', '')}Schema)
`
      } else {
        return `/**
 * ${this.capitalize(basename)} Model
 *
 * TODO: Define data model
 */

export class ${this.capitalize(basename.replace('.model', ''))} {
  constructor(data) {
    // TODO: Initialize model properties
  }

  async save() {
    // TODO: Save to database
  }

  static async findAll() {
    // TODO: Find all records
  }

  static async findById(id) {
    // TODO: Find by ID
  }
}
`
      }
    } else if (filename.includes('route')) {
      // Route
      return `import express from 'express'

const router = express.Router()

/**
 * ${this.capitalize(basename)} Routes
 *
 * TODO: Define API routes
 */

// GET /${basename}
router.get('/', (req, res) => {
  res.json({ message: 'Not implemented' })
})

// GET /${basename}/:id
router.get('/:id', (req, res) => {
  res.json({ message: 'Not implemented' })
})

// POST /${basename}
router.post('/', (req, res) => {
  res.json({ message: 'Not implemented' })
})

// PUT /${basename}/:id
router.put('/:id', (req, res) => {
  res.json({ message: 'Not implemented' })
})

// DELETE /${basename}/:id
router.delete('/:id', (req, res) => {
  res.json({ message: 'Not implemented' })
})

export default router
`
    } else if (filename.includes('test')) {
      // Test
      return `/**
 * ${this.capitalize(basename)} Tests
 *
 * TODO: Implement tests
 */

describe('${this.capitalize(basename.replace('.test', ''))}', () => {
  test('should exist', () => {
    expect(true).toBe(true)
  })

  // TODO: Add more tests
})
`
    } else {
      // Generic file
      return `/**
 * ${this.capitalize(basename)}
 *
 * TODO: Implement functionality
 */

// TODO: Add implementation
`
    }
  }

  /**
   * 구조 문서 생성
   */
  async generateStructureDoc(projectPath, structure, features) {
    const docPath = path.join(projectPath, 'docs', 'STRUCTURE.md')

    const content = `# Project Structure

> 자동 생성됨: ${new Date().toISOString().split('T')[0]}
> PRD 기반 구조 자동 생성

## 폴더 구조

\`\`\`
${this.stringifyStructure(structure)}
\`\`\`

## 기능별 파일 매핑

${features.map(f => `### ${f.name}
- **우선순위**: ${f.priority}
- **설명**: ${f.description || 'N/A'}
- **관련 파일**:
  - Components: \`components/${f.slug}/\`
  - API: \`api/${f.slug}\`
  - Tests: \`tests/${f.slug}.test.js\`
`).join('\n')}

## 다음 단계

1. 각 placeholder 파일의 TODO 주석 확인
2. 비즈니스 로직 구현
3. 테스트 코드 작성
4. API 문서화

## 참고

- 모든 파일은 기본 구조만 포함
- 실제 구현은 PRD의 상세 요구사항 참조
- 우선순위 높은 기능부터 구현 권장
`

    await fs.writeFile(docPath, content, 'utf-8')
    return docPath
  }

  /**
   * 구조를 트리 문자열로 변환
   */
  stringifyStructure(structure, prefix = '', isLast = true) {
    let result = ''
    const entries = Object.entries(structure)

    entries.forEach(([key, value], index) => {
      const isLastEntry = index === entries.length - 1
      const connector = isLastEntry ? '└── ' : '├── '
      const extension = isLastEntry ? '    ' : '│   '

      if (value === 'file') {
        result += `${prefix}${connector}${key}\n`
      } else if (typeof value === 'object') {
        result += `${prefix}${connector}${key}/\n`
        result += this.stringifyStructure(value, prefix + extension, isLastEntry)
      }
    })

    return result
  }

  /**
   * 문자열을 slug로 변환
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * 첫 글자 대문자
   */
  capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }
}
