import { Footer } from './footer'
import { GlobalNav } from './global-nav'
import { Header } from './header'

type AppLayoutProps = {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <GlobalNav />
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">{children}</main>
      <Footer />
    </div>
  )
}
