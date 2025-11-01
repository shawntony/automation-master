import fs from 'fs/promises'
import path from 'path'

/**
 * PRD 처리 유틸리티
 *
 * PRD 파일 읽기, 파싱, 검증 기능 제공
 */
export class PrdProcessor {
  /**
   * PRD 파일 읽기 (markdown, txt)
   * @param {string} filePath - PRD 파일 경로
   * @returns {Promise<string>} PRD 내용
   */
  async readPrdFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return content
    } catch (error) {
      throw new Error(`PRD 파일 읽기 실패: ${error.message}`)
    }
  }

  /**
   * PRD 내용 검증
   * @param {string} content - PRD 내용
   * @returns {{valid: boolean, errors: string[]}}
   */
  validatePrd(content) {
    const errors = []

    if (!content || content.trim() === '') {
      errors.push('PRD 내용이 비어있습니다')
      return { valid: false, errors }
    }

    // 기본 섹션 체크 (선택적)
    const requiredSections = ['목적', '개요', 'purpose', 'overview']
    const hasRequiredSection = requiredSections.some(section =>
      content.toLowerCase().includes(section.toLowerCase())
    )

    if (!hasRequiredSection) {
      errors.push('PRD에 목적 또는 개요 섹션이 없습니다 (권장사항)')
    }

    // 최소 길이 체크
    if (content.length < 100) {
      errors.push('PRD 내용이 너무 짧습니다 (최소 100자 권장)')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * PRD에서 메타데이터 추출
   * @param {string} content - PRD 내용
   * @returns {Object} 메타데이터
   */
  extractMetadata(content) {
    const metadata = {
      title: '',
      sections: [],
      estimatedReadTime: Math.ceil(content.split(/\s+/).length / 200) // 분
    }

    // 제목 추출 (첫 # 헤딩)
    const titleMatch = content.match(/^#\s+(.+)$/m)
    if (titleMatch) {
      metadata.title = titleMatch[1].trim()
    }

    // 섹션 추출 (모든 ## 헤딩)
    const sectionMatches = content.matchAll(/^##\s+(.+)$/gm)
    for (const match of sectionMatches) {
      metadata.sections.push(match[1].trim())
    }

    return metadata
  }

  /**
   * PRD 파일 유효성 검사 (확장자)
   * @param {string} filename - 파일명
   * @returns {boolean}
   */
  isValidPrdFile(filename) {
    const validExtensions = ['.md', '.txt', '.markdown']
    const ext = path.extname(filename).toLowerCase()
    return validExtensions.includes(ext)
  }

  /**
   * PRD 내용 정리 (앞뒤 공백 제거, 빈 줄 정리)
   * @param {string} content - PRD 내용
   * @returns {string}
   */
  cleanPrdContent(content) {
    return content
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // 3개 이상의 빈 줄을 2개로
      .trim()
  }

  /**
   * PRD를 파일로 저장
   * @param {string} projectPath - 프로젝트 경로
   * @param {string} content - PRD 내용
   * @returns {Promise<string>} 저장된 파일 경로
   */
  async savePrd(projectPath, content) {
    try {
      // docs 폴더 생성
      const docsPath = path.join(projectPath, 'docs')
      await fs.mkdir(docsPath, { recursive: true })

      // PRD.md 저장
      const prdFilePath = path.join(docsPath, 'PRD.md')
      const cleanedContent = this.cleanPrdContent(content)
      await fs.writeFile(prdFilePath, cleanedContent, 'utf-8')

      return prdFilePath
    } catch (error) {
      throw new Error(`PRD 저장 실패: ${error.message}`)
    }
  }

  /**
   * PRD에서 기능 목록 추출 (간단한 파싱)
   * @param {string} content - PRD 내용
   * @returns {string[]} 기능 목록
   */
  extractFeatures(content) {
    const features = []

    // "기능", "Features", "요구사항" 섹션 찾기
    const featureSectionMatch = content.match(
      /##\s*(주요\s*기능|기능|Features|요구사항)[\s\S]*?(?=##|$)/i
    )

    if (featureSectionMatch) {
      const sectionContent = featureSectionMatch[0]

      // - 또는 * 로 시작하는 항목 추출
      const listItems = sectionContent.match(/^[\s]*[-*]\s+(.+)$/gm)
      if (listItems) {
        features.push(...listItems.map(item =>
          item.replace(/^[\s]*[-*]\s+/, '').trim()
        ))
      }

      // ### 하위 헤딩 추출
      const subHeadings = sectionContent.match(/^###\s+(.+)$/gm)
      if (subHeadings) {
        features.push(...subHeadings.map(heading =>
          heading.replace(/^###\s+/, '').trim()
        ))
      }
    }

    return features.filter(Boolean)
  }

  /**
   * PRD 처리 메인 함수
   * @param {Object} options - PRD 옵션
   * @param {string} options.method - 입력 방식 ('file' | 'idea' | 'form' | 'skip')
   * @param {string} [options.filePath] - 파일 경로
   * @param {string} [options.fileContent] - 파일 내용
   * @param {string} [options.idea] - 아이디어 텍스트
   * @param {Object} [options.formData] - 폼 데이터
   * @param {string} options.projectName - 프로젝트명
   * @returns {Promise<{content: string, metadata: Object}>}
   */
  async processPrd(options) {
    const { method, filePath, fileContent, fileUpload, idea, ideaInput, formData, projectName } = options

    let content = ''

    switch (method) {
      case 'file':
        // Support both flat and nested structures
        const actualFilePath = filePath || fileUpload?.filePath
        const actualFileContent = fileContent || fileUpload?.content

        if (actualFilePath) {
          content = await this.readPrdFile(actualFilePath)
        } else if (actualFileContent) {
          content = actualFileContent
        } else {
          throw new Error('파일 경로 또는 내용이 필요합니다')
        }
        break

      case 'idea':
        // Support both flat and nested structures
        const actualIdea = idea || ideaInput?.idea

        if (!actualIdea) {
          throw new Error('아이디어 텍스트가 필요합니다')
        }
        // 아이디어 → PRD 변환 (간단한 템플릿)
        const { ideaToPrdMarkdown } = await import('./prd-templates.js')
        content = ideaToPrdMarkdown(projectName, actualIdea)
        break

      case 'form':
        if (!formData) {
          throw new Error('폼 데이터가 필요합니다')
        }
        // 폼 데이터 → PRD 변환
        const { formDataToPrdDocument, generatePrdMarkdown } = await import('./prd-templates.js')
        const prdDoc = formDataToPrdDocument(projectName, formData)
        content = generatePrdMarkdown(prdDoc)
        break

      case 'skip':
        // PRD 생성하지 않음
        return {
          content: null,
          metadata: { skipped: true }
        }

      default:
        throw new Error(`알 수 없는 PRD 입력 방식: ${method}`)
    }

    // 검증
    const validation = this.validatePrd(content)
    if (!validation.valid) {
      console.warn('PRD 검증 경고:', validation.errors.join(', '))
    }

    // 메타데이터 추출
    const metadata = this.extractMetadata(content)
    metadata.features = this.extractFeatures(content)
    metadata.validation = validation

    return {
      content,
      metadata
    }
  }
}
