# 閲覧履歴

## 画面概要
- **画面名**: 閲覧履歴
- **URL**: `/history/:date`
- **URLパラメータ**:
  - `date`: 表示する日付（yyyy-MM-dd形式、例: `2024-12-15`）
- **目的**: ユーザーの閲覧履歴を日付単位で表示（localStorageベース、ログインなし）

## レイアウト構成

### ページヘッダー
- ページタイトル: "yyyy年MM月dd日 の閲覧履歴"（日付は動的に表示）
- エントリー件数: "N件の履歴"

### 日付ナビゲーション
- DateNavigationコンポーネント（前日/翌日リンク）
- 本日より未来の日付は選択不可（翌日ボタンがdisabled）

### メインコンテンツ
- 閲覧履歴エントリーカードリスト
  - 閲覧時刻表示（HH:mm形式、例: "14:30"）
  - 個別削除ボタン（×アイコン）
  - Infinite scroll対応
  - データなし: "この日の閲覧履歴はありません"

## エントリーカード構成

新着順エントリー一覧と同じ。詳細は [03_entries_new.md](./03_entries_new.md) を参照。

### 特記事項（閲覧履歴専用）
- 閲覧時刻表示を追加
  - 時刻のみ表示（HH:mm形式、例: "14:30"）
  - エントリーカードの右上に配置
- 削除ボタン
  - 個別エントリーの削除ボタン（×アイコン）
  - ホバー時に表示

## データ管理（localStorage）

### 閲覧履歴データ構造
```javascript
// localStorage key: 'viewHistory'
[
  {
    entry_id: "uuid",
    title: "記事タイトル",
    url: "https://example.com/article",
    bookmark_count: 150,
    tags: ["Go", "プログラミング"],
    favicon_url: "...",
    viewed_at: "2025-01-05T14:30:00Z"
  },
  // ...
]
```

### 閲覧履歴の追加
エントリーカードクリック時:
```javascript
function addToViewHistory(entry) {
  const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');

  // 重複チェック（同じURLがあれば削除）
  const filtered = history.filter(item => item.url !== entry.url);

  // 新しい履歴を先頭に追加
  filtered.unshift({
    entry_id: entry.id,
    title: entry.title,
    url: entry.url,
    bookmark_count: entry.bookmark_count,
    tags: entry.tags.map(t => t.tag_name),
    favicon_url: entry.favicon_url,
    viewed_at: new Date().toISOString()
  });

  // 最大保存件数を制限（例: 1000件）
  const limited = filtered.slice(0, 1000);

  localStorage.setItem('viewHistory', JSON.stringify(limited));
}
```

### 閲覧履歴の削除
```javascript
// 全削除
function clearAllHistory() {
  localStorage.removeItem('viewHistory');
}

// 個別削除
function removeFromHistory(entryId) {
  const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
  const filtered = history.filter(item => item.entry_id !== entryId);
  localStorage.setItem('viewHistory', JSON.stringify(filtered));
}

// 期間指定削除
function clearHistoryByPeriod(days) {
  const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const filtered = history.filter(item => {
    return new Date(item.viewed_at) > cutoffDate;
  });

  localStorage.setItem('viewHistory', JSON.stringify(filtered));
}
```

## API連携

閲覧履歴はlocalStorageベースのため、APIは使用しない。

ただし、エントリー情報の最新化が必要な場合:
- エントリーIDからエントリー詳細を取得するAPIを検討（将来的な拡張）

## インタラクション

### 日付ナビゲーション
1. 前日/翌日ボタンをクリック
2. 選択した日付の履歴を表示
3. 本日より未来の日付は選択不可

### 履歴削除（個別）
1. エントリーカードの削除ボタン（×）をホバー時に表示
2. クリックで確認なしで即座に削除
3. リストから削除

### エントリーカードクリック
新着順エントリー一覧と同じ。詳細は [03_entries_new.md](./03_entries_new.md) を参照。

### Infinite Scroll
1. ページ下部までスクロール
2. 自動的に次のエントリーを読み込み
3. すべて表示後に「すべての履歴を表示しました」メッセージを表示

## 状態管理

### ローカルステート
- 閲覧履歴データ（historyData）
  - localStorageから読み込み
- 表示する日付（date）
  - URLパラメータから取得
- 表示中のエントリー（displayedEntries）
  - Infinite scroll用
- ローディング状態（isLoading）
- さらに読み込み可能か（hasMore）

### localStorage
- `viewHistory`: 閲覧履歴配列

## デザインガイドライン

### 日付ナビゲーション
- DateNavigationコンポーネントを使用
- 前日/翌日ボタンで日付を切り替え

### 削除ボタン
- 個別削除ボタン: グレーの×アイコン、ホバー時に赤（destructive color）
- ホバー時のみ表示（opacity-0 → opacity-100）

### 閲覧時刻表示
- フォントサイズ: 12px（text-xs）
- カラー: text-muted-foreground
- 位置: エントリーカードの右上
- 背景: background/80（半透明）

### エントリーカード
新着順エントリー一覧と同じ。詳細は [03_entries_new.md](./03_entries_new.md) を参照。

## アクセシビリティ

- 削除ボタン: `aria-label="削除"`, `title="削除"`
- DateNavigationコンポーネントのアクセシビリティ対応
- キーボードナビゲーション対応

## パフォーマンス

- 初期表示: 1秒以内（localStorageから読み込み）
- Infinite scroll: IntersectionObserverでパフォーマンス最適化
- 日付単位でフィルタリングして表示量を削減

## エラーハンドリング

### localStorageエラー
- localStorageが無効な場合: "閲覧履歴機能を使用するにはCookieを有効にしてください"
- 容量超過: 古い履歴を自動削除

### データなし
- "この日の閲覧履歴はありません"

## テスト観点

### 表示テスト
- [ ] ページタイトルに日付が表示される
- [ ] エントリー件数が表示される
- [ ] DateNavigationが表示される
- [ ] 閲覧履歴エントリーカードが表示される
- [ ] 閲覧時刻が表示される（HH:mm形式）
- [ ] データなし時に適切なメッセージが表示される
- [ ] サイドバーが表示される（PC）
- [ ] ScrollToTopButtonが表示される

### 機能テスト
- [ ] 日付ナビゲーションが動作する（前日/翌日）
- [ ] 本日より未来の日付が選択できない
- [ ] 個別削除が動作する
- [ ] Infinite scrollが動作する
- [ ] エントリー閲覧時にlocalStorageに保存される
- [ ] 重複エントリーが正しく処理される
- [ ] 最大保存件数制限が機能する
- [ ] 日付単位でフィルタリングされる

### レスポンシブテスト
- [ ] PC表示でサイドバーが表示される
- [ ] モバイル表示でサイドバーが非表示になる

### パフォーマンステスト
- [ ] 初期表示が1秒以内
- [ ] Infinite scrollがスムーズに動作する

### プライバシーテスト
- [ ] localStorageのみで動作し、サーバーに送信しない
- [ ] ブラウザ間で履歴が共有されない

## 備考
- 閲覧履歴はlocalStorageベースで実装し、ログイン不要
- 日付単位で表示することで、ユーザーが特定の日の閲覧履歴を確認しやすくする
- DateNavigationで前日/翌日に簡単に移動可能
- 将来的にログイン機能を追加する場合、サーバー側での履歴管理も検討
- ブラウザのプライベートモードでは履歴が保存されないことをユーザーに通知
