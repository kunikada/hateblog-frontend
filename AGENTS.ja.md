# 作業ルール

手戻りによる工数の増加を防ぐため、以下のルールに従って作業を進める
応答は必ず日本語とする

## ドキュメント

- 必要最低限の内容にする
- 1つのファイルは200から400行程度、最大でも500行に収める
- サンプルや事例を記載する必要があると判断したら事前確認する
- 要点をまとめた文章とサンプルや事例のファイルは別にする
- 記述する対象のファイルが正しいか、重複していないか確認する

## 実装

- 指示と違うことを行う場合は事前確認して同意を得る
- 設定や方針を変更する場合は事前確認して同意を得る
- 作業中に別の問題が見つかった場合は中止して事前確認する
- 作業中に作成した一時ファイルは必ず消す
- デバッグメッセージを追加するときはデバッグレベルで出力する
- データやタイプではなく機能やドメインを考慮してディレクトリやファイルを構成する
- 実装後にformat/lint/testなどのコマンドは実行しないで報告する

## ターミナル

- プロセスをkillするときは事前確認する

# アーキテクチャ

- **`ランタイム`**: TypeScript / pnpm
- **`ビルド`**: Vite v7
- **`UI`**: React v19 / Tailwind CSS v4 / shadcn/ui
- **`インフラ`**: TanStack Router / TanStack Query
- **`API`**: openapi-typescript
- **`テスト`**: Vitest / Biome / MSW

# ディレクトリ構造

- **`.devcontainer/`**: DevContainer（Docker + VS Code）用の開発環境定義  
- **`docs/`**: アーキテクチャや仕様などの設計ドキュメント置き場  
- **`public/`**: ビルド時にそのまま配信される静的ファイル  
- **`src/api/`**: OpenAPI型を使ったAPIクライアント定義・通信層 
- **`src/usecases/`**: 画面から呼ばれるアプリの操作手順（業務ロジック・副作用のオーケストレーション）
- **`src/components/layout/`**: ヘッダーやフッターなど画面共通レイアウト  
- **`src/components/page/`**: ルート単位で使われるページ専用コンポーネント  
- **`src/components/ui/`**: 再利用可能なUI部品  
- **`src/hooks/`**: React用の接着層（TanStack Query購読、フォーム/URL状態、UI都合のまとめ）
- **`src/infra/repositories/`**: Repositoryの具象実装（HTTP/OpenAPIクライアントやキャッシュ制御に依存する層）
- **`src/lib/`**: フレームワーク非依存の共通ユーティリティ  
- **`src/mocks/`**: MSW用のAPIモック定義
- **`src/repositories/`**: Repositoryのinterface/型定義（usecaseが依存する境界）  
- **`src/routes/`**: TanStack Routerのルート定義  
- **`src/index.css`**: Tailwind CSS v4のエントリCSS  
- **`src/main.tsx`**: Reactアプリケーションのエントリーポイント  
- **`biome.json`**: BiomeのLint・Format設定  
- **`components.json`**: shadcn/uiのコンポーネント生成設定  
- **`index.html`**: ViteのHTMLエントリーファイル  
- **`oepnapi.yaml`**: API仕様のOpenAPI定義（型生成の元）  
- **`package.json`**: 依存関係・スクリプト定義  
- **`tsconfig.json`**: フロントエンド用TypeScript設定  
- **`tsconfig.node.json`**: Node.js（Vite/テスト）用TypeScript設定  
- **`vite.config.ts`**: Viteのビルド・開発サーバー設定  
- **`vitest.config.ts`**: Vitestのテスト設定  
