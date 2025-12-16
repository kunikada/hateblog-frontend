import { createFileRoute } from '@tanstack/react-router'
import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { EntryCard } from '@/components/entry/entry-card'
import { SkeletonList } from '@/components/entry/skeleton-list'
import { Button } from '@/components/ui/button'
import { filterEntriesByBookmarkCount, mockEntries } from '@/mocks/entries'

type SearchParams = {
  date?: string
}

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      date: typeof search.date === 'string' ? search.date : undefined,
    }
  },
})

function Index() {
  const [selectedThreshold, setSelectedThreshold] = useState<number | null>(null)
  const [displayedCount, setDisplayedCount] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const thresholds = [5, 10, 50, 100, 500, 1000]
  const loadMoreStep = 10

  // Filter entries
  const filteredEntries = filterEntriesByBookmarkCount(mockEntries, selectedThreshold)
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

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Column */}
      <div className="flex-1">
        {/* Page Title and Filter */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">本日の人気エントリー</h2>

          {/* Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">フィルター:</span>
            <Button
              variant={selectedThreshold === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleThresholdChange(null)}
            >
              全て
            </Button>
            {thresholds.map((threshold) => (
              <Button
                key={threshold}
                variant={selectedThreshold === threshold ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThresholdChange(threshold)}
              >
                {threshold}+ users
              </Button>
            ))}
          </div>
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
      <aside className="hidden lg:block w-80">
        {/* Popular Tags */}
        <div className="bg-card rounded-lg shadow-md p-5 mb-6">
          <h3 className="text-lg font-bold mb-4">人気のタグ</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'JavaScript',
              'Python',
              'React',
              'AI',
              '機械学習',
              '設計',
              'AWS',
              'Docker',
              'セキュリティ',
              'データベース',
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                className="px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-[#00a4de] hover:text-white transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Ranking */}
        <div className="bg-card rounded-lg shadow-md p-5">
          <h3 className="text-lg font-bold mb-4">週間ランキング</h3>
          <ol className="space-y-3">
            {[
              { rank: 1, title: 'GPT-5発表 - AIの新時代が始まる', color: 'bg-yellow-400' },
              {
                rank: 2,
                title: 'TypeScript 5.4の新機能完全ガイド',
                color: 'bg-gray-400',
              },
              {
                rank: 3,
                title: '初心者のためのDocker完全入門',
                color: 'bg-orange-400',
              },
              { rank: 4, title: 'パフォーマンス改善テクニック集', color: 'bg-gray-300' },
              { rank: 5, title: 'Reactのベストプラクティス2024', color: 'bg-gray-300' },
            ].map((item) => (
              <li key={item.rank} className="flex gap-3">
                <span
                  className={`shrink-0 w-6 h-6 ${item.color} ${item.rank <= 3 ? 'text-white' : 'text-foreground'} rounded-full flex items-center justify-center text-sm font-bold`}
                >
                  {item.rank}
                </span>
                <button
                  type="button"
                  className="text-sm hover:text-[#00a4de] line-clamp-2 text-left"
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="block mt-4 text-sm text-[#00a4de] hover:underline text-center w-full"
          >
            もっと見る →
          </button>
        </div>
      </aside>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-[#00a4de] hover:bg-[#0070b8]"
        >
          <ArrowUp className="h-6 w-6" />
          <span className="sr-only">トップに戻る</span>
        </Button>
      )}
    </div>
  )
}
