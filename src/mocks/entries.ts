import type { Entry } from '@/repositories/entries'

export const mockEntries: Entry[] = [
  {
    id: '1',
    title: 'React 19の新機能: Server Componentsとは何か',
    url: 'https://example.com/react-19-server-components',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 1234,
    timestamp: new Date().toISOString(),
    tags: [
      { name: 'React', score: 1.0 },
      { name: 'JavaScript', score: 0.8 },
      { name: 'Web開発', score: 0.6 },
    ],
    excerpt:
      'React 19で導入されるServer Componentsについて詳しく解説します。従来のクライアントサイドレンダリングとの違いや、パフォーマンス向上のメカニズムを理解しましょう。',
  },
  {
    id: '2',
    title: 'TypeScriptの型安全性を極める: 実践的なテクニック集',
    url: 'https://example.com/typescript-type-safety',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 987,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    tags: [
      { name: 'TypeScript', score: 1.0 },
      { name: 'プログラミング', score: 0.8 },
      { name: '型安全', score: 0.6 },
    ],
    excerpt:
      'TypeScriptの型システムを最大限に活用するための実践的なテクニックを紹介します。Utility Typesの活用法から、高度な型推論まで幅広くカバーします。',
  },
  {
    id: '3',
    title: 'Next.js App Routerで作るモダンなWebアプリケーション',
    url: 'https://example.com/nextjs-app-router',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 856,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    tags: [
      { name: 'Next.js', score: 1.0 },
      { name: 'React', score: 0.8 },
      { name: 'フロントエンド', score: 0.6 },
    ],
    excerpt:
      'Next.js 13で導入されたApp Routerを使った実践的なWebアプリケーション開発について解説します。ファイルベースのルーティングから、レイアウトの活用まで。',
  },
  {
    id: '4',
    title: 'TailwindCSSのベストプラクティス: 保守性の高いスタイル設計',
    url: 'https://example.com/tailwind-best-practices',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 654,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    tags: [
      { name: 'TailwindCSS', score: 1.0 },
      { name: 'CSS', score: 0.8 },
      { name: 'デザインシステム', score: 0.6 },
    ],
    excerpt:
      'TailwindCSSを使ったプロジェクトで保守性を高めるためのベストプラクティスを紹介します。コンポーネント化の手法やカスタマイズのポイントを解説。',
  },
  {
    id: '5',
    title: 'Viteで始める高速フロントエンド開発環境',
    url: 'https://example.com/vite-fast-development',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 543,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    tags: [
      { name: 'Vite', score: 1.0 },
      { name: 'ビルドツール', score: 0.8 },
      { name: '開発環境', score: 0.6 },
    ],
    excerpt:
      'Viteを使った高速な開発環境の構築方法を解説します。Hot Module Replacementの仕組みから、プロダクションビルドの最適化まで。',
  },
  {
    id: '6',
    title: 'TanStack Queryによる効率的なデータフェッチング',
    url: 'https://example.com/tanstack-query-data-fetching',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 432,
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    tags: [
      { name: 'TanStack Query', score: 1.0 },
      { name: 'データフェッチ', score: 0.8 },
      { name: '状態管理', score: 0.6 },
    ],
    excerpt:
      'TanStack Query（旧React Query）を使った効率的なデータフェッチングとキャッシング戦略について解説します。サーバーステートの管理をシンプルに。',
  },
  {
    id: '7',
    title: 'shadcn/uiで構築する美しいUIコンポーネント',
    url: 'https://example.com/shadcn-ui-components',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 321,
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    tags: [
      { name: 'shadcn/ui', score: 1.0 },
      { name: 'UIコンポーネント', score: 0.8 },
      { name: 'デザイン', score: 0.6 },
    ],
    excerpt:
      'shadcn/uiを使った美しく機能的なUIコンポーネントの構築方法を紹介します。カスタマイズ可能で、アクセシビリティにも配慮した設計。',
  },
  {
    id: '8',
    title: 'Biomeで統一するコード品質管理: ESLintとPrettierの代替',
    url: 'https://example.com/biome-code-quality',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 234,
    timestamp: new Date(Date.now() - 25200000).toISOString(),
    tags: [
      { name: 'Biome', score: 1.0 },
      { name: 'リンター', score: 0.8 },
      { name: 'フォーマッター', score: 0.6 },
    ],
    excerpt:
      'Biomeによるコードリンティングとフォーマッティングのベストプラクティスを解説します。高速で統一されたコード品質管理を実現。',
  },
  {
    id: '9',
    title: 'TanStack Routerで実現する型安全なルーティング',
    url: 'https://example.com/tanstack-router-type-safe',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 198,
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    tags: [
      { name: 'TanStack Router', score: 1.0 },
      { name: 'ルーティング', score: 0.8 },
      { name: '型安全', score: 0.6 },
    ],
    excerpt:
      'TanStack Routerを使った型安全なルーティングの実装方法を紹介します。ファイルベースのルーティングと完全な型推論を活用。',
  },
  {
    id: '10',
    title: 'Vitestで始めるモダンなユニットテスト',
    url: 'https://example.com/vitest-unit-testing',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 156,
    timestamp: new Date(Date.now() - 32400000).toISOString(),
    tags: [
      { name: 'Vitest', score: 1.0 },
      { name: 'テスト', score: 0.8 },
      { name: 'ユニットテスト', score: 0.6 },
    ],
    excerpt:
      'Vitestを使ったユニットテストの書き方と、テスト駆動開発のベストプラクティスを解説します。Viteとの統合で高速なテスト実行を実現。',
  },
]

// Filter entries by bookmark count threshold
export function filterEntriesByBookmarkCount<T extends Entry>(
  entries: T[],
  threshold: number | null,
): T[] {
  if (threshold === null) return entries
  return entries.filter((entry) => entry.bookmarkCount >= threshold)
}
