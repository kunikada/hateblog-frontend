# 画面一覧

## 概要
hateblogフロントエンドの画面設計書一覧です。各画面の詳細設計は個別のファイルを参照してください。

## 画面一覧

| No | 画面名 | パス | 設計書 | 説明 |
|----|--------|------|--------|------|
| 1 | トップページ | `/` | [01_top.md](./01_top.md) | サイトのトップページ。検索フォームとナビゲーションを提供 |
| 2 | 新着順エントリー一覧 | `/entries/new` | [02_entries_new.md](./02_entries_new.md) | 新着順のエントリー一覧を表示 |
| 3 | 人気順エントリー一覧 | `/entries/hot` | [03_entries_hot.md](./03_entries_hot.md) | 人気順（ブックマーク件数順）のエントリー一覧を表示 |
| 4 | アーカイブ（年選択） | `/archive` | [04_archive_year.md](./04_archive_year.md) | 年単位のアーカイブ一覧を表示 |
| 5 | アーカイブ（月選択） | `/archive/:year` | [05_archive_month.md](./05_archive_month.md) | 指定年の月別アーカイブを表示 |
| 6 | アーカイブ（日選択） | `/archive/:year/:month` | [06_archive_day.md](./06_archive_day.md) | 指定年月の日別アーカイブを表示 |
| 7 | 年次ランキング | `/rankings/:year` | [07_ranking_yearly.md](./07_ranking_yearly.md) | 年次「はてブ・オブ・ザ・イヤー」ランキング |
| 8 | 月次ランキング | `/rankings/:year/:month` | [08_ranking_monthly.md](./08_ranking_monthly.md) | 月間ランキングTOP 100 |
| 9 | 週次ランキング | `/rankings/:year/week/:week` | [09_ranking_weekly.md](./09_ranking_weekly.md) | 週間ランキングTOP 100 |
| 10 | タグ別エントリー一覧 | `/tags/:tag` | [10_tag_entries.md](./10_tag_entries.md) | 指定タグに関連するエントリー一覧 |
| 11 | 検索結果 | `/search` | [11_search.md](./11_search.md) | キーワード検索結果を表示 |
| 12 | 閲覧履歴 | `/history` | [12_history.md](./12_history.md) | ユーザーの閲覧履歴を表示（localStorageベース） |

## 共通要素

### レイアウト
- ヘッダー（ロゴ、グローバルナビゲーション、検索フォーム）
- フッター（コピーライト、リンク）
- ダークモード対応

### グローバルナビゲーション
- 新着
- 人気
- アーカイブ
- ランキング
- 閲覧履歴

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

## 技術スタック（想定）
- フレームワーク: React / Next.js / Vue.js など
- スタイリング: Tailwind CSS / CSS Modules など
- 状態管理: Context API / Zustand / Recoil など
- API通信: Axios / Fetch API
- ルーティング: React Router / Next.js Router など

## デザインガイドライン
- カラー: Hatebuブルー + モノクロベース
- レスポンシブ対応: PC 2列 / SP 1列
- カード型UI
- ダークモード対応
