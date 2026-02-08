import { Navigation } from '@/components/layout/navigation'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { EntryCard } from '@/components/ui/entry-card'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { useApiInfiniteScroll } from '@/hooks/use-api-infinite-scroll'
import { rankingsRepository } from '@/infra/repositories/rankings'
import { config } from '@/lib/config'
import { convertApiEntry } from '@/lib/entry-mapper'
import type { Entry } from '@/repositories/entries'
import { recordEntryClick } from '@/usecases/entry-click'
import { type RankingEntry, rankingsQueryOptions } from '@/usecases/fetch-rankings'

type YearlyRankingPageProps = {
  title: string
  year: number
  prev?: {
    label: string
    path: string
    disabled?: boolean
  }
  next?: {
    label: string
    path: string
    disabled?: boolean
  }
}

const YEARLY_RANKING_LIMIT = 100

export function YearlyRankingPage({ title, year, prev, next }: YearlyRankingPageProps) {
  console.debug('[YearlyRankingPage] Component mounted', { title, year })

  const { displayedEntries, isLoading, isLoadingMore, hasMore, error, loadMoreRef } =
    useApiInfiniteScroll({
      queryKey: rankingsQueryOptions.keys.yearly({ year, limit: YEARLY_RANKING_LIMIT }),
      queryFn: async ({ pageParam = 0 }) => {
        const result = await rankingsRepository.getYearlyRanking({
          year,
          limit: YEARLY_RANKING_LIMIT,
          offset: pageParam,
        })
        return {
          entries: result.entries.map((apiEntry) => ({
            ...convertApiEntry(apiEntry.entry),
            rank: apiEntry.rank,
          })),
          total: result.total,
        }
      },
      perPage: config.pagination.entriesPerPage,
      apiLimit: YEARLY_RANKING_LIMIT,
      resetDeps: [year],
      staleTime: rankingsQueryOptions.staleTime,
    })

  const handleEntryClick = (entry: Entry | RankingEntry) => {
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
      <div className="flex-1">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="ml-auto">
              <Navigation prev={prev} next={next} />
            </div>
          </div>
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
        {!isLoading && displayedEntries.length === 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            該当するエントリーがありません
          </div>
        )}
      </div>

      <Sidebar />

      <ScrollToTopButton />
    </div>
  )
}
