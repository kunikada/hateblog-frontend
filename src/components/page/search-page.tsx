import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FilterBar } from '@/components/layout/filter-bar'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { EntryCount } from '@/components/ui/entry-count'
import { EntryCard } from '@/components/ui/entry-card'
import { EntrySortToggle } from '@/components/ui/entry-sort-toggle'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { config } from '@/lib/config'
import { EntryDate } from '@/lib/entry-date'
import { filterEntriesByBookmarkCount } from '@/mocks/entries'
import type { Entry } from '@/repositories/entries'
import { recordEntryClick } from '@/usecases/entry-click'

type SearchPageProps = {
  query?: string
  entries: Entry[]
}

export function SearchPage({ query, entries }: SearchPageProps) {
  const entriesPerPage = config.pagination.entriesPerPage
  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>(
    'minUsers',
    5,
  )
  const [sortType, setSortType] = useState<'popular' | 'new'>('popular')
  const [displayedEntries, setDisplayedEntries] = useState<Entry[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const filteredEntries = useMemo(
    () => filterEntriesByBookmarkCount(entries, selectedThreshold),
    [entries, selectedThreshold],
  )
  const sortedEntries = useMemo(() => {
    const sorted = [...filteredEntries]
    if (sortType === 'new') {
      return sorted.sort(
        (a, b) =>
          EntryDate.fromTimestamp(b.timestamp).toEpochMs() -
          EntryDate.fromTimestamp(a.timestamp).toEpochMs(),
      )
    }
    return sorted.sort((a, b) => b.bookmarkCount - a.bookmarkCount)
  }, [filteredEntries, sortType])
  const totalEntries = sortedEntries.length

  const handleEntryClick = (entry: Entry) => {
    recordEntryClick({
      entry,
      referrer: window.location.href,
      userAgent: navigator.userAgent,
    })
  }

  const handleThresholdChange = (threshold: number | null) => {
    setSelectedThreshold(threshold)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Load more entries
  const loadMore = useCallback(() => {
    if (isLoading) return

    setIsLoading(true)
    setTimeout(() => {
      const currentLength = displayedEntries.length
      const nextEntries = sortedEntries.slice(currentLength, currentLength + entriesPerPage)

      if (nextEntries.length === 0) {
        setHasMore(false)
      } else {
        setDisplayedEntries((prev) => [...prev, ...nextEntries])
      }
      setIsLoading(false)
    }, 500)
  }, [isLoading, displayedEntries.length, sortedEntries, entriesPerPage])

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

  // Reset entries when filter changes
  useEffect(() => {
    setDisplayedEntries(sortedEntries.slice(0, entriesPerPage))
    setHasMore(sortedEntries.length > entriesPerPage)
  }, [sortedEntries, entriesPerPage])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Column */}
      <div className="flex-1">
        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">{query} の検索結果</h2>
          {query && (
            <EntrySortToggle
              value={sortType}
              onChange={setSortType}
              options={[
                { value: 'popular', label: '人気順' },
                { value: 'new', label: '新着順' },
              ]}
            />
          )}
        </div>

        {/* Filter Bar */}
        {query && (
          <div className="mb-4">
            <FilterBar
              selectedThreshold={selectedThreshold}
              onThresholdChange={handleThresholdChange}
            />
          </div>
        )}

        {/* Entry Count */}
        {query && totalEntries > 0 && (
          <EntryCount count={totalEntries} className="mb-4" />
        )}

        {/* Entry List */}
        <div className="space-y-4">
          {!query ? (
            <div className="text-center py-12 text-muted-foreground">
              検索キーワードを入力してください
            </div>
          ) : displayedEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              該当するエントリーがありません
            </div>
          ) : (
            <>
              {displayedEntries.map((entry) => (
                <div key={entry.id}>
                  <EntryCard entry={entry} onTitleClick={handleEntryClick} />
                </div>
              ))}

              {/* Loading Skeleton */}
              {isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`skeleton-${
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton key
                        i
                      }`}
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
