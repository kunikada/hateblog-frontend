import { createFileRoute } from '@tanstack/react-router'
import { SearchPage } from '@/components/page/search-page'

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

  return <SearchPage query={q} />
}
