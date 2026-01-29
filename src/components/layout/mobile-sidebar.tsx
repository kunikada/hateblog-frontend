import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EntryDate } from '@/lib/entry-date'
import { getCachedFaviconUrl } from '@/lib/favicon-cache'
import { type SidebarEntry, type SidebarTag, sidebarQueryOptions } from '@/usecases/fetch-sidebar'

type MobileSidebarProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SidebarEntrySkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="h-4 w-4 bg-muted rounded-sm shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SidebarTagsSkeleton() {
  return (
    <div className="animate-pulse flex flex-wrap gap-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-7 bg-muted rounded-full w-16" />
      ))}
    </div>
  )
}

function EntryFavicon({ src }: { src: string }) {
  const [faviconUrl, setFaviconUrl] = useState(src)
  const revokeRef = useRef<null | (() => void)>(null)

  useEffect(() => {
    let isActive = true

    const loadFavicon = async () => {
      revokeRef.current?.()
      revokeRef.current = null
      setFaviconUrl(src)

      const result = await getCachedFaviconUrl(src)
      if (!isActive) {
        result.revoke?.()
        return
      }

      setFaviconUrl(result.url)
      revokeRef.current = result.revoke ?? null
    }

    void loadFavicon()

    return () => {
      isActive = false
      revokeRef.current?.()
      revokeRef.current = null
    }
  }, [src])

  return faviconUrl ? (
    <img
      src={faviconUrl}
      alt=""
      className="h-4 w-4 rounded-sm shrink-0 translate-y-0.5"
      loading="lazy"
    />
  ) : (
    <div className="h-4 w-4 rounded-sm bg-muted shrink-0 translate-y-0.5" />
  )
}

function MoreLink({
  to,
  params,
  onClick,
}: {
  to: string
  params?: Record<string, string>
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      params={params}
      className="block mt-4 text-sm text-hatebu-500 hover:underline text-center"
      onClick={onClick}
    >
      もっと見る
    </Link>
  )
}

function EntryList({ entries, onLinkClick }: { entries: SidebarEntry[]; onLinkClick: () => void }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">エントリーがありません</p>
  }

  return (
    <ol className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id}>
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-hatebu-500 line-clamp-2 flex items-start gap-2"
            onClick={onLinkClick}
          >
            <EntryFavicon src={entry.favicon} />
            <span className="flex-1">{entry.title}</span>
          </a>
          <span className="text-xs font-medium text-hatebu-500 ml-6">
            {entry.bookmarkCount.toLocaleString()} users
          </span>
        </li>
      ))}
    </ol>
  )
}

function TagList({ tags, onLinkClick }: { tags: SidebarTag[]; onLinkClick: () => void }) {
  if (tags.length === 0) {
    return <p className="text-sm text-muted-foreground">タグがありません</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 10).map((tag) => (
        <Link
          key={tag.id}
          to="/tags/$tag"
          params={{ tag: tag.name }}
          className="px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-hatebu-500 hover:text-white transition-colors"
          onClick={onLinkClick}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold mb-4">{children}</h3>
}

function NewEntriesSection({ onLinkClick }: { onLinkClick: () => void }) {
  const today = EntryDate.today().toYYYYMMDD()
  const { data, isLoading } = useQuery(sidebarQueryOptions.newEntries(today))

  return (
    <div className="pb-6 border-b">
      <SectionTitle>新着エントリー</SectionTitle>
      {isLoading && <SidebarEntrySkeleton />}
      {data && (
        <>
          <EntryList entries={data.entries} onLinkClick={onLinkClick} />
          {data.entries.length > 0 && (
            <MoreLink to="/entries/$date/new" params={{ date: today }} onClick={onLinkClick} />
          )}
        </>
      )}
    </div>
  )
}

function TrendingTagsSection({ onLinkClick }: { onLinkClick: () => void }) {
  const { data, isLoading } = useQuery(sidebarQueryOptions.trendingTags())

  return (
    <div className="pb-6 border-b">
      <SectionTitle>人気のタグ</SectionTitle>
      {isLoading && <SidebarTagsSkeleton />}
      {data && <TagList tags={data.tags} onLinkClick={onLinkClick} />}
    </div>
  )
}

function YearAgoEntriesSection({ onLinkClick }: { onLinkClick: () => void }) {
  const yearAgoDate = EntryDate.today().subtractYears(1).toYYYYMMDD()
  const { data, isLoading } = useQuery(sidebarQueryOptions.yearAgoEntries())

  return (
    <div className="pb-6 border-b">
      <SectionTitle>1年前の人気エントリー</SectionTitle>
      {isLoading && <SidebarEntrySkeleton />}
      {data && (
        <>
          <EntryList entries={data.entries} onLinkClick={onLinkClick} />
          {data.entries.length > 0 && (
            <MoreLink
              to="/entries/$date/hot"
              params={{ date: yearAgoDate }}
              onClick={onLinkClick}
            />
          )}
        </>
      )}
    </div>
  )
}

function ClickedTagsSection({ onLinkClick }: { onLinkClick: () => void }) {
  const { data, isLoading } = useQuery(sidebarQueryOptions.clickedTags())

  return (
    <div>
      <SectionTitle>注目のタグ</SectionTitle>
      {isLoading && <SidebarTagsSkeleton />}
      {data && <TagList tags={data.tags} onLinkClick={onLinkClick} />}
    </div>
  )
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const handleLinkClick = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-70 sm:w-80 overflow-y-auto">
        <SheetHeader className="sr-only">
          <SheetTitle>サイドバー</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-2">
          <NewEntriesSection onLinkClick={handleLinkClick} />
          <TrendingTagsSection onLinkClick={handleLinkClick} />
          <YearAgoEntriesSection onLinkClick={handleLinkClick} />
          <ClickedTagsSection onLinkClick={handleLinkClick} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
