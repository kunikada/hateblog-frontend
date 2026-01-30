import { useQuery } from '@tanstack/react-query'
import { FilterBar } from '@/components/layout/filter-bar'
import { Navigation } from '@/components/layout/navigation'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { EntryCard } from '@/components/ui/entry-card'
import { EntryCount } from '@/components/ui/entry-count'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
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

  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>('minUsers:v1', 5)

  const entryDate = EntryDate.fromUrlParam(date)
  const previousDay = entryDate.previousDay()
  const nextDay = entryDate.nextDay()

  // Fetch data from API
  const queryOptions = routeType === 'new' ? entriesQueryOptions.new : entriesQueryOptions.hot
  const queryParams = {
    date: entryDate.toYYYYMMDD(),
    minUsers: 5,
  }
  console.debug('[EntriesPage] Query params', queryParams)

  const { data, isLoading, error } = useQuery(queryOptions(queryParams))

  console.debug('[EntriesPage] Query state', { isLoading, hasData: !!data, error })

  const getRoutePath = (entryDate: EntryDate) => {
    return `/entries/${entryDate.toYYYYMMDD()}/${routeType}`
  }

  const allEntries = (data?.entries ?? []).filter(
    (entry) => selectedThreshold === null || entry.bookmarkCount >= selectedThreshold,
  )

  const { displayedCount, isLoadingMore, loadMoreRef } = useInfiniteScroll({
    totalCount: allEntries.length,
    perPage: config.pagination.entriesPerPage,
    resetDeps: [date, selectedThreshold],
  })

  const displayedEntries = allEntries.slice(0, displayedCount)
  const hasMore = displayedCount < allEntries.length

  const handleThresholdChange = (threshold: number | null) => {
    setSelectedThreshold(threshold)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEntryClick = (entry: Entry) => {
    recordEntryClick({
      entry,
      referrer: window.location.href,
      userAgent: navigator.userAgent,
    })
  }

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
        {!isLoading && allEntries.length > 0 && (
          <EntryCount count={allEntries.length} className="mb-4" />
        )}

        {/* Loading State */}
        {isLoading && <SkeletonList count={5} />}

        {/* Entry Cards */}
        {!isLoading && (
          <ul className="space-y-4">
            {displayedEntries.map((entry) => (
              <li key={entry.id}>
                <EntryCard entry={entry} onTitleClick={handleEntryClick} />
              </li>
            ))}
          </ul>
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
