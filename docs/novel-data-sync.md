# 小説データ自動同期システム

## 概要

このシステムでは、別のGitHubリポジトリに小説データをpushすると、GitHub Actionsが自動でSupabaseにデータを取り込みます。

## アーキテクチャ

```
小説データリポジトリ          メインアプリリポジトリ         Supabase
┌─────────────────┐         ┌─────────────────┐         ┌──────────┐
│ novels/         │ push    │ GitHub Actions  │ upsert  │ novels   │
│ ├─novel-a/      │ ──────→ │ sync-supabase   │ ──────→ │ episodes │
│ │ ├─info.yml    │         │                 │         │          │
│ │ ├─001.md      │         │                 │         │          │
│ │ └─002.md      │         │                 │         │          │
│ └─novel-b/      │         │                 │         │          │
└─────────────────┘         └─────────────────┘         └──────────┘
```

## セットアップ手順

### 1. 小説データリポジトリ側の設定

#### 1.1 ディレクトリ構造

```
novel-data-repo/
└── novels/
    ├── my-first-novel/
    │   ├── info.yml
    │   ├── 001.md
    │   └── 002.md
    └── another-story/
        ├── info.yml
        └── 001.md
```

#### 1.2 info.yml の形式

```yaml
id: "my-first-novel"
title: "僕の最初の小説"
author: "作者名"
description: "小説の概要をここに記述します。"
genre: "ファンタジー"
tags: ["異世界", "冒険"]
```

#### 1.3 エピソードファイル（*.md）の形式

```markdown
---
id: "mfn-ep001"
title: "第一話：始まり"
episode_number: 1
---

ここからが本文です。

Markdown形式で小説の内容を記述できます。

**太字**や*斜体*、リンクなども使用可能です。
```

#### 1.4 GitHub Actions設定

`.github/workflows/dispatch.yml` を作成：

```yaml
name: Notify Main App Repo

on:
  push:
    branches: [main]

jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync Workflow
        uses: peter-evans/repository-dispatch@v3
        with:
          token: ${{ secrets.DISPATCH_PAT }}
          repository: yar0316/novel-viewer  # メインアプリリポジトリ
          event-type: sync-novel-data
          client-payload: |
            {
              "data_repo": "${{ github.repository }}",
              "ref": "${{ github.ref }}",
              "sha": "${{ github.sha }}"
            }
```

#### 1.5 シークレット設定

小説データリポジトリの Settings → Secrets and variables → Actions で以下を設定：

- `DISPATCH_PAT`: メインアプリリポジトリのActionsを起動するためのPersonal Access Token

### 2. メインアプリリポジトリ側の設定

#### 2.1 Supabaseテーブル作成

```sql
-- 小説マスタテーブル
CREATE TABLE novels (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  genre TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- エピソードテーブル
CREATE TABLE episodes (
  id TEXT PRIMARY KEY,
  novel_id TEXT REFERENCES novels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  episode_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(novel_id, episode_number)
);

-- RLS（Row Level Security）設定
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシー
CREATE POLICY "Anyone can view novels" ON novels FOR SELECT USING (true);
CREATE POLICY "Anyone can view episodes" ON episodes FOR SELECT USING (true);
```

#### 2.2 シークレット設定

メインアプリリポジトリの Settings → Secrets and variables → Actions で以下を設定：

- `SUPABASE_URL`: SupabaseプロジェクトのURL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのservice_roleキー（書き込み権限）
- `DATA_REPO_PAT`: 小説データリポジトリを読み取るためのPersonal Access Token

### 3. Personal Access Token (PAT) の作成

#### 3.1 DISPATCH_PAT用

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 新しいトークンを作成
3. リポジトリ: メインアプリリポジトリを選択
4. 権限: Actions (write) を選択

#### 3.2 DATA_REPO_PAT用

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 新しいトークンを作成
3. リポジトリ: 小説データリポジトリを選択
4. 権限: Contents (read) を選択

## 動作フロー

1. **データ追加**: 小説データリポジトリに新しい小説やエピソードを追加
2. **Push**: `main`ブランチにpush
3. **通知**: 小説データリポジトリのGitHub Actionsが`repository_dispatch`イベントを送信
4. **同期開始**: メインアプリリポジトリでsync-supabaseワークフローが起動
5. **データ検証**: 小説データの構造を検証
6. **Supabase更新**: UPSERT処理でデータを同期
7. **完了通知**: 成功/失敗の結果をログ出力

## トラブルシューティング

### よくあるエラー

#### 1. "Missing required field 'id'" エラー
- `info.yml`または`*.md`ファイルの`id`フィールドが不足
- 各ファイルに一意のIDが設定されているか確認

#### 2. "Duplicate episode ID" エラー
- 同じ小説内で重複するエピソードIDが存在
- エピソードIDを一意になるよう修正

#### 3. GitHub Actions権限エラー
- PATの権限が不足している可能性
- 必要な権限（Actions write, Contents read）が設定されているか確認

#### 4. Supabase接続エラー
- `SUPABASE_URL`と`SUPABASE_SERVICE_ROLE_KEY`が正しく設定されているか確認
- Supabaseプロジェクトが稼働しているか確認

### ログの確認方法

1. GitHub → リポジトリ → Actions
2. 失敗したワークフローをクリック
3. 各ステップのログを確認してエラー原因を特定

## セキュリティ考慮事項

1. **最小権限の原則**: PATには必要最小限の権限のみを付与
2. **シークレットの管理**: 機密情報は必ずGitHub Secretsで管理
3. **public リポジトリ**: 小説データが公開される点を考慮してデータを管理
4. **バックアップ**: Supabaseの自動バックアップ機能を有効化

## 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase REST API](https://supabase.com/docs/guides/api)
- [Repository Dispatch Event](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#repository_dispatch)

---

**最終更新**: 2025-07-13