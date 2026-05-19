'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error'
}

interface ToastContextType {
  toasts: Toast[]
  toast: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4 shadow-lg min-w-[320px] bg-white',
              t.variant === 'error' ? 'border-red-200' : t.variant === 'success' ? 'border-emerald-200' : 'border-slate-200'
            )}
          >
            {t.variant === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />}
            {t.variant === 'error' && <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
            {(!t.variant || t.variant === 'default') && <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{t.title}</p>
              {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return React.useContext(ToastContext)
}
