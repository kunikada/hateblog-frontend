# 新着順エントリー一覧

## 画面概要
- **画面名**: 新着順エントリー一覧
- **URL**: `/entries/new`
- **URLパラメータ**:
  - `date`: 対象日付（YYYYMMDD形式、省略時は今日）
  - `min_users`: 最低ブックマーク件数フィルタ（デフォルト: 5）
  - `page`: ページ番号（デフォルト: 1）
- **目的**: 指定日付のエントリーを新着順（posted_at DESC）で表示

## レイアウト構成

### ページヘッダー
- ページタイトル: "新着エントリー"
- 対象日付表示: "2025年1月5日"
- 日付選択カレンダー
- 前日/翌日ナビゲーションボタン

### フィルタバー
- はてなブックマーク件数閾値チップ
  - 5 users / 10 users / 50 users / 100 users / 500 users / 1000 users
  - 複数選択可能（OR条件）
  - クリアボタン
- PC: 水平配置
- SP: 横スクロールチップ

### メインコンテンツ
- エントリーカードリスト
  - PC: 2列グリッド
  - SP: 1列リスト
- 読み込み中: スケルトンスクリーン表示

### ページネーション
- 前のページ / 次のページボタン
- ページ番号表示（現在ページ / 総ページ数）
- ページ数セレクタ

## エントリーカード構成

### 上部
- Favicon（左）+ ドメイン名
- 投稿日時（右）

### 中央
- タイトル（太字、リンク）
- 記事抜粋（100-200文字）

### 下部左
- タグ一覧（最大5個、横並び）
  - クリックでタグ別一覧ページへ遷移

### 下部右
- はてなブックマーク件数バッジ（アイコン + 件数）
- ブックマーク追加アイコン（はてなブックマークへのリンク）
- 共有アイコンバー（hover/tapで展開）
  - Twitter
  - Facebook
  - Pocket
  - Instapaper
  - Evernote

## API連携

### 初期表示
```
GET /api/v1/entries/new?date={YYYYMMDD}&min_users={number}&limit=25&offset=0
```

#### リクエストパラメータ
- `date`: 対象日付（YYYYMMDD形式）
- `min_users`: 最低ブックマーク件数（5/10/50/100/500/1000）
- `limit`: 取得件数（デフォルト: 25）
- `offset`: オフセット（ページネーション用）

#### レスポンス
```json
{
  "entries": [
    {
      "id": "uuid",
      "title": "記事タイトル",
      "url": "https://example.com/article",
      "posted_at": "2025-01-05T10:30:00Z",
      "bookmark_count": 150,
      "excerpt": "記事の抜粋...",
      "tags": [
        {
          "tag_id": "uuid",
          "tag_name": "Go",
          "score": 0.95
        }
      ],
      "favicon_url": "https://www.google.com/s2/favicons?domain=example.com"
    }
  ],
  "total": 500,
  "limit": 25,
  "offset": 0
}
```

### クリック計測
エントリーカードクリック時:
```
POST /api/v1/metrics/clicks
Content-Type: application/json

{
  "entry_id": "uuid",
  "referrer": "https://hateblog.jp/entries/new",
  "user_agent": "Mozilla/5.0..."
}
```

## インタラクション

### 日付選択
1. 日付選択カレンダーをクリック
2. カレンダーモーダル表示
3. 日付を選択
4. `/entries/new?date={YYYYMMDD}` に遷移

### 前日/翌日ナビゲーション
- 前日ボタン: 1日前の日付で再読み込み
- 翌日ボタン: 1日後の日付で再読み込み
- 未来日付の場合は翌日ボタンを無効化

### 閾値フィルタ選択
1. チップをクリック
2. 選択状態をトグル（ON/OFF）
3. URLパラメータ更新: `?min_users={number}`
4. API再リクエスト

### エントリーカードクリック
1. カード全体がクリック領域
2. クリック計測APIを呼び出し（非同期）
3. 元記事URLを新規タブで開く
4. 閲覧履歴をlocalStorageに保存

