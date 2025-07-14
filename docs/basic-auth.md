# Basic認証設定ガイド

## 概要

Web小説閲覧サイトにBasic認証を設定して、サイトへのアクセスを制限する方法について説明します。

## 認証システムの特徴

- **環境変数による制御**: 認証の有効/無効を環境変数で切り替え可能
- **Next.js Middleware使用**: 全ページに対して統一的な認証処理
- **開発環境対応**: ローカル開発時は認証をスキップ可能

## 環境変数設定

### 必要な環境変数

```bash
# Basic認証の有効/無効（true/false）
BASIC_AUTH_ENABLED=true

# 認証用ユーザー名
BASIC_AUTH_USER=your_username

# 認証用パスワード
BASIC_AUTH_PASSWORD=your_password
```

### Vercelでの設定手順

1. **Vercelダッシュボードにアクセス**
   - プロジェクトを選択
   - Settings → Environment Variables

2. **環境変数を追加**
   ```
   BASIC_AUTH_ENABLED = true
   BASIC_AUTH_USER = admin
   BASIC_AUTH_PASSWORD = your_secure_password
   ```

3. **適用環境を選択**
   - Production: 本番環境のみ
   - Preview: プレビュー環境のみ  
   - Development: 開発環境のみ
   - All: 全環境

### ローカル開発での設定

1. **`.env.local`ファイル作成**（frontendフォルダ直下）
   ```bash
   # Basic認証設定（開発時は無効にすることを推奨）
   BASIC_AUTH_ENABLED=false
   BASIC_AUTH_USER=admin
   BASIC_AUTH_PASSWORD=password123
   ```

2. **注意事項**
   - `.env.local`はGitにコミットしないでください
   - 既に`.gitignore`で除外設定済みです

## 動作確認

### 認証有効時
1. サイトにアクセス
2. ブラウザでBasic認証ダイアログが表示される
3. 設定したユーザー名・パスワードを入力
4. 認証成功でサイトが表示される

### 認証無効時
- 通常通りサイトにアクセス可能
- 認証ダイアログは表示されない

## セキュリティ考慮事項

### パスワード設定のベストプラクティス
- **強力なパスワード**: 8文字以上、英数字・記号を混合
- **定期的な変更**: セキュリティ向上のため定期的にパスワードを変更
- **共有の制限**: 必要最小限の人数のみに認証情報を共有

### HTTPS必須
- Basic認証は平文でBase64エンコードされるだけ
- 必ずHTTPS環境でのみ使用してください
- Vercelは自動的にHTTPS化されるため安全

## トラブルシューティング

### 認証ダイアログが表示されない
1. `BASIC_AUTH_ENABLED=true`が設定されているか確認
2. Vercelで環境変数が正しく設定されているか確認
3. デプロイが完了しているか確認

### 認証に失敗する
1. ユーザー名・パスワードが正確か確認
2. 環境変数の値にスペースが含まれていないか確認
3. ブラウザのキャッシュをクリアして再試行

### ローカル開発で認証が邪魔になる場合
```bash
# .env.localで認証を無効化
BASIC_AUTH_ENABLED=false
```

## 認証の無効化

認証を完全に無効化したい場合：

1. **Vercelの環境変数を更新**
   ```
   BASIC_AUTH_ENABLED = false
   ```

2. **または環境変数を削除**
   - `BASIC_AUTH_ENABLED`変数自体を削除
   - 環境変数が存在しない場合は自動的に無効

## 実装詳細

### Middlewareの動作
- すべてのページリクエストで認証チェックを実行
- 静的ファイル（CSS、JS、画像）は認証対象外
- 認証失敗時は401ステータスを返却

### 除外パス
以下のパスは認証対象外：
- `/_next/static/*` - Next.jsの静的ファイル
- `/_next/image/*` - 画像最適化ファイル
- `/favicon.ico` - ファビコン

---

## 使用例

### 開発段階での設定例
```bash
# ローカル: 認証無効で開発効率を優先
BASIC_AUTH_ENABLED=false

# Vercel Preview: プレビュー環境では認証有効
BASIC_AUTH_ENABLED=true
BASIC_AUTH_USER=preview
BASIC_AUTH_PASSWORD=preview123

# Vercel Production: 本番環境では強固なパスワード
BASIC_AUTH_ENABLED=true
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=Very$trong@Password2025
```

この設定により、セキュアで使いやすいBasic認証システムが構築できます。