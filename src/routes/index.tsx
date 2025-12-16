import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600">Hateblog Frontend</h1>
      <p className="mt-4 text-gray-600">
        はてなブックマークのエントリーを閲覧・検索できるWebアプリケーション
      </p>
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h2 className="text-xl font-semibold mb-2">Phase A-0 セットアップ完了</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Vite + React 19</li>
          <li>TanStack Router</li>
          <li>Tailwind CSS</li>
          <li>TypeScript</li>
        </ul>
      </div>
    </div>
  )
}
