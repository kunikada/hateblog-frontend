import { Link } from '@tanstack/react-router'
import { PanelRight, Search } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { MobileSidebar } from './mobile-sidebar'

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('検索:', searchQuery)
      // TODO: 検索機能の実装
    }
  }

  return (
    <>
      <header className="bg-card shadow-sm">
        <div className="container mx-auto py-3 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center">
                <img src="/logo.svg" alt="Hateblog" className="h-8" />
              </Link>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Search Form (PC) */}
              <div className="hidden md:block relative">
                <input
                  type="search"
                  placeholder="キーワード検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  className="w-64 px-4 py-2 pr-10 rounded-lg border bg-background focus:ring-2 focus:ring-hatebu-500 focus:border-transparent"
                />
                <Search
                  className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={handleSearch}
                />
              </div>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelRight className="h-6 w-6" />
                <span className="sr-only">サイドバーを開く</span>
              </Button>
            </div>
          </div>

          {/* Search Form (Mobile) */}
          <div className="md:hidden mt-3 relative">
            <input
              type="search"
              placeholder="キーワード検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="w-full px-4 py-2 pr-10 rounded-lg border bg-background"
            />
            <Search
              className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              onClick={handleSearch}
            />
          </div>
        </div>
      </header>

      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  )
}
