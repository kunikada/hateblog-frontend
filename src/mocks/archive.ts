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

// Generate mock archive data for 2024
export const mockArchive2024: ArchiveYear = {
  year: 2024,
  totalEntries: 36500,
  months: [
    {
      month: '2024-12',
      totalEntries: 3200,
      days: generateDaysForMonth(2024, 12, 80, 120),
    },
    {
      month: '2024-11',
      totalEntries: 3100,
      days: generateDaysForMonth(2024, 11, 85, 115),
    },
    {
      month: '2024-10',
      totalEntries: 3150,
      days: generateDaysForMonth(2024, 10, 90, 110),
    },
    {
      month: '2024-09',
      totalEntries: 3000,
      days: generateDaysForMonth(2024, 9, 85, 105),
    },
    {
      month: '2024-08',
      totalEntries: 2950,
      days: generateDaysForMonth(2024, 8, 80, 100),
    },
    {
      month: '2024-07',
      totalEntries: 3100,
      days: generateDaysForMonth(2024, 7, 90, 110),
    },
    {
      month: '2024-06',
      totalEntries: 3050,
      days: generateDaysForMonth(2024, 6, 85, 115),
    },
    {
      month: '2024-05',
      totalEntries: 3200,
      days: generateDaysForMonth(2024, 5, 95, 120),
    },
    {
      month: '2024-04',
      totalEntries: 3150,
      days: generateDaysForMonth(2024, 4, 90, 115),
    },
    {
      month: '2024-03',
      totalEntries: 3100,
      days: generateDaysForMonth(2024, 3, 85, 110),
    },
    {
      month: '2024-02',
      totalEntries: 2900,
      days: generateDaysForMonth(2024, 2, 85, 110),
    },
    {
      month: '2024-01',
      totalEntries: 3100,
      days: generateDaysForMonth(2024, 1, 90, 110),
    },
  ],
}

export const mockArchive2023: ArchiveYear = {
  year: 2023,
  totalEntries: 35800,
  months: [
    {
      month: '2023-12',
      totalEntries: 3100,
      days: generateDaysForMonth(2023, 12, 85, 115),
    },
    {
      month: '2023-11',
      totalEntries: 3000,
      days: generateDaysForMonth(2023, 11, 80, 110),
    },
    // ... other months
  ],
}

export const mockArchives: ArchiveYear[] = [mockArchive2024, mockArchive2023]

// Helper function to generate days for a month
function generateDaysForMonth(
  year: number,
  month: number,
  minEntries: number,
  maxEntries: number,
): ArchiveDay[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const days: ArchiveDay[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const entryCount = Math.floor(Math.random() * (maxEntries - minEntries + 1)) + minEntries
    days.push({ date, entryCount })
  }

  return days
}

// Get archive for a specific year
export function getArchiveByYear(year: number): ArchiveYear | undefined {
  return mockArchives.find((archive) => archive.year === year)
}

// Get all available years
export function getAvailableYears(): number[] {
  return mockArchives.map((archive) => archive.year).sort((a, b) => b - a)
}
