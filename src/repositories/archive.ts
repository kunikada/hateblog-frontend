import type { components } from '@/api/openapi'

// API Response types
export type ArchiveItem = components['schemas']['ArchiveItem']
export type ArchiveResponse = components['schemas']['ArchiveResponse']

export type GetArchiveParams = {
  minUsers?: number
}

export interface ArchiveRepository {
  getArchive(params?: GetArchiveParams): Promise<ArchiveResponse>
}
