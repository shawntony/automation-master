#!/usr/bin/env python3
"""
Phase 3-4 자동 적용 스크립트
가이드에 따라 모든 파일을 수정합니다.
"""

import os
import re

def modify_enhanced_code_generator():
    """EnhancedCodeGenerator.tsx 수정"""
    filepath = 'app/tools/appscript/components/EnhancedCodeGenerator.tsx'

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Import 추가
    content = content.replace(
        "import { Code, Save, Edit2, Trash2, Plus, ArrowRight, FileCode } from 'lucide-react'",
        "import { Code, Save, Edit2, Trash2, Plus, ArrowRight, FileCode, BookmarkPlus } from 'lucide-react'\nimport { createTemplate } from '@/lib/template-storage'"
    )

    # 2. handleSaveAsTemplate 함수 추가 (handleSave 함수 다음)
    save_as_template_handler = """
  const handleSaveAsTemplate = () => {
    if (!generatedCode) {
      alert('저장할 코드가 없습니다.')
      return
    }

    const templateName = prompt('템플릿 이름을 입력하세요:', menuName || '새 템플릿')
    if (!templateName) return

    const templateDescription = prompt(
      '템플릿 설명을 입력하세요:',
      feature || description
    )

    try {
      const categoryInput = prompt(
        '카테고리를 입력하세요 (기본값: 사용자 생성):',
        '사용자 생성'
      )

      const tagsInput = prompt(
        '태그를 쉼표로 구분하여 입력하세요:',
        '자동생성, 사용자'
      )
      const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : []

      createTemplate(
        templateName,
        templateDescription || '자동 생성된 템플릿',
        generatedCode,
        {
          category: categoryInput || '사용자 생성',
          tags
        }
      )

      alert('템플릿으로 저장되었습니다!')
    } catch (error) {
      console.error('템플릿 저장 실패:', error)
      alert('템플릿 저장에 실패했습니다.')
    }
  }
"""

    # handleSave 함수 다음에 추가
    content = re.sub(
        r'(const handleSave = \(\) => {[^}]+}\n  })',
        r'\1\n' + save_as_template_handler,
        content,
        flags=re.DOTALL
    )

    # 3. UI 버튼 수정
    old_button_section = '''              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">생성된 코드</h4>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  저장
                </button>
              </div>'''

    new_button_section = '''              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">생성된 코드</h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAsTemplate}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    템플릿으로 저장
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    저장
                  </button>
                </div>
              </div>'''

    content = content.replace(old_button_section, new_button_section)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    pass  # print removed

if __name__ == '__main__':
    os.chdir('C:/Users/gram/myautomation/automationmaster/web')
    modify_enhanced_code_generator()
    pass  # print removed
