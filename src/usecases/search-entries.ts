import { searchRepository } from '@/infra/repositories/search'
import { config } from '@/lib/config'
import type { ApiEntry, Entry } from '@/repositories/entries'

export type SearchEntriesParams = {
  q: string
  minUsers?: number
  sort?: 'new' | 'hot'
  limit?: number
  offset?: number
}

export type SearchEntriesResult = {
  entries: Entry[]
  total: number
}

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

async function searchEntries(params: SearchEntriesParams): Promise<SearchEntriesResult> {
  console.debug('[searchEntries] Calling repository', params)
  const response = await searchRepository.searchEntries({
    q: params.q,
    minUsers: params.minUsers,
    sort: params.sort,
    limit: params.limit ?? 1000,
    offset: params.offset,
  })
  console.debug('[searchEntries] Response received', {
    total: response.total,
    count: response.entries.length,
  })
  return {
    entries: response.entries.map(convertApiEntry),
    total: response.total,
  }
}

export const searchEntriesQueryOptions = {
  staleTime: 1000 * 60 * 5, // 5分

  keys: {
    all: ['searchEntries'] as const,
    byQuery: (params: SearchEntriesParams) =>
      [...searchEntriesQueryOptions.keys.all, params] as const,
  },

  entries: (params: SearchEntriesParams) => ({
    queryKey: searchEntriesQueryOptions.keys.byQuery(params),
    queryFn: () => searchEntries(params),
    staleTime: searchEntriesQueryOptions.staleTime,
    enabled: params.q.trim().length > 0,
  }),
}
