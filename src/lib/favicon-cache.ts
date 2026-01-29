const FAVICON_CACHE_NAME = 'favicons-v1'

type CachedFaviconResult = {
  url: string
  revoke?: () => void
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

    const response = await fetch(src, { cache: 'no-store' })
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
