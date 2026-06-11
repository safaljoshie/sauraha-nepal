"use client"

import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { useChatUI } from "@/components/ChatUIProvider"
import ChatAssistantAvatar from "@/components/chat/ChatAssistantAvatar"
import type { AnthropicHistoryMessage, ChatUiMessage } from "@/lib/chat-types"
import { MOBILE_HOME_NAV_TOP } from "@/lib/mobile-home-nav"

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 md:h-6 md:w-6"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  )
}

function BotAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      aria-hidden
    >
      <ChatAssistantAvatar size={size} variant="avatar" />
    </span>
  )
}

const WELCOME =
  "Hi! 👋 I'm Dhurbe, your AI travel guide for Sauraha and Chitwan National Park. What would you like to know? 🐘"

const QUICK_REPLIES = [
  "🏨 Best hotels",
  "🐘 Safari options",
  "🚌 Getting here",
  "🌤️ Best time to visit",
] as const

const MAX_MESSAGE_LENGTH = 200
const MAX_HISTORY = 10
const ERROR_MESSAGE =
  "Sorry, I'm having trouble connecting. Please try again or email us at hello@mail.saurahanepal.com"

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function newMessage(role: ChatUiMessage["role"], content: string): ChatUiMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
  }
}

function toApiHistory(messages: ChatUiMessage[]): AnthropicHistoryMessage[] {
  return messages.slice(-MAX_HISTORY).map((m) => ({
    role: m.role,
    content: m.content,
  }))
}

export default function ChatWidget() {
  const pathname = usePathname()
  const onHome = pathname === "/"
  const { open, unread, setUnread, openChat, closeChat } = useChatUI()
  const [messages, setMessages] = useState<ChatUiMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    if (open) {
      setUnread(false)
      scrollToBottom()
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open, messages, loading, scrollToBottom, setUnread])

  useEffect(() => {
    if (open && !sessionId) setSessionId(crypto.randomUUID())
  }, [open, sessionId])

  const handleClose = () => {
    closeChat()
    setMessages([])
    setInput("")
    setError(null)
    setSessionId(null)
  }

  const handleOpen = () => {
    if (!sessionId) setSessionId(crypto.randomUUID())
    openChat()
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setError(null)
    const userMsg = newMessage("user", trimmed)
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)

    const sid = sessionId ?? crypto.randomUUID()
    if (!sessionId) setSessionId(sid)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: toApiHistory(messages),
          sessionId: sid,
        }),
      })

      const data = (await res.json()) as { reply?: string; error?: string }

      if (!res.ok) {
        setError(data.error ?? ERROR_MESSAGE)
        return
      }

      const reply = data.reply?.trim() || "Sorry, I could not process that."
      setMessages((prev) => [...prev, newMessage("assistant", reply)])
      if (!open) setUnread(true)
    } catch {
      setError(ERROR_MESSAGE)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendMessage(input)
  }

  const showWelcome = messages.length === 0 && !loading

  return (
    <>
      {open && (
        <div
          className={`chat-window-enter fixed z-[1000] flex flex-col overflow-hidden border border-border-brand bg-white shadow-[0_8px_40px_rgba(0,0,0,0.2)] max-md:inset-x-0 max-md:h-[60vh] max-md:rounded-t-2xl md:right-6 md:bottom-[90px] md:h-[500px] md:w-[360px] md:rounded-2xl ${MOBILE_HOME_NAV_TOP}`}
          role="dialog"
          aria-label="Dhurbe chat"
        >
          <header className="flex shrink-0 items-start justify-between gap-2 bg-green-brand px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <ChatAssistantAvatar size={40} variant="avatar" className="shadow-sm" />
              <div>
                <p className="font-semibold leading-tight">Dhurbe</p>
                <p className="flex items-center gap-1.5 text-xs text-white/85">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-light" aria-hidden />
                  Your Sauraha travel guide
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-2 py-1 text-lg leading-none text-white/90 transition-colors hover:bg-white/15"
              aria-label="Close chat"
            >
              ✕
            </button>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto bg-cream/50 p-4">
            {showWelcome && (
              <div className="mb-4 flex gap-2">
                <BotAvatar />
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-cream px-3 py-2 text-sm text-text-brand">
                  {WELCOME}
                </div>
              </div>
            )}

            {showWelcome && (
              <div className="mb-4 flex flex-wrap gap-2 pl-10">
                {QUICK_REPLIES.map((label) => (
                  <button
                    key={label}
                    type="button"
                    disabled={loading}
                    onClick={() => void sendMessage(label)}
                    className="rounded-full border border-green-brand/25 bg-white px-3 py-1.5 text-xs font-semibold text-green-brand transition-colors hover:bg-green-brand hover:text-white disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "assistant" && <BotAvatar />}
                <div
                  className={`max-w-[85%] ${
                    msg.role === "user" ? "items-end text-right" : ""
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-green-brand text-white"
                        : "rounded-tl-sm bg-cream text-text-brand"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p
                    className={`mt-1 text-[0.65rem] text-text-light ${
                      msg.role === "user" ? "text-right" : ""
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="mb-2 flex gap-2 pl-0">
                <BotAvatar />
                <div className="rounded-2xl rounded-tl-sm bg-cream px-3 py-3">
                  <div className="flex items-center gap-1" aria-hidden>
                    <span className="chat-typing-dot inline-block h-2 w-2 rounded-full bg-green-mid" />
                    <span className="chat-typing-dot inline-block h-2 w-2 rounded-full bg-green-mid" />
                    <span className="chat-typing-dot inline-block h-2 w-2 rounded-full bg-green-mid" />
                  </div>
                  <p className="mt-2 text-xs text-text-light">Dhurbe is typing...</p>
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-orange-brand/30 bg-orange-brand/10 px-3 py-2 text-sm text-text-brand">
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-border-brand bg-white p-3"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                placeholder="Ask Dhurbe about Sauraha..."
                disabled={loading}
                maxLength={MAX_MESSAGE_LENGTH}
                className="min-w-0 flex-1 rounded-full border border-border-brand bg-cream px-4 py-2.5 text-sm text-text-brand outline-none focus:border-green-mid disabled:opacity-60"
                aria-label="Message"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-brand text-white transition-colors hover:bg-green-mid disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="site-floating-actions">
        {onHome ? (
          <a
            href="#hero-search"
            className="site-search-fab"
            aria-label="Search destinations"
          >
            <SearchIcon />
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => (open ? handleClose() : handleOpen())}
          className="chat-bubble-pulse site-chat-fab relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-brand p-0 shadow-[0_4px_20px_rgba(232,98,26,0.45)] transition-transform hover:scale-105 md:h-12 md:w-12"
          title={open ? "Close Dhurbe" : "Chat with Dhurbe"}
          aria-label={open ? "Close Dhurbe" : "Open Dhurbe"}
        >
          {open ? (
            <span className="text-lg font-semibold text-white">✕</span>
          ) : (
            <ChatAssistantAvatar variant="launcher" />
          )}
          {!open && unread ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-brand text-[10px] font-bold text-white">
              1
            </span>
          ) : null}
        </button>
      </div>
    </>
  )
}
