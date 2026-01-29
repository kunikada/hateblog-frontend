import { api } from '@/api/client'
import type {
  ClickedTagsResponse,
  GetClickedTagsParams,
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
  }
}

export const tagsRepository = createTagsRepository()
