export function Sidebar() {
  const popularTags = [
    'JavaScript',
    'Python',
    'React',
    'AI',
    '機械学習',
    '設計',
    'AWS',
    'Docker',
    'セキュリティ',
    'データベース',
  ]

  const weeklyRanking = [
    { rank: 1, title: 'GPT-5発表 - AIの新時代が始まる', color: 'bg-warning-500' },
    { rank: 2, title: 'TypeScript 5.4の新機能完全ガイド', color: 'bg-gray-400' },
    { rank: 3, title: '初心者のためのDocker完全入門', color: 'bg-hot-500' },
    { rank: 4, title: 'パフォーマンス改善テクニック集', color: 'bg-gray-300' },
    { rank: 5, title: 'Reactのベストプラクティス2024', color: 'bg-gray-300' },
  ]

  return (
    <aside className="hidden lg:block w-80">
      {/* Popular Tags */}
      <div className="bg-card rounded-lg shadow-md p-5 mb-6">
        <h3 className="text-lg font-bold mb-4">人気のタグ</h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-hatebu-500 hover:text-white transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Ranking */}
      <div className="bg-card rounded-lg shadow-md p-5">
        <h3 className="text-lg font-bold mb-4">週間ランキング</h3>
        <ol className="space-y-3">
          {weeklyRanking.map((item) => (
            <li key={item.rank} className="flex gap-3">
              <span
                className={`shrink-0 w-6 h-6 ${item.color} ${item.rank <= 3 ? 'text-white' : 'text-foreground'} rounded-full flex items-center justify-center text-sm font-bold`}
              >
                {item.rank}
              </span>
              <button
                type="button"
                className="text-sm hover:text-hatebu-500 line-clamp-2 text-left"
              >
                {item.title}
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="block mt-4 text-sm text-hatebu-500 hover:underline text-center w-full"
        >
          もっと見る →
        </button>
      </div>
    </aside>
  )
}
