import { clearApiKey, ensureApiKey, issueApiKey } from '@/infra/api-key'
import { config } from '@/lib/config'
import type { paths } from './openapi'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  console.debug('[API Client] Ensuring API key')
  const credentials = await ensureApiKey()
  console.debug('[API Client] API key obtained', { keyId: credentials.keyId })

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key-ID': credentials.keyId,
    'X-API-Key': credentials.key,
    ...headers,
  }

  const url = `${config.api.baseUrl}${path}`
  console.debug('[API Client] Making request', { method, url })

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  console.debug('[API Client] Response received', {
    status: response.status,
    statusText: response.statusText,
  })

  if (response.status === 401) {
    // APIキーが無効な場合、再発行してリトライ
    clearApiKey()
    const newCredentials = await issueApiKey()

    const retryResponse = await fetch(`${config.api.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-ID': newCredentials.keyId,
        'X-API-Key': newCredentials.key,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!retryResponse.ok) {
      const errorData = await retryResponse.json().catch(() => null)
      throw new ApiError(
        retryResponse.status,
        errorData?.message || retryResponse.statusText,
        errorData,
      )
    }

    return retryResponse.json()
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new ApiError(response.status, errorData?.message || response.statusText, errorData)
  }

  return response.json()
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type GetNewEntriesParams = paths['/entries/new']['get']['parameters']['query']
type GetNewEntriesResponse =
  paths['/entries/new']['get']['responses']['200']['content']['application/json']

type GetHotEntriesParams = paths['/entries/hot']['get']['parameters']['query']
type GetHotEntriesResponse =
  paths['/entries/hot']['get']['responses']['200']['content']['application/json']

type RecordClickBody =
  paths['/metrics/clicks']['post']['requestBody']['content']['application/json']
type RecordClickResponse =
  paths['/metrics/clicks']['post']['responses']['201']['content']['application/json']

type GetArchiveParams = paths['/archive']['get']['parameters']['query']
type GetArchiveResponse =
  paths['/archive']['get']['responses']['200']['content']['application/json']

type GetTrendingTagsParams = paths['/tags/trending']['get']['parameters']['query']
type GetTrendingTagsResponse =
  paths['/tags/trending']['get']['responses']['200']['content']['application/json']

type GetClickedTagsParams = paths['/tags/clicked']['get']['parameters']['query']
type GetClickedTagsResponse =
  paths['/tags/clicked']['get']['responses']['200']['content']['application/json']

type GetYearlyRankingParams = paths['/rankings/yearly']['get']['parameters']['query']
type GetYearlyRankingResponse =
  paths['/rankings/yearly']['get']['responses']['200']['content']['application/json']

type GetMonthlyRankingParams = paths['/rankings/monthly']['get']['parameters']['query']
type GetMonthlyRankingResponse =
  paths['/rankings/monthly']['get']['responses']['200']['content']['application/json']

type GetWeeklyRankingParams = paths['/rankings/weekly']['get']['parameters']['query']
type GetWeeklyRankingResponse =
  paths['/rankings/weekly']['get']['responses']['200']['content']['application/json']

type GetTagEntriesParams = {
  tag: string
  min_users?: number
  sort?: 'new' | 'hot'
  limit?: number
  offset?: number
}
type GetTagEntriesResponse =
  paths['/tags/entries/{tag}']['get']['responses']['200']['content']['application/json']

type SearchEntriesParams = paths['/search']['get']['parameters']['query']
type SearchEntriesResponse =
  paths['/search']['get']['responses']['200']['content']['application/json']

export const api = {
  entries: {
    getNew: (params: GetNewEntriesParams): Promise<GetNewEntriesResponse> => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', params.date)
      if (params.min_users !== undefined) searchParams.set('min_users', String(params.min_users))
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
      if (params.offset !== undefined) searchParams.set('offset', String(params.offset))
      return request(`/entries/new?${searchParams}`)
    },
    getHot: (params: GetHotEntriesParams): Promise<GetHotEntriesResponse> => {
      const searchParams = new URLSearchParams()
      searchParams.set('date', params.date)
      if (params.min_users !== undefined) searchParams.set('min_users', String(params.min_users))
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
      if (params.offset !== undefined) searchParams.set('offset', String(params.offset))
      return request(`/entries/hot?${searchParams}`)
    },
  },
  metrics: {
    recordClick: (body: RecordClickBody): Promise<RecordClickResponse> => {
      return request('/metrics/clicks', { method: 'POST', body })
    },
  },
  favicons: {
    getUrl: (domain: string): string => {
      return `${config.api.baseUrl}/favicons?domain=${encodeURIComponent(domain)}`
    },
  },
  archive: {
    get: (params?: GetArchiveParams): Promise<GetArchiveResponse> => {
      const searchParams = new URLSearchParams()
      if (params?.min_users !== undefined) searchParams.set('min_users', String(params.min_users))
      const query = searchParams.toString()
      return request(`/archive${query ? `?${query}` : ''}`)
    },
  },
  tags: {
    getTrending: (params?: GetTrendingTagsParams): Promise<GetTrendingTagsResponse> => {
      const searchParams = new URLSearchParams()
      if (params?.hours !== undefined) searchParams.set('hours', String(params.hours))
      if (params?.min_users !== undefined) searchParams.set('min_users', String(params.min_users))
      if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return request(`/tags/trending${query ? `?${query}` : ''}`)
    },
    getClicked: (params?: GetClickedTagsParams): Promise<GetClickedTagsResponse> => {
      const searchParams = new URLSearchParams()
      if (params?.days !== undefined) searchParams.set('days', String(params.days))
      if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return request(`/tags/clicked${query ? `?${query}` : ''}`)
    },
    getEntries: (params: GetTagEntriesParams): Promise<GetTagEntriesResponse> => {
      const searchParams = new URLSearchParams()
      if (params.min_users !== undefined) searchParams.set('min_users', String(params.min_users))
      if (params.sort !== undefined) searchParams.set('sort', params.sort)
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
      if (params.offset !== undefined) searchParams.set('offset', String(params.offset))
      const query = searchParams.toString()
      return request(`/tags/entries/${encodeURIComponent(params.tag)}${query ? `?${query}` : ''}`)
    },
  },
  search: {
    entries: (params: SearchEntriesParams): Promise<SearchEntriesResponse> => {
      const searchParams = new URLSearchParams()
      searchParams.set('q', params.q)
      if (params.min_users !== undefined) searchParams.set('min_users', String(params.min_users))
      if (params.sort !== undefined) searchParams.set('sort', params.sort)
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
      if (params.offset !== undefined) searchParams.set('offset', String(params.offset))
      return request(`/search?${searchParams}`)
    },
  },
  rankings: {
    getYearly: (params: GetYearlyRankingParams): Promise<GetYearlyRankingResponse> => {
      const searchParams = new URLSearchParams()
      searchParams.set('year', String(params.year))
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
      if (params.offset !== undefined) searchParams.set('offset', String(params.offset))
      return request(`/rankings/yearly?${searchParams}`)
    },
    getMonthly: (params: GetMonthlyRankingParams): Promise<GetMonthlyRankingResponse> => {
      const searchParams = new URLSearchParams()
      searchParams.set('year', String(params.year))
      searchParams.set('month', String(params.month))
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
      if (params.offset !== undefined) searchParams.set('offset', String(params.offset))
      return request(`/rankings/monthly?${searchParams}`)
    },
    getWeekly: (params: GetWeeklyRankingParams): Promise<GetWeeklyRankingResponse> => {
      const searchParams = new URLSearchParams()
      searchParams.set('year', String(params.year))
      searchParams.set('week', String(params.week))
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
      if (params.offset !== undefined) searchParams.set('offset', String(params.offset))
      return request(`/rankings/weekly?${searchParams}`)
    },
  },
}

export type {
  GetArchiveParams,
  GetArchiveResponse,
  GetClickedTagsParams,
  GetClickedTagsResponse,
  GetHotEntriesParams,
  GetHotEntriesResponse,
  GetMonthlyRankingParams,
  GetMonthlyRankingResponse,
  GetNewEntriesParams,
  GetNewEntriesResponse,
  GetTagEntriesParams,
  GetTagEntriesResponse,
  GetTrendingTagsParams,
  GetTrendingTagsResponse,
  GetYearlyRankingParams,
  GetYearlyRankingResponse,
  RecordClickBody,
  RecordClickResponse,
  SearchEntriesParams,
  SearchEntriesResponse,
}
