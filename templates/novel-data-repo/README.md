# 小説データ管理リポジトリ

このリポジトリは、Web小説閲覧サイトで使用する小説データを管理するためのものです。

## 📁 ディレクトリ構造

```
novel-data-repo/
├── .github/workflows/
│   └── dispatch.yml          # 自動同期用GitHub Actions
├── 書名/                     # 小説ごとのディレクトリ（書名）
│   └── manuscript/           # 原稿ディレクトリ
│       ├── info.yml          # 小説の基本情報
│       ├── 001.md            # 第1話
│       ├── 002.md            # 第2話
│       └── ...               # 追加の話数
└── README.md                 # このファイル
```

## 📝 ファイル形式

### info.yml（小説の基本情報）

```yaml
id: "novel-unique-id"
title: "小説のタイトル"
author: "作者名"
description: |
  小説の概要・あらすじ
  複数行で記述可能
genre: "ジャンル"
tags: ["タグ1", "タグ2", "タグ3"]
status: "連載中"  # 連載中 / 完結 / 休載
created_at: "2025-07-13"
```

### エピソードファイル（XXX.md）

```markdown
---
id: "unique-episode-id"
title: "第X話：タイトル"
episode_number: 1
published_at: "2025-07-13"
---

ここから本文です。

小説家になろう風のルビ記法が使用できます：
｜漢字《ふりがな》

例：｜俺《おれ》は｜勇者《ゆうしゃ》だ。
```

## ✨ ルビ記法

小説家になろうと同じ記法を使用できます：

- `｜漢字《ふりがな》` → <ruby>漢字<rt>ふりがな</rt></ruby>
- `｜異世界《いせかい》` → <ruby>異世界<rt>いせかい</rt></ruby>
- `｜魔法《まほう》` → <ruby>魔法<rt>まほう</rt></ruby>

## 🚀 自動同期

このリポジトリの`書名/manuscript/`ディレクトリに変更をpushすると：

1. GitHub Actionsが自動実行
2. メインアプリリポジトリに通知
3. Supabaseデータベースに自動同期

## 📋 セットアップ手順

### 1. リポジトリの準備
1. このテンプレートを使用して新しいリポジトリを作成
2. `yar0316/novel-viewer`を自分のメインアプリリポジトリに変更

### 2. GitHub Secrets設定
Settings → Secrets and variables → Actions で以下を設定：

- `DISPATCH_PAT`: メインアプリリポジトリのActionsを起動するためのPersonal Access Token

### 3. Personal Access Token作成
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 新しいトークンを作成
3. リポジトリ: メインアプリリポジトリを選択
4. 権限: Actions (write) を選択

## 📖 使用方法

### 新しい小説を追加
1. 書名のディレクトリを作成
2. その中に`manuscript/`ディレクトリを作成
3. `manuscript/info.yml`で基本情報を設定
4. `manuscript/001.md`から話数を追加
5. コミット・プッシュで自動同期

### エピソードを追加
1. 該当小説の`manuscript/`ディレクトリに新しい`.md`ファイルを作成
2. 連番でファイル名を設定（002.md, 003.md...）
3. コミット・プッシュで自動同期

## ⚠️ 注意事項

- ファイル名は必ず連番にしてください
- `id`フィールドは全体で一意になるよう設定
- `episode_number`は小説内で重複しないよう注意
- プッシュ前にファイル構造を確認してください

## 🔧 トラブルシューティング

### GitHub Actions失敗時
1. Actions タブでエラーログを確認
2. ファイル形式が正しいかチェック
3. 必須フィールドが設定されているか確認

### 同期されない場合
1. `書名/manuscript/`ディレクトリ内のファイルを変更したか確認
2. Personal Access Tokenの権限をチェック
3. メインアプリリポジトリ名が正しいか確認

---

**Happy Writing! 📚✨**