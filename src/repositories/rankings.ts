import type * as schemas from '@/api/generated'

// API Response types
export type RankingResponse = schemas.RankingResponse
export type ApiRankingEntry = schemas.RankingEntry

export type GetYearlyRankingParams = {
  year: number
  limit?: number
  offset?: number
}

export type GetMonthlyRankingParams = {
  year: number
  month: number
  limit?: number
  offset?: number
}

export type GetWeeklyRankingParams = {
  year: number
  week: number
  limit?: number
  offset?: number
}

export interface RankingsRepository {
  getYearlyRanking(params: GetYearlyRankingParams): Promise<RankingResponse>
  getMonthlyRanking(params: GetMonthlyRankingParams): Promise<RankingResponse>
  getWeeklyRanking(params: GetWeeklyRankingParams): Promise<RankingResponse>
}
