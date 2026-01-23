import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@/components/theme-provider'
import { routeTree } from './routeTree.gen'
import './index.css'

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Create a new router instance
const router = createRouter({
  routeTree,
  onError: (error) => {
    console.error('[Router] Global error:', error)
  },
})

// Log route changes
router.subscribe('onLoad', (event) => {
  console.debug('[Router] Route loaded:', event.toLocation.pathname)
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

async function enableMocking() {
  const { config } = await import('@/lib/config')
  if (config.msw.enabled) {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}

enableMocking().then(() => {
  const rootElement = document.getElementById('root')
  if (rootElement && !rootElement.innerHTML) {
    const root = createRoot(rootElement)
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="hateblog-ui-theme">
            <RouterProvider router={router} />
          </ThemeProvider>
        </QueryClientProvider>
      </StrictMode>,
    )
  }
})
