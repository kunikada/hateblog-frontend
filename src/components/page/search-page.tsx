import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Entry } from '@/components/common/entry-card'
import { EntryCard } from '@/components/common/entry-card'
import { FilterBar } from '@/components/layout/filter-bar'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { filterEntriesByBookmarkCount } from '@/mocks/entries'

type SearchPageProps = {
  query?: string
  entries: Entry[]
}

// Highlight matching keywords in text
function highlightKeywords(text: string, keywords: string[]): ReactElement {
  if (keywords.length === 0) {
    return <>{text}</>
  }

  const pattern = new RegExp(
    `(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi',
  )
  const parts = text.split(pattern)

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = keywords.some((keyword) =>
          part.toLowerCase().includes(keyword.toLowerCase()),
        )
        return isMatch ? (
          <mark
            key={
              // biome-ignore lint/suspicious/noArrayIndexKey: text part key
              index
            }
            className="bg-warning-200 dark:bg-warning-700 font-medium"
          >
            {part}
          </mark>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: text part key
          <span key={index}>{part}</span>
        )
      })}
    </>
  )
}

export function SearchPage({ query, entries }: SearchPageProps) {
  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>(
    'filter-threshold',
    5,
  )
  const [displayedEntries, setDisplayedEntries] = useState<Entry[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const keywords = query ? query.trim().split(/\s+/) : []
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
          <h2 className="text-2xl font-bold">検索: {query || ''}</h2>
        </div>

        {/* Filter Bar */}
        {query && (
          <div className="mb-4">
            <FilterBar
              selectedThreshold={selectedThreshold}
              onThresholdChange={setSelectedThreshold}
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
                  <EntryCard
                    entry={{
                      ...entry,
                      title: highlightKeywords(entry.title, keywords) as unknown as string,
                      excerpt: entry.excerpt
                        ? (highlightKeywords(entry.excerpt, keywords) as unknown as string)
                        : entry.excerpt,
                    }}
                  />
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
