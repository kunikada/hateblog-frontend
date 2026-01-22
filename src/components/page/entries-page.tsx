import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useEffect, useRef, useState } from 'react'
import { type Entry, EntryCard } from '@/components/ui/entry-card'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { FilterBar } from '@/components/layout/filter-bar'
import { Navigation } from '@/components/layout/navigation'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { filterEntriesByBookmarkCount } from '@/mocks/entries'

interface EntriesPageProps {
  date: string
  title: string
  routeType: 'hot' | 'new'
  entries: Entry[]
}

export function EntriesPage({ date, title, routeType, entries }: EntriesPageProps) {
  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>(
    'filter-threshold',
    5,
  )
  const [displayedCount, setDisplayedCount] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreStep = 10

  // Parse and validate date (support both YYYY-MM-DD and YYYYMMDD formats)
  const normalizedDate =
    date.length === 8 && /^\d{8}$/.test(date)
      ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
      : date
  const parsedDate = new Date(normalizedDate)
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date format: ${date}`)
  }

  // Calculate previous and next dates
  const previousDay = new Date(parsedDate)
  previousDay.setDate(previousDay.getDate() - 1)

  const nextDay = new Date(parsedDate)
  nextDay.setDate(nextDay.getDate() + 1)

  const isToday = format(parsedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  const formatDateForUrl = (date: Date) => format(date, 'yyyy-MM-dd')

  const getRoutePath = (dateStr: string) => {
    if (routeType === 'hot') return `/entries/${dateStr}/hot`
    if (routeType === 'new') return `/entries/${dateStr}/new`
    return `/entries/${dateStr}/hot`
  }

  // Filter entries
  const filteredEntries = filterEntriesByBookmarkCount(entries, selectedThreshold)
  const displayedEntries = filteredEntries.slice(0, displayedCount)
  const hasMore = displayedCount < filteredEntries.length

  const handleThresholdChange = (threshold: number | null) => {
    setSelectedThreshold(threshold)
    setDisplayedCount(10)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true)
          setTimeout(() => {
            setDisplayedCount((prev) => prev + loadMoreStep)
            setIsLoading(false)
          }, 500)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Column */}
      <div className="flex-1">
        {/* Page Title and Date Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <h2 className="text-2xl font-bold">
              {format(parsedDate, 'yyyy年MM月dd日', { locale: ja })}の{title}
            </h2>
            <div className="ml-auto">
              <Navigation
                prev={{
                  label: format(previousDay, 'yyyy年MM月dd日', { locale: ja }),
                  path: getRoutePath(formatDateForUrl(previousDay)),
                }}
                next={{
                  label: format(nextDay, 'yyyy年MM月dd日', { locale: ja }),
                  path: getRoutePath(formatDateForUrl(nextDay)),
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
          {filteredEntries.length}件のエントリー
        </div>

        {/* Entry Cards */}
        <div className="space-y-4">
          {displayedEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>

        {/* Load more trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="mt-8">
            {isLoading && <SkeletonList count={3} />}
          </div>
        )}

        {/* End of list */}
        {!hasMore && filteredEntries.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            すべてのエントリーを表示しました
          </div>
        )}

        {/* No results */}
        {filteredEntries.length === 0 && (
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
