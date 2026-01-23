import type { components } from '@/api/openapi'

// API Response types
export type ApiEntry = components['schemas']['Entry']
export type EntryListResponse = components['schemas']['EntryListResponse']

// Domain types (used throughout the application)
export type Entry = {
  id: string
  title: string
  url: string
  domain: string
  favicon: string
  bookmarkCount: number
  timestamp: string
  tags: string[]
  excerpt?: string
}

export type GetEntriesParams = {
  date: string
  minUsers?: number
  limit?: number
  offset?: number
}

export interface EntriesRepository {
  getNewEntries(params: GetEntriesParams): Promise<EntryListResponse>
  getHotEntries(params: GetEntriesParams): Promise<EntryListResponse>
}
