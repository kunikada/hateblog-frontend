import { Calendar, ExternalLink, Share2, Link as LinkIcon, Check, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EntryDate } from '@/lib/entry-date'
import { getCachedFaviconUrl } from '@/lib/favicon-cache'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Entry } from '@/repositories/entries'

const TAG_MIN_SCORE = 27
const TAG_MAX_COUNT = 5

function isValidTagLength(name: string): boolean {
  const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(name)
  return isAlphanumeric ? name.length >= 3 : name.length >= 2
}

function getHatenaBookmarkUrl(url: string): string {
  const parsed = new URL(url)
  const pathWithQuery = parsed.pathname + parsed.search + parsed.hash
  if (parsed.protocol === 'https:') {
    return `https://b.hatena.ne.jp/entry/s/${parsed.host}${pathWithQuery}`
  }
  return `https://b.hatena.ne.jp/entry/${parsed.host}${pathWithQuery}`
}

type EntryCardProps = {
  entry: Entry
  onTitleClick?: (entry: Entry) => void
  onDelete?: (entry: Entry) => void
}

export function EntryCard({ entry, onTitleClick, onDelete }: EntryCardProps) {
  const formattedDate = EntryDate.fromTimestamp(entry.timestamp).toSlashSeparated()

  const [copied, setCopied] = useState(false)
  const [faviconUrl, setFaviconUrl] = useState(entry.favicon)
  const [isInView, setIsInView] = useState(false)
  const cardRef = useRef<HTMLElement | null>(null)
  const faviconRevokeRef = useRef<null | (() => void)>(null)

  useEffect(() => {
    const element = cardRef.current
    if (!element) {
      return
    }

    if (!('IntersectionObserver' in window)) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entryObserver]) => {
        if (entryObserver?.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView) {
      return
    }

    let isActive = true

    const loadFavicon = async () => {
      faviconRevokeRef.current?.()
      faviconRevokeRef.current = null
      setFaviconUrl(entry.favicon)

      const result = await getCachedFaviconUrl(entry.favicon)
      if (!isActive) {
        result.revoke?.()
        return
      }

      setFaviconUrl(result.url)
      faviconRevokeRef.current = result.revoke ?? null
    }

    void loadFavicon()

    return () => {
      isActive = false
      faviconRevokeRef.current?.()
      faviconRevokeRef.current = null
    }
  }, [entry.favicon, isInView])

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: entry.title, url: entry.url })
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(entry.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareActions = useMemo(
    () => [
      {
        name: 'Twitter',
        url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(entry.url)}&text=${encodeURIComponent(entry.title)}`,
        icon: (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ),
      },
      {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(entry.url)}`,
        icon: (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ),
      },
      {
        name: 'Instagram',
        url: `https://www.instagram.com/`,
        icon: (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        ),
      },
    ],
    [entry.url, entry.title],
  )

  return (
    <article
      ref={cardRef}
      className="group relative rounded-lg border bg-card p-3 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col gap-2">
        {/* Title with Favicon */}
        <h3 className="font-semibold text-base leading-tight">
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-hatebu-500 transition-colors flex items-start gap-2"
            onClick={() => onTitleClick?.(entry)}
          >
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                className="h-4 w-4 rounded-sm shrink-0 translate-y-0.5"
                loading="lazy"
              />
            ) : (
              <div className="h-4 w-4 rounded-sm bg-muted shrink-0 translate-y-0.5" />
            )}
            <span className="flex-1">{entry.title}</span>
            <ExternalLink className="h-4 w-4 shrink-0 translate-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </h3>

        {/* Excerpt */}
        {entry.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{entry.excerpt}</p>
        )}

        {/* Tags */}
        {(() => {
          const filteredTags = entry.tags
            .filter((tag) => tag.score >= TAG_MIN_SCORE && isValidTagLength(tag.name))
            .sort((a, b) => b.score - a.score)
            .slice(0, TAG_MAX_COUNT)
          return (
            filteredTags.length > 0 && (
              <div className="flex flex-wrap gap-0.5">
                {filteredTags.map((tag) => (
                  <Link key={tag.name} to="/tags/$tag" params={{ tag: tag.name }}>
                    <Badge
                      variant="secondary"
                      className="text-xs transition-colors hover:bg-hatebu-500 hover:text-white"
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )
          )
        })()}

        {/* Footer: Bookmark Count, Domain, Timestamp, Share */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <a
              href={getHatenaBookmarkUrl(entry.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-hatebu-500 hover:underline"
            >
              {entry.bookmarkCount.toLocaleString()} users
            </a>
            <Link to="/search" search={{ q: entry.domain }} className="font-medium hover:underline">
              {entry.domain}
            </Link>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-1 -my-1">
            {/* Share - PC: hover popover, Mobile: native share */}
            <div className="relative group/share">
              <Button
                variant="ghost"
                size="sm"
                className="md:cursor-default"
                onClick={handleNativeShare}
              >
                <Share2 className="h-4 w-4" />
                <span className="sr-only">共有</span>
              </Button>
              {/* PC hover popover */}
              <div className="hidden md:block absolute right-0 bottom-full mb-1 opacity-0 invisible group-hover/share:opacity-100 group-hover/share:visible transition-all z-10">
                <div className="bg-popover border rounded-md shadow-md p-1 flex flex-col gap-0.5 min-w-32">
                  {shareActions.map((action) => (
                    <a
                      key={action.name}
                      href={action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm hover:bg-accent rounded-sm transition-colors flex items-center gap-2"
                    >
                      {action.icon}
                      {action.name}
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 text-sm hover:bg-accent rounded-sm transition-colors text-left flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        コピーしました
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-3 w-3" />
                        リンクをコピー
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* Delete */}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => onDelete(entry)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">削除</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
