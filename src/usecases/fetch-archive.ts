import { archiveRepository } from '@/infra/repositories/archive'
import type { ArchiveItem } from '@/repositories/archive'

export type { ArchiveItem }

export type FetchArchiveParams = {
  minUsers?: number
}

export type ArchiveResult = {
  items: ArchiveItem[]
  latestDate: string | null
}

async function fetchArchive(params?: FetchArchiveParams): Promise<ArchiveResult> {
  console.debug('[fetchArchive] Calling repository', params)
  const response = await archiveRepository.getArchive({
    minUsers: params?.minUsers,
  })
  console.debug('[fetchArchive] Response received', {
    count: response.items.length,
  })

  const latestDate = response.items.length > 0 ? response.items[0].date : null

  return {
    items: response.items,
    latestDate,
  }
}

export const archiveQueryOptions = {
  staleTime: 1000 * 60 * 5, // 5分

  keys: {
    all: ['archive'] as const,
    byParams: (params?: FetchArchiveParams) => [...archiveQueryOptions.keys.all, params] as const,
  },

  get: (params?: FetchArchiveParams) => ({
    queryKey: archiveQueryOptions.keys.byParams(params),
    queryFn: () => fetchArchive(params),
    staleTime: archiveQueryOptions.staleTime,
  }),
}
