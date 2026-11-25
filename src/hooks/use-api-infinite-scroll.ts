import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  /** 取得済み記事全体に適用する絞り込み（キーワードフィルタ） */
  filterEntries?: (entries: TEntry[]) => TEntry[]
  /** 絞り込み条件が有効か。有効時は自動の追加取得を行わない */
  isFiltered?: boolean
}

type UseApiInfiniteScrollReturn<TEntry> = {
  displayedEntries: TEntry[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  /** 初回取得のエラー（追加取得のエラーは含まない） */
  error: Error | null
  loadMoreRef: React.RefObject<HTMLDivElement | null>
  /** 取得済み記事の表示を終え、取得元に続きがある（手動の追加取得が必要） */
  canFetchMore: boolean
  isFetchingMore: boolean
  /** 追加取得のエラー */
  fetchMoreError: Error | null
  fetchMore: () => void
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
  filterEntries,
  isFiltered = false,
}: UseApiInfiniteScrollOptions<TEntry>): UseApiInfiniteScrollReturn<TEntry> {
  const [displayedCount, setDisplayedCount] = useState(perPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isFetchNextPageError,
    error,
  } = useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam = 0 }) => queryFn({ pageParam }),
      getNextPageParam: (lastPage, pages) => {
        const currentOffset = pages.length * apiLimit
        return currentOffset < lastPage.total ? currentOffset : undefined
      },
      initialPageParam: 0,
      staleTime,
    })

  const allEntries = useMemo(() => {
    const fetched = data?.pages.flatMap((page) => page.entries) ?? []
    return isFiltered && filterEntries ? filterEntries(fetched) : fetched
  }, [data, isFiltered, filterEntries])
  const totalFetched = allEntries.length
  const totalAvailable = data?.pages[0]?.total ?? 0

  const displayedEntries = allEntries.slice(0, displayedCount)
  const hasMoreInMemory = displayedCount < totalFetched
  const hasMoreToFetch = hasNextPage ?? false
  // 絞り込み中と追加取得の失敗後は、取得済み記事の範囲だけを自動表示し、追加取得は手動で行う
  const isManualFetch = isFiltered || isFetchNextPageError
  const hasMore = isManualFetch ? hasMoreInMemory : hasMoreInMemory || hasMoreToFetch
  const canFetchMore = isManualFetch && !hasMoreInMemory && hasMoreToFetch

  // Reset displayed count when dependencies change
  useEffect(() => {
    setDisplayedCount(perPage)
  }, [...resetDeps, perPage])

  // Auto-fetch next page when approaching the end of fetched data
  useEffect(() => {
    if (isManualFetch || !hasMoreToFetch || isFetchingNextPage) return

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
    isManualFetch,
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
    error: isFetchNextPageError ? null : (error as Error | null),
    loadMoreRef,
    canFetchMore,
    isFetchingMore: isFetchingNextPage,
    fetchMoreError: isFetchNextPageError ? (error as Error | null) : null,
    fetchMore: () => {
      if (isFetchingNextPage) return
      console.debug('[useApiInfiniteScroll] Manual fetch next page', { totalFetched })
      fetchNextPage()
    },
  }
}
