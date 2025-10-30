'use client'

import { useState } from 'react'
import { Code, Edit, Trash2, Check, Plus, Clock, FileCode } from 'lucide-react'
import type { CodeMenuItem, CodeVersion, CodeStatus } from '@/types/code-menu'
import {
  addCodeVersion,
  updateCodeVersion,
  deleteCodeVersion,
  setActiveVersion,
  toggleCodeStatus
} from '@/lib/code-menu-storage'

interface CodeVersionListProps {
  /** 선택된 메뉴 */
  menu: CodeMenuItem
  /** 메뉴 업데이트 시 콜백 */
  onMenuUpdate?: () => void
  /** 버전 선택 시 콜백 */
  onSelectVersion?: (version: CodeVersion) => void
}

export function CodeVersionList({ menu, onMenuUpdate, onSelectVersion }: CodeVersionListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVersion, setEditingVersion] = useState<CodeVersion | null>(null)
  const [formData, setFormData] = useState({
    versionName: '',
    description: '',
    code: ''
  })

  const handleAddVersion = () => {
    if (!formData.versionName.trim()) {
      alert('버전 이름을 입력해주세요.')
      return
    }

    addCodeVersion(menu.id, formData.code, {
      versionName: formData.versionName,
      description: formData.description || undefined,
      status: 'draft',
      setAsActive: false
    })

    onMenuUpdate?.()
    setShowAddForm(false)
    setFormData({ versionName: '', description: '', code: '' })
  }

  const handleUpdateVersion = () => {
    if (!editingVersion) return
    if (!formData.versionName.trim()) {
      alert('버전 이름을 입력해주세요.')
      return
    }

    updateCodeVersion(menu.id, editingVersion.id, {
      versionName: formData.versionName,
      description: formData.description || undefined,
      code: formData.code
    })

    onMenuUpdate?.()
    setEditingVersion(null)
    setFormData({ versionName: '', description: '', code: '' })
  }

  const handleDeleteVersion = (version: CodeVersion) => {
    if (menu.versions.length === 1) {
      alert('마지막 버전은 삭제할 수 없습니다.')
      return
    }

    if (confirm(`"${version.versionName}" 버전을 삭제하시겠습니까?`)) {
      deleteCodeVersion(menu.id, version.id)
      onMenuUpdate?.()
    }
  }

  const handleSetActive = (version: CodeVersion) => {
    setActiveVersion(menu.id, version.id)
    onMenuUpdate?.()
  }

  const handleToggleStatus = (version: CodeVersion) => {
    toggleCodeStatus(menu.id, version.id)
    onMenuUpdate?.()
  }

  const startEdit = (version: CodeVersion) => {
    setEditingVersion(version)
    setFormData({
      versionName: version.versionName,
      description: version.description || '',
      code: version.code
    })
    setShowAddForm(false)
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setEditingVersion(null)
    setFormData({ versionName: '', description: '', code: '' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: CodeStatus) => {
    return status === 'draft'
      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
      : 'bg-green-100 text-green-700 border-green-300'
  }

  const getStatusLabel = (status: CodeStatus) => {
    return status === 'draft' ? '초안' : '완성'
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <FileCode className="h-4 w-4" />
          버전 관리
          <span className="text-sm text-gray-500">({menu.versions.length}개)</span>
        </h4>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingVersion(null)
            setFormData({
              versionName: `v${menu.versions.length + 1}`,
              description: '',
              code: menu.versions[0]?.code || ''
            })
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          새 버전
        </button>
      </div>

      {/* 추가/수정 폼 */}
      {(showAddForm || editingVersion) && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <h5 className="font-medium">{editingVersion ? '버전 수정' : '새 버전 추가'}</h5>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                버전 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.versionName}
                onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                placeholder="예: v1, v2, 초안, 최종"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="이 버전의 특징이나 변경사항"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">코드</label>
            <textarea
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Apps Script 코드를 입력하세요"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={10}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelForm}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              취소
            </button>
            <button
              onClick={editingVersion ? handleUpdateVersion : handleAddVersion}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {editingVersion ? '수정' : '추가'}
            </button>
          </div>
        </div>
      )}

      {/* 버전 목록 */}
      <div className="space-y-2">
        {menu.versions.map((version) => (
          <div
            key={version.id}
            className={`border rounded-lg p-4 ${
              version.isActive ? 'border-blue-500 bg-blue-50' : 'bg-white'
            }`}
          >
            {/* 버전 헤더 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {version.isActive && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                    <Check className="h-3 w-3" />
                    활성
                  </div>
                )}
                <h5 className="font-medium">{version.versionName}</h5>
                <button
                  onClick={() => handleToggleStatus(version)}
                  className={`px-2 py-1 text-xs border rounded cursor-pointer ${getStatusColor(
                    version.status
                  )}`}
                  title="클릭하여 상태 변경"
                >
                  {getStatusLabel(version.status)}
                </button>
              </div>

              <div className="flex gap-1">
                {!version.isActive && (
                  <button
                    onClick={() => handleSetActive(version)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    title="활성 버전으로 설정"
                  >
                    활성화
                  </button>
                )}
                <button
                  onClick={() => {
                    startEdit(version)
                    onSelectVersion?.(version)
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="수정"
                >
                  <Edit className="h-4 w-4 text-blue-500" />
                </button>
                <button
                  onClick={() => handleDeleteVersion(version)}
                  className="p-1 hover:bg-red-100 rounded"
                  title="삭제"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* 버전 상세 */}
            {version.description && (
              <p className="text-sm text-gray-600 mb-2">{version.description}</p>
            )}

            {/* 코드 미리보기 */}
            {version.code && (
              <div className="bg-gray-900 text-gray-100 rounded p-3 mb-2">
                <pre className="text-xs overflow-x-auto">
                  <code>{version.code.substring(0, 200)}</code>
                  {version.code.length > 200 && <span className="text-gray-500">...</span>}
                </pre>
              </div>
            )}

            {/* 메타 정보 */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                생성: {formatDate(version.createdAt)}
              </span>
              {version.updatedAt.getTime() !== version.createdAt.getTime() && (
                <span>수정: {formatDate(version.updatedAt)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
