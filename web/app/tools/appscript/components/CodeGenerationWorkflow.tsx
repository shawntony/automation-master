'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Menu, Code, BookOpen, X, FileCode } from 'lucide-react'
import type { CodeMenuItem, CodeVersion } from '@/types/code-menu'
import type { ConversationRecord } from '@/types/conversation'
import type { CodeExecutionResult } from '@/types/roadmap'
import { AssistantChat } from './AssistantChat'
import { CodeMenuManager } from './CodeMenuManager'
import { CodeVersionList } from './CodeVersionList'
import { ConversationHistory } from './ConversationHistory'
import { CodeLibraryBrowser } from './CodeLibraryBrowser'
import { CodeExecutionPreview } from './CodeExecutionPreview'
import { TemplateBrowser } from './TemplateBrowser'
import { EnhancedCodeGenerator, type EnhancedCodeGeneratorRef } from './EnhancedCodeGenerator'
import { getCodeMenuById } from '@/lib/code-menu-storage'
import { CodeLibraryStorage } from '@/lib/assistant/code-library-storage'
import {
  createConversation,
  addMessage,
  linkConversationToMenu,
  generateConversationTitle,
  updateConversation
} from '@/lib/conversation-storage'
import { createCodeMenu } from '@/lib/code-menu-storage'

interface CodeGenerationWorkflowProps {
  spreadsheetId: string
  spreadsheetTitle: string
  analysisResult: any
  onGenerateCode?: (
    description: string,
    options?: { sheetNames?: string[]; specificRequirement?: string }
  ) => Promise<string>
  onModifyCode?: (currentCode: string, modificationRequest: string) => Promise<string>
  onSelectCode?: (code: string) => void
}

