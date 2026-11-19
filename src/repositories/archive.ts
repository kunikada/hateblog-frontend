import type * as schemas from '@/api/generated'

// API Response types
export type ArchiveItem = schemas.ArchiveItem
export type ArchiveResponse = schemas.ArchiveResponse

export type GetArchiveParams = {
  minUsers?: number
}

export interface ArchiveRepository {
  getArchive(params?: GetArchiveParams): Promise<ArchiveResponse>
}
