import { searchRepository } from '@/infra/repositories/search'
import { convertApiEntry } from '@/lib/entry-mapper'
import type { Entry } from '@/repositories/entries'

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
