import type { components } from '@/api/openapi'

export type ClickMetricsRequest = components['schemas']['ClickMetricsRequest']
export type MetricsResponse = components['schemas']['MetricsResponse']

export interface MetricsRepository {
  recordClick(request: ClickMetricsRequest): Promise<MetricsResponse>
}
