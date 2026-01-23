import { metricsRepository } from '@/infra/repositories/metrics'

const VIEW_HISTORY_KEY = 'viewHistory'
const VIEW_HISTORY_MAX_SIZE = 100

export type EntryClickParams = {
  entryId: string
  entryUrl: string
  referrer: string
  userAgent: string
}

export async function recordEntryClick(params: EntryClickParams): Promise<void> {
  // Record click to API (fire and forget, don't block on failure)
  metricsRepository
    .recordClick({
      entry_id: params.entryId,
      referrer: params.referrer,
      user_agent: params.userAgent,
    })
    .catch((error) => {
      console.debug('Failed to record click:', error)
    })

  // Save to view history in localStorage
  saveToViewHistory(params.entryId)
}

function saveToViewHistory(entryId: string): void {
  try {
    const viewHistory = JSON.parse(localStorage.getItem(VIEW_HISTORY_KEY) || '[]') as string[]
    if (!viewHistory.includes(entryId)) {
      viewHistory.unshift(entryId)
      localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(viewHistory.slice(0, VIEW_HISTORY_MAX_SIZE)))
    }
  } catch (error) {
    console.debug('Failed to save view history:', error)
  }
}

export function getViewHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(VIEW_HISTORY_KEY) || '[]') as string[]
  } catch {
    return []
  }
}
