"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

type ChatUIContextValue = {
  open: boolean
  unread: boolean
  setUnread: (value: boolean) => void
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  registerChatReset: (fn: () => void) => () => void
}

const ChatUIContext = createContext<ChatUIContextValue | null>(null)

export function ChatUIProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(false)
  const chatResetRef = useRef<(() => void) | null>(null)

  const registerChatReset = useCallback((fn: () => void) => {
    chatResetRef.current = fn
    return () => {
      if (chatResetRef.current === fn) chatResetRef.current = null
    }
  }, [])

  const openChat = useCallback(() => {
    setOpen(true)
    setUnread(false)
  }, [])

  const closeChat = useCallback(() => {
    setOpen(false)
  }, [])

  const toggleChat = useCallback(() => {
    setOpen((prev) => {
      if (prev) {
        chatResetRef.current?.()
        return false
      }
      setUnread(false)
      return true
    })
  }, [])

  const value = useMemo(
    () => ({ open, unread, setUnread, openChat, closeChat, toggleChat, registerChatReset }),
    [open, unread, openChat, closeChat, toggleChat, registerChatReset],
  )

  return <ChatUIContext.Provider value={value}>{children}</ChatUIContext.Provider>
}

export function useChatUI() {
  const ctx = useContext(ChatUIContext)
  if (!ctx) {
    throw new Error("useChatUI must be used within ChatUIProvider")
  }
  return ctx
}
