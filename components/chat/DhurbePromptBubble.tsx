"use client"

import ChatAssistantAvatar from "@/components/chat/ChatAssistantAvatar"

type DhurbePromptBubbleProps = {
  message: string
  onOpen: () => void
  onDismiss: () => void
  className?: string
}

export default function DhurbePromptBubble({
  message,
  onOpen,
  onDismiss,
  className = "",
}: DhurbePromptBubbleProps) {
  return (
    <div
      className={`dhurbe-prompt-anchor ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="dhurbe-prompt-bubble relative max-w-[260px] rounded-2xl border border-green-brand/15 bg-[#faf7f2] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          className="dhurbe-prompt-close absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-sm leading-none text-green-brand transition-colors hover:text-[#e8621a]"
          aria-label="Dismiss Dhurbe suggestion"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-start gap-2.5 pr-6 text-left"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <ChatAssistantAvatar size={32} variant="avatar" />
          </span>
          <span className="font-[family-name:var(--font-nunito)] text-sm leading-snug text-[#1a5c2a]">
            {message}
          </span>
        </button>
      </div>
    </div>
  )
}
