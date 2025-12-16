# hateblog-frontend

はてなブックマークのエントリーを閲覧・検索できるWebアプリケーションのフロントエンドです。

## 主な機能

- 新着・人気エントリーの一覧表示
- アーカイブ（年/月/日）とランキング（年/月/週）
- キーワード検索・タグ別一覧
- はてブ数によるフィルタリング
- 閲覧履歴（ローカル保存）

## 技術スタック

- React 19 + Vite
- TanStack Router + TanStack Query
- Tailwind CSS
- OpenAPI Generator（API型生成）

## セットアップ

```bash
pnpm install
```

## 開発

```bash
# 開発サーバーを起動
pnpm dev

# Lint
pnpm run lint

# Format
pnpm run format

# 型チェック
pnpm run typecheck

# テスト
pnpm run test
```

## ビルド

```bash
pnpm build
```

## プロジェクト構成

```
hateblog-frontend/
├── src/
│   ├── routes/           # TanStack Routerのルート定義
│   ├── lib/              # ユーティリティ関数
│   ├── main.tsx          # エントリーポイント
│   └── index.css         # グローバルCSS（Tailwind）
├── .github/workflows/    # GitHub Actions CI/CD
├── biome.json            # Biome設定
├── tailwind.config.ts    # Tailwind CSS設定
├── tsconfig.json         # TypeScript設定
└── vite.config.ts        # Vite設定
```
