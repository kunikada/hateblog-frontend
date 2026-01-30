import { rankingsRepository } from '@/infra/repositories/rankings'
import { config } from '@/lib/config'
import type { Entry } from '@/repositories/entries'
import type { ApiRankingEntry, RankingResponse } from '@/repositories/rankings'

export type RankingEntry = Entry & {
  rank: number
}

export type FetchYearlyRankingParams = {
  year: number
  limit?: number
}

export type FetchMonthlyRankingParams = {
  year: number
  month: number
  limit?: number
}

export type FetchWeeklyRankingParams = {
  year: number
  week: number
  limit?: number
}

export type YearlyRankingResult = {
  entries: RankingEntry[]
  total: number
  year: number
}

export type MonthlyRankingResult = {
  entries: RankingEntry[]
  total: number
  year: number
  month: number
}

export type WeeklyRankingResult = {
  entries: RankingEntry[]
  total: number
  year: number
  week: number
}

function convertApiRankingEntry(apiEntry: ApiRankingEntry): RankingEntry {
  const entry = apiEntry.entry
  const url = new URL(entry.url)
  const faviconUrl =
    entry.favicon_url || `${config.api.baseUrl}/favicons?domain=${encodeURIComponent(url.hostname)}`

  return {
    id: entry.id,
    rank: apiEntry.rank,
    title: entry.title,
    url: entry.url,
    domain: url.hostname,
    favicon: faviconUrl,
    bookmarkCount: entry.bookmark_count,
    timestamp: entry.posted_at,
    tags: entry.tags.map((t) => ({ name: t.tag_name, score: t.score })),
    excerpt: entry.excerpt ?? undefined,
  }
}

function convertYearlyResponse(response: RankingResponse): YearlyRankingResult {
  return {
    entries: response.entries.map(convertApiRankingEntry),
    total: response.total,
    year: response.year,
  }
}

function convertMonthlyResponse(response: RankingResponse): MonthlyRankingResult {
  return {
    entries: response.entries.map(convertApiRankingEntry),
    total: response.total,
    year: response.year,
    month: response.month ?? 1,
  }
}

function convertWeeklyResponse(response: RankingResponse): WeeklyRankingResult {
  return {
    entries: response.entries.map(convertApiRankingEntry),
    total: response.total,
    year: response.year,
    week: response.week ?? 1,
  }
}

async function fetchYearlyRanking(params: FetchYearlyRankingParams): Promise<YearlyRankingResult> {
  console.debug('[fetchYearlyRanking] Calling repository', params)
  const response = await rankingsRepository.getYearlyRanking(params)
  console.debug('[fetchYearlyRanking] Response received', {
    total: response.total,
    count: response.entries.length,
  })
  return convertYearlyResponse(response)
}

async function fetchMonthlyRanking(
  params: FetchMonthlyRankingParams,
): Promise<MonthlyRankingResult> {
  console.debug('[fetchMonthlyRanking] Calling repository', params)
  const response = await rankingsRepository.getMonthlyRanking(params)
  console.debug('[fetchMonthlyRanking] Response received', {
    total: response.total,
    count: response.entries.length,
  })
  return convertMonthlyResponse(response)
}

async function fetchWeeklyRanking(params: FetchWeeklyRankingParams): Promise<WeeklyRankingResult> {
  console.debug('[fetchWeeklyRanking] Calling repository', params)
  const response = await rankingsRepository.getWeeklyRanking(params)
  console.debug('[fetchWeeklyRanking] Response received', {
    total: response.total,
    count: response.entries.length,
  })
  return convertWeeklyResponse(response)
}

export const rankingsQueryOptions = {
  staleTime: 1000 * 60 * 5, // 5分

  keys: {
    all: ['rankings'] as const,
    yearly: (params: FetchYearlyRankingParams) =>
      [...rankingsQueryOptions.keys.all, 'yearly', params] as const,
    monthly: (params: FetchMonthlyRankingParams) =>
      [...rankingsQueryOptions.keys.all, 'monthly', params] as const,
    weekly: (params: FetchWeeklyRankingParams) =>
      [...rankingsQueryOptions.keys.all, 'weekly', params] as const,
  },

  yearly: (params: FetchYearlyRankingParams) => ({
    queryKey: rankingsQueryOptions.keys.yearly(params),
    queryFn: () => fetchYearlyRanking(params),
    staleTime: rankingsQueryOptions.staleTime,
  }),

  monthly: (params: FetchMonthlyRankingParams) => ({
    queryKey: rankingsQueryOptions.keys.monthly(params),
    queryFn: () => fetchMonthlyRanking(params),
    staleTime: rankingsQueryOptions.staleTime,
  }),

  weekly: (params: FetchWeeklyRankingParams) => ({
    queryKey: rankingsQueryOptions.keys.weekly(params),
    queryFn: () => fetchWeeklyRanking(params),
    staleTime: rankingsQueryOptions.staleTime,
  }),
}
