import { api } from '@/api/client'
import type { EntriesRepository, EntryListResponse, GetEntriesParams } from '@/repositories/entries'

export function createEntriesRepository(): EntriesRepository {
  return {
    async getNewEntries(params: GetEntriesParams): Promise<EntryListResponse> {
      console.debug('[EntriesRepository] getNewEntries', params)
      const result = await api.entries.getNew({
        date: params.date,
        min_users: params.minUsers,
        limit: params.limit,
        offset: params.offset,
      })
      console.debug('[EntriesRepository] getNewEntries result', result)
      return result
    },
    async getHotEntries(params: GetEntriesParams): Promise<EntryListResponse> {
      console.debug('[EntriesRepository] getHotEntries', params)
      const result = await api.entries.getHot({
        date: params.date,
        min_users: params.minUsers,
        limit: params.limit,
        offset: params.offset,
      })
      console.debug('[EntriesRepository] getHotEntries result', result)
      return result
    },
  }
}

export const entriesRepository = createEntriesRepository()
