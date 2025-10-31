# Phase 3-4 구현 가이드

## 개요

Phase 1-2에서 버전 관리 UI와 실행 히스토리 시스템을 완성했습니다.
Phase 3-4에서는 템플릿-코드생성 양방향 통합 및 모든 기능의 최종 통합을 진행합니다.

## Phase 3: 템플릿-코드생성 양방향 통합

### 3.1. EnhancedCodeGenerator에 "템플릿으로 저장" 버튼 추가

**파일**: `web/app/tools/appscript/components/EnhancedCodeGenerator.tsx`

#### 변경사항 1: Import 추가

```typescript
// 기존 (4번째 줄)
import { Code, Save, Edit2, Trash2, Plus, ArrowRight, FileCode } from 'lucide-react'

// 변경 후
import { Code, Save, Edit2, Trash2, Plus, ArrowRight, FileCode, BookmarkPlus } from 'lucide-react'
import { createTemplate } from '@/lib/template-storage'
```

#### 변경사항 2: 템플릿 저장 핸들러 추가

**위치**: handleSave 함수 다음에 추가 (약 125줄 근처)

```typescript
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
```

#### 변경사항 3: UI에 버튼 추가

**위치**: 약 286-295줄 (생성된 코드 미리보기 섹션)

```typescript
// 기존
{generatedCode && (
  <div className="bg-gray-50 rounded-lg p-4 border">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-semibold text-gray-700">생성된 코드</h4>
      <button
        onClick={handleSave}
        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
      >
        <Save className="h-4 w-4" />
        저장
      </button>
    </div>
    <pre className="bg-white border rounded p-3 text-sm overflow-x-auto">
      <code>{generatedCode}</code>
    </pre>
  </div>
)}

// 변경 후
{generatedCode && (
  <div className="bg-gray-50 rounded-lg p-4 border">
    <div className="flex items-center justify-between mb-2">
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
    </div>
    <pre className="bg-white border rounded p-3 text-sm overflow-x-auto">
      <code>{generatedCode}</code>
    </pre>
  </div>
)}
```

---

### 3.2. TemplateBrowser에 "생성기에 채우기" 액션 추가

**파일**: `web/app/tools/appscript/components/TemplateBrowser.tsx`

#### 변경사항 1: Props 인터페이스 확장

**위치**: 약 8-14줄

```typescript
// 기존
interface TemplateBrowserProps {
  onSelectTemplate?: (template: CodeTemplate) => void
}

// 변경 후
interface TemplateBrowserProps {
  onSelectTemplate?: (template: CodeTemplate) => void
  onFillGenerator?: (template: CodeTemplate) => void
}
```

#### 변경사항 2: Props 추가

**위치**: 컴포넌트 선언 부분 (약 16줄)

```typescript
// 기존
export function TemplateBrowser({ onSelectTemplate }: TemplateBrowserProps) {

// 변경 후
export function TemplateBrowser({ onSelectTemplate, onFillGenerator }: TemplateBrowserProps) {
```

#### 변경사항 3: "생성기에 채우기" 버튼 추가

**위치**: 각 템플릿 카드의 버튼 영역 (약 200-230줄 근처)

```typescript
// 템플릿 카드 내부, 기존 버튼들 옆에 추가
{onFillGenerator && (
  <button
    onClick={() => onFillGenerator(template)}
    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
    title="코드 생성기에 채우기"
  >
    <ArrowRight className="h-4 w-4" />
    생성기에 채우기
  </button>
)}
```

**참고**: `ArrowRight` 아이콘을 import에 추가해야 합니다:

```typescript
import { /* 기존 imports */, ArrowRight } from 'lucide-react'
```

---

## Phase 4: 최종 통합

### 4.1. CodeVersionList에 비교 기능 통합

**파일**: `web/app/tools/appscript/components/CodeVersionList.tsx`

#### 변경사항 1: Import 추가

```typescript
// 약 4번째 줄에 추가
import { CodeVersionCompare } from './CodeVersionCompare'
```

#### 변경사항 2: State 추가

**위치**: 컴포넌트 내부 state 선언 부분 (약 30-37줄)

```typescript
const [showAddForm, setShowAddForm] = useState(false)
const [editingVersion, setEditingVersion] = useState<CodeVersion | null>(null)
const [linkedConversation, setLinkedConversation] = useState<ConversationRecord | null>(null)
// 아래 추가
const [compareVersions, setCompareVersions] = useState<{ v1: CodeVersion; v2: CodeVersion } | null>(null)
```

#### 변경사항 3: 비교 핸들러 추가

**위치**: handleToggleStatus 함수 다음 (약 102줄)

