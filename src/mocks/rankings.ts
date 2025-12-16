import type { Entry } from '@/components/entry/entry-card'

export type RankingEntry = Entry & {
  rank: number
}

export const mockYearlyRankings: RankingEntry[] = [
  {
    id: 'r1',
    rank: 1,
    title: '2024年最も注目された技術トレンド総まとめ',
    url: 'https://example.com/2024-tech-trends',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 5678,
    timestamp: '2024-12-15T00:00:00.000Z',
    tags: ['技術トレンド', '2024年', '総まとめ'],
    excerpt:
      '2024年のテクノロジー業界を振り返り、最も注目された技術トレンドを総括します。AIの進化、Webフレームワークの革新、そして新しい開発ツールまで。',
  },
  {
    id: 'r2',
    rank: 2,
    title: '大規模言語モデル（LLM）の実践的な活用方法',
    url: 'https://example.com/llm-practical-use',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 4321,
    timestamp: '2024-11-20T00:00:00.000Z',
    tags: ['LLM', 'AI', '機械学習'],
    excerpt:
      'ChatGPTやClaude、Geminiなどの大規模言語モデルを実務で活用するための実践的なテクニックとベストプラクティスを紹介します。',
  },
  {
    id: 'r3',
    rank: 3,
    title: 'Web開発者のためのパフォーマンス最適化完全ガイド',
    url: 'https://example.com/web-performance-guide',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 3456,
    timestamp: '2024-10-05T00:00:00.000Z',
    tags: ['パフォーマンス', '最適化', 'Web開発'],
    excerpt:
      'ページ速度を劇的に改善するための実践的なテクニックを解説します。Core Web Vitalsの最適化から、バンドルサイズの削減まで。',
  },
  {
    id: 'r4',
    rank: 4,
    title: 'Docker & Kubernetesで始めるコンテナ化入門',
    url: 'https://example.com/docker-kubernetes-intro',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 2987,
    timestamp: '2024-09-18T00:00:00.000Z',
    tags: ['Docker', 'Kubernetes', 'DevOps'],
    excerpt:
      'DockerとKubernetesを使ったコンテナベースの開発・デプロイ環境の構築方法を基礎から解説します。',
  },
  {
    id: 'r5',
    rank: 5,
    title: 'GraphQLで構築する柔軟なAPI設計',
    url: 'https://example.com/graphql-api-design',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 2543,
    timestamp: '2024-08-22T00:00:00.000Z',
    tags: ['GraphQL', 'API', 'バックエンド'],
    excerpt:
      'GraphQLを使った柔軟で効率的なAPI設計のベストプラクティスを紹介します。RESTとの比較や、実装のコツを解説。',
  },
  {
    id: 'r6',
    rank: 6,
    title: 'Rust入門: メモリ安全性と高パフォーマンスを両立',
    url: 'https://example.com/rust-introduction',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 2198,
    timestamp: '2024-07-14T00:00:00.000Z',
    tags: ['Rust', 'システムプログラミング', 'パフォーマンス'],
  },
  {
    id: 'r7',
    rank: 7,
    title: 'GitHub Actionsで実現するCI/CD自動化',
    url: 'https://example.com/github-actions-cicd',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 1876,
    timestamp: '2024-06-30T00:00:00.000Z',
    tags: ['GitHub Actions', 'CI/CD', '自動化'],
  },
  {
    id: 'r8',
    rank: 8,
    title: 'AWS Lambda & Serverlessアーキテクチャ設計',
    url: 'https://example.com/aws-lambda-serverless',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 1654,
    timestamp: '2024-05-25T00:00:00.000Z',
    tags: ['AWS', 'Serverless', 'Lambda'],
  },
  {
    id: 'r9',
    rank: 9,
    title: 'PostgreSQL vs MySQL: 2024年のデータベース選択ガイド',
    url: 'https://example.com/postgresql-vs-mysql-2024',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 1432,
    timestamp: '2024-04-18T00:00:00.000Z',
    tags: ['PostgreSQL', 'MySQL', 'データベース'],
  },
  {
    id: 'r10',
    rank: 10,
    title: 'セキュアなWebアプリケーション開発のベストプラクティス',
    url: 'https://example.com/secure-web-app-best-practices',
    domain: 'example.com',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    bookmarkCount: 1287,
    timestamp: '2024-03-12T00:00:00.000Z',
    tags: ['セキュリティ', 'Webアプリ', 'ベストプラクティス'],
  },
]

export const mockMonthlyRankings: RankingEntry[] = mockYearlyRankings.slice(0, 10)
export const mockWeeklyRankings: RankingEntry[] = mockYearlyRankings.slice(0, 10)
