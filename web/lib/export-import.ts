'use client'

import { getCodeMenus } from './code-menu-storage'
import { getConversations } from './conversation-storage'
import type { CodeMenuItem } from '@/types/code-menu'
import type { ConversationRecord } from '@/types/conversation'

// Export 데이터 타입
interface ExportData {
  version: string
  exportDate: string
  menus?: CodeMenuItem[]
  conversations?: ConversationRecord[]
}

/**
 * 메뉴 데이터를 JSON 파일로 내보내기
 */
export function exportMenus() {
  const menus = getCodeMenus()
  const exportData: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    menus
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `code-menus-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 대화 데이터를 JSON 파일로 내보내기
 */
export function exportConversations() {
  const conversations = getConversations()
  const exportData: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    conversations
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `conversations-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 모든 데이터를 JSON 파일로 내보내기
 */
export function exportAll() {
  const menus = getCodeMenus()
  const conversations = getConversations()
  const exportData: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    menus,
    conversations
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `appscript-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * JSON 파일에서 메뉴 데이터 가져오기
 */
export async function importMenus(file: File): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const text = await file.text()
    const data: ExportData = JSON.parse(text)

    if (!data.menus || !Array.isArray(data.menus)) {
      return { success: false, count: 0, message: '유효한 메뉴 데이터가 없습니다.' }
    }

    // LocalStorage에 저장
    const existingMenus = getCodeMenus()
    const newMenus = [...existingMenus]

    let importedCount = 0
    for (const menu of data.menus) {
      // 중복 체크 (ID 기반)
      const exists = existingMenus.some((m) => m.id === menu.id)
      if (!exists) {
        newMenus.push(menu)
        importedCount++
      }
    }

    localStorage.setItem('code_menus', JSON.stringify(newMenus))

    return {
      success: true,
      count: importedCount,
      message: `${importedCount}개 메뉴를 가져왔습니다.`
    }
  } catch (error) {
    return {
      success: false,
      count: 0,
      message: '파일 읽기 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류')
    }
  }
}

/**
 * JSON 파일에서 대화 데이터 가져오기
 */
export async function importConversations(file: File): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const text = await file.text()
    const data: ExportData = JSON.parse(text)

    if (!data.conversations || !Array.isArray(data.conversations)) {
      return { success: false, count: 0, message: '유효한 대화 데이터가 없습니다.' }
    }

    // LocalStorage에 저장
    const existingConvs = getConversations()
    const newConvs = [...existingConvs]

    let importedCount = 0
    for (const conv of data.conversations) {
      // 중복 체크 (ID 기반)
      const exists = existingConvs.some((c) => c.id === conv.id)
      if (!exists) {
        // Date 객체 복원
        const restoredConv = {
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }
        newConvs.push(restoredConv)
        importedCount++
      }
    }

    localStorage.setItem('conversations', JSON.stringify(newConvs))

    return {
      success: true,
      count: importedCount,
      message: `${importedCount}개 대화를 가져왔습니다.`
    }
  } catch (error) {
    return {
      success: false,
      count: 0,
      message: '파일 읽기 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류')
    }
  }
}

/**
 * JSON 파일에서 모든 데이터 가져오기
 */
export async function importAll(file: File): Promise<{ success: boolean; menuCount: number; convCount: number; message: string }> {
  try {
    const text = await file.text()
    const data: ExportData = JSON.parse(text)

    let menuCount = 0
    let convCount = 0

    // 메뉴 가져오기
    if (data.menus && Array.isArray(data.menus)) {
      const menuResult = await importMenus(
        new File([JSON.stringify({ menus: data.menus })], 'menus.json', { type: 'application/json' })
      )
      menuCount = menuResult.count
    }

    // 대화 가져오기
    if (data.conversations && Array.isArray(data.conversations)) {
      const convResult = await importConversations(
        new File([JSON.stringify({ conversations: data.conversations })], 'conversations.json', { type: 'application/json' })
      )
      convCount = convResult.count
    }

    return {
      success: true,
      menuCount,
      convCount,
      message: `메뉴 ${menuCount}개, 대화 ${convCount}개를 가져왔습니다.`
    }
  } catch (error) {
    return {
      success: false,
      menuCount: 0,
      convCount: 0,
      message: '파일 읽기 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류')
    }
  }
}
