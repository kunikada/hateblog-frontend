# 閲覧履歴

## 画面概要
- **画面名**: 閲覧履歴
- **URL**: `/history`
- **目的**: ユーザーの閲覧履歴を表示（localStorageベース）

### URL例
- `/history`

## レイアウト構成

### ページヘッダー
- タイトル: "閲覧履歴"
- すべて削除するボタン

### メインコンテンツ
- 日付
- 日付に該当するエントリーカードリスト
- これを繰り返す
- 閲覧日時の降順表示

## エントリーカード構成
- 基本は [docs/screens/03_entries_new.md](docs/screens/03_entries_new.md) と同一
- 追加: 右上に削除ボタン

## データ管理（localStorage）

### データ構造
- エントリーのデータ構造に、閲覧日時を加える

### 追加・削除ポリシー
- クリックで追加、同一URLは閲覧日時を更新、最大1000件でtruncate
- 個別削除
- 全体削除

## API連携
- なし（localStorageのみ）

## インタラクション

### 履歴削除
1. すべて削除する、またはカード右上の×
2. クリックで即削除（確認なし）

### エントリーカード
- クリック計測・遷移は [docs/screens/03_entries_new.md](docs/screens/03_entries_new.md) と同一

### 無限スクロール
- 初期表示: 最初のentriesPerPage件を読み込み
- スクロールでロードトリガーに到達するとentriesPerPage件追加読み込み
- 読み込み中はスケルトン表示

## 状態管理

### localStorage
- `viewHistory`: 閲覧履歴配列
