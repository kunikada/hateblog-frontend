const FAVICON_CACHE_NAME = 'favicons-v1'

type CachedFaviconResult = {
  url: string
  revoke?: () => void
}

const DEFAULT_RETRY_AFTER_MS = 500

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

const getRetryAfterMs = (response: Response): number | null => {
  const retryAfter = response.headers.get('Retry-After')
  if (!retryAfter) {
    return null
  }
  const seconds = Number.parseInt(retryAfter, 10)
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000)
  }
  const dateMs = Date.parse(retryAfter)
  if (Number.isNaN(dateMs)) {
    return null
  }
  return Math.max(0, dateMs - Date.now())
}

const fetchFaviconWithRetry = async (src: string): Promise<Response> => {
  const first = await fetch(src, { cache: 'no-store' })
  if (first.status !== 425) {
    return first
  }
  const retryAfterMs = getRetryAfterMs(first) ?? DEFAULT_RETRY_AFTER_MS
  await sleep(retryAfterMs)
  return fetch(src, { cache: 'no-store' })
}

export async function getCachedFaviconUrl(src: string): Promise<CachedFaviconResult> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { url: src }
  }

  try {
    const cache = await caches.open(FAVICON_CACHE_NAME)
    const cachedResponse = await cache.match(src)
    if (cachedResponse) {
      const blob = await cachedResponse.blob()
      const objectUrl = URL.createObjectURL(blob)
      return { url: objectUrl, revoke: () => URL.revokeObjectURL(objectUrl) }
    }

    const response = await fetchFaviconWithRetry(src)
    if (!response.ok) {
      return { url: src }
    }

    await cache.put(src, response.clone())
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    return { url: objectUrl, revoke: () => URL.revokeObjectURL(objectUrl) }
  } catch {
    return { url: src }
  }
}
