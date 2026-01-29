import { http, HttpResponse, delay } from 'msw'
import type { components } from '@/api/openapi'

type Entry = components['schemas']['Entry']
type EntryListResponse = components['schemas']['EntryListResponse']
type MetricsResponse = components['schemas']['MetricsResponse']
type ApiKeyResponse = components['schemas']['ApiKeyResponse']
type TrendingTagsResponse = components['schemas']['TrendingTagsResponse']
type ClickedTagsResponse = components['schemas']['ClickedTagsResponse']

function generateMockEntry(index: number, date: string): Entry {
  const domains = ['example.com', 'qiita.com', 'zenn.dev', 'note.com', 'dev.to']
  const tags = [
    ['React', 'JavaScript', 'Web開発'],
    ['TypeScript', 'プログラミング', '型安全'],
    ['Next.js', 'React', 'フロントエンド'],
    ['TailwindCSS', 'CSS', 'デザインシステム'],
    ['Go', 'バックエンド', 'API'],
    ['Rust', 'システムプログラミング', '高速化'],
    ['Python', '機械学習', 'データサイエンス'],
    ['Docker', 'インフラ', 'コンテナ'],
  ]
  const titles = [
    'React 19の新機能: Server Componentsとは何か',
    'TypeScriptの型安全性を極める: 実践的なテクニック集',
    'Next.js App Routerで作るモダンなWebアプリケーション',
    'TailwindCSSのベストプラクティス: 保守性の高いスタイル設計',
    'Viteで始める高速フロントエンド開発環境',
    'TanStack Queryによる効率的なデータフェッチング',
    'Go言語で作るマイクロサービスアーキテクチャ',
    'Rustで始めるシステムプログラミング入門',
  ]

  const domain = domains[index % domains.length]
  const tagSet = tags[index % tags.length]
  const title = titles[index % titles.length]

  // Parse date from YYYYMMDD format
  const year = date.slice(0, 4)
  const month = date.slice(4, 6)
  const day = date.slice(6, 8)
  const postedAt = new Date(
    `${year}-${month}-${day}T${String(10 + (index % 12)).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00Z`,
  )

  return {
    id: `entry-${date}-${index}`,
    title: `${title} #${index + 1}`,
    url: `https://${domain}/article/${date}-${index}`,
    posted_at: postedAt.toISOString(),
    bookmark_count: Math.floor(Math.random() * 2000) + 5,
    excerpt: `これは${title}に関する記事の抜粋です。実践的なテクニックとベストプラクティスを紹介します。`,
    subject: 'テクノロジー',
    tags: tagSet.map((name, i) => ({
      tag_id: `tag-${i}`,
      tag_name: name,
      score: 90 - i * 10,
    })),
    favicon_url: `/api/v1/favicons?domain=${domain}`,
    created_at: postedAt.toISOString(),
    updated_at: postedAt.toISOString(),
  }
}

function generateMockEntries(date: string, minUsers: number, count: number): Entry[] {
  const entries: Entry[] = []
  for (let i = 0; i < count; i++) {
    const entry = generateMockEntry(i, date)
    if (entry.bookmark_count >= minUsers) {
      entries.push(entry)
    }
  }
  return entries
}

export const handlers = [
  // GET /api/v1/entries/new
  http.get('/api/v1/entries/new', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const date = url.searchParams.get('date') || '20250123'
    const minUsers = Number(url.searchParams.get('min_users')) || 5
    const limit = Number(url.searchParams.get('limit')) || 100
    const offset = Number(url.searchParams.get('offset')) || 0

    const allEntries = generateMockEntries(date, minUsers, 200)
    // Sort by posted_at DESC (newest first)
    const sortedEntries = allEntries.sort(
      (a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime(),
    )
    const entries = sortedEntries.slice(offset, offset + limit)

    const response: EntryListResponse = {
      entries,
      total: allEntries.length,
      limit,
      offset,
    }

    return HttpResponse.json(response)
  }),

  // GET /api/v1/entries/hot
  http.get('/api/v1/entries/hot', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const date = url.searchParams.get('date') || '20250123'
    const minUsers = Number(url.searchParams.get('min_users')) || 5
    const limit = Number(url.searchParams.get('limit')) || 100
    const offset = Number(url.searchParams.get('offset')) || 0

    const allEntries = generateMockEntries(date, minUsers, 200)
    // Sort by bookmark_count DESC (most popular first)
    const sortedEntries = allEntries.sort((a, b) => b.bookmark_count - a.bookmark_count)
    const entries = sortedEntries.slice(offset, offset + limit)

    const response: EntryListResponse = {
      entries,
      total: allEntries.length,
      limit,
      offset,
    }

    return HttpResponse.json(response)
  }),

  // POST /api/v1/metrics/clicks
  http.post('/api/v1/metrics/clicks', async () => {
    await delay(100)

    const response: MetricsResponse = {
      success: true,
      message: 'Click recorded successfully',
    }

    return HttpResponse.json(response, { status: 201 })
  }),

  // GET /api/v1/favicons
  http.get('/api/v1/favicons', async ({ request }) => {
    const url = new URL(request.url)
    const domain = url.searchParams.get('domain') || 'example.com'

    // Redirect to Google's favicon service
    return HttpResponse.redirect(`https://www.google.com/s2/favicons?domain=${domain}&sz=32`, 302)
  }),

  // POST /api/v1/api-keys
  http.post('/api/v1/api-keys', async () => {
    await delay(100)

    const response: ApiKeyResponse = {
      id: crypto.randomUUID(),
      key: `hb_mock_${crypto.randomUUID().replace(/-/g, '')}`,
      created_at: new Date().toISOString(),
    }

    return HttpResponse.json(response, { status: 201 })
  }),

  // GET /api/v1/tags/trending
  http.get('/api/v1/tags/trending', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit')) || 20

    const tagNames = [
      'React', 'TypeScript', 'JavaScript', 'Go', 'Python',
      'Rust', 'Docker', 'AWS', 'AI', '機械学習',
      'Web開発', 'フロントエンド', 'バックエンド', 'インフラ', 'セキュリティ',
      'データベース', 'API', 'マイクロサービス', 'CI/CD', 'テスト',
    ]

    const tags = tagNames.slice(0, limit).map((name, i) => ({
      id: `trending-tag-${i}`,
      name,
      occurrence_count: Math.floor(Math.random() * 100) + 10,
      entry_count: Math.floor(Math.random() * 5000) + 100,
    }))

    const response: TrendingTagsResponse = {
      tags,
      hours: 48,
      total: tags.length,
    }

    return HttpResponse.json(response)
  }),

  // GET /api/v1/tags/clicked
  http.get('/api/v1/tags/clicked', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit')) || 20

    const tagNames = [
      'プログラミング', 'エンジニア', 'キャリア', '転職', '副業',
      'ChatGPT', 'LLM', '生成AI', 'OpenAI', 'Claude',
      'Next.js', 'Vite', 'TailwindCSS', 'shadcn/ui', 'Radix',
      'PostgreSQL', 'Redis', 'GraphQL', 'REST', 'gRPC',
    ]

    const tags = tagNames.slice(0, limit).map((name, i) => ({
      id: `clicked-tag-${i}`,
      name,
      click_count: Math.floor(Math.random() * 500) + 50,
      entry_count: Math.floor(Math.random() * 3000) + 100,
    }))

    const response: ClickedTagsResponse = {
      tags,
      days: 30,
      total: tags.length,
    }

    return HttpResponse.json(response)
  }),
]
