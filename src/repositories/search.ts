import type { components } from '@/api/openapi'

export type SearchResponse = components['schemas']['SearchResponse']

export type SearchEntriesParams = {
  q: string
  minUsers?: number
  sort?: 'new' | 'hot'
  limit?: number
  offset?: number
}

export interface SearchRepository {
  searchEntries(params: SearchEntriesParams): Promise<SearchResponse>
}
