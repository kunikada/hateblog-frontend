import { useEffect, useRef, useState } from 'react'
import { EntryCard } from '@/components/ui/entry-card'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { Navigation } from '@/components/layout/navigation'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import type { RankingEntry } from '@/mocks/rankings'

type RankingPageProps = {
  title: string
  entries: RankingEntry[]
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

export function RankingPage({ title, entries, prev, next }: RankingPageProps) {
  const [displayedCount, setDisplayedCount] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreStep = 10

  const displayedEntries = entries.slice(0, displayedCount)
  const hasMore = displayedCount < entries.length

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
      <div className="flex-1">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="ml-auto">
              <Navigation prev={prev} next={next} />
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">{entries.length}件のエントリー</div>

        <div className="space-y-4">
          {displayedEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>

        {hasMore && (
          <div ref={loadMoreRef} className="mt-8">
            {isLoading && <SkeletonList count={3} />}
          </div>
        )}

        {!hasMore && entries.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            すべてのエントリーを表示しました
          </div>
        )}

        {entries.length === 0 && (
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
