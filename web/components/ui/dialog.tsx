'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default'
}: DialogProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for easier dialog management
export function useDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    description: '',
    confirmText: '확인',
    cancelText: '취소',
    variant: 'default' as 'default' | 'danger',
    onConfirm: () => {}
  })

  const showDialog = (config: {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'danger'
    onConfirm: () => void
  }) => {
    setDialogConfig({
      title: config.title,
      description: config.description,
      confirmText: config.confirmText || '확인',
      cancelText: config.cancelText || '취소',
      variant: config.variant || 'default',
      onConfirm: config.onConfirm
    })
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
  }

  const DialogComponent = () => (
    <Dialog
      isOpen={isOpen}
      onClose={closeDialog}
      {...dialogConfig}
    />
  )

  return { showDialog, closeDialog, DialogComponent, isOpen }
}
