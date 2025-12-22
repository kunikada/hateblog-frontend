import { useCallback, useEffect, useRef, useState } from 'react'
import type { Entry } from '@/components/common/entry-card'
import { EntryCard } from '@/components/common/entry-card'
import { FilterBar } from '@/components/layout/filter-bar'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { filterEntriesByBookmarkCount } from '@/mocks/entries'

type TagPageProps = {
  tag: string
  entries: Entry[]
}

export function TagPage({ tag, entries }: TagPageProps) {
  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>(
    'filter-threshold',
    5,
  )
  const [displayedEntries, setDisplayedEntries] = useState<Entry[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const filteredEntries = filterEntriesByBookmarkCount(entries, selectedThreshold)
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

  // Reset entries when filter changes
  useEffect(() => {
    setDisplayedEntries(filteredEntries.slice(0, 10))
    setHasMore(filteredEntries.length > 10)
  }, [filteredEntries])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Column */}
      <div className="flex-1">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">タグ: {tag}</h2>
        </div>

        {/* Filter Bar */}
        <div className="mb-4">
          <FilterBar
            selectedThreshold={selectedThreshold}
            onThresholdChange={setSelectedThreshold}
          />
        </div>

        {/* Entry Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {totalEntries.toLocaleString()}件のエントリー
        </div>

        {/* Entry List */}
        <div className="space-y-4">
          {displayedEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              該当するエントリーがありません
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

              {/* End of List */}
              {!hasMore && displayedEntries.length > 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  すべてのエントリーを表示しました
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