```typescript
const handleCompareVersions = (version: CodeVersion) => {
  if (menu.versions.length < 2) {
    alert('비교할 다른 버전이 없습니다.')
    return
  }

  // 현재 버전과 다른 버전 선택 UI (간단하게 이전 버전과 비교)
  const otherVersion = menu.versions.find(v => v.id !== version.id)
  if (otherVersion) {
    setCompareVersions({ v1: version, v2: otherVersion })
  }
}
```

#### 변경사항 4: 버전 복제 핸들러 추가

```typescript
const handleDuplicateVersion = (version: CodeVersion) => {
  const newVersionName = prompt(
    '새 버전 이름을 입력하세요:',
    `${version.versionName} (복사본)`
  )

  if (!newVersionName) return

  addCodeVersion(menu.id, version.code, {
    versionName: newVersionName,
    description: `${version.description || ''} (복사본)`,
    status: 'draft',
    setAsActive: false
  })

  onMenuUpdate?.()
}
```

#### 변경사항 5: UI에 버튼 추가

**위치**: 버전 카드의 액션 버튼 영역 (약 267-294줄)

```typescript
// 기존 버튼들 다음에 추가
<button
  onClick={() => handleCompareVersions(version)}
  className="p-1 hover:bg-blue-100 rounded"
  title="다른 버전과 비교"
>
  <ArrowLeftRight className="h-4 w-4 text-blue-500" />
</button>
<button
  onClick={() => handleDuplicateVersion(version)}
  className="p-1 hover:bg-gray-100 rounded"
  title="버전 복제"
>
  <CopyIcon className="h-4 w-4 text-gray-500" />
</button>
```

#### 변경사항 6: 비교 모달 추가

**위치**: 컴포넌트 return 문 마지막 (약 337줄)

```typescript
return (
  <div className="space-y-4">
    {/* 기존 컨텐츠 */}

    {/* 비교 모달 추가 */}
    {compareVersions && (
      <CodeVersionCompare
        version1={compareVersions.v1}
        version2={compareVersions.v2}
        onClose={() => setCompareVersions(null)}
      />
    )}
  </div>
)
```

---

### 4.2. CodeExecutionPreview에 히스토리 저장 기능 추가

**파일**: `web/app/tools/appscript/components/CodeExecutionPreview.tsx`

#### 변경사항 1: Import 추가

```typescript
import { addExecutionHistory } from '@/lib/execution-history-storage'
import type { CodeExecutionResult } from '@/types/execution-history'
```

#### 변경사항 2: Props 확장

```typescript
interface CodeExecutionPreviewProps {
  code: string
  spreadsheetId: string
  spreadsheetTitle: string
  // 아래 추가
  menuId?: string
  versionId?: string
  versionName?: string
  onHistorySaved?: () => void
}
```

#### 변경사항 3: 히스토리 저장 핸들러 추가

**위치**: 실행 완료 후 (약 executeCode 함수 내부)

```typescript
const handleSaveToHistory = (result: CodeExecutionResult) => {
  try {
    addExecutionHistory(result, {
      menuId,
      versionId,
      versionName: versionName || '실행 테스트',
      code,
      spreadsheetId,
      spreadsheetTitle
    })

    onHistorySaved?.()
    alert('실행 결과가 히스토리에 저장되었습니다.')
  } catch (error) {
    console.error('히스토리 저장 실패:', error)
  }
}
```

#### 변경사항 4: UI에 저장 버튼 추가

**위치**: 실행 결과 표시 영역

```typescript
// 실행 결과 표시 후
{executionResult && (
  <div className="mt-4">
    <button
      onClick={() => handleSaveToHistory(executionResult)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      <Save className="h-4 w-4" />
      히스토리에 저장
    </button>
  </div>
)}
```

---

### 4.3. CodeGenerationWorkflow 통합

**파일**: `web/app/tools/appscript/components/CodeGenerationWorkflow.tsx`

#### 변경사항 1: Import 추가

```typescript
import { CodeExecutionHistory } from './CodeExecutionHistory'
```

#### 변경사항 2: State 추가

```typescript
const [showExecutionHistory, setShowExecutionHistory] = useState(false)
```

#### 변경사항 3: 템플릿 → 생성기 연결

**위치**: TemplateBrowser 컴포넌트 사용 부분

```typescript
<TemplateBrowser
  onSelectTemplate={(template) => {
    // 기존 로직
  }}
  onFillGenerator={(template) => {
    // 템플릿을 EnhancedCodeGenerator에 채우기
    if (codeGeneratorRef.current) {
      codeGeneratorRef.current.fillFormData({
        menuName: template.name,
        feature: template.name,
        description: template.description,
        code: template.code
      })

      // 자동 스크롤
      setTimeout(() => {
        codeGeneratorSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    }
  }}
/>
```

