import { api } from '@/api/client'
import type {
  GetMonthlyRankingParams,
  GetWeeklyRankingParams,
  GetYearlyRankingParams,
  RankingResponse,
  RankingsRepository,
} from '@/repositories/rankings'

export function createRankingsRepository(): RankingsRepository {
  return {
    async getYearlyRanking(params: GetYearlyRankingParams): Promise<RankingResponse> {
      console.debug('[RankingsRepository] getYearlyRanking', params)
      const result = await api.rankings.getYearly({
        year: params.year,
        limit: params.limit,
        offset: params.offset,
      })
      console.debug('[RankingsRepository] getYearlyRanking result', result)
      return result
    },
    async getMonthlyRanking(params: GetMonthlyRankingParams): Promise<RankingResponse> {
      console.debug('[RankingsRepository] getMonthlyRanking', params)
      const result = await api.rankings.getMonthly({
        year: params.year,
        month: params.month,
        limit: params.limit,
        offset: params.offset,
      })
      console.debug('[RankingsRepository] getMonthlyRanking result', result)
      return result
    },
    async getWeeklyRanking(params: GetWeeklyRankingParams): Promise<RankingResponse> {
      console.debug('[RankingsRepository] getWeeklyRanking', params)
      const result = await api.rankings.getWeekly({
        year: params.year,
        week: params.week,
        limit: params.limit,
        offset: params.offset,
      })
      console.debug('[RankingsRepository] getWeeklyRanking result', result)
      return result
    },
  }
}

export const rankingsRepository = createRankingsRepository()