export function CodeGenerationWorkflow({
  spreadsheetId,
  spreadsheetTitle,
  analysisResult,
  onGenerateCode,
  onModifyCode,
  onSelectCode
}: CodeGenerationWorkflowProps) {
  const [activeStep, setActiveStep] = useState<'chat' | 'menu' | 'library' | 'template'>('chat')
  const [selectedMenu, setSelectedMenu] = useState<CodeMenuItem | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null)
  const [executingCode, setExecutingCode] = useState(false)
  const [lastExecutedCode, setLastExecutedCode] = useState<string>('')

  // EnhancedCodeGenerator ref와 스크롤 ref
  const codeGeneratorRef = useRef<EnhancedCodeGeneratorRef>(null)
  const codeGeneratorSectionRef = useRef<HTMLDivElement>(null)

  // AI 어시스턴트에서 코드 생성 시
  const handleCodeGenerated = async (code: string, userMessage: string) => {
    // 1. 대화 기록 생성 또는 업데이트
    if (!currentConversationId) {
      // 새 대화 생성 (자동 저장)
      const conversation = createConversation(
        [
          { role: 'user', content: userMessage, timestamp: new Date() },
          { role: 'assistant', content: '코드를 생성했습니다.', timestamp: new Date(), generatedCode: code }
        ],
        {
          generatedCode: code,
          isSaved: false // 자동 저장 (수동 저장 아님)
        }
      )

      // 제목 자동 생성
      const title = generateConversationTitle(conversation.messages)
      updateConversation(conversation.id, { title })

      setCurrentConversationId(conversation.id)
    } else {
      // 기존 대화에 메시지 추가
      addMessage(currentConversationId, {
        role: 'user',
        content: userMessage
      })
      addMessage(currentConversationId, {
        role: 'assistant',
        content: '코드를 생성했습니다.',
        generatedCode: code
      })
    }

    // 2. EnhancedCodeGenerator에 자동 채우기
    if (codeGeneratorRef.current) {
      // 대화에서 생성된 제목 사용 또는 사용자 메시지 기반으로 생성
      const title = currentConversationId
        ? generateConversationTitle([{ role: 'user', content: userMessage, timestamp: new Date() }])
        : '새 코드'

      codeGeneratorRef.current.fillFormData({
        menuName: title || '자동 생성 코드',
        feature: '자동 생성된 기능',
        description: userMessage,
        code: code
      })

      // 3. 스크롤 자동 이동 (Phase 5)
      setTimeout(() => {
        codeGeneratorSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    }
  }

  // 대화를 메뉴로 변환
  const handleConvertToMenu = (conversation: ConversationRecord) => {
    if (!conversation.generatedCode) {
      alert('생성된 코드가 없습니다.')
      return
    }

    // 대화 제목을 메뉴명으로 사용
    const menuName = conversation.title || '새 코드 메뉴'
    const description = conversation.messages[0]?.content || '코드 설명'

    // 메뉴 생성
    const menu = createCodeMenu(menuName, description, conversation.generatedCode, {
      status: 'draft',
      versionName: 'v1'
    })

    // 대화와 메뉴 연결
    linkConversationToMenu(conversation.id, menu.id)

    // 메뉴 선택 및 화면 전환
    setSelectedMenu(menu)
    setActiveStep('menu')
    setRefreshKey((prev) => prev + 1)

    alert(`"${menuName}" 메뉴가 생성되었습니다!`)
  }

  // 메뉴 선택 시
  const handleSelectMenu = (menu: CodeMenuItem) => {
    setSelectedMenu(menu)
  }

  // 메뉴 업데이트 시 (버전 추가/수정 등)
  const handleMenuUpdate = () => {
    if (selectedMenu) {
      const updated = getCodeMenuById(selectedMenu.id)
      if (updated) {
        setSelectedMenu(updated)
      }
    }
    setRefreshKey((prev) => prev + 1)
  }

  // 버전 선택 시 코드 에디터로 전달
  const handleSelectVersion = (version: CodeVersion) => {
    onSelectCode?.(version.code)
  }

  // 코드 라이브러리에서 선택 시
  const handleSelectFromLibrary = (code: string) => {
    onSelectCode?.(code)
    // 선택한 코드로 새 대화 시작
    setActiveStep('chat')
  }

  // 코드 실행 및 테스트
  const handleExecuteCode = async (code: string, versionName: string) => {
    setExecutingCode(true)
    setLastExecutedCode(code)
    try {
      // 시뮬레이션된 실행 결과 생성
      const result: CodeExecutionResult = {
        success: true,
        executionId: crypto.randomUUID(),
        executedAt: new Date().toISOString(),
        executionTimeMs: 150,
        changes: [
          {
            sheetName: '시트1',
            rowsAffected: 3,
            columnsAffected: 2,
            before: [
              ['이전값1', '이전값2'],
              ['이전값3', '이전값4']
            ],
            after: [
              ['새값1', '새값2'],
              ['새값3', '새값4']
            ]
          },
          {
            sheetName: '시트2',
            rowsAffected: 2,
            columnsAffected: 2,
            before: [],
            after: [
              ['새로운행1', '새로운행2']
            ]
          }
        ],
        logs: [
          '코드 실행 시작...',
          `버전: ${versionName}`,
          '데이터 처리 중...',
          '변경사항 적용 완료'
        ]
      }
      setExecutionResult(result)
    } catch (error) {
      console.error('Code execution failed:', error)
      const errorResult: CodeExecutionResult = {
        success: false,
        executionId: crypto.randomUUID(),
        executedAt: new Date().toISOString(),
        executionTimeMs: 0,
        changes: [],
        logs: ['실행 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류')],
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
      setExecutionResult(errorResult)
    } finally {
      setExecutingCode(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 워크플로우 단계 네비게이션 */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-center gap-4">
          {/* 1단계: AI 채팅 */}
          <button
            onClick={() => setActiveStep('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeStep === 'chat'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">1. AI 대화</div>
              <div className="text-xs opacity-80">코드 생성 및 수정</div>
            </div>
          </button>

          <div className="text-gray-400">→</div>

          {/* 2단계: 메뉴 관리 */}
          <button
            onClick={() => setActiveStep('menu')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeStep === 'menu'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Menu className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">2. 메뉴 관리</div>
              <div className="text-xs opacity-80">코드 정리 및 버전 관리</div>
            </div>
          </button>

          <div className="text-gray-400">→</div>

          {/* 3단계: 템플릿 */}
          <button
            onClick={() => setActiveStep('template')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeStep === 'template'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileCode className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">3. 템플릿</div>
              <div className="text-xs opacity-80">재사용 가능한 코드</div>
            </div>
          </button>

          <div className="text-gray-400">→</div>

          {/* 4단계: 라이브러리 */}
          <button
            onClick={() => setActiveStep('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeStep === 'library'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">4. 라이브러리</div>
              <div className="text-xs opacity-80">완성된 코드 저장</div>
            </div>
          </button>
        </div>
      </div>

      {/* 1단계: AI 대화 */}
      {activeStep === 'chat' && (
        <div className="space-y-6">
          {/* 향상된 코드 생성기 */}
          <div ref={codeGeneratorSectionRef}>
            <EnhancedCodeGenerator
              ref={codeGeneratorRef}
              spreadsheetId={spreadsheetId}
              spreadsheetTitle={spreadsheetTitle}
              onGenerateCode={async (desc, opts) => {
                const code = await onGenerateCode?.(desc, opts)
                if (code) {
                  handleCodeGenerated(code, desc)
                }
                return code || ''
              }}
              onTransferToLibrary={(entry) => {
                // 코드 라이브러리로 전송
                CodeLibraryStorage.save({
                  title: entry.menuName,
                  type: 'automation',
                  description: entry.feature,
                  userRequest: entry.description,
                  code: entry.generatedCode,
                  targetSheets: [],
                  createdAt: entry.createdAt,
                  saved: true
                })
              }}
            />
          </div>

          {/* 기존 AI 어시스턴트 및 대화 내역 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: AI 어시스턴트 */}
            <div className="lg:col-span-2">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI 어시스턴트 (고급)
                </h3>
                <AssistantChat
                  spreadsheetId={spreadsheetId}
                  spreadsheetTitle={spreadsheetTitle}
                  analysisResult={analysisResult}
                  onGenerateCode={async (desc, opts) => {
                    const code = await onGenerateCode?.(desc, opts)
                    if (code) {
                      handleCodeGenerated(code, desc)
                    }
                    return code || ''
                  }}
                  onModifyCode={onModifyCode}
                />
              </div>
            </div>

            {/* 오른쪽: 대화 내역 */}
            <div>
              <div className="bg-white border rounded-lg p-6">
                <ConversationHistory
                  onSelectConversation={(conv) => {
                    console.log('대화 선택:', conv)
                  }}
                  onConvertToMenu={handleConvertToMenu}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2단계: 메뉴 관리 */}
      {activeStep === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 메뉴 목록 */}
          <div>
            <div className="bg-white border rounded-lg p-6">
              <CodeMenuManager
                key={refreshKey}
                onSelectMenu={handleSelectMenu}
                selectedMenuId={selectedMenu?.id}
              />
            </div>
          </div>

          {/* 오른쪽: 선택된 메뉴의 버전 관리 */}
          <div className="lg:col-span-2">
            {selectedMenu ? (
              <div className="bg-white border rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{selectedMenu.menuName}</h3>
                  <p className="text-sm text-gray-600">{selectedMenu.description}</p>
                </div>
                <CodeVersionList
                  menu={selectedMenu}
                  onMenuUpdate={handleMenuUpdate}
                  onSelectVersion={handleSelectVersion}
                  onViewConversation={(conversationId) => {
                    // 대화 탭으로 이동하고 해당 대화를 하이라이트
                    setActiveStep('chat')
                    // TODO: 특정 대화로 스크롤하는 기능 추가 가능
                  }}
                  onExecuteCode={handleExecuteCode}
                />
              </div>
            ) : (
              <div className="bg-white border rounded-lg p-6 flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Menu className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>왼쪽에서 메뉴를 선택하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3단계: 코드 템플릿 */}
      {activeStep === 'template' && (
          <div className="bg-white border rounded-lg p-6">
            <TemplateBrowser
              onSelectTemplate={(template) => {
                console.log('템플릿 선택:', template)
              }}
              onUseTemplate={(code) => {
                onSelectCode?.(code)
                alert('템플릿 코드를 에디터에 적용했습니다!')
              }}
              onFillGenerator={(template) => {
                // 템플릿으로 코드 생성기 채우기
                if (codeGeneratorRef.current) {
                  codeGeneratorRef.current.fillFormData({
                    menuName: template.name,
                    feature: template.name,
                    description: template.description,
                    code: template.code
                  })

                  // AI 대화 탭으로 이동
                  setActiveStep('chat')

                  // 코드 생성기로 스크롤
                  setTimeout(() => {
                    codeGeneratorSectionRef.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }, 100)

                  alert('템플릿이 코드 생성기에 적용되었습니다!')
                }
              }}
            />
          </div>
        )}

      {/* 4단계: 코드 라이브러리 */}
      {activeStep === 'library' && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            코드 라이브러리
          </h3>
          <CodeLibraryBrowser onSelectCode={handleSelectFromLibrary} />
        </div>
      )}

      {/* 코드 실행 결과 오버레이 */}
      {executionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">코드 실행 결과</h3>
              <button
                onClick={() => setExecutionResult(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <CodeExecutionPreview
                  result={executionResult}
                  menuId={selectedMenu?.id}
                  versionId={selectedMenu?.versions.find(v => v.isActive)?.id}
                  versionName={selectedMenu?.versions.find(v => v.isActive)?.versionName}
                  executedCode={lastExecutedCode}
                  onHistorySaved={() => {
                    setRefreshKey((prev) => prev + 1)
                  }}
                  onSave={() => {
                    alert('실행 결과가 저장되었습니다!')
                    setExecutionResult(null)
                  }}
                  onCancel={() => setExecutionResult(null)}
                  onRerun={() => {
                    alert('코드를 다시 실행합니다...')
                  }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
