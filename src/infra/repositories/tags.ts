import { api } from '@/api/client'
import type {
  ClickedTagsResponse,
  EntryListResponse,
  GetClickedTagsParams,
  GetTagEntriesParams,
  GetTrendingTagsParams,
  TagsRepository,
  TrendingTagsResponse,
} from '@/repositories/tags'

export function createTagsRepository(): TagsRepository {
  return {
    async getTrendingTags(params?: GetTrendingTagsParams): Promise<TrendingTagsResponse> {
      console.debug('[TagsRepository] getTrendingTags', params)
      const result = await api.tags.getTrending({
        hours: params?.hours,
        min_users: params?.minUsers,
        limit: params?.limit,
      })
      console.debug('[TagsRepository] getTrendingTags result', result)
      return result
    },
    async getClickedTags(params?: GetClickedTagsParams): Promise<ClickedTagsResponse> {
      console.debug('[TagsRepository] getClickedTags', params)
      const result = await api.tags.getClicked({
        days: params?.days,
        limit: params?.limit,
      })
      console.debug('[TagsRepository] getClickedTags result', result)
      return result
    },
    async getEntries(params: GetTagEntriesParams): Promise<EntryListResponse> {
      console.debug('[TagsRepository] getEntries', params)
      const result = await api.tags.getEntries({
        tag: params.tag,
        min_users: params.minUsers,
        sort: params.sort,
        limit: params.limit,
        offset: params.offset,
      })
      console.debug('[TagsRepository] getEntries result', result)
      return result
    },
  }
}

export const tagsRepository = createTagsRepository()
