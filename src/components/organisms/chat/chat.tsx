'use client'

import {
  type ComponentProps,
  type KeyboardEvent,
  type SubmitEvent,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import { ChatMessage } from '@/components/atoms/chat-message/chat-message'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useChat } from '@/contexts/chat/chat-context'
import { useInView } from '@/hooks/use-intersection-observer'
import { cn } from '@/lib/utils'

export function Chat({ className, ...rest }: ComponentProps<'div'>) {
  const { messages, writting, hasMore, fetchMore, sendMessage } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const initializedRef = useRef(false)

  const observerRef = useInView({
    callback: () => {
      if (initializedRef.current) fetchMore()
    },
  })

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (writting) return

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const message = formData.get('message')?.toString()
    if (message) {
      sendMessage(message)
      e.currentTarget.reset()
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrolling
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
      })
      initializedRef.current = true
    }
  }, [messages[0]?.id])

  function handleEnterPress(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <div className={cn('w-100 bg-white border-l border-border', className)} {...rest}>
      <div className="flex flex-col h-full">
        {/* Messages container */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 overflow-y-scroll p-4" ref={scrollRef}>
            <div className="flex flex-col-reverse gap-2 min-h-full justify-end">
              {writting && <Spinner />}
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  ref={index === 0 ? observerRef : undefined}
                  message={message}
                />
              ))}
              {hasMore && (
                <div className="flex justify-center w-full pb-2" ref={observerRef}>
                  <Spinner />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Input container */}
        <div className="p-4 border-t border-border bg-background">
          <form onSubmit={handleSubmit} ref={formRef}>
            <Textarea
              name="message"
              autoComplete="off"
              onKeyDown={handleEnterPress}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring resize-none bg-white"
            />
          </form>
        </div>
      </div>
    </div>
  )
}
