# 閲覧履歴

## 画面概要
- **画面名**: 閲覧履歴
- **URL**: `/history/:date`
- **URLパラメータ**:
  - `date`: 表示日（yyyy-MM-dd、例: 2024-12-15）
- **目的**: ユーザーの閲覧履歴を日付単位で表示（localStorageベース）

### URL例
- `/history/2024-12-15`

## レイアウト構成

### ページヘッダー
- タイトル: "yyyy年MM月dd日の閲覧履歴"（動的）
- 件数表示: "N件の履歴"

### 日付ナビゲーション
- 前日/翌日リンク（未来日は無効）

### メインコンテンツ
- 閲覧履歴エントリーカードリスト
  - 閲覧時刻（HH:mm）
  - 個別削除ボタン（×）
  - Infinite Scroll
- データなし: "この日の閲覧履歴はありません"

## エントリーカード構成
- 基本は [docs/screens/03_entries_new.md](docs/screens/03_entries_new.md) と同一
- 追加: 右上に閲覧時刻、ホバー時に削除ボタン

## データ管理（localStorage）

### データ構造
```javascript
// key: viewHistory
[
  {
    entry_id: "uuid",
    title: "記事タイトル",
    url: "https://example.com/article",
    bookmark_count: 150,
    tags: ["Go", "プログラミング"],
    favicon_url: "...",
    viewed_at: "2025-01-05T14:30:00Z"
  }
]
```

### 追加・削除ポリシー
- クリックで先頭追加、同一URLは重複排除、最大1000件でtruncate
- 個別削除・全削除・期間削除（days指定）を提供

## API連携
- なし（localStorageのみ）。必要に応じてエントリー最新化APIを将来検討

## インタラクション

### 日付ナビゲーション
1. 前日/翌日ボタンで `date` を変更
2. 未来日は disable

### 履歴削除
1. カード右上の×をホバーで表示
2. クリックで即削除（確認なし）

### エントリーカード
- クリック計測・遷移は [docs/screens/03_entries_new.md](docs/screens/03_entries_new.md) と同一

### Infinite Scroll
1. 末尾到達で次の履歴を読み込み
2. 全件表示後は完了メッセージ

## 状態管理

### ローカルステート
- `date`: 表示日（URL起点）
- `historyData`: 全履歴（localStorage）
- `displayedEntries`: Infinite Scroll用スライス
- `isLoading`, `hasMore`

### localStorage
- `viewHistory`: 閲覧履歴配列

## デザインガイドライン
- 日付ナビ: 前/翌ボタンで明確な矢印、未来日は disabled スタイル
- 削除ボタン: グレー×、ホバーで赤に変化、opacity 0→100
- 閲覧時刻: 12px、text-muted-foreground、カード右上に半透明背景で配置
- カード本体は [docs/screens/03_entries_new.md](docs/screens/03_entries_new.md) と同一

## アクセシビリティ
- 削除ボタンに `aria-label="削除"` と `title="削除"`
- 日付ナビは `<nav aria-label="日付ナビゲーション">`
- キーボード操作で削除・遷移が可能

## パフォーマンス
- 初期表示1秒以内（localStorage読み込みのみ）
- IntersectionObserverで Infinite Scroll を最適化

## エラーハンドリング
- localStorage無効: "閲覧履歴機能を使用するにはCookieを有効にしてください"
- 容量超過: 古い履歴を自動削除して保存
- データなし: "この日の閲覧履歴はありません"

## テスト観点

### 表示
- [ ] 日付入りタイトルと件数が表示される
- [ ] DateNavigationが表示され未来日はdisableになる
- [ ] 閲覧時刻付きカードが表示される/空表示メッセージが出る

### 機能
- [ ] 前日/翌日遷移が正しく動く
- [ ] 個別削除が動作しリストが更新される
- [ ] Infinite Scrollで追加読み込みできる
- [ ] 保存上限・重複排除が機能する

### レスポンシブ
- [ ] PCでサイドバーあり、SPで非表示

### パフォーマンス/プライバシー
- [ ] 初期表示が1秒以内
- [ ] 履歴がlocalStorageのみでサーバー送信されない
