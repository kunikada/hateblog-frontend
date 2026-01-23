import { config } from '@/lib/config'

const STORAGE_KEY_ID = 'hateblog-api-key-id'
const STORAGE_KEY = 'hateblog-api-key'

type ApiKeyCredentials = {
  keyId: string
  key: string
}

export function getStoredApiKey(): ApiKeyCredentials | null {
  const keyId = sessionStorage.getItem(STORAGE_KEY_ID)
  const key = sessionStorage.getItem(STORAGE_KEY)
  if (keyId && key) {
    return { keyId, key }
  }
  return null
}

export function saveApiKey(credentials: ApiKeyCredentials): void {
  sessionStorage.setItem(STORAGE_KEY_ID, credentials.keyId)
  sessionStorage.setItem(STORAGE_KEY, credentials.key)
}

export function clearApiKey(): void {
  sessionStorage.removeItem(STORAGE_KEY_ID)
  sessionStorage.removeItem(STORAGE_KEY)
}

type ApiKeyResponse = {
  id: string
  key: string
}

export async function issueApiKey(): Promise<ApiKeyCredentials> {
  console.debug('[API Key] Issuing new API key')
  const response = await fetch(`${config.api.baseUrl}/api-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Frontend Session Key',
    }),
  })

  console.debug('[API Key] Issue response', { status: response.status })

  if (!response.ok) {
    throw new Error(`Failed to issue API key: ${response.status}`)
  }

  const data: ApiKeyResponse = await response.json()
  const credentials = { keyId: data.id, key: data.key }
  console.debug('[API Key] API key issued successfully', { keyId: credentials.keyId })
  saveApiKey(credentials)
  return credentials
}

export async function ensureApiKey(): Promise<ApiKeyCredentials> {
  const stored = getStoredApiKey()
  if (stored) {
    console.debug('[API Key] Using stored API key', { keyId: stored.keyId })
    return stored
  }
  console.debug('[API Key] No stored key found, issuing new one')
  return issueApiKey()
}
