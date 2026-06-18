'use client'

import { useMutation } from '@tanstack/react-query'
import { createContext, type ReactNode, use } from 'react'
import { toast } from 'sonner'
import { sendMessageAction } from './actions'
import type { ClientMessage } from './types'
import { useConversation } from './use-conversation'

type ChatContextData = {
  messages: ClientMessage[]
  isLoadingMore: boolean
  hasMore: boolean
  writting: boolean
  fetchMore: () => void
  sendMessage(content: string): Promise<void>
  clear(): void
}

interface Props {
  children?: ReactNode
}

const ChatContextContext = createContext<ChatContextData | null>(null)

export function ChatProvider({ children }: Props) {
  const conversation = useConversation()

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
      conversation.appendMessage(newMessage)
    },
    onError: async (error) => {
      toast.error('Failed to send message.')
      conversation.refetch()
      console.error(error)
    },
    onSuccess(data) {
      conversation.appendMessage({
        id: `${Date.now()}`,
        role: 'assistant',
        content: data.response,
        sentAt: new Date(),
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
        messages: conversation.messages,
        writting: sendMessageMutation.isPending,
        isLoadingMore: conversation.isFetchingNextPage,
        hasMore: conversation.hasNextPage ?? false,
        fetchMore: conversation.fetchMore,
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
