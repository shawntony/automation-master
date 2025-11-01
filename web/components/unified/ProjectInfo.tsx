'use client'

import { Folder, FileText, Package, CheckCircle } from 'lucide-react'
import type { ProjectType } from '@/types/unified-workflow'

interface ProjectInfoProps {
  projectName: string
  projectType: ProjectType
  projectPath?: string
  prdPath?: string
  generatedFiles?: string[]
  showSuccess?: boolean
}

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  fullstack: 'Fullstack',
  frontend: 'Frontend',
  backend: 'Backend',
  automation: 'Automation'
}

export function ProjectInfo({
  projectName,
  projectType,
  projectPath,
  prdPath,
  generatedFiles = [],
  showSuccess = false
}: ProjectInfoProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {showSuccess ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : (
          <Package className="h-6 w-6 text-indigo-600" />
        )}
        <h3 className="text-lg font-semibold text-gray-900">프로젝트 정보</h3>
      </div>

      {/* Project Details */}
      <div className="space-y-3">
        {/* Project Name */}
        <div className="flex items-start gap-3">
          <Folder className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">프로젝트명</p>
            <p className="text-sm text-gray-900 font-mono">{projectName}</p>
          </div>
        </div>

        {/* Project Type */}
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">타입</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
              {PROJECT_TYPE_LABELS[projectType]}
            </span>
          </div>
        </div>

        {/* Project Path (if created) */}
        {projectPath && (
          <div className="flex items-start gap-3">
            <Folder className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">프로젝트 경로</p>
              <p className="text-xs text-gray-600 font-mono break-all">{projectPath}</p>
            </div>
          </div>
        )}

        {/* PRD Path (if created) */}
        {prdPath && (
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">PRD 문서</p>
              <p className="text-xs text-gray-600 font-mono break-all">{prdPath}</p>
            </div>
          </div>
        )}

        {/* Generated Files */}
        {generatedFiles.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">생성된 파일</p>
            <div className="grid grid-cols-2 gap-2">
              {generatedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
                >
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="truncate" title={file}>{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ 프로젝트가 성공적으로 생성되었습니다!
          </p>
        </div>
      )}
    </div>
  )
}
