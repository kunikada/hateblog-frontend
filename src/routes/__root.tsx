import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppLayout } from '@/components/layout/app-layout'
import { NotFoundPage } from '@/components/page/not-found-page'

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <AppLayout>
        <Outlet />
      </AppLayout>
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: NotFoundPage,
})
