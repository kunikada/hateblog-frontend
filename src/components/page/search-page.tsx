import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FilterBar } from '@/components/layout/filter-bar'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { EntryCard } from '@/components/ui/entry-card'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { config } from '@/lib/config'
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
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
    }
    return sorted.sort((a, b) => b.bookmarkCount - a.bookmarkCount)
  }, [filteredEntries, sortType])
  const totalEntries = sortedEntries.length

  const handleEntryClick = (entry: Entry) => {
    recordEntryClick({
      entryId: entry.id,
      entryUrl: entry.url,
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
          <h2 className="text-2xl font-bold">
            {query ? `「${query}」の検索結果` : '検索結果'}
          </h2>
          {query && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={sortType === 'popular' ? 'default' : 'outline'}
                className={
                  sortType === 'popular'
                    ? 'bg-hatebu-500 text-white hover:bg-hatebu-600'
                    : 'text-gray-600 border-gray-300'
                }
                onClick={() => setSortType('popular')}
              >
                人気順
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sortType === 'new' ? 'default' : 'outline'}
                className={
                  sortType === 'new'
                    ? 'bg-hatebu-500 text-white hover:bg-hatebu-600'
                    : 'text-gray-600 border-gray-300'
                }
                onClick={() => setSortType('new')}
              >
                新着順
              </Button>
            </div>
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
        {query && (
          <div className="mb-4 text-sm text-muted-foreground">
            {totalEntries.toLocaleString()}件のエントリー
          </div>
        )}

        {/* Entry List */}
        <div className="space-y-4">
          {!query ? (
            <div className="text-center py-12 text-muted-foreground">
              検索キーワードを入力してください
            </div>
          ) : displayedEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              「{query}」に一致するエントリーが見つかりませんでした
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

              {/* End of List */}
              {!hasMore && displayedEntries.length > 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  すべての検索結果を表示しました
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
