import { api } from '@/api/client'
import type { SearchEntriesParams, SearchRepository, SearchResponse } from '@/repositories/search'

export function createSearchRepository(): SearchRepository {
  return {
    async searchEntries(params: SearchEntriesParams): Promise<SearchResponse> {
      console.debug('[SearchRepository] searchEntries', params)
      const result = await api.search.entries({
        q: params.q,
        min_users: params.minUsers,
        sort: params.sort,
        limit: params.limit,
        offset: params.offset,
      })
      console.debug('[SearchRepository] searchEntries result', result)
      return result
    },
  }
}

export const searchRepository = createSearchRepository()
