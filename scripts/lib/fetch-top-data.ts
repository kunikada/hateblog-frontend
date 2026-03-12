type ArchiveItem = {
  date: string
  count: number
}

type ArchiveResponse = {
  items: ArchiveItem[]
}

type EntryTag = {
  tag_name: string
  score: number
}

type ApiEntry = {
  id: string
  title: string
  url: string
  favicon_url?: string
  bookmark_count: number
  posted_at: string
  tags: EntryTag[]
  excerpt?: string
}

type EntryListResponse = {
  entries: ApiEntry[]
  total: number
}

type ApiKeyResponse = {
  id: string
  key: string
}

type ApiCredentials = {
  keyId: string
  key: string
}

async function issueApiKey(baseUrl: string): Promise<ApiCredentials> {
  const response = await fetch(`${baseUrl}/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Prerender Script Key' }),
  })
  if (!response.ok) {
    throw new Error(`Failed to issue API key: ${response.status}`)
  }
  const data: ApiKeyResponse = await response.json()
  return { keyId: data.id, key: data.key }
}

async function apiGet<T>(baseUrl: string, credentials: ApiCredentials, path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key-ID': credentials.keyId,
      'X-API-Key': credentials.key,
    },
  })
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`)
  }
  return response.json()
}

export type FetchArchiveParams = {
  minUsers?: number
}

export async function fetchArchive(
  baseUrl: string,
  credentials: ApiCredentials,
  params?: FetchArchiveParams,
): Promise<ArchiveResponse> {
  const searchParams = new URLSearchParams()
  if (params?.minUsers !== undefined) searchParams.set('min_users', String(params.minUsers))
  const query = searchParams.toString()
  return apiGet<ArchiveResponse>(baseUrl, credentials, `/archive${query ? `?${query}` : ''}`)
}

export type FetchHotEntriesParams = {
  date: string
  minUsers?: number
}

export async function fetchHotEntries(
  baseUrl: string,
  credentials: ApiCredentials,
  params: FetchHotEntriesParams,
): Promise<EntryListResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('date', params.date)
  if (params.minUsers !== undefined) searchParams.set('min_users', String(params.minUsers))
  searchParams.set('limit', '1000')
  return apiGet<EntryListResponse>(baseUrl, credentials, `/entries/hot?${searchParams}`)
}

export { issueApiKey }
export type { ArchiveItem, ApiEntry, ApiCredentials }
