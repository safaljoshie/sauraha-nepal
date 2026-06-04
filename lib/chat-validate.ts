import type { AnthropicHistoryMessage } from "@/lib/chat-types"

const MAX_MESSAGE_LENGTH = 200
const MAX_HISTORY = 10

export function validateChatMessage(message: unknown): string | null {
  if (typeof message !== "string") return null
  const trimmed = message.trim()
  if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return null
  return trimmed
}

export function validateChatHistory(history: unknown): AnthropicHistoryMessage[] {
  if (!Array.isArray(history)) return []

  const out: AnthropicHistoryMessage[] = []
  for (const item of history.slice(-MAX_HISTORY)) {
    if (!item || typeof item !== "object") continue
    const role = (item as { role?: unknown }).role
    const content = (item as { content?: unknown }).content
    if (role !== "user" && role !== "assistant") continue
    if (typeof content !== "string") continue
    const trimmed = content.trim()
    if (!trimmed) continue
    out.push({
      role,
      content: trimmed.slice(0, MAX_MESSAGE_LENGTH * 4),
    })
  }
  return out
}
