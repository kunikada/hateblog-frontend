import { createFileRoute } from '@tanstack/react-router'
import { SearchPage } from '@/components/page/search-page'

type SearchParams = {
  q?: string
}

export const Route = createFileRoute('/search')({
  head: ({ match }) => {
    const keyword = match.search.q?.trim()
    return {
      meta: [{ title: keyword ? `${keyword}の検索結果 | はてブログ` : '検索 | はてブログ' }],
    }
  },
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