### タグクリック
- `/tags/{tag_name}` に遷移

### 共有アイコンクリック
- Twitter: `https://twitter.com/intent/tweet?url={encoded_url}&text={encoded_title}`
- Facebook: `https://www.facebook.com/sharer/sharer.php?u={encoded_url}`
- Pocket: `https://getpocket.com/edit?url={encoded_url}`
- Instapaper: `https://www.instapaper.com/text?u={encoded_url}`
- Evernote: `https://www.evernote.com/clip.action?url={encoded_url}`

### ページネーション
- 次のページボタン: `offset` を `limit` 分増やして再リクエスト
- 前のページボタン: `offset` を `limit` 分減らして再リクエスト

## 状態管理

### ローカルステート
- 選択日付（date）
- 選択閾値フィルタ（minUsers）
- 現在ページ（page）
- エントリーリスト（entries）
- 総件数（total）
- ローディング状態（isLoading）
- エラー状態（error）

### localStorage
- `viewHistory`: 閲覧履歴配列
  - `{ entry_id, title, url, viewed_at }`

## デザインガイドライン

### エントリーカード
- 背景: 白（ライト）/ ダークグレー（ダーク）
- ボーダー: 1px solid #DDD
- パディング: 16px
- ホバー時: 影を表示、カーソルをポインターに
- 角丸: 8px

### 閾値チップ
- 未選択: グレー背景、グレーテキスト
- 選択中: Hatebuブルー背景、白テキスト
- パディング: 8px 16px
- 角丸: 20px（pill型）

### ブックマーク件数バッジ
- アイコン: はてなブックマークアイコン
- テキスト: 件数表示
- カラー: Hatebuブルー

## アクセシビリティ

- エントリーカード: `role="article"`
- タグリンク: `aria-label="タグ: {tag_name}"`
- ページネーション: `aria-label="ページネーション"`
- 閾値チップ: `aria-pressed="true/false"`
- ローディング時: `aria-busy="true"`

## パフォーマンス

- 初期表示: 2秒以内
- Faviconの遅延読み込み
- 無限スクロール検討（将来）
- APIレスポンスキャッシュ（同一日付の場合）

## エラーハンドリング

### APIエラー
- 400 Bad Request: "日付形式が正しくありません"
- 500 Server Error: "サーバーエラーが発生しました。しばらくしてから再度お試しください。"
- エラーメッセージをトースト表示
- 再試行ボタン表示

### ネットワークエラー
- "ネットワークに接続できません"
- オフライン検知
- 再試行ボタン表示

### データなし
- "該当するエントリーがありません"
- フィルタ条件を緩和する提案表示

## テスト観点

### 表示テスト
- [ ] ページタイトルと日付が表示される
- [ ] 日付選択カレンダーが表示される
- [ ] 前日/翌日ボタンが表示される
- [ ] 閾値フィルタチップが表示される
- [ ] エントリーカードが表示される（25件）
- [ ] ページネーションが表示される

### 機能テスト
- [ ] 日付を変更するとエントリーが更新される
- [ ] 前日ボタンで前日のエントリーが表示される
- [ ] 翌日ボタンで翌日のエントリーが表示される
- [ ] 閾値フィルタを変更するとエントリーがフィルタされる
- [ ] エントリーカードクリックで元記事が新規タブで開く
- [ ] タグクリックでタグ別一覧ページに遷移する
- [ ] 共有アイコンクリックで共有URLが開く
- [ ] ページネーションが動作する

### レスポンシブテスト
- [ ] PC表示で2列グリッド
- [ ] SP表示で1列リスト
- [ ] 閾値フィルタが横スクロール可能（SP）

### パフォーマンステスト
- [ ] 初期表示が2秒以内
- [ ] スクロールがスムーズ
- [ ] ローディング中はスケルトンスクリーン表示
