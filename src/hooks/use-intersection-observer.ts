'use client'

import { useCallback, useMemo } from 'react'

type Props = {
  callback: () => void
  options?: IntersectionObserverInit
}

export function useInView({ callback, options }: Props) {
  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          callback()
        }
      }, options),
    [callback, options],
  )

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        observer.observe(node)
      }
      return () => {
        if (node) {
          observer.unobserve(node)
        }
      }
    },
    [observer],
  )

  return ref
}
