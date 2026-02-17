'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, type ReactNode, use } from 'react'
import { toast } from 'sonner'
import { useUser } from '../user-context'
import { listMessagesAction, sendMessageAction } from './actions'
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

  const sendMessageMutation = useMutation({
    mutationKey: ['send-message'],
    mutationFn: async (message: string) => sendMessageAction(message),
    onMutate: async (message: string) => {
      const newMessage: ClientMessage = {
        id: `${Date.now()}`,
        role: 'user',
        content: message,
        sentAt: new Date(),
      }
      client.setQueryData(['chat-messages', user?.email], (old: ClientMessage[] | undefined) => {
        if (!old) return [newMessage]
        return [newMessage, ...old]
      })
    },
    onError: async (error) => {
      toast.error('Failed to send message.')
      messagesQuery.refetch()
      console.error(error)
    },
    onSuccess(data) {
      client.setQueryData(['chat-messages', user?.email], (old: ClientMessage[] | undefined) => {
        if (!old) return old
        const assistantMessage: ClientMessage = {
          id: `${Date.now()}`,
          role: 'assistant',
          content: data.response,
          sentAt: new Date(),
        }
        return [assistantMessage, ...old]
      })
    },
  })

  async function sendMessage(request: string) {
    sendMessageMutation.mutate(request)
  }

  function clear() {
    // setMessages([])
  }

  return (
    <ChatContextContext
      value={{
        messages: messagesQuery.data || [],
        writting: sendMessageMutation.isPending,
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
