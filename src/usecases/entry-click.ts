import { metricsRepository } from '@/infra/repositories/metrics'
import type { Entry } from '@/repositories/entries'

const VIEW_HISTORY_KEY = 'viewHistory:v1'
const VIEW_HISTORY_LEGACY_KEY = 'viewHistory'
const VIEW_HISTORY_MAX_SIZE = 1000

function migrateViewHistory(): void {
  try {
    const legacy = localStorage.getItem(VIEW_HISTORY_LEGACY_KEY)
    if (legacy && !localStorage.getItem(VIEW_HISTORY_KEY)) {
      localStorage.setItem(VIEW_HISTORY_KEY, legacy)
      localStorage.removeItem(VIEW_HISTORY_LEGACY_KEY)
    }
  } catch {
    // ignore migration errors
  }
}

migrateViewHistory()

export type ViewHistoryItem = Entry & {
  viewedAt: string
}

export type EntryClickParams = {
  entry: Entry
  referrer: string
  userAgent: string
}

export async function recordEntryClick(params: EntryClickParams): Promise<void> {
  // Record click to API (fire and forget, don't block on failure)
  metricsRepository
    .recordClick({
      entry_id: params.entry.id,
      referrer: params.referrer,
      user_agent: params.userAgent,
    })
    .catch((error) => {
      console.debug('Failed to record click:', error)
    })

  // Save to view history in localStorage
  saveToViewHistory(params.entry)
}

function saveToViewHistory(entry: Entry): void {
  try {
    const viewHistory = getViewHistory()
    const now = new Date().toISOString()

    // 同一URLは閲覧日時を更新
    const filtered = viewHistory.filter((item) => item.url !== entry.url)
    const newItem: ViewHistoryItem = { ...entry, viewedAt: now }
    filtered.unshift(newItem)

    localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(filtered.slice(0, VIEW_HISTORY_MAX_SIZE)))
  } catch (error) {
    console.debug('Failed to save view history:', error)
  }
}

export function getViewHistory(): ViewHistoryItem[] {
  try {
    const items = JSON.parse(localStorage.getItem(VIEW_HISTORY_KEY) || '[]') as ViewHistoryItem[]
    return items.filter((item) => typeof item.viewedAt === 'string' && item.viewedAt !== '')
  } catch {
    return []
  }
}

export function removeViewHistoryItem(url: string): ViewHistoryItem[] {
  try {
    const viewHistory = getViewHistory()
    const updated = viewHistory.filter((item) => item.url !== url)
    localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

export function clearViewHistory(): void {
  try {
    localStorage.removeItem(VIEW_HISTORY_KEY)
  } catch (error) {
    console.debug('Failed to clear view history:', error)
  }
}
