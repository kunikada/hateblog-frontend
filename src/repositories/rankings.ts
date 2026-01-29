import type { components } from '@/api/openapi'

// API Response types
export type RankingResponse = components['schemas']['RankingResponse']
export type ApiRankingEntry = components['schemas']['RankingEntry']

export type GetYearlyRankingParams = {
  year: number
  limit?: number
}

export interface RankingsRepository {
  getYearlyRanking(params: GetYearlyRankingParams): Promise<RankingResponse>
}
