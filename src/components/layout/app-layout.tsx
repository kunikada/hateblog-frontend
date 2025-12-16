import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

type AppLayoutProps = {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="w-10 h-10 bg-[#00a4de] rounded-lg flex items-center justify-center text-white font-bold text-xl"
              >
                H
              </Link>
              <h1 className="text-2xl font-bold">Hateblog</h1>
            </div>

            {/* Search Form (PC) */}
            <div className="hidden md:block flex-1 max-w-md ml-8">
              <input
                type="search"
                placeholder="キーワード検索..."
                className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-[#00a4de] focus:border-transparent"
              />
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">メニュー</span>
              </Button>
            </div>
          </div>

          {/* Search Form (Mobile) */}
          <div className="md:hidden mt-3">
            <input
              type="search"
              placeholder="キーワード検索..."
              className="w-full px-4 py-2 rounded-lg border bg-background"
            />
          </div>
        </div>
      </header>

      {/* Global Navigation (Sticky) */}
      <nav className="bg-card shadow-md sticky top-0 z-40 border-t">
        <div className="container py-3">
          <ul className="flex flex-wrap gap-2 text-sm">
            <li>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-md bg-[#00a4de] text-white hover:bg-[#0070b8]"
              >
                本日の人気
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-md text-foreground/70 hover:bg-muted"
              >
                本日の新着
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-md text-foreground/70 hover:bg-muted"
              >
                1年前の人気
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-md text-foreground/70 hover:bg-muted"
              >
                先週のランキング
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-md text-foreground/70 hover:bg-muted"
              >
                今月のランキング
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-md text-foreground/70 hover:bg-muted"
              >
                アーカイブ
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="px-3 py-1.5 rounded-md text-foreground/70 hover:bg-muted"
              >
                閲覧履歴
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container py-6">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="container py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 Hateblog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
