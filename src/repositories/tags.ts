import type * as schemas from '@/api/generated'

export type TrendingTag = schemas.TrendingTag
export type TrendingTagsResponse = schemas.TrendingTagsResponse
export type ClickedTag = schemas.ClickedTag
export type ClickedTagsResponse = schemas.ClickedTagsResponse
export type EntryListResponse = schemas.EntryListResponse

export type GetTrendingTagsParams = {
  hours?: 6 | 12 | 24 | 48
  minUsers?: number
  limit?: number
}

export type GetClickedTagsParams = {
  days?: 1 | 7 | 30
  limit?: number
}

export type GetTagEntriesParams = {
  tag: string
  minUsers?: number
  sort?: 'new' | 'hot'
  limit?: number
  offset?: number
}

export interface TagsRepository {
  getTrendingTags(params?: GetTrendingTagsParams): Promise<TrendingTagsResponse>
  getClickedTags(params?: GetClickedTagsParams): Promise<ClickedTagsResponse>
  getEntries(params: GetTagEntriesParams): Promise<EntryListResponse>
}
