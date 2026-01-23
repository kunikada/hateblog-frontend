export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    key: import.meta.env.VITE_API_KEY || '',
    keyId: import.meta.env.VITE_API_KEY_ID || '',
  },
  msw: {
    enabled: import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true',
  },
  pagination: {
    entriesPerPage: Number(import.meta.env.VITE_ENTRIES_PER_PAGE) || 25,
  },
} as const
