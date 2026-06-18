'use client'

import { useCallback, useRef } from 'react'

type Props = {
  callback: () => void
  options?: IntersectionObserverInit
}

/**
 * Returns a callback ref that observes the attached node and runs `callback`
 * whenever it enters the viewport. The observer is created once per mounted
 * node (not on every render) and always calls the latest `callback`, so it can
 * be safely used with inline arrow functions.
 */
export function useInView({ callback, options }: Props) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect()

      if (!node) return

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) callbackRef.current()
      }, options)

      observer.observe(node)
      observerRef.current = observer
    },
    [options],
  )

  return ref
}
