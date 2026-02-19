'use client'

import { type InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '../user-context'
import { type Cursor, type ListMessagesResult, listMessagesAction } from './actions'
import type { ClientMessage } from './types'

export function useConversation() {
  const user = useUser()

  const messagesQuery = useInfiniteQuery({
    queryKey: ['chat-messages', user?.email],
    async queryFn({ pageParam }) {
      const result = await listMessagesAction({
        limit: 5,
        cursor: pageParam,
      })
      return result
    },
    getNextPageParam(lastPage) {
      return lastPage.cursor ?? undefined
    },
    initialPageParam: null as Cursor | null,
  })

  const client = useQueryClient()

  function appendMessage(message: ClientMessage) {
    client.setQueryData(
      ['chat-messages', user?.email],
      (data: InfiniteData<ListMessagesResult, Cursor | null>) => {
        data.pages[0] = {
          cursor: data.pages[0].cursor,
          messages: [message, ...data.pages[0].messages],
        }
        return { ...data }
      },
    )
  }

  const messages = messagesQuery.data
    ? messagesQuery.data.pages.flatMap((page) => page.messages)
    : []

  return {
    messagesQuery,
    messages,
    appendMessage,
    refetch: messagesQuery.refetch,
    fetchMore: messagesQuery.fetchNextPage,
    isLoading: messagesQuery.isLoading,
    isFetchingNextPage: messagesQuery.isFetchingNextPage,
    hasNextPage: messagesQuery.hasNextPage,
  }
}
