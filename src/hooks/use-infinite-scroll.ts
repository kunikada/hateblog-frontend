import { useEffect, useRef, useState } from 'react'

type UseInfiniteScrollOptions = {
  totalCount: number
  perPage: number
  resetDeps: unknown[]
  loadingDelayMs?: number
}

type UseInfiniteScrollReturn = {
  displayedCount: number
  isLoadingMore: boolean
  loadMoreRef: React.RefObject<HTMLDivElement | null>
}

export function useInfiniteScroll({
  totalCount,
  perPage,
  resetDeps,
  loadingDelayMs = 500,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [displayedCount, setDisplayedCount] = useState(perPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const hasMore = displayedCount < totalCount

  // Reset displayed count when dependencies change
  useEffect(() => {
    setDisplayedCount(perPage)
  }, [...resetDeps, perPage])

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true)
          setTimeout(() => {
            setDisplayedCount((prev) => prev + perPage)
            setIsLoadingMore(false)
          }, loadingDelayMs)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, perPage, loadingDelayMs])

  return { displayedCount, isLoadingMore, loadMoreRef }
}
