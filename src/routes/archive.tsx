import { createFileRoute } from '@tanstack/react-router'
import { ArchivePage } from '@/components/page/archive-page'

export const Route = createFileRoute('/archive')({
  head: () => ({
    meta: [{ title: 'アーカイブ | はてブログ' }],
  }),
  component: ArchivePage,
})
