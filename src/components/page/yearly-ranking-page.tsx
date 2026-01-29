import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Navigation } from '@/components/layout/navigation'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { EntryCount } from '@/components/ui/entry-count'
import { EntryCard } from '@/components/ui/entry-card'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { config } from '@/lib/config'
import type { Entry } from '@/repositories/entries'
import { recordEntryClick } from '@/usecases/entry-click'
import { type RankingEntry, rankingsQueryOptions } from '@/usecases/fetch-rankings'

type YearlyRankingPageProps = {
  title: string
  year: number
  prev?: {
    label: string
    path: string
    disabled?: boolean
  }
  next?: {
    label: string
    path: string
    disabled?: boolean
  }
}

const YEARLY_RANKING_LIMIT = 1000

export function YearlyRankingPage({ title, year, prev, next }: YearlyRankingPageProps) {
  console.debug('[YearlyRankingPage] Component mounted', { title, year })

  const entriesPerPage = config.pagination.entriesPerPage
  const [displayedCount, setDisplayedCount] = useState(entriesPerPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, error } = useQuery(
    rankingsQueryOptions.yearly({ year, limit: YEARLY_RANKING_LIMIT }),
  )

  const allEntries = data?.entries ?? []
  const displayedEntries = allEntries.slice(0, displayedCount)
  const hasMore = displayedCount < allEntries.length

  const handleEntryClick = (entry: Entry | RankingEntry) => {
    recordEntryClick({
      entryId: entry.id,
      entryUrl: entry.url,
      referrer: window.location.href,
      userAgent: navigator.userAgent,
    })
  }

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true)
          setTimeout(() => {
            setDisplayedCount((prev) => prev + entriesPerPage)
            setIsLoadingMore(false)
          }, 500)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, entriesPerPage])

  // Reset displayed count when year changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on year change
  useEffect(() => {
    setDisplayedCount(entriesPerPage)
  }, [year, entriesPerPage])

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mt-8 text-center text-sm text-error-500">
            エラーが発生しました: {error.message}
          </div>
        </div>
        <Sidebar />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="ml-auto">
              <Navigation prev={prev} next={next} />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <SkeletonList count={5} />}

        {/* Entry Cards */}
        {!isLoading && (
          <div className="space-y-4">
            {displayedEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onTitleClick={handleEntryClick} />
            ))}
          </div>
        )}

        {/* Load more trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="mt-8">
            {isLoadingMore && <SkeletonList count={3} />}
          </div>
        )}

        {/* Entry Count */}
        {!isLoading && !hasMore && allEntries.length > 0 && (
          <EntryCount
            count={data?.total ?? allEntries.length}
            className="mt-8 text-center"
          />
        )}

        {/* No results */}
        {!isLoading && allEntries.length === 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            該当するエントリーがありません
          </div>
        )}
      </div>

      <Sidebar />

      <ScrollToTopButton />
    </div>
  )
}
