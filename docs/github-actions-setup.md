# GitHub Actions自動同期設定ガイド

## 概要

booksリポジトリ（作品管理）とnovel-viewerリポジトリ（Webアプリ）間の自動同期システムの設定方法について説明します。

## システム構成

```mermaid
graph LR
    A[booksリポジトリ] -->|push| B[GitHub Actions]
    B -->|repository_dispatch| C[novel-viewerリポジトリ]
    C -->|sync| D[Supabase]
```

## 必要なトークン・環境変数

### 1. Personal Access Token (PAT) の作成

#### 1.1 novel-viewer用PATの作成
**目的**: booksリポジトリからnovel-viewerリポジトリに通知を送るため

##### オプション1: Fine-grained PAT（推奨・セキュア）
1. **GitHubにログイン** → Settings → Developer settings → Personal access tokens → **Fine-grained tokens**
2. **Generate new token** をクリック
3. **設定内容**:
   ```
   Token name: Novel Viewer Repository Dispatch
   Expiration: 90 days（推奨）
   Resource owner: your-username
   Selected repositories: novel-viewer（特定リポジトリのみ）
   
   Repository permissions:
   ✅ Actions: Write
   ✅ Contents: Read
   ✅ Metadata: Read
   ```

##### オプション2: Classic PAT
1. **GitHubにログイン** → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Generate new token (classic)** をクリック
3. **設定内容**:
   ```
   Note: Novel Viewer Repository Dispatch
   Expiration: 90 days（推奨）
   Scopes:
   ✅ repo (Full control of private repositories)
   ```

**既存のFine-grained PATがある場合**: 上記の権限（Actions: Write, Contents: Read, Metadata: Read）がnovel-viewerリポジトリに付与されていれば、それをそのまま使用できます。

#### 1.2 books用PATの作成（オプション）
**目的**: novel-viewerリポジトリからbooksリポジトリのデータを取得するため

##### Fine-grained PAT（推奨）
```
Token name: Books Repository Access
Selected repositories: books（特定リポジトリのみ）

Repository permissions:
✅ Contents: Read
✅ Metadata: Read
```

##### Classic PAT
```
Note: Books Repository Access
Scopes:
✅ repo (Full control of private repositories)
```

**既存PATの活用**: 既にbooksリポジトリへのContents: Read権限があるFine-grained PATをお持ちの場合は、それをそのまま使用できます。

### 2. GitHub Secretsの設定

#### 2.1 booksリポジトリでの設定

1. **booksリポジトリに移動** → Settings → Secrets and variables → Actions
2. **New repository secret** で以下を追加:

```bash
# novel-viewerリポジトリへの通知用PAT
Name: DISPATCH_PAT
Secret: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 2.2 novel-viewerリポジトリでの設定

1. **novel-viewerリポジトリに移動** → Settings → Secrets and variables → Actions
2. **New repository secret** で以下を追加:

```bash
# Supabase接続URL
Name: SUPABASE_URL
Secret: https://your-project-id.supabase.co

# Supabaseサービスロールキー
Name: SUPABASE_SERVICE_ROLE_KEY
Secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# booksリポジトリアクセス用PAT（リポジトリがprivateの場合のみ必要）
Name: DATA_REPO_PAT
Secret: ghp_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

## Supabase設定値の取得方法

### SUPABASE_URLの取得
1. **Supabaseダッシュボード** → プロジェクト選択
2. **Settings** → **API**
3. **Project URL** をコピー

### SUPABASE_SERVICE_ROLE_KEYの取得
1. **Supabaseダッシュボード** → プロジェクト選択
2. **Settings** → **API**
3. **Project API keys** → **service_role** → **Reveal** → コピー

⚠️ **注意**: service_roleキーは管理者権限を持つため、絶対に公開しないでください。

## 設定確認手順

### 1. 環境変数設定の確認

#### booksリポジトリ
- [ ] `DISPATCH_PAT` が設定されている

#### novel-viewerリポジトリ  
- [ ] `SUPABASE_URL` が設定されている
- [ ] `SUPABASE_SERVICE_ROLE_KEY` が設定されている
- [ ] `DATA_REPO_PAT` が設定されている（privateリポジトリの場合）

### 2. 動作テスト

#### テスト手順
1. **booksリポジトリでファイル更新**:
   ```bash
   # 任意の作品のmanuscriptフォルダ内のファイルを編集
   echo "テスト更新" >> claudecode-test/manuscript/star-temple-act1.md
   git add .
   git commit -m "test: 同期テスト"
   git push origin main
   ```

2. **GitHub Actionsログ確認**:
   - booksリポジトリ: Actions タブでDispatch workflowの実行確認
   - novel-viewerリポジトリ: Actions タブでSync workflowの実行確認

3. **Supabaseデータ確認**:
   - Supabaseダッシュボード → Table Editor
   - novelsテーブルとepisodesテーブルにデータが追加されていることを確認

## トラブルシューティング

### よくあるエラーと解決方法

#### 1. "Bad credentials" エラー
**原因**: PATの権限不足またはトークンの有効期限切れ
**解決**: 新しいPATを作成し、適切な権限（repo）を付与

#### 2. "Repository not found" エラー  
**原因**: `DATA_REPO_PAT`の権限不足またはリポジトリ名の間違い
**解決**: リポジトリ名を確認し、PATにrepo権限があることを確認

#### 3. "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set" エラー
**原因**: Supabase環境変数が設定されていない
**解決**: novel-viewerリポジトリのSecretsにSupabase情報を設定

#### 4. 同期が実行されない
**原因**: manuscriptフォルダ以外のファイルを変更した
**解決**: `*/manuscript/`パス内のファイルを変更してpush

### デバッグ方法

1. **GitHub Actions ログの確認**:
   - 各ステップの実行状況とエラーメッセージを確認
   - 特に「Check Changed Files」ステップで変更検知されているか確認

2. **環境変数の確認**:
   ```bash
   # GitHub Actions内でのデバッグ出力例
   - name: Debug Environment
     run: |
       echo "SUPABASE_URL is set: ${{ secrets.SUPABASE_URL != '' }}"
       echo "SERVICE_KEY is set: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY != '' }}"
   ```

## セキュリティ考慮事項

### PATの管理
- **定期的な更新**: 90日ごとにPATを再生成
- **最小権限の原則**: 必要最小限の権限のみを付与
- **ローテーション**: 古いPATは即座に削除

### Supabaseキーの管理
- **service_roleキーの保護**: 絶対に公開リポジトリにコミットしない
- **RLS (Row Level Security)**: Supabaseでデータアクセス制御を設定
- **監査ログ**: Supabaseでアクセスログを定期的に確認

---

## 設定完了後の運用

### 日常的な作業フロー

1. **作品更新**:
   ```bash
   # booksリポジトリで作品を編集
   vim claudecode-test/manuscript/new-chapter.md
   git add .
   git commit -m "feat: 新章追加"
   git push origin main
   ```

2. **自動同期確認**:
   - GitHub ActionsでWorkflowが実行されることを確認
   - Webサイトで新しいデータが反映されることを確認

3. **定期メンテナンス**:
   - PATの有効期限チェック（月1回推奨）
   - 同期ログの確認（週1回推奨）
   - Supabaseデータのバックアップ（必要に応じて）

これで完全自動化された小説データ管理システムが構築されます。