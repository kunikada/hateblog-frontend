import { clearApiKey, ensureApiKey, issueApiKey } from '@/infra/api-key'
import { config } from '@/lib/config'
import {
  type GetArchiveData,
  type GetArchiveResponse,
  type GetClickedTagsData,
  type GetClickedTagsResponse,
  type GetEntriesByTagResponse,
  type GetHotEntriesData,
  type GetHotEntriesResponse,
  type GetMonthlyRankingData,
  type GetMonthlyRankingResponse,
  type GetNewEntriesData,
  type GetNewEntriesResponse,
  type GetTrendingTagsData,
  type GetTrendingTagsResponse,
  type GetWeeklyRankingData,
  type GetWeeklyRankingResponse,
  type GetYearlyRankingData,
  type GetYearlyRankingResponse,
  getArchive,
  getClickedTags,
  getEntriesByTag,
  getHotEntries,
  getMonthlyRanking,
  getNewEntries,
  getTrendingTags,
  getWeeklyRanking,
  getYearlyRanking,
  type RecordClickData,
  type RecordClickResponse,
  recordClick,
  type SearchEntriesData,
  type SearchEntriesResponse,
  searchEntries,
} from './generated'
import { client } from './generated/client.gen'

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

function setApiKeyHeaders(request: Request, credentials: { keyId: string; key: string }): Request {
  request.headers.set('X-API-Key-ID', credentials.keyId)
  request.headers.set('X-API-Key', credentials.key)
  return request
}

async function fetchWithApiKey(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request = new Request(input, init)
  // 401時の再送用（fetchでbodyが消費されるため事前に複製する）
  const retryRequest = request.clone()

  console.debug('[API Client] Ensuring API key')
  const credentials = await ensureApiKey()
  console.debug('[API Client] API key obtained', { keyId: credentials.keyId })

  console.debug('[API Client] Making request', { method: request.method, url: request.url })
  const response = await fetch(setApiKeyHeaders(request, credentials))

  console.debug('[API Client] Response received', {
    status: response.status,
    statusText: response.statusText,
  })

  if (response.status !== 401) {
    return response
  }

  // APIキーが無効な場合、再発行してリトライ
  clearApiKey()
  const newCredentials = await issueApiKey()
  return fetch(setApiKeyHeaders(retryRequest, newCredentials))
}

client.setConfig({
  baseUrl: config.api.baseUrl,
  fetch: fetchWithApiKey,
  throwOnError: true,
})

client.interceptors.error.use((error, response) => {
  if (!response) {
    return error
  }
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message)
      : response.statusText
  return new ApiError(response.status, message || response.statusText, error)
})

type GetNewEntriesParams = GetNewEntriesData['query']
type GetHotEntriesParams = GetHotEntriesData['query']
type RecordClickBody = RecordClickData['body']
type GetArchiveParams = GetArchiveData['query']
type GetTrendingTagsParams = GetTrendingTagsData['query']
type GetClickedTagsParams = GetClickedTagsData['query']
type GetYearlyRankingParams = GetYearlyRankingData['query']
type GetMonthlyRankingParams = GetMonthlyRankingData['query']
type GetWeeklyRankingParams = GetWeeklyRankingData['query']

type GetTagEntriesParams = {
  tag: string
  min_users?: number
  sort?: 'new' | 'hot'
  limit?: number
  offset?: number
}
type GetTagEntriesResponse = GetEntriesByTagResponse

type SearchEntriesParams = SearchEntriesData['query']

export const api = {
  entries: {
    getNew: async (params: GetNewEntriesParams): Promise<GetNewEntriesResponse> => {
      const { data } = await getNewEntries({ query: params })
      return data
    },
    getHot: async (params: GetHotEntriesParams): Promise<GetHotEntriesResponse> => {
      const { data } = await getHotEntries({ query: params })
      return data
    },
  },
  metrics: {
    recordClick: async (body: RecordClickBody): Promise<RecordClickResponse> => {
      const { data } = await recordClick({ body })
      return data
    },
  },
  favicons: {
    getUrl: (domain: string): string => {
      return `${config.api.baseUrl}/favicons?domain=${encodeURIComponent(domain)}`
    },
  },
  archive: {
    get: async (params?: GetArchiveParams): Promise<GetArchiveResponse> => {
      const { data } = await getArchive({ query: params })
      return data
    },
  },
  tags: {
    getTrending: async (params?: GetTrendingTagsParams): Promise<GetTrendingTagsResponse> => {
      const { data } = await getTrendingTags({ query: params })
      return data
    },
    getClicked: async (params?: GetClickedTagsParams): Promise<GetClickedTagsResponse> => {
      const { data } = await getClickedTags({ query: params })
      return data
    },
    getEntries: async ({ tag, ...query }: GetTagEntriesParams): Promise<GetTagEntriesResponse> => {
      const { data } = await getEntriesByTag({ path: { tag }, query })
      return data
    },
  },
  search: {
    entries: async (params: SearchEntriesParams): Promise<SearchEntriesResponse> => {
      const { data } = await searchEntries({ query: params })
      return data
    },
  },
  rankings: {
    getYearly: async (params: GetYearlyRankingParams): Promise<GetYearlyRankingResponse> => {
      const { data } = await getYearlyRanking({ query: params })
      return data
    },
    getMonthly: async (params: GetMonthlyRankingParams): Promise<GetMonthlyRankingResponse> => {
      const { data } = await getMonthlyRanking({ query: params })
      return data
    },
    getWeekly: async (params: GetWeeklyRankingParams): Promise<GetWeeklyRankingResponse> => {
      const { data } = await getWeeklyRanking({ query: params })
      return data
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
