"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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
}

const ChatUIContext = createContext<ChatUIContextValue | null>(null)

export function ChatUIProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(false)

  const openChat = useCallback(() => {
    setOpen(true)
    setUnread(false)
  }, [])

  const closeChat = useCallback(() => {
    setOpen(false)
  }, [])

  const toggleChat = useCallback(() => {
    setOpen((prev) => {
      if (prev) return false
      setUnread(false)
      return true
    })
  }, [])

  const value = useMemo(
    () => ({ open, unread, setUnread, openChat, closeChat, toggleChat }),
    [open, unread, openChat, closeChat, toggleChat],
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
