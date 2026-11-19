import type * as schemas from '@/api/generated'

export type SearchResponse = schemas.SearchResponse

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
