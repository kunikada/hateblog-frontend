import { createFileRoute } from '@tanstack/react-router'
import { TagPage } from '@/components/page/tag-page'
import { mockEntries } from '@/mocks/entries'

export const Route = createFileRoute('/tags/$tag')({
  component: TagEntries,
})

function TagEntries() {
  const { tag } = Route.useParams()
  const decodedTag = decodeURIComponent(tag)

  // Filter entries by tag
  const tagFilteredEntries = mockEntries.filter((entry) => entry.tags.includes(decodedTag))

  return <TagPage tag={decodedTag} entries={tagFilteredEntries} />
}
