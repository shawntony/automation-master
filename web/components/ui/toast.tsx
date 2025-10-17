import * as React from "react"

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  type: ToastType
  title: string
  message: string
  duration?: number
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ type, title, message, duration = 5000, onClose }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }, [duration, onClose])

    if (!isVisible) return null

    const typeStyles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    }

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    }

    return (
      <div
        ref={ref}
        className={`fixed top-4 right-4 max-w-md p-4 rounded-lg border shadow-lg z-50 animate-in slide-in-from-top-2 ${typeStyles[type]}`}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">{icons[type]}</div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{title}</h4>
            <p className="text-sm">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              onClose?.()
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>
    )
  }
)

Toast.displayName = "Toast"

export { Toast }

// Toast container component
export function ToastContainer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed top-0 right-0 p-4 z-50 pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {children}
      </div>
    </div>
  )
}

// Simple toast hook
export function useToast() {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const showToast = React.useCallback((props: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substring(7)

    setToasts(prev => [...prev, { ...props, id, onClose: () => removeToast(id) }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = React.useCallback((title: string, message: string) => {
    showToast({ type: 'success', title, message })
  }, [showToast])

  const error = React.useCallback((title: string, message: string) => {
    showToast({ type: 'error', title, message })
  }, [showToast])

  const warning = React.useCallback((title: string, message: string) => {
    showToast({ type: 'warning', title, message })
  }, [showToast])

  const info = React.useCallback((title: string, message: string) => {
    showToast({ type: 'info', title, message })
  }, [showToast])

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
  }
}
