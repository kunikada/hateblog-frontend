import type { components } from '@/api/openapi'

export type TrendingTag = components['schemas']['TrendingTag']
export type TrendingTagsResponse = components['schemas']['TrendingTagsResponse']
export type ClickedTag = components['schemas']['ClickedTag']
export type ClickedTagsResponse = components['schemas']['ClickedTagsResponse']
export type EntryListResponse = components['schemas']['EntryListResponse']

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
