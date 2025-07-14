# Vercel + Supabase セットアップガイド

## 概要

このドキュメントは、Web小説閲覧サイトをVercel + Supabaseでデプロイするためのセットアップ手順を説明します。

## 1. Vercelセットアップ

### 1.1 Vercelアカウント作成

1. [Vercel](https://vercel.com)でアカウントを作成
2. GitHubアカウントと連携

### 1.2 プロジェクト作成

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
3. Build Settings:
   - Framework Preset: `Other`
   - Root Directory: `frontend`
   - Build Command: （空白のまま）
   - Output Directory: `src`

### 1.3 Basic認証設定

1. Vercelプロジェクトの Settings > Environment Variables
2. 以下の環境変数を追加:

   ```
   BASIC_AUTH_USER=your_username
   BASIC_AUTH_PASSWORD=your_password
   ```

3. デプロイ完了後、サイト全体にBasic認証が適用されます

## 2. Supabaseセットアップ

### 2.1 Supabaseプロジェクト作成

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. データベースパスワードを設定

### 2.2 テーブル設計

```sql
-- 小説テーブル
CREATE TABLE novels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  author VARCHAR(100),
  updated_at TIMESTAMP DEFAULT NOW(),
  episodes INTEGER DEFAULT 0,
  genre VARCHAR(50),
  tags TEXT[]
);

-- 話テーブル
CREATE TABLE episodes (
  id SERIAL PRIMARY KEY,
  novel_id INTEGER REFERENCES novels(id),
  title VARCHAR(255) NOT NULL,
  post_date DATE DEFAULT CURRENT_DATE,
  content JSONB
);
```

### 2.3 Row Level Security (RLS) 設定

```sql
-- 読み取り専用アクセスを許可
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view novels" ON novels FOR SELECT USING (true);
CREATE POLICY "Anyone can view episodes" ON episodes FOR SELECT USING (true);
```

## 3. Vercel-Supabaseインテグレーション

### 3.1 インテグレーション追加

1. Vercel Marketplace → Supabaseインテグレーションを検索
2. 対象プロジェクトを選択してインストール
3. Supabaseプロジェクトと連携

### 3.2 自動設定される環境変数

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 4. フロントエンド修正

### 4.1 Supabase JavaScript Client

```javascript
// 既存のfetch()をSupabase APIに変更
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';

async function loadNovels() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/novels`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  });
  const novels = await response.json();
  return novels;
}
```

## 5. デプロイフロー

1. GitHubにpush
2. Vercelが自動ビルド・デプロイ
3. Basic認証でアクセス制限
4. Supabase APIからデータ取得

## 6. 本番運用

### 6.1 ドメイン設定

- Vercelダッシュボードでカスタムドメインを設定可能

### 6.2 アクセス解析

- Vercel Analytics（無料プランでも利用可能）
- Supabase Dashboard でデータベースアクセス状況確認

### 6.3 バックアップ

- Supabaseは自動バックアップ機能あり
- GitHubリポジトリがソースコードのバックアップ

---

**注意事項**:

- Basic認証の環境変数は本番環境のみ設定
- 開発環境では認証なしでアクセス可能
- Supabase匿名キーは公開されても安全（読み取り専用）
