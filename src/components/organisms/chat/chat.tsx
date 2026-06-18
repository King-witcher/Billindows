'use client'

import {
  type ComponentProps,
  type KeyboardEvent,
  type SubmitEvent,
  useLayoutEffect,
  useRef,
} from 'react'
import { ChatMessage } from '@/components/atoms/chat-message/chat-message'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useChat } from '@/contexts/chat/chat-context'
import { useInView } from '@/hooks/use-intersection-observer'
import { cn } from '@/lib/utils'

export function Chat({ className, ...rest }: ComponentProps<'div'>) {
  const { messages, writting, hasMore, isLoadingMore, fetchMore, sendMessage } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Scroll bookkeeping from the previous commit, used to decide between sticking
  // to the bottom and preserving the position when older messages are prepended.
  const prevScrollHeightRef = useRef(0)
  const prevNewestIdRef = useRef<string | undefined>(undefined)
  const prevCountRef = useRef(0)
  const prevWrittingRef = useRef(false)

  // Loads older messages only when the top sentinel actually scrolls into view.
  const observerRef = useInView({
    callback: () => {
      if (hasMore && !isLoadingMore) fetchMore()
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

  // Manage the scroll position deterministically (native scroll anchoring is
  // disabled via `overflow-anchor: none` on the container):
  //  - newest message changed (initial load / send / receive) -> stick to bottom
  //  - assistant started writing -> stick to bottom so the spinner is visible
  //  - only older messages were prepended -> keep the current view by offsetting
  //    the scroll by exactly the height that was added at the top.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const newestId = messages[0]?.id
    const count = messages.length

    if (newestId !== prevNewestIdRef.current || (writting && !prevWrittingRef.current)) {
      el.scrollTop = el.scrollHeight
    } else if (count > prevCountRef.current) {
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current
    }

    prevScrollHeightRef.current = el.scrollHeight
    prevNewestIdRef.current = newestId
    prevCountRef.current = count
    prevWrittingRef.current = writting
  }, [messages, writting])

  function handleEnterPress(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <div className={cn('w-100 bg-white border-l border-border', className)} {...rest}>
      <div className="flex flex-col h-full">
        {/* Messages container. `flex-col-reverse` on the scroll element makes it
            start at the bottom, keep newest messages anchored down, and preserve
            the scroll position when older messages are prepended at the top. */}
        <div className="flex-1 relative">
          <div
            className="absolute inset-0 overflow-y-auto p-4 flex flex-col-reverse gap-2 [overflow-anchor:none]"
            ref={scrollRef}
          >
            {writting && <Spinner />}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {hasMore && (
              <div className="flex justify-center w-full py-2" ref={observerRef}>
                <Spinner />
              </div>
            )}
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
