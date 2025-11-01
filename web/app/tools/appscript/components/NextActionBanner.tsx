'use client'

import { ArrowRight, Lightbulb } from 'lucide-react'

interface NextActionBannerProps {
  message: string
  actionText?: string
  onAction?: () => void
  type?: 'info' | 'success' | 'warning'
}

export function NextActionBanner({
  message,
  actionText,
  onAction,
  type = 'info'
}: NextActionBannerProps) {
  const bgColors = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200'
  }

  const textColors = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-yellow-800'
  }

  const buttonColors = {
    info: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700'
  }

  return (
    <div className={`border rounded-lg p-4 mb-6 ${bgColors[type]}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Lightbulb className={`h-5 w-5 flex-shrink-0 ${textColors[type]}`} />
          <p className={`text-sm font-medium ${textColors[type]}`}>
            {message}
          </p>
        </div>

        {actionText && onAction && (
          <button
            onClick={onAction}
            className={`
              inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg
              font-medium text-sm transition-colors flex-shrink-0
              ${buttonColors[type]}
            `}
          >
            {actionText}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
