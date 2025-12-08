# hateblog フロントエンドアーキテクチャ

## 技術スタック概要
- **アプリ基盤**：TypeScript + React + Vite。`vite-tsconfig-paths` などでエイリアスを整備して開発体験とビルド速度を両立する。
- **ルーティング**：TanStack Router。リスト／詳細／タブ切替をルート単位でモデル化し、ロード時のデータ依存を `loader` で宣言する。
- **データフェッチ**：TanStack Query。API 応答のキャッシュ・再検証・並列フェッチを抽象化し、履歴などブラウザローカルデータとは責務を分離する。
- **UI/デザイン**：Tailwind CSS をユーティリティ層、shadcn/ui をアクセシブルな基礎コンポーネント層として共存させる。ダークモードは `class` トグルで切替。
- **API 型生成**：OpenAPI Generator (`@openapitools/openapi-generator-cli`) で TypeScript クライアントと型を生成し、通信処理を `api/clients` 配下へ集約する。
- **Lint/Format**：Biome を唯一の統合ツールとして採用し、`biome.json` でルールを集中管理する。
- **テスト**：Vitest + `@testing-library/react` を基本構成とし、TanStack Query のキャッシュ層はモックサーバーか MSW を利用して検証する。

## アプリケーション構成
- **ルート構造**：`/`（トップ＆新着）、`/popular`, `/archives/:year/:month?/:day?`, `/ranking/:year/:month?/:week?`, `/tags/:tag`, `/history`, `/search` を TanStack Router のフラットツリーで管理。SP/PC 切替はレイアウトコンポーネント側で調整。
- **レイアウト**：`AppLayout` がヘッダー・ナビ・テーマトグルを提供し、主要セクションは `PageHero`（導入情報）と `EntryListSection`（コンテンツ）に分割。
- **状態管理**：サーバーデータは TanStack Query、フィルタや UI 状態（閾値チップ、モーダル開閉など）は React コンポーネントローカルか `useReducer` で保持。閲覧履歴はラッパーフック `useBrowsingHistory` で localStorage と同期。
- **ローディング・エラー**：ルート `loader` で初期データをプリフェッチし、ページ内は `SkeletonList` と `RetryBoundary` を用意。クリック計測 API は `mutations` に乗せて失敗時はユーザー通知無しでロギングのみ。

## データ / API レイヤー
- `openapi.yaml` から `pnpm openapi:generate`（仮）で `src/api/gen` を更新。生成物は直接編集せず、`src/api/clients/*Client.ts` を薄いラッパーとして用意してクエリキーやモデル変換を記述する。
- TanStack Query のキーは `[resource, params]` 形式に統一し、アーカイブやランキングなど日付軸 API は `params` を正規化してキャッシュ衝突を防ぐ。
- エラーはレスポンスコードを判定して `AppError` 型にマッピングし、UI で表示文言と再試行可否を制御。計測系 API は失敗時でもアプリ動作を阻害しないよう `onError` で `console.debug` ログに留める。
- localStorage 履歴は `historyStore` モジュールに集約し、永続化フォーマット変更時のマイグレーションを `version` 付きで扱う。

## UI / スタイリング戦略
- Tailwind の `@layer components` でレイアウト系ユーティリティ（カードグリッド、レスポンシブガターなど）を定義し、shadcn/ui の Button / Tabs / Dialog などを再エクスポートしてデザインシステムを単一点管理。
- ダークモードは `ThemeProvider` が `data-theme` をルートに設定。モバイルではナビをシート表示、デスクトップでは水平タブを維持し、同じコンポーネントで振る舞いを制御する。
- アイコンやタグチップなど繰り返し要素は `ui/entry-card/*` として分割し、アクセシビリティ対応（`aria-label` など）を共通化する。

## 開発運用とツール
- **ディレクトリ例**：`src/app`（ルート、プロバイダ）、`src/features/*`（ドメイン別 UI + hooks）、`src/components/ui`（shadcn/ui 再エクスポート）、`src/lib`（ユーティリティ）、`src/api`（生成物＋ラッパー）、`src/tests`（テストヘルパー）。
- **Vite 設定**：`vite.config.ts` で React プラグイン、tsconfig パス、`define` による API ベース URL、`optimizeDeps` に shadcn/ui 由来の依存を追加。環境変数は `.env.*` を `import.meta.env` として利用。
- **Biome**：`pnpm biome check` と `biome format` を CI / pre-commit に設定し、ESLint + Prettier を置き換える。Tailwind 専用プラグインが不要なようにクラス並び順はデフォルトで許容する。
- **Vitest**：`vitest.config.ts` で `jsdom`、`setupTests.ts`（Testing Library、QueryClient のセットアップ）を読み込む。OpenAPI クライアントのテストは MSW で API をモックし、ルーターを跨ぐコンポーネントは `@tanstack/router-devtools/testing` を活用する。
- **ビルド/配布**：静的ホスティング前提で `pnpm build` → `dist/` をデプロイ。CI では型チェック (`tsc --noEmit`)、Biome、Vitest を直列実行して品質を担保する。
- **開発コンテナ**：VS Code DevContainer を前提とし、Node.js ベースのコンテナ（pnpm/必要な CLI 含む）でローカル開発を統一。OpenAPI Generator や Biome も同コンテナで実行して環境差異を抑える。
- **本番コンテナ**：ビルド済み `dist/` を Nginx イメージに COPY する 2 段階 Dockerfile（Node ベースでビルド → Nginx で配信）を用意し、ランタイムでは Nginx の静的配信のみに絞って軽量運用する。
