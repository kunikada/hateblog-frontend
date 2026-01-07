export function Footer() {
  return (
    <footer className="bg-card border-t mt-12">
      <div className="container mx-auto py-6">
        <p className="text-center text-sm text-muted-foreground">
          © 2011{' '}
          <a
            href="https://twitter.com/_hateblog/"
            title="はてブログ on Twitter"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            hateblog
          </a>{' '}
          Powered by{' '}
          <a
            href="https://b.hatena.ne.jp/"
            title="はてなブックマーク"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            はてなブックマーク
          </a>{' '}
          <span className="whitespace-nowrap">
            /{' '}
            <a
              href="https://developer.yahoo.co.jp/sitemap/"
              title="Web Services by Yahoo! JAPAN"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Web Services by Yahoo! JAPAN
            </a>
          </span>
        </p>
      </div>
    </footer>
  )
}
