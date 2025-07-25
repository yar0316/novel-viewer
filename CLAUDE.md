# Web小説閲覧サイト開発 - AI協働ガイド

## ドキュメント参照指示

**📋 [総合ガイド - docs/general.md](./docs/general.md)**

すべての開発関連情報はこちらを参照してください。  
作業開始時は必ずこのドキュメントから適切な情報を確認してください。

---

**最終更新**: 2025-07-14

## 重要な実装状況

### Basic認証機能
- **実装完了**: `src/middleware.ts`でBasic認証を実装
- **設定方法**: [Basic認証設定ガイド](./docs/basic-auth.md)を参照
- **環境変数**: `BASIC_AUTH_ENABLED`, `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`
- **ローカル開発**: `.env.local`で`BASIC_AUTH_ENABLED=false`に設定推奨

### GitHub Actions自動同期システム
- **実装完了**: booksリポジトリ → novel-viewerリポジトリ → Supabase の自動同期
- **設定方法**: [GitHub Actions設定ガイド](./docs/github-actions-setup.md)を参照
- **必要なPAT**: novel-viewerリポジトリアクセス用（DISPATCH_PAT）
- **必要なSecrets**: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATA_REPO_PAT