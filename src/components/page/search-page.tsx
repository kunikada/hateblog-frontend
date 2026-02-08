import { useState } from 'react'
import { FilterBar } from '@/components/layout/filter-bar'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { EntryCard } from '@/components/ui/entry-card'
import { EntrySortToggle } from '@/components/ui/entry-sort-toggle'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { useApiInfiniteScroll } from '@/hooks/use-api-infinite-scroll'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { searchRepository } from '@/infra/repositories/search'
import { config } from '@/lib/config'
import { convertApiEntry } from '@/lib/entry-mapper'
import type { Entry } from '@/repositories/entries'
import { recordEntryClick } from '@/usecases/entry-click'

type SearchPageProps = {
  query?: string
}

type SortType = 'popular' | 'new'

export function SearchPage({ query }: SearchPageProps) {
  console.debug('[SearchPage] Component mounted', { query })

  const [selectedThreshold, setSelectedThreshold] = useLocalStorage<number | null>('minUsers:v1', 5)
  const [sortType, setSortType] = useState<SortType>('popular')

  const { displayedEntries, isLoading, isLoadingMore, hasMore, error, loadMoreRef } =
    useApiInfiniteScroll<Entry>({
      queryKey: ['searchEntries', query, selectedThreshold ?? 5, sortType],
      queryFn: async ({ pageParam = 0 }) => {
        console.debug('[SearchPage] Fetching entries', {
          query,
          minUsers: selectedThreshold ?? 5,
          sort: sortType === 'new' ? 'new' : 'hot',
          limit: 100,
          offset: pageParam,
        })
        const result = await searchRepository.searchEntries({
          q: query ?? '',
          minUsers: selectedThreshold ?? 5,
          sort: sortType === 'new' ? 'new' : 'hot',
          limit: 100,
          offset: pageParam,
        })
        console.debug('[SearchPage] Fetched entries', {
          total: result.total,
          count: result.entries.length,
        })
        return {
          entries: result.entries.map(convertApiEntry),
          total: result.total,
        }
      },
      perPage: config.pagination.entriesPerPage,
      apiLimit: 100,
      resetDeps: [query, selectedThreshold, sortType],
      staleTime: 1000 * 60 * 5,
    })

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
        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">{query} の検索結果</h2>
          {query && (
            <EntrySortToggle
              value={sortType}
              onChange={handleSortChange}
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

        {/* Loading State */}
        {query && isLoading && <SkeletonList count={5} />}

        {/* Entry List */}
        {!isLoading && (
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
              <ul className="space-y-4">
                {displayedEntries.map((entry) => (
                  <li key={entry.id}>
                    <EntryCard entry={entry} onTitleClick={handleEntryClick} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Load more trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="mt-8">
            {isLoadingMore && <SkeletonList count={3} />}
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
