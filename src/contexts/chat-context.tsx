'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createContext, type ReactNode, use, useState } from 'react'
import { callAgentAction } from './actions'

export type Message = {
  role: 'user' | 'assistant' | 'internal'
  content: string
  sentAt: Date
}

type ChatContextData = {
  messages: Message[]
  writting: boolean
  sendMessage(content: string): Promise<void>
  clear(): void
}

interface Props {
  children?: ReactNode
}

const ChatContextContext = createContext<ChatContextData | null>(null)

export function ChatProvider({ children }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const client = useQueryClient()

  const callAgentMutation = useMutation({
    mutationKey: ['call-agent'],
    mutationFn: async (message: string) => {
      return await callAgentAction({ history: messages.slice(-20), input: message })
    },
    onMutate: async (message: string) => {
      const newMessage: Message = {
        role: 'user',
        content: message,
        sentAt: new Date(),
      }
      setMessages((prev) => [...prev, newMessage])
    },
    onSuccess: async (response) => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text,
        sentAt: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      if (response.invalidate.transactions) {
        client.refetchQueries({ queryKey: ['transactions'] })
      }
    },
    onError: async (error) => {
      console.error('Error calling agent:', error)
    },
  })

  async function sendMessage(request: string) {
    callAgentMutation.mutate(request)
  }

  function clear() {
    setMessages([])
  }

  return (
    <ChatContextContext
      value={{
        messages,
        writting: callAgentMutation.isPending,
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
