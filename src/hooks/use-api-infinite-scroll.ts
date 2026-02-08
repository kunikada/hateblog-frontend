import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import type { RankingEntry } from '@/usecases/fetch-rankings'

type InfiniteScrollQueryFn<TEntry> = (params: { pageParam?: number }) => Promise<{
  entries: TEntry[]
  total: number
}>

type UseApiInfiniteScrollOptions<TEntry> = {
  queryKey: readonly unknown[]
  queryFn: InfiniteScrollQueryFn<TEntry>
  perPage: number
  apiLimit: number
  resetDeps: unknown[]
  loadingDelayMs?: number
  staleTime?: number
}

type UseApiInfiniteScrollReturn<TEntry> = {
  displayedEntries: TEntry[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error: Error | null
  loadMoreRef: React.RefObject<HTMLDivElement | null>
}

const DEFAULT_API_LIMIT = 100
const DEFAULT_LOADING_DELAY_MS = 500

export function useApiInfiniteScroll<TEntry = RankingEntry>({
  queryKey,
  queryFn,
  perPage,
  apiLimit = DEFAULT_API_LIMIT,
  resetDeps,
  loadingDelayMs = DEFAULT_LOADING_DELAY_MS,
  staleTime,
}: UseApiInfiniteScrollOptions<TEntry>): UseApiInfiniteScrollReturn<TEntry> {
  const [displayedCount, setDisplayedCount] = useState(perPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, error } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam = 0 }) => queryFn({ pageParam }),
      getNextPageParam: (lastPage, pages) => {
        const currentOffset = pages.length * apiLimit
        return currentOffset < lastPage.total ? currentOffset : undefined
      },
      initialPageParam: 0,
      staleTime,
    })

  const allEntries = data?.pages.flatMap((page) => page.entries) ?? []
  const totalFetched = allEntries.length
  const totalAvailable = data?.pages[0]?.total ?? 0

  const displayedEntries = allEntries.slice(0, displayedCount)
  const hasMoreInMemory = displayedCount < totalFetched
  const hasMoreToFetch = hasNextPage ?? false
  const hasMore = hasMoreInMemory || hasMoreToFetch

  // Reset displayed count when dependencies change
  useEffect(() => {
    setDisplayedCount(perPage)
  }, [...resetDeps, perPage])

  // Auto-fetch next page when approaching the end of fetched data
  useEffect(() => {
    if (!hasMoreToFetch || isFetchingNextPage) return

    const remainingItems = totalFetched - displayedCount
    // Only fetch next page if we've displayed at least apiLimit items
    // and remaining items are low
    if (displayedCount >= apiLimit && remainingItems <= perPage && remainingItems > 0) {
      console.debug('[useApiInfiniteScroll] Auto-fetching next page', {
        totalFetched,
        displayedCount,
        remainingItems,
        apiLimit,
      })
      fetchNextPage()
    }
  }, [
    displayedCount,
    totalFetched,
    hasMoreToFetch,
    isFetchingNextPage,
    fetchNextPage,
    perPage,
    apiLimit,
  ])

  // Infinite scroll observer for incrementing displayed count
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && !isFetchingNextPage) {
          setIsLoadingMore(true)
          setTimeout(() => {
            setDisplayedCount((prev) => {
              const next = prev + perPage
              console.debug('[useApiInfiniteScroll] Incrementing displayed count', {
                prev,
                next,
                totalFetched,
                totalAvailable,
              })
              return next
            })
            setIsLoadingMore(false)
          }, loadingDelayMs)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [
    hasMore,
    isLoadingMore,
    isFetchingNextPage,
    perPage,
    loadingDelayMs,
    totalFetched,
    totalAvailable,
  ])

  return {
    displayedEntries,
    isLoading,
    isLoadingMore: isLoadingMore || isFetchingNextPage,
    hasMore,
    error: error as Error | null,
    loadMoreRef,
  }
}
