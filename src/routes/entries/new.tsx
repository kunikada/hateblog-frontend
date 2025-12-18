import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { EntryCard } from '@/components/entry/entry-card'
import { FilterBar } from '@/components/entry/filter-bar'
import { SkeletonList } from '@/components/entry/skeleton-list'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { filterEntriesByBookmarkCount, mockEntries } from '@/mocks/entries'

export const Route = createFileRoute('/entries/new')({
  component: NewEntries,
})

function NewEntries() {
  const [selectedThreshold, setSelectedThreshold] = useState<number | null>(null)
  const [displayedCount, setDisplayedCount] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreStep = 10

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...mockEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  // Filter entries
  const filteredEntries = filterEntriesByBookmarkCount(sortedEntries, selectedThreshold)
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
        {/* Page Title and Filter */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">本日の新着エントリー</h2>
          <FilterBar
            selectedThreshold={selectedThreshold}
            onThresholdChange={handleThresholdChange}
          />
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
