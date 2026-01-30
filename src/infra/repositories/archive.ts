import { api } from '@/api/client'
import type { ArchiveRepository, ArchiveResponse, GetArchiveParams } from '@/repositories/archive'

export function createArchiveRepository(): ArchiveRepository {
  return {
    async getArchive(params?: GetArchiveParams): Promise<ArchiveResponse> {
      console.debug('[ArchiveRepository] getArchive', params)
      const result = await api.archive.get(
        params?.minUsers
          ? { min_users: params.minUsers as 5 | 10 | 50 | 100 | 500 | 1000 }
          : undefined,
      )
      console.debug('[ArchiveRepository] getArchive result', result)
      return result
    },
  }
}

export const archiveRepository = createArchiveRepository()
