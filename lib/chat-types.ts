export type ChatRole = "user" | "assistant"

export type ChatUiMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
}

export type AnthropicHistoryMessage = {
  role: ChatRole
  content: string
}

export type ChatApiRequestBody = {
  message?: string
  history?: AnthropicHistoryMessage[]
  sessionId?: string
}
