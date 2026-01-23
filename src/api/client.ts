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
}

export type {
  GetHotEntriesParams,
  GetHotEntriesResponse,
  GetNewEntriesParams,
  GetNewEntriesResponse,
  RecordClickBody,
  RecordClickResponse,
}
