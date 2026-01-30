import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { FilterBar } from '@/components/layout/filter-bar'
import { Navigation } from '@/components/layout/navigation'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { EntryCount } from '@/components/ui/entry-count'
import { EntryCard } from '@/components/ui/entry-card'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { config } from '@/lib/config'
import { EntryDate } from '@/lib/entry-date'
import type { Entry } from '@/repositories/entries'
import { recordEntryClick } from '@/usecases/entry-click'
import { entriesQueryOptions } from '@/usecases/fetch-entries'

interface EntriesPageProps {
  date: string
  title: string
  routeType: 'hot' | 'new'
}

export function EntriesPage({ date, title, routeType }: EntriesPageProps) {
  console.debug('[EntriesPage] Component mounted', { date, title, routeType })

  const entriesPerPage = config.pagination.entriesPerPage

  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>(
    'minUsers',
    5,
  )
  const [displayedCount, setDisplayedCount] = useState(entriesPerPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const entryDate = EntryDate.fromUrlParam(date)
  const previousDay = entryDate.previousDay()
  const nextDay = entryDate.nextDay()

  // Fetch data from API
  const queryOptions = routeType === 'new' ? entriesQueryOptions.new : entriesQueryOptions.hot
  const queryParams = {
    date: entryDate.toYYYYMMDD(),
    minUsers: selectedThreshold ?? undefined,
  }
  console.debug('[EntriesPage] Query params', queryParams)

  const { data, isLoading, error } = useQuery(queryOptions(queryParams))

  console.debug('[EntriesPage] Query state', { isLoading, hasData: !!data, error })

  const getRoutePath = (entryDate: EntryDate) => {
    return `/entries/${entryDate.toYYYYMMDD()}/${routeType}`
  }

  const allEntries = data?.entries ?? []
  const displayedEntries = allEntries.slice(0, displayedCount)
  const hasMore = displayedCount < allEntries.length

  const handleThresholdChange = (threshold: number | null) => {
    setSelectedThreshold(threshold)
    setDisplayedCount(entriesPerPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEntryClick = (entry: Entry) => {
    recordEntryClick({
      entry,
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

  // Reset displayed count when date or threshold changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on date/threshold change
  useEffect(() => {
    setDisplayedCount(entriesPerPage)
  }, [date, selectedThreshold, entriesPerPage])

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
      {/* Main Column */}
      <div className="flex-1">
        {/* Page Title and Date Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <h2 className="text-2xl font-bold">
              {entryDate.toDisplayString()}の{title}
            </h2>
            <div className="ml-auto">
              <Navigation
                prev={{
                  label: previousDay.toDisplayString(),
                  path: getRoutePath(previousDay),
                }}
                next={{
                  label: nextDay.toDisplayString(),
                  path: getRoutePath(nextDay),
                  disabled: entryDate.isToday(),
                }}
              />
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            selectedThreshold={selectedThreshold}
            onThresholdChange={handleThresholdChange}
          />
        </div>

        {/* Entry Count */}
        {!isLoading && (data?.total ?? 0) > 0 && (
          <EntryCount count={data?.total ?? 0} className="mb-4" />
        )}

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

        {/* No results */}
        {!isLoading && allEntries.length === 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            該当するエントリーがありません
          </div>
        )}
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  )
}
