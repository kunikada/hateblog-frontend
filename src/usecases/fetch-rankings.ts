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

export type YearlyRankingResult = {
  entries: RankingEntry[]
  total: number
  year: number
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

function convertResponse(response: RankingResponse): YearlyRankingResult {
  return {
    entries: response.entries.map(convertApiRankingEntry),
    total: response.total,
    year: response.year,
  }
}

async function fetchYearlyRanking(params: FetchYearlyRankingParams): Promise<YearlyRankingResult> {
  console.debug('[fetchYearlyRanking] Calling repository', params)
  const response = await rankingsRepository.getYearlyRanking(params)
  console.debug('[fetchYearlyRanking] Response received', {
    total: response.total,
    count: response.entries.length,
  })
  return convertResponse(response)
}

export const rankingsQueryOptions = {
  staleTime: 1000 * 60 * 5, // 5分

  keys: {
    all: ['rankings'] as const,
    yearly: (params: FetchYearlyRankingParams) => [...rankingsQueryOptions.keys.all, 'yearly', params] as const,
  },

  yearly: (params: FetchYearlyRankingParams) => ({
    queryKey: rankingsQueryOptions.keys.yearly(params),
    queryFn: () => fetchYearlyRanking(params),
    staleTime: rankingsQueryOptions.staleTime,
  }),
}
