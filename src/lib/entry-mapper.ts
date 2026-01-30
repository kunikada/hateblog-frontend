import { config } from '@/lib/config'
import type { ApiEntry, Entry } from '@/repositories/entries'

export function getFaviconUrl(entry: { favicon_url?: string; url: string }): string {
  const url = new URL(entry.url)
  return (
    entry.favicon_url || `${config.api.baseUrl}/favicons?domain=${encodeURIComponent(url.hostname)}`
  )
}

export function convertApiEntry(apiEntry: ApiEntry): Entry {
  const url = new URL(apiEntry.url)
  return {
    id: apiEntry.id,
    title: apiEntry.title,
    url: apiEntry.url,
    domain: url.hostname,
    favicon: getFaviconUrl(apiEntry),
    bookmarkCount: apiEntry.bookmark_count,
    timestamp: apiEntry.posted_at,
    tags: apiEntry.tags.map((t) => ({ name: t.tag_name, score: t.score })),
    excerpt: apiEntry.excerpt ?? undefined,
  }
}
