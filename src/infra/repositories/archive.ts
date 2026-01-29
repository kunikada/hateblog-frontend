import { api } from '@/api/client'
import type { ArchiveRepository, ArchiveResponse, GetArchiveParams } from '@/repositories/archive'

export function createArchiveRepository(): ArchiveRepository {
  return {
    async getArchive(params?: GetArchiveParams): Promise<ArchiveResponse> {
      console.debug('[ArchiveRepository] getArchive', params)
      const result = await api.archive.get({
        min_users: params?.minUsers,
      })
      console.debug('[ArchiveRepository] getArchive result', result)
      return result
    },
  }
}

export const archiveRepository = createArchiveRepository()
