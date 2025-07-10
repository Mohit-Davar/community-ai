import type { Message } from "@ai-sdk/react"

export interface ChatHistoryItem {
  id: string
  title: string
  date: string
  icon: string
  messages: Message[]
  mode: string
  active?: boolean
}

export interface IntegrationMode {
  id: string
  name: string
  icon: string
  image: string
  color: string
  description: string
  systemPrompt?: string
  useCustomBackend?: boolean
}
