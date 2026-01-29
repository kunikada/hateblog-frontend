import { api } from '@/api/client'
import type {
  MetricsRepository,
  ClickMetricsRequest,
  MetricsResponse,
} from '@/repositories/metrics'

export function createMetricsRepository(): MetricsRepository {
  return {
    async recordClick(request: ClickMetricsRequest): Promise<MetricsResponse> {
      return api.metrics.recordClick(request)
    },
  }
}

export const metricsRepository = createMetricsRepository()
