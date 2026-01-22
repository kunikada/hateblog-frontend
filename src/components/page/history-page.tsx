import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Entry } from '@/components/ui/entry-card'
import { EntryCard } from '@/components/ui/entry-card'
import { FilterBar } from '@/components/layout/filter-bar'
import { Navigation } from '@/components/layout/navigation'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { filterEntriesByBookmarkCount } from '@/mocks/entries'

export type HistoryEntry = Entry & {
  viewedAt: string
}

type HistoryPageProps = {
  date: string
  entries: HistoryEntry[]
}

export function HistoryPage({ date, entries }: HistoryPageProps) {
  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>(
    'filter-threshold',
    5,
  )

  // Parse the date parameter
  const parsedDate = new Date(date)

  // Calculate previous and next dates
  const previousDay = new Date(parsedDate)
  previousDay.setDate(previousDay.getDate() - 1)

  const nextDay = new Date(parsedDate)
  nextDay.setDate(nextDay.getDate() + 1)

  const isToday = format(parsedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  const formatDateForUrl = (date: Date) => format(date, 'yyyy-MM-dd')

  // Filter entries for the selected date
  const filterByDate = (entries: HistoryEntry[], targetDate: Date): HistoryEntry[] => {
    const targetDateStr = format(targetDate, 'yyyy-MM-dd')
    return entries.filter((entry) => {
      const entryDateStr = format(new Date(entry.viewedAt), 'yyyy-MM-dd')
      return entryDateStr === targetDateStr
    })
  }

  const dateFilteredEntries = filterByDate(entries, parsedDate)
  const filteredEntries = filterEntriesByBookmarkCount(dateFilteredEntries, selectedThreshold)
  const [displayedEntries, setDisplayedEntries] = useState<HistoryEntry[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const totalEntries = filteredEntries.length

  // Load more entries
  const loadMore = useCallback(() => {
    if (isLoading) return

    setIsLoading(true)
    setTimeout(() => {
      const currentLength = displayedEntries.length
      const nextEntries = filteredEntries.slice(currentLength, currentLength + 10)

      if (nextEntries.length === 0) {
        setHasMore(false)
      } else {
        setDisplayedEntries((prev) => [...prev, ...nextEntries])
      }
      setIsLoading(false)
    }, 500)
  }, [isLoading, displayedEntries.length, filteredEntries])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasMore, isLoading, loadMore])

  // Reset entries when date or filteredEntries changes
  useEffect(() => {
    setDisplayedEntries(filteredEntries.slice(0, 10))
    setHasMore(filteredEntries.length > 10)
  }, [filteredEntries])

  const handleThresholdChange = (threshold: number | null) => {
    setSelectedThreshold(threshold)
    setDisplayedEntries(filteredEntries.slice(0, 10))
    setHasMore(filteredEntries.length > 10)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Column */}
      <div className="flex-1">
        {/* Page Title and Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <h2 className="text-2xl font-bold">
              {format(parsedDate, 'yyyy年MM月dd日', { locale: ja })}の閲覧履歴
            </h2>
            <div className="ml-auto">
              <Navigation
                prev={{
                  label: format(previousDay, 'yyyy年MM月dd日', { locale: ja }),
                  path: `/history/${formatDateForUrl(previousDay)}`,
                }}
                next={{
                  label: format(nextDay, 'yyyy年MM月dd日', { locale: ja }),
                  path: `/history/${formatDateForUrl(nextDay)}`,
                  disabled: isToday,
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
        <div className="mb-4 text-sm text-muted-foreground">
          {totalEntries.toLocaleString()}件の履歴
        </div>

        {/* Entry List */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              この日の閲覧履歴はありません
            </div>
          ) : (
            <>
              {displayedEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}

              {/* Loading Skeleton */}
              {isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="bg-card rounded-lg border p-4 animate-pulse"
                    >
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                      <div className="h-4 bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  ))}
                </div>
              )}

              {/* Infinite Scroll Trigger */}
              {hasMore && <div ref={loadMoreRef} className="h-10" />}

              {/* End of List */}
              {!hasMore && displayedEntries.length > 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  すべての履歴を表示しました
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  )
}
