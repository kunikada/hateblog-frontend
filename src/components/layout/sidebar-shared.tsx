import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { getCachedFaviconUrl } from '@/lib/favicon-cache'
import type { SidebarEntry, SidebarTag } from '@/usecases/fetch-sidebar'

export function SidebarEntrySkeleton() {
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

export function SidebarTagsSkeleton() {
  return (
    <div className="animate-pulse flex flex-wrap gap-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-7 bg-muted rounded-full w-16" />
      ))}
    </div>
  )
}

export function EntryFavicon({ src }: { src: string }) {
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

export function MoreLink({
  to,
  params,
  onClick,
}: {
  to: string
  params?: Record<string, string>
  onClick?: () => void
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

export function EntryList({
  entries,
  onLinkClick,
}: {
  entries: SidebarEntry[]
  onLinkClick?: () => void
}) {
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

export function TagList({ tags, onLinkClick }: { tags: SidebarTag[]; onLinkClick?: () => void }) {
  if (tags.length === 0) {
    return <p className="text-sm text-muted-foreground">タグがありません</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 20).map((tag) => (
        <Link
          key={tag.id}
          to="/tags/$tag"
          params={{ tag: tag.name }}
          className="px-3 py-1.5 bg-muted border border-border rounded-full text-sm hover:bg-hatebu-500 hover:text-white hover:border-transparent transition-colors"
          onClick={onLinkClick}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  )
}
