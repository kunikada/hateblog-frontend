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
| 10 | 閲覧履歴 | `/history/:date` | [10_history.md](./10_history.md) | ユーザーの閲覧履歴を日付単位で表示（localStorageベース） |
| 11 | 404エラーページ | - | [11_not_found.md](./11_not_found.md) | 存在しないページにアクセスした際のエラー画面 |

## 共通要素

### レイアウト
- ヘッダー（ロゴ、グローバルナビゲーション、検索フォーム）
- フッター（コピーライト、リンク）
- サイドバー

### グローバルナビゲーション
各リンクのURLはシステム時刻に基づいて動的に生成されます。

- 本日の人気エントリー → `/entries/{今日の日付}/hot`
- 本日の新着エントリー → `/entries/{今日の日付}/new`
- アーカイブ → `/archive`
- 先週のランキング → `/rankings/{該当年}/week/{先週の週番号}`
- 今月のランキング → `/rankings/{該当年}/{今月}`
- 閲覧履歴 → `/history/{履歴の最新の日付}`
- 検索 → `/search/{検索キーワード}`
- ライトモード/ダークモード

### サイドバー
- 新着エントリー
  - 15分単位で更新
- 人気のタグ
- 1年前のエントリー
- 注目のタグ

## API連携

### 新着エントリー
```
GET /api/v1/entries/new?date={YYYYMMDD}&limit=5
```

#### リクエストパラメータ
- `date`: 対象日付（YYYYMMDD形式）
  - 本日の日付、なかったら前日の日付で再取得
- `limit`: 5

#### レスポンス
openapi.yamlを参照

### 人気のタグ
```
GET /api/v1/tags/trending?hours=48&limit=10
```

#### リクエストパラメータ
- `hours`: 集計対象時間
- `limit`: 取得件数

#### レスポンス
openapi.yamlを参照

### 1年前のエントリー
```
GET /api/v1/entries/hot?date={YYYYMMDD}&limit=5
```

#### リクエストパラメータ
- `date`: 対象日付（YYYYMMDD形式）
  - 1年前の日付
- `limit`: 5

#### レスポンス
openapi.yamlを参照

### 注目のタグ
```
GET /api/v1/tags/clicked?days=30&limit=10
```

#### リクエストパラメータ
- `days`: 集計対象日数
- `limit`: 取得件数

#### レスポンス
openapi.yamlを参照
