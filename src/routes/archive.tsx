import { createFileRoute } from '@tanstack/react-router'
import { ArchivePage } from '@/components/page/archive-page'
import { mockArchives } from '@/mocks/archive'

export const Route = createFileRoute('/archive')({
  component: Archive,
})

function Archive() {
  return <ArchivePage archives={mockArchives} />
}
