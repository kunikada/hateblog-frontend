import { createFileRoute } from '@tanstack/react-router'
import { TagPage } from '@/components/page/tag-page'

export const Route = createFileRoute('/tags/$tag')({
  head: ({ params }) => {
    const decodedTag = decodeURIComponent(params.tag)
    return {
      meta: [{ title: `${decodedTag}のタグ | はてブログ` }],
    }
  },
  component: TagEntries,
})

function TagEntries() {
  const { tag } = Route.useParams()
  const decodedTag = decodeURIComponent(tag)

  return <TagPage tag={decodedTag} />
}
