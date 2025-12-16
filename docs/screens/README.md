# 画面一覧

## 概要
hateblogフロントエンドの画面設計書一覧です。各画面の詳細設計は個別のファイルを参照してください。

## 画面一覧

| No | 画面名 | パス | 設計書 | 説明 |
|----|--------|------|--------|------|
| 1 | トップページ | `/` | [02_entries_hot.md](./02_entries_hot.md) | 人気順エントリー一覧と同じ内容。SSG化対応（詳細は[top-page-ssg-strategy.md](../top-page-ssg-strategy.md)参照） |
| 2 | 人気順エントリー一覧 | `/entries/:date/hot` | [02_entries_hot.md](./02_entries_hot.md) | 指定日付の人気順エントリー一覧（例: `/entries/today/hot`, `/entries/year-ago/hot`, `/entries/20240115/hot`） |
| 3 | 新着順エントリー一覧 | `/entries/:date/new` | [03_entries_new.md](./03_entries_new.md) | 指定日付の新着順エントリー一覧（例: `/entries/today/new`, `/entries/20240115/new`） |
| 4 | 年次ランキング | `/rankings/:year` | [04_ranking_yearly.md](./04_ranking_yearly.md) | 年次「はてブ・オブ・ザ・イヤー」ランキング（例: `/rankings/2024`） |
| 5 | 月次ランキング | `/rankings/:year/:month` | [05_ranking_monthly.md](./05_ranking_monthly.md) | 月間ランキングTOP 100（例: `/rankings/2024/12`） |
| 6 | 週次ランキング | `/rankings/:year/week/:week` | [06_ranking_weekly.md](./06_ranking_weekly.md) | 週間ランキングTOP 100（例: `/rankings/2024/week/50`） |
| 7 | アーカイブ | `/archive` | [07_archive.md](./07_archive.md) | 日別のエントリー件数を1ページで全表示 |
| 8 | タグ別エントリー一覧 | `/tags/:tag` | [08_tag_entries.md](./08_tag_entries.md) | 指定タグに関連するエントリー一覧 |
| 9 | 検索結果 | `/search/:search` | [09_search.md](./09_search.md) | キーワード検索結果を表示（GETベース） |
| 10 | 閲覧履歴 | `/history` | [10_history.md](./10_history.md) | ユーザーの閲覧履歴を表示（localStorageベース） |

## 共通要素

### レイアウト
- ヘッダー（ロゴ、グローバルナビゲーション、検索フォーム）
- フッター（コピーライト、リンク）
- サイドバー／タグセクション（表示中の画面で頻出するタグを表示）
- ダークモード対応

### グローバルナビゲーション
各リンクのURLはシステム時刻に基づいて動的に生成されます。

- 本日の人気エントリー → `/entries/{今日の日付}/hot`
- 本日の新着エントリー → `/entries/{今日の日付}/new`
- 1年前の人気エントリー → `/entries/{1年前の日付}/hot`
- 先週のランキング → `/rankings/{該当年}/week/{先週の週番号}`
- 今月のランキング → `/rankings/{該当年}/{今月}`
- アーカイブ → `/archive`
- 閲覧履歴 → `/history`

例（2024年12月15日の場合）:
- `/entries/20241215/hot`
- `/entries/20241215/new`
- `/entries/20231215/hot`
- `/rankings/2024/week/49`
- `/rankings/2024/12`

### エントリーカード共通要素
- タイトル
- 投稿日時
- はてなブックマーク件数
- ブックマーク追加リンク
- 共有アクション（Twitter、Facebook、Pocket、Instapaper、Evernote）
- タグ一覧
- 記事抜粋
- 続きを読むリンク
- Favicon表示
- クリック計測

### フィルタ機能
- はてなブックマーク件数閾値（5/10/50/100/500/1000 users）

## 技術スタック
- フレームワーク: React（Next.jsは使用しない）
- UI コンポーネント: shadcn/ui
- スタイリング: Tailwind CSS
- データフェッチ: TanStack Query
- ルーティング: TanStack Router
- API通信: Axios / Fetch API（OpenAPIクライアント生成ライブラリに依存）
- トップページ: SSG化対応（詳細は[top-page-ssg-strategy.md](../top-page-ssg-strategy.md)参照）

## デザインガイドライン
- カラー: Hatebuブルー + モノクロベース
- レスポンシブ対応
  - PC: リスト型表示
  - タブレット: 2列カード表示
  - スマホ: 1列カード表示
- ダークモード対応
