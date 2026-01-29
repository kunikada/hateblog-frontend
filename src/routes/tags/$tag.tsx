import { createFileRoute } from '@tanstack/react-router'
import { TagPage } from '@/components/page/tag-page'

export const Route = createFileRoute('/tags/$tag')({
  component: TagEntries,
})

function TagEntries() {
  const { tag } = Route.useParams()
  const decodedTag = decodeURIComponent(tag)

  return <TagPage tag={decodedTag} />
}
