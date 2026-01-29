import { api } from '@/api/client'
import type {
  GetMonthlyRankingParams,
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
      })
      console.debug('[RankingsRepository] getMonthlyRanking result', result)
      return result
    },
  }
}

export const rankingsRepository = createRankingsRepository()
