import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FilterBar } from '@/components/layout/filter-bar'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { EntryCard } from '@/components/ui/entry-card'
import { EntrySortToggle } from '@/components/ui/entry-sort-toggle'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { config } from '@/lib/config'
import type { Entry } from '@/repositories/entries'
import { recordEntryClick } from '@/usecases/entry-click'
import { tagEntriesQueryOptions } from '@/usecases/fetch-tag-entries'

type TagPageProps = {
  tag: string
}

type SortType = 'new' | 'hot'

export function TagPage({ tag }: TagPageProps) {
  console.debug('[TagPage] Component mounted', { tag })

  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>('minUsers:v1', 5)
  const [sortType, setSortType] = useState<SortType>('new')

  const queryParams = {
    tag,
    minUsers: 5,
    sort: sortType,
  }
  console.debug('[TagPage] Query params', queryParams)

  const { data, isLoading, error } = useQuery(tagEntriesQueryOptions.entries(queryParams))

  console.debug('[TagPage] Query state', { isLoading, hasData: !!data, error })

  const allEntries = (data?.entries ?? []).filter(
    (entry) => selectedThreshold === null || entry.bookmarkCount >= selectedThreshold,
  )

  const { displayedCount, isLoadingMore, loadMoreRef } = useInfiniteScroll({
    totalCount: allEntries.length,
    perPage: config.pagination.entriesPerPage,
    resetDeps: [tag, selectedThreshold, sortType],
  })

  const displayedEntries = allEntries.slice(0, displayedCount)
  const hasMore = displayedCount < allEntries.length

  const handleThresholdChange = (threshold: number | null) => {
    setSelectedThreshold(threshold)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (sort: SortType) => {
    setSortType(sort)
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
        {/* Page Title and Sort Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold">{tag} のタグ</h2>
            <EntrySortToggle
              value={sortType}
              onChange={handleSortChange}
              options={[
                { value: 'hot', label: '人気順' },
                { value: 'new', label: '新着順' },
              ]}
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-4">
          <FilterBar
            selectedThreshold={selectedThreshold}
            onThresholdChange={handleThresholdChange}
          />
        </div>

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
