import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ScrollToTopButton } from '@/components/layout/scroll-to-top-button'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { EntryCard } from '@/components/ui/entry-card'
import { EntryCount } from '@/components/ui/entry-count'
import { SkeletonList } from '@/components/ui/skeleton-list'
import { config } from '@/lib/config'
import { EntryDate } from '@/lib/entry-date'
import type { Entry } from '@/repositories/entries'
import {
  clearViewHistory,
  getViewHistory,
  recordEntryClick,
  removeViewHistoryItem,
  type ViewHistoryItem,
} from '@/usecases/entry-click'

type DateGroup = {
  date: string
  label: string
  entries: ViewHistoryItem[]
}

function groupByDate(entries: ViewHistoryItem[]): DateGroup[] {
  const groups = new Map<string, ViewHistoryItem[]>()

  for (const entry of entries) {
    const dateKey = EntryDate.fromTimestamp(entry.viewedAt).toYYYY_MM_DD()
    const existing = groups.get(dateKey)
    if (existing) {
      existing.push(entry)
    } else {
      groups.set(dateKey, [entry])
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, items]) => ({
      date: dateKey,
      label: format(EntryDate.fromYYYY_MM_DD(dateKey).toDate(), 'yyyy年M月d日（E）', {
        locale: ja,
      }),
      entries: items,
    }))
}

export function HistoryPage() {
  const entriesPerPage = config.pagination.entriesPerPage
  const [historyItems, setHistoryItems] = useState<ViewHistoryItem[]>(() => getViewHistory())
  const [displayedCount, setDisplayedCount] = useState(entriesPerPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const allItems = historyItems
  const displayedItems = allItems.slice(0, displayedCount)
  const hasMore = displayedCount < allItems.length
  const totalEntries = allItems.length

  const dateGroups = useMemo(() => groupByDate(displayedItems), [displayedItems])

  const handleEntryClick = (entry: Entry) => {
    recordEntryClick({
      entry,
      referrer: window.location.href,
      userAgent: navigator.userAgent,
    })
  }

  const handleDelete = (entry: Entry) => {
    const updated = removeViewHistoryItem(entry.url)
    setHistoryItems(updated)
  }

  const handleClearAll = () => {
    clearViewHistory()
    setHistoryItems([])
  }

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true)
          setTimeout(() => {
            setDisplayedCount((prev) => prev + entriesPerPage)
            setIsLoadingMore(false)
          }, 500)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, entriesPerPage])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Column */}
      <div className="flex-1">
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold">閲覧履歴</h2>
            {totalEntries > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleClearAll}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                すべて削除する
              </Button>
            )}
          </div>
        </div>

        {/* Entry Count */}
        {totalEntries > 0 && (
          <EntryCount count={totalEntries} suffix="件のエントリー" className="mb-4" />
        )}

        {/* Entry List */}
        {totalEntries === 0 ? (
          <div className="text-center py-12 text-muted-foreground">閲覧履歴はありません</div>
        ) : (
          <>
            {dateGroups.map((group) => (
              <div key={group.date} className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{group.label}</h3>
                <div className="space-y-4">
                  {group.entries.map((entry) => (
                    <EntryCard
                      key={`${entry.id}-${entry.viewedAt}`}
                      entry={entry}
                      onTitleClick={handleEntryClick}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Load more trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="mt-8">
                {isLoadingMore && <SkeletonList count={3} />}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  )
}
