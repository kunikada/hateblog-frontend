import { archiveRepository } from '@/infra/repositories/archive'
import type { ArchiveItem } from '@/repositories/archive'

export type { ArchiveItem }

export type FetchArchiveParams = {
  minUsers?: number
}

export type ArchiveDay = {
  date: string // YYYY-MM-DD
  entryCount: number
}

export type ArchiveMonth = {
  month: string // YYYY-MM
  totalEntries: number
  days: ArchiveDay[]
}

export type ArchiveYear = {
  year: number
  totalEntries: number
  months: ArchiveMonth[]
}

export type ArchiveResult = {
  items: ArchiveItem[]
  latestDate: string | null
  years: ArchiveYear[]
}

function convertToArchiveYears(items: ArchiveItem[]): ArchiveYear[] {
  const yearMap = new Map<number, Map<string, ArchiveDay[]>>()

  for (const item of items) {
    const [yearStr, monthStr] = item.date.split('-')
    const year = Number.parseInt(yearStr, 10)
    const monthKey = `${yearStr}-${monthStr}`

    let monthMap = yearMap.get(year)
    if (!monthMap) {
      monthMap = new Map()
      yearMap.set(year, monthMap)
    }

    let days = monthMap.get(monthKey)
    if (!days) {
      days = []
      monthMap.set(monthKey, days)
    }
    days.push({
      date: item.date,
      entryCount: item.count,
    })
  }

  const years: ArchiveYear[] = []
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a)

  for (const year of sortedYears) {
    const monthMap = yearMap.get(year)
    if (!monthMap) continue

    const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a))

    const months: ArchiveMonth[] = sortedMonths.map((monthKey) => {
      const days = monthMap.get(monthKey) ?? []
      const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date))
      const totalEntries = sortedDays.reduce((sum, day) => sum + day.entryCount, 0)
      return {
        month: monthKey,
        totalEntries,
        days: sortedDays,
      }
    })

    const totalEntries = months.reduce((sum, month) => sum + month.totalEntries, 0)
    years.push({
      year,
      totalEntries,
      months,
    })
  }

  return years
}

async function fetchArchive(params?: FetchArchiveParams): Promise<ArchiveResult> {
  console.debug('[fetchArchive] Calling repository', params)
  const response = await archiveRepository.getArchive({
    minUsers: params?.minUsers,
  })
  console.debug('[fetchArchive] Response received', {
    count: response.items.length,
  })

  const latestDate = response.items.length > 0 ? response.items[0].date : null
  const years = convertToArchiveYears(response.items)

  return {
    items: response.items,
    latestDate,
    years,
  }
}

export const archiveQueryOptions = {
  staleTime: 1000 * 60 * 5, // 5分

  keys: {
    all: ['archive'] as const,
    byParams: (params?: FetchArchiveParams) => [...archiveQueryOptions.keys.all, params] as const,
  },

  get: (params?: FetchArchiveParams) => ({
    queryKey: archiveQueryOptions.keys.byParams(params),
    queryFn: () => fetchArchive(params),
    staleTime: archiveQueryOptions.staleTime,
  }),
}
