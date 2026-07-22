"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

type ToastVariant = "error" | "success" | "info"

type Toast = {
  id: number
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const AUTO_DISMISS_MS = 5000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    idRef.current += 1
    const id = idRef.current
    setToasts((current) => [...current, { id, message, variant }])
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const palette: Record<ToastVariant, string> = {
    error: "border-orange-brand/30 bg-orange-brand/10 text-orange-brand",
    success: "border-green-mid/30 bg-green-mid/10 text-green-brand",
    info: "border-border-brand bg-cream text-text-mid",
  }

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      className={`animate-fade-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-sm ${palette[toast.variant]}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fail soft: never crash a form because the provider is missing.
    return { toast: () => {} }
  }
  return ctx
}
