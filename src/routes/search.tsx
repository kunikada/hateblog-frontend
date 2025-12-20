import { createFileRoute } from '@tanstack/react-router'
import { SearchPage } from '@/components/page/search-page'
import { mockEntries } from '@/mocks/entries'

type SearchParams = {
  q?: string
}

export const Route = createFileRoute('/search')({
  component: Search,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
    }
  },
})

function Search() {
  const { q } = Route.useSearch()

  // Filter entries by search query
  const keywords = q ? q.trim().split(/\s+/) : []
  const searchFilteredEntries =
    keywords.length > 0
      ? mockEntries.filter((entry) => {
          const searchText = `${entry.title} ${entry.excerpt || ''}`.toLowerCase()
          return keywords.some((keyword) => searchText.includes(keyword.toLowerCase()))
        })
      : []

  return <SearchPage query={q} entries={searchFilteredEntries} />
}
