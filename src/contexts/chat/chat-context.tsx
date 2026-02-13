'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, type ReactNode, use } from 'react'
import { useUser } from '../user-context'
import { listMessagesAction } from './actions'
import type { ClientMessage } from './types'

type ChatContextData = {
  messages: ClientMessage[]
  writting: boolean
  sendMessage(content: string): Promise<void>
  clear(): void
}

interface Props {
  children?: ReactNode
}

const ChatContextContext = createContext<ChatContextData | null>(null)

export function ChatProvider({ children }: Props) {
  const user = useUser()
  const messagesQuery = useQuery({
    queryKey: ['chat-messages', user?.email],
    queryFn: async () => {
      return await listMessagesAction()
    },
  })

  const client = useQueryClient()

  const callAgentMutation = useMutation({
    mutationKey: ['call-agent'],
    mutationFn: async (message: string) => {
      // return await callAgentAction({ history: messages.slice(-20), input: message })
    },
    onMutate: async (message: string) => {
      const newMessage: ClientMessage = {
        id: `${Date.now()}`,
        role: 'user',
        content: message,
        sentAt: new Date(),
      }
      // setMessages((prev) => [...prev, newMessage])
    },
    onSuccess: async (response) => {
      // const assistantMessage: ClientMessage = {
      //   id: `${Date.now()}`,
      //   role: 'assistant',
      //   content: response.text,
      //   sentAt: new Date(),
      // }
      // setMessages((prev) => [...prev, assistantMessage])
      // if (response.invalidate.transactions) {
      //   client.refetchQueries({ queryKey: ['transactions'] })
      // }
    },
    onError: async (error) => {
      console.error('Error calling agent:', error)
    },
  })

  async function sendMessage(request: string) {
    callAgentMutation.mutate(request)
  }

  function clear() {
    // setMessages([])
  }

  return (
    <ChatContextContext
      value={{
        messages: messagesQuery.data || [],
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
