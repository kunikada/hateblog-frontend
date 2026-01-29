import { tagsRepository } from '@/infra/repositories/tags'
import { config } from '@/lib/config'
import type { ApiEntry, Entry } from '@/repositories/entries'

export type FetchTagEntriesParams = {
  tag: string
  minUsers?: number
  sort?: 'new' | 'hot'
  limit?: number
  offset?: number
}

export type TagEntriesResult = {
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

async function fetchTagEntries(params: FetchTagEntriesParams): Promise<TagEntriesResult> {
  console.debug('[fetchTagEntries] Calling repository', params)
  const response = await tagsRepository.getEntries({
    tag: params.tag,
    minUsers: params.minUsers,
    sort: params.sort,
    limit: params.limit ?? 1000,
    offset: params.offset,
  })
  console.debug('[fetchTagEntries] Response received', {
    total: response.total,
    count: response.entries.length,
  })
  return {
    entries: response.entries.map(convertApiEntry),
    total: response.total,
  }
}

export const tagEntriesQueryOptions = {
  staleTime: 1000 * 60 * 5, // 5分

  keys: {
    all: ['tagEntries'] as const,
    byTag: (params: FetchTagEntriesParams) => [...tagEntriesQueryOptions.keys.all, params] as const,
  },

  entries: (params: FetchTagEntriesParams) => ({
    queryKey: tagEntriesQueryOptions.keys.byTag(params),
    queryFn: () => fetchTagEntries(params),
    staleTime: tagEntriesQueryOptions.staleTime,
  }),
}
