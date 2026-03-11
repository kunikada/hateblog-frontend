import { entriesRepository } from '@/infra/repositories/entries'
import { tagsRepository } from '@/infra/repositories/tags'
import { EntryDate } from '@/lib/entry-date'
import { convertApiEntry } from '@/lib/entry-mapper'
import { aggregateTagsFromViewHistory } from '@/lib/tag-aggregator'
import type { Entry, EntryListResponse } from '@/repositories/entries'
import type { TrendingTagsResponse } from '@/repositories/tags'
import { getViewHistory } from '@/usecases/entry-click'

export type SidebarTag = {
  id: string
  name: string
  count: number
}

export type SidebarNewEntriesResult = {
  entries: Entry[]
}

export type SidebarYearAgoEntriesResult = {
  entries: Entry[]
  date: string
}

export type SidebarTrendingTagsResult = {
  tags: SidebarTag[]
}

export type SidebarClickedTagsResult = {
  tags: SidebarTag[]
}

function convertEntryListResponse(response: EntryListResponse): Entry[] {
  return response.entries.map(convertApiEntry)
}

function convertTrendingTags(response: TrendingTagsResponse): SidebarTag[] {
  return response.tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    count: tag.occurrence_count,
  }))
}

const SIDEBAR_NEW_ENTRIES_LIMIT = 5
const SIDEBAR_TAGS_API_LIMIT = 25
const SIDEBAR_TAGS_MIN_LENGTH_JP = 2
const SIDEBAR_TAGS_MIN_LENGTH_ALNUM = 3

function isAsciiAlnumOnly(value: string): boolean {
  return /^[A-Za-z0-9]+$/.test(value)
}

function getTagNameLength(value: string): number {
  return Array.from(value).length
}

function filterSidebarTags(tags: SidebarTag[]): SidebarTag[] {
  return tags.filter((tag) => {
    const name = tag.name.trim()
    if (name.length === 0) {
      return false
    }
    const minLength = isAsciiAlnumOnly(name)
      ? SIDEBAR_TAGS_MIN_LENGTH_ALNUM
      : SIDEBAR_TAGS_MIN_LENGTH_JP
    return getTagNameLength(name) >= minLength
  })
}

async function fetchNewEntries(date: string): Promise<SidebarNewEntriesResult> {
  console.debug('[fetchSidebarNewEntries] Fetching', { date })
  const response = await entriesRepository.getNewEntries({
    date,
    limit: SIDEBAR_NEW_ENTRIES_LIMIT,
  })
  let entries = convertEntryListResponse(response)

  // 日付が変わる時間帯で5件に満たない場合、前日のデータも取得
  if (entries.length < SIDEBAR_NEW_ENTRIES_LIMIT) {
    const previousDate = EntryDate.fromYYYYMMDD(date).previousDay().toYYYYMMDD()
    console.debug('[fetchSidebarNewEntries] Fetching previous day', {
      previousDate,
      currentCount: entries.length,
    })
    const previousResponse = await entriesRepository.getNewEntries({
      date: previousDate,
      limit: SIDEBAR_NEW_ENTRIES_LIMIT - entries.length,
    })
    entries = [...entries, ...convertEntryListResponse(previousResponse)]
  }

  return {
    entries,
  }
}

async function fetchYearAgoEntries(): Promise<SidebarYearAgoEntriesResult> {
  const yearAgoDate = EntryDate.today().subtractYears(1)
  const date = yearAgoDate.toYYYYMMDD()
  console.debug('[fetchSidebarYearAgoEntries] Fetching', { date })
  const response = await entriesRepository.getHotEntries({
    date,
    limit: 5,
  })
  return {
    entries: convertEntryListResponse(response),
    date: yearAgoDate.toDisplayString(),
  }
}

async function fetchTrendingTags(): Promise<SidebarTrendingTagsResult> {
  console.debug('[fetchSidebarTrendingTags] Fetching')
  const response = await tagsRepository.getTrendingTags({
    hours: 48,
    limit: SIDEBAR_TAGS_API_LIMIT,
  })
  return {
    tags: filterSidebarTags(convertTrendingTags(response)),
  }
}

async function fetchClickedTags(): Promise<SidebarClickedTagsResult> {
  console.debug('[fetchSidebarClickedTags] Fetching from view history')

  const viewHistory = getViewHistory()
  const aggregatedTags = aggregateTagsFromViewHistory(viewHistory, SIDEBAR_TAGS_API_LIMIT)

  const tags: SidebarTag[] = aggregatedTags.map((tag) => ({
    id: tag.name, // タグ名をIDとして使用（リンク生成にはnameを使用）
    name: tag.name,
    count: tag.count,
  }))

  return {
    tags: filterSidebarTags(tags),
  }
}

export const sidebarQueryOptions = {
  staleTime: 1000 * 60 * 15, // 15分

  keys: {
    newEntries: (date: string) => ['sidebar', 'newEntries', date] as const,
    yearAgoEntries: () => ['sidebar', 'yearAgoEntries'] as const,
    trendingTags: () => ['sidebar', 'trendingTags'] as const,
    clickedTags: () => ['sidebar', 'clickedTags'] as const,
  },

  newEntries: (date: string) => ({
    queryKey: sidebarQueryOptions.keys.newEntries(date),
    queryFn: () => fetchNewEntries(date),
    staleTime: sidebarQueryOptions.staleTime,
    refetchInterval: 1000 * 60 * 15, // 15分毎に自動更新
  }),

  yearAgoEntries: () => ({
    queryKey: sidebarQueryOptions.keys.yearAgoEntries(),
    queryFn: () => fetchYearAgoEntries(),
    staleTime: sidebarQueryOptions.staleTime,
  }),

  trendingTags: () => ({
    queryKey: sidebarQueryOptions.keys.trendingTags(),
    queryFn: () => fetchTrendingTags(),
    staleTime: sidebarQueryOptions.staleTime,
  }),

  clickedTags: () => ({
    queryKey: sidebarQueryOptions.keys.clickedTags(),
    queryFn: () => fetchClickedTags(),
    staleTime: sidebarQueryOptions.staleTime,
  }),
}
