import { entriesRepository } from '@/infra/repositories/entries'
import { config } from '@/lib/config'
import type { ApiEntry, Entry, EntryListResponse } from '@/repositories/entries'

// Re-export Entry for convenience
export type { Entry }

export type FetchEntriesParams = {
  date: string
  minUsers?: number
  limit?: number
  offset?: number
}

export type EntriesResult = {
  entries: Entry[]
  total: number
}

export type EntryType = 'new' | 'hot'

function convertApiEntry(apiEntry: ApiEntry): Entry {
  const url = new URL(apiEntry.url)
  const faviconUrl =
    apiEntry.favicon_url ||
    `${config.api.baseUrl}/favicons?domain=${encodeURIComponent(url.hostname)}`
  return {
    id: apiEntry.id,
    title: apiEntry.title,
    url: apiEntry.url,
    domain: url.hostname,
    favicon: faviconUrl,
    bookmarkCount: apiEntry.bookmark_count,
    timestamp: apiEntry.posted_at,
    tags: apiEntry.tags.map((t) => ({ name: t.tag_name, score: t.score })),
    excerpt: apiEntry.excerpt ?? undefined,
  }
}

function convertResponse(response: EntryListResponse): EntriesResult {
  return {
    entries: response.entries.map(convertApiEntry),
    total: response.total,
  }
}

async function fetchNewEntries(params: FetchEntriesParams): Promise<EntriesResult> {
  console.debug('[fetchNewEntries] Calling repository', params)
  const response = await entriesRepository.getNewEntries(params)
  console.debug('[fetchNewEntries] Response received', {
    total: response.total,
    count: response.entries.length,
  })
  return convertResponse(response)
}

async function fetchHotEntries(params: FetchEntriesParams): Promise<EntriesResult> {
  console.debug('[fetchHotEntries] Calling repository', params)
  const response = await entriesRepository.getHotEntries(params)
  console.debug('[fetchHotEntries] Response received', {
    total: response.total,
    count: response.entries.length,
  })
  return convertResponse(response)
}

export const entriesQueryOptions = {
  staleTime: 1000 * 60 * 5, // 5分

  keys: {
    all: ['entries'] as const,
    byType: (type: EntryType, params: FetchEntriesParams) =>
      [...entriesQueryOptions.keys.all, type, params] as const,
  },

  new: (params: FetchEntriesParams) => ({
    queryKey: entriesQueryOptions.keys.byType('new', params),
    queryFn: () => fetchNewEntries(params),
    staleTime: entriesQueryOptions.staleTime,
  }),

  hot: (params: FetchEntriesParams) => ({
    queryKey: entriesQueryOptions.keys.byType('hot', params),
    queryFn: () => fetchHotEntries(params),
    staleTime: entriesQueryOptions.staleTime,
  }),
}