#### 변경사항 4: 실행 히스토리 탭 추가

**위치**: 탭 버튼 영역

```typescript
<button
  onClick={() => setCurrentStep('execution-history')}
  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
    currentStep === 'execution-history'
      ? 'bg-blue-500 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`}
>
  실행 히스토리
</button>
```

#### 변경사항 5: 히스토리 컴포넌트 추가

```typescript
{currentStep === 'execution-history' && (
  <CodeExecutionHistory
    onReExecute={(code, versionName) => {
      // 코드를 생성기에 채우고 실행
      if (codeGeneratorRef.current) {
        codeGeneratorRef.current.fillFormData({
          menuName: versionName,
          feature: '히스토리에서 재실행',
          description: '이전 실행 기록에서 가져온 코드',
          code
        })
      }
    }}
  />
)}
```

---

## 적용 순서

VS Code를 종료한 후 다음 순서로 적용하세요:

1. **EnhancedCodeGenerator.tsx** 수정 (3.1)
2. **TemplateBrowser.tsx** 수정 (3.2)
3. **CodeVersionList.tsx** 수정 (4.1)
4. **CodeExecutionPreview.tsx** 수정 (4.2)
5. **CodeGenerationWorkflow.tsx** 수정 (4.3)

## 테스트 체크리스트

### Phase 3 테스트
- [ ] 코드 생성 후 "템플릿으로 저장" 버튼 클릭
- [ ] 템플릿 이름, 설명, 카테고리, 태그 입력
- [ ] 템플릿 브라우저에서 저장된 템플릿 확인
- [ ] 템플릿에서 "생성기에 채우기" 버튼 클릭
- [ ] 생성기에 템플릿 코드가 자동으로 채워지는지 확인

### Phase 4 테스트
- [ ] 버전 목록에서 "비교" 버튼 클릭
- [ ] 버전 비교 모달에서 좌우 비교 확인
- [ ] 통합 diff 뷰 확인
- [ ] 버전 복제 기능 테스트
- [ ] 코드 실행 후 "히스토리에 저장" 버튼
- [ ] 실행 히스토리 탭에서 저장된 기록 확인
- [ ] 히스토리에서 "다시 실행" 기능 테스트

## 커밋 메시지 템플릿

```
feat: Phase 3-4 완료 - 템플릿 통합 및 최종 기능 연결

**Phase 3: 템플릿-코드생성 양방향 통합**
- EnhancedCodeGenerator: "템플릿으로 저장" 기능 추가
- TemplateBrowser: "생성기에 채우기" 액션 추가
- 양방향 데이터 흐름 구현

**Phase 4: 최종 통합**
- CodeVersionList: 버전 비교 UI 통합, 버전 복제 기능
- CodeExecutionPreview: 실행 히스토리 저장 기능
- CodeGenerationWorkflow: 모든 기능 통합
  * 실행 히스토리 탭 추가
  * 템플릿 → 생성기 연결
  * 히스토리 → 재실행 연결

**완성된 통합 워크플로우**:
1. AI 대화 → 코드 생성 → 템플릿 저장
2. 템플릿 → 코드 생성기 → 수정 → 저장
3. 코드 실행 → 히스토리 저장 → 재실행
4. 버전 관리 → 비교 → 복제 → 병합

✅ 전체 3단계 기능 완성:
- 코드 실행 미리보기
- 버전 관리
- 코드 템플릿

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 추가 개선 아이디어 (선택사항)

### 향상된 템플릿 저장 UI
간단한 prompt 대신 모달 폼 사용:

```typescript
// TemplateFormModal.tsx 컴포넌트 생성
interface TemplateFormModalProps {
  code: string
  defaultName?: string
  defaultDescription?: string
  onSave: (template: { name: string; description: string; category: string; tags: string[] }) => void
  onClose: () => void
}
```

### 버전 자동 병합
두 버전의 코드를 지능적으로 병합하는 기능

### 실행 결과 비교
여러 실행 결과를 나란히 비교하는 기능

---

## 문제 해결

### Import 에러
만약 import 에러가 발생하면:
```bash
npm install
```

### 타입 에러
TypeScript 컴파일 확인:
```bash
cd web && npx tsc --noEmit
```

### 런타임 에러
브라우저 콘솔에서 에러 확인 후 해당 컴포넌트의 props 전달 확인

---

준비되었습니다! VS Code를 종료하고 이 가이드를 따라 코드를 수정해주세요.
