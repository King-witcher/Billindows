'use client'

import { ReactNode, createContext, use, useState } from 'react'
import { handleUserMessage } from './actions'

export type Message = {
  role: 'user' | 'assistant' | 'internal'
  content: string
  sentAt: Date
}

type ChatContextData = {
  messages: Message[]
  sendMessage(content: string): Promise<void>
  clear(): void
}

interface Props {
  children?: ReactNode
}

const ChatContextContext = createContext<ChatContextData | null>(null)

export function ChatProvider({ children }: Props) {
  const [messages, setMessages] = useState<Message[]>([])

  async function sendMessage(content: string) {
    const newMessage: Message = {
      role: 'user',
      content,
      sentAt: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])

    const response = await handleUserMessage(messages.slice(-20), content)
    const assistantMessage: Message = {
      role: 'assistant',
      content: response,
      sentAt: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])
  }

  function clear() {
    setMessages([])
  }

  return (
    <ChatContextContext
      value={{
        messages,
        sendMessage,
        clear,
      }}
    >
      {children}
    </ChatContextContext>
  )
}

export function useChat(): ChatContextData {
  const context = use(ChatContextContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatContextProvider')
  }
  return context
}
