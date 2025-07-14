# Web小説閲覧サイト - プロジェクト概要

## プロジェクト概要

Web小説の閲覧に特化したシンプルなWebアプリケーションです。スマートフォンファーストで設計され、読みやすさを重視したユーザーインターフェースを提供します。

## 主要機能

### 1. 小説一覧画面 (`index.html`)

- 小説の一覧表示
- タイトル検索機能
- 各小説の概要、更新日、話数を表示
- 小説詳細画面への遷移

### 2. 小説詳細画面 (`novel-detail.html`)

- 小説の詳細情報表示（タイトル、作者、概要）
- 目次（話一覧）の表示
- 各話への遷移機能

### 3. 話閲覧画面 (`episode.html`)

- 話の本文表示
- 読みやすいフォントサイズと行間
- 前後の話への移動機能
- 目次への戻るボタン

## 技術スタック

### フロントエンド

- **Next.js 15**: React 19 + App Router + Turbopack高速化
- **shadcn/ui**: LLMフレンドリーなUIコンポーネントシステム
- **Tailwind CSS v4**: 新エンジンによる高速ビルド + @themeディレクティブ
- **TypeScript**: 型安全な開発体験
- **React Server Components**: SSR/SSG最適化

### バックエンド

- **API**: Supabase Auto-generated RESTful API + TypeScript SDK連携
- **データベース**: Supabase PostgreSQL + 自動型生成
- **セキュリティ**: RLS（Row Level Security）+ 読み取り専用API
- **型安全性**: Supabase CLI による TypeScript 型の自動生成

### インフラ構成（Vercel + Supabase）

- **ホスティング**: Vercel（Next.js 15最適化 + Edge Functions）
- **データベース**: Supabase（PostgreSQL + TypeScript型生成）
- **API**: Supabase RESTful API（自動生成）+ RLS セキュリティ
- **認証**: Next.js Middleware による環境別Basic認証
- **デプロイ**: GitHub連携による自動デプロイ + Vercel-Supabaseインテグレーション
- **環境変数**: Vercel最新の環境変数管理システム
- **監視**: Vercel Analytics + Supabase Dashboard
- **開発体験**: Turbopack + TypeScript + shadcn/ui

### アーキテクチャ

- **App Router**: Next.js 15のファイルベースルーティング + React Server Components
- **Component-First**: shadcn/ui + Atomic Design による統一されたデザインシステム
- **Type-Safe**: Supabase → TypeScript 型生成による型安全なAPI連携
- **LLM-Friendly**: コンポーネント分割とJSDocによるAI協働開発最適化
- **Edge-Optimized**: Vercel Edge Functions + Middleware活用

## ディレクトリ構造

```
novel-viewer/
├── docs/                    # プロジェクト文書
│   ├── general.md          # 総合ガイド（AI協働原則含む）
│   ├── overview.md         # プロジェクト概要（このファイル）
│   └── prompts/            # AI用指示書
├── frontend/               # Next.js 15アプリケーション
│   ├── app/                # App Router
│   │   ├── layout.tsx      # ルートレイアウト
│   │   ├── page.tsx        # 小説一覧画面
│   │   ├── novel/[id]/     # 小説詳細画面（動的ルーティング）
│   │   └── chapter/[id]/   # 章閲覧画面（動的ルーティング）
│   ├── components/         # コンポーネント
│   │   ├── ui/            # shadcn/ui基本コンポーネント
│   │   └── custom/        # Atomic Designカスタムコンポーネント
│   ├── lib/               # ユーティリティ
│   │   ├── supabase.ts    # Supabase設定・型定義
│   │   └── utils.ts       # 共通関数
│   └── middleware.ts      # Basic認証ミドルウェア
├── wireframe/              # ワイヤーフレーム（参考用）
│   ├── index.html          # 一覧画面ワイヤーフレーム
│   ├── novel-detail.html   # 詳細画面ワイヤーフレーム
│   └── chapter.html        # 閲覧画面ワイヤーフレーム
└── playwright.config.json # テスト設定
```

## データ構造

### 小説オブジェクト（TypeScript型定義）

```typescript
interface Novel {
  id: number;           // 小説ID
  title: string;        // タイトル
  summary: string;      // 概要
  author: string;       // 作者名
  updated_at: string;   // 更新日 (ISO string)
  episodes: number;     // 話数
  genre?: string;       // ジャンル（オプション）
  tags?: string[];      // タグ配列（オプション）
}
```

### エピソードオブジェクト（TypeScript型定義）

```typescript
interface Episode {
  id: number;           // エピソードID
  novel_id: number;     // 所属小説ID
  title: string;        // エピソードタイトル
  post_date: string;    // 投稿日 (ISO string)
  content: Paragraph[]; // 本文（段落配列）
  order: number;        // 表示順序
}

interface Paragraph {
  id: number;           // 段落ID
  text: string;         // 段落テキスト
}
```

## 設計原則

### 1. スマホファースト

- モバイルデバイスでの閲覧体験を最優先
- タッチ操作に適したUI要素
- 縦スクロールベースのレイアウト

### 2. 読みやすさ重視

- 適切なフォントサイズ（1.1rem以上）
- 広い行間（1.8）
- 十分なコントラスト
- 目に優しい色合い

### 3. シンプルな機能

- 最小限の機能で構成
- 直感的な操作性
- 高速な動作

### 4. アクセシビリティ

- セマンティックなHTML
- キーボード操作対応
- スクリーンリーダー対応

## 現在の実装状況

### 完了済み

- ✅ 3画面の基本ワイヤーフレーム設計
- ✅ Next.js 15 + shadcn/ui + Tailwind CSS v4 技術選定
- ✅ Atomic Design ベースのコンポーネント設計
- ✅ TypeScript型定義とSupabase連携設計
- ✅ Gemini CLI協働による技術調査

### 今後の実装予定

- 📋 Next.js 15プロジェクト作成とshadcn/ui導入
- 📋 Atomic Designベースのコンポーネント実装
- 📋 Supabase API連携とRLS設定
- 📋 Vercel Basic認証ミドルウェア実装
- 📋 TypeScript型生成の自動化
- 📋 ダークモード対応（shadcn/ui）
- 📋 PWA対応（Next.js 15機能）

## 開発ガイドライン

### コーディング規約

- **TypeScript**: 厳密な型定義、Supabase自動生成型の活用
- **React**: React Server Components + App Router パターン
- **shadcn/ui**: コンポーネントの一貫した使用、カスタマイズ指針
- **Tailwind CSS v4**: @themeディレクティブ活用、レスポンシブファースト
- **命名**: PascalCase（コンポーネント）、camelCase（関数・変数）

### ファイル命名規則

- **コンポーネント**: NovelCard.tsx（PascalCase）
- **ページ**: page.tsx, layout.tsx（Next.js規則）
- **ユーティリティ**: supabase.ts, utils.ts（camelCase）
- **型定義**: types.ts, database.types.ts（camelCase）

### git運用

- 機能単位でコミット
- わかりやすいコミットメッセージ
- 作業前にドキュメント確認

---

**最終更新**: 2025-07-13  
**作成者**: AI協働開発  
**バージョン**: 1.0.0
