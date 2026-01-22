import { useEffect, useRef } from 'react'

type InfiniteScrollProps = {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  children: React.ReactNode
  threshold?: number
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  children,
  threshold = 300,
}: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      {
        rootMargin: `${threshold}px`,
      },
    )

    const currentRef = observerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasMore, isLoading, onLoadMore, threshold])

  return (
    <>
      {children}
      {hasMore && <div ref={observerRef} className="h-4" />}
    </>
  )
}
