import type * as schemas from '@/api/generated'

export type ClickMetricsRequest = schemas.ClickMetricsRequest
export type MetricsResponse = schemas.MetricsResponse

export interface MetricsRepository {
  recordClick(request: ClickMetricsRequest): Promise<MetricsResponse>
}
