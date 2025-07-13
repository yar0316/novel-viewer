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

- **HTML5**: セマンティックなマークアップ
- **CSS3**: レスポンシブデザイン
- **JavaScript**: バニラJavaScript
- **Alpine.js**: リアクティブなUI構築
- **PicoCSS**: モダンなCSSフレームワーク

### バックエンド

- **API**: Supabase Auto-generated RESTful API（カスタム開発不要）
- **データベース**: Supabase PostgreSQL
- **API認証**: Supabase匿名キー（読み取り専用）
- **ユーザー認証**: なし（ログイン機能なし）

### インフラ構成（Vercel + Supabase）

- **ホスティング**: Vercel（静的サイト + 自動デプロイ）
- **データベース**: Supabase（PostgreSQL + Auto-generated API）
- **API**: Supabase RESTful API（自動生成）
- **認証**: API認証（匿名キー使用）+ Basic認証（サイトアクセス制限）
- **デプロイ**: GitHub連携による自動デプロイ
- **環境変数**: Vercel-Supabaseインテグレーション + Basic認証設定
- **監視**: Vercel Analytics + Supabase Dashboard
- **IaC**: 不要（マネージドサービス活用）

### アーキテクチャ

- **SPA風設計**: シングルページアプリケーション的な体験
- **スマホファースト**: モバイル優先のレスポンシブデザイン
- **コンポーネント指向**: 再利用可能なコンポーネント設計

## ディレクトリ構造

```
novel-viewer/
├── docs/                    # プロジェクト文書
│   ├── general.md          # 総合ガイド
│   ├── overview.md         # プロジェクト概要（このファイル）
│   └── prompts/            # AI用指示書
├── frontend/               # フロントエンドソース
│   ├── src/                # HTMLファイル
│   │   ├── index.html      # 小説一覧画面
│   │   ├── novel-detail.html # 小説詳細画面
│   │   └── episode.html    # 話閲覧画面
│   └── assets/             # 静的リソース
│       ├── css/
│       │   └── style.css   # カスタムスタイル
│       └── js/             # JavaScriptファイル
│           ├── app.js      # 小説一覧機能
│           ├── novel-detail.js # 小説詳細機能
│           └── episode.js  # 話閲覧機能
├── wireframe/              # ワイヤーフレーム
│   ├── index.html          # 一覧画面ワイヤーフレーム
│   ├── novel-detail.html   # 詳細画面ワイヤーフレーム
│   ├── chapter.html        # 閲覧画面ワイヤーフレーム
│   └── style.css           # ワイヤーフレーム用スタイル
└── playwright.config.json # テスト設定
```

## データ構造

### 小説オブジェクト

```javascript
{
  id: number,           // 小説ID
  title: string,        // タイトル
  summary: string,      // 概要
  author: string,       // 作者名
  updatedAt: string,    // 更新日 (YYYY/MM/DD)
  episodes: number      // 話数
}
```

### 話オブジェクト

```javascript
{
  id: number,           // 話ID
  title: string,        // 話タイトル
  postDate: string,     // 投稿日 (YYYY/MM/DD)
  content: [            // 本文（段落配列）
    {
      id: number,       // 段落ID
      text: string      // 段落テキスト
    }
  ]
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

- ✅ 3画面の基本レイアウト
- ✅ PicoCSSベースのスタイリング
- ✅ Alpine.jsによるリアクティブUI
- ✅ サンプルデータでの動作確認
- ✅ レスポンシブデザイン

### 今後の実装予定

- 📋 実際のデータ連携
- 📋 ローカルストレージ対応
- 📋 ブックマーク機能
- 📋 読書進捗管理
- 📋 ダークモード対応
- 📋 PWA対応

## 開発ガイドライン

### コーディング規約

- **HTML**: セマンティックなタグ使用
- **CSS**: PicoCSS変数の活用
- **JavaScript**: ES6+記法、Alpine.js準拠
- **命名**: ケバブケース（HTML/CSS）、キャメルケース（JavaScript）

### ファイル命名規則

- **HTML**: 機能名.html（例：episode.html）
- **CSS**: 用途-詳細.css（例：style.css）
- **JavaScript**: 機能名.js（例：episode.js）

### git運用

- 機能単位でコミット
- わかりやすいコミットメッセージ
- 作業前にドキュメント確認

---

**最終更新**: 2025-07-13  
**作成者**: AI協働開発  
**バージョン**: 1.0.0
