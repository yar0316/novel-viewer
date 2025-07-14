# Vercel + Supabase セットアップガイド

## 概要

このドキュメントは、Next.js 15 + shadcn/ui + Tailwind CSS構成のWeb小説閲覧サイトをVercel + Supabaseでデプロイするためのセットアップ手順を説明します。

## 技術スタック
- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **UIライブラリ**: shadcn/ui + Tailwind CSS v4
- **バックエンド**: Supabase (PostgreSQL + REST API)
- **ホスティング**: Vercel
- **テスト**: Jest + React Testing Library

## 1. Vercelセットアップ

### 1.1 Vercelアカウント作成

1. [Vercel](https://vercel.com)でアカウントを作成
2. GitHubアカウントと連携

### 1.2 プロジェクト作成

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択して「Import」
3. Build Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend` 
   - **Build Command**: 自動検出（`npm run build`）
   - **Output Directory**: 自動検出（`.next`）
   - **Install Command**: 自動検出（`npm install`）
   - **Development Command**: 自動検出（`npm run dev`）

### 1.3 Next.js 15固有の設定

Vercelは自動的にNext.js 15の以下の機能をサポートします：
- App Router
- Turbopack（開発時）
- Server Components
- TypeScript
- Tailwind CSS

### 1.4 環境変数設定

#### Supabase接続用環境変数（必須）
**Supabaseインテグレーションにより自動設定されます**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Basic認証用環境変数（オプション）
サイトアクセスを制限したい場合は以下を設定：

1. Vercelプロジェクトの Settings > Environment Variables
2. 以下の環境変数を追加：
   ```
   BASIC_AUTH_ENABLED=true
   BASIC_AUTH_USER=your_username  
   BASIC_AUTH_PASSWORD=your_password
   ```

**詳細な設定方法**: [Basic認証設定ガイド](./basic-auth.md)を参照

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
  summary TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  episodes INTEGER DEFAULT 0,
  genre VARCHAR(50),
  tags TEXT[]
);

-- 話テーブル
CREATE TABLE episodes (
  id VARCHAR(50) PRIMARY KEY,  -- 文字列ID（例: "ep1", "ep2"）
  novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  episode_number INTEGER NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_episodes_novel_id ON episodes(novel_id);
CREATE INDEX idx_episodes_episode_number ON episodes(novel_id, episode_number);
```

### 2.3 Row Level Security (RLS) 設定

```sql
-- 読み取り専用アクセスを許可
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view novels" ON novels FOR SELECT USING (true);
CREATE POLICY "Anyone can view episodes" ON episodes FOR SELECT USING (true);
```

### 2.4 サンプルデータ投入

```sql
-- サンプル小説データ
INSERT INTO novels (id, title, summary, author, updated_at, episodes, genre, tags, created_at) VALUES
(1, '異世界転生記', '普通の高校生が異世界に転生して冒険する物語です。魔法と剣の世界で、仲間たちと共に成長していく姿を描きます。', '山田太郎', '2025-07-10T12:00:00Z', 15, 'ファンタジー', ARRAY['異世界', '冒険', '成長'], '2025-01-01T00:00:00Z'),
(2, '現代魔法使いの日常', '現代社会に隠れて生活する魔法使いの物語。日常の中にある小さな魔法を通して、人々との絆を描いています。', '佐藤花子', '2025-07-08T15:30:00Z', 8, '現代ファンタジー', ARRAY['日常', '魔法', '現代'], '2025-02-15T00:00:00Z'),
(3, '宇宙の果ての物語', '遥か未来の宇宙を舞台にしたSF小説。異星人との出会いや宇宙の謎を解き明かす冒険が始まります。', '田中一郎', '2025-07-12T09:15:00Z', 12, 'SF', ARRAY['宇宙', '未来', '冒険'], '2025-03-01T00:00:00Z');

-- サンプル話データ
INSERT INTO episodes (id, title, episode_number, published_at, novel_id, content) VALUES
-- 異世界転生記のエピソード（novel_id = 1）
('ep1', '新たな始まり', 1, '2025-06-01T00:00:00Z', 1, '　主人公が異世界に転生する第一話です。普通のサラリーマンだった主人公が、突然の交通事故で命を落とし、気がつくと異世界の森の中にいました。

　周りを見回すと、見たこともない植物や動物たちが生息していて、明らかに地球とは違う世界であることが分かります。困惑する主人公でしたが、やがて自分に特別な力が宿っていることに気づきます。'),
('ep2', '初めての仲間', 2, '2025-06-08T00:00:00Z', 1, '　森で迷っていた主人公は、魔物に襲われている少女を発見します。持ち前の正義感から助けようとした主人公でしたが、まだ力の使い方が分からずに苦戦します。

　しかし、危機的状況で覚醒した力により、魔物を撃退することができました。救った少女エルフィは、主人公の最初の仲間となります。'),
('ep3', '試練の森', 3, '2025-06-15T00:00:00Z', 1, '　エルフィと共に森を進む主人公。しかし、森の奥には強力な魔物が住んでいると言われています。

　村にたどり着くためには、その森を抜ける必要がありました。二人は協力して数々の試練に立ち向かっていきます。この経験を通じて、主人公とエルフィの絆は深まっていくのでした。'),

-- 現代魔法使いの日常のエピソード（novel_id = 2）
('magic_ep1', '隠された才能', 1, '2025-06-20T00:00:00Z', 2, '　大学生の田中美咲は、ごく普通の日常を送っていると思っていました。しかし、ある日の朝、コーヒーカップが宙に浮いているのを目撃します。

　最初は寝ぼけていたのかと思いましたが、よく観察すると、自分の意識に反応してカップが動いていることに気づきました。美咲の魔法使いとしての覚醒の瞬間でした。'),
('magic_ep2', '魔法界への招待', 2, '2025-06-27T00:00:00Z', 2, '　美咲の前に現れたのは、魔法使いの先輩である山田ゆかりでした。ゆかりは美咲に、現代社会に隠れて生きる魔法使いたちの存在を教えます。

　「普通の人々に知られてはいけない。でも、困っている人を助けることはできる」そんな魔法使いたちのルールを学んだ美咲は、新しい世界への一歩を踏み出します。'),
('magic_ep3', '初めての魔法使い', 3, '2025-07-05T00:00:00Z', 2, '　ゆかりに連れられて、美咲は街中の小さなカフェへ向かいます。そこには魔法使いたちが集まる秘密の場所がありました。

　初めて出会う同世代の魔法使いたち。彼らとの交流を通して、美咲は魔法が単なる超能力ではなく、人と人とのつながりを大切にする力であることを学んでいきます。'),

-- 宇宙の果ての物語のエピソード（novel_id = 3）
('space_ep1', '星間航海の始まり', 1, '2025-07-01T00:00:00Z', 3, '　西暦2387年、宇宙探査船「ホープ号」の船長である高橋太郎は、人類初の銀河系外探査ミッションに就いていました。

　地球から300光年離れた未知の星系で、突然船のセンサーが異常な信号を検知します。それは明らかに人工的な、地球外知的生命体からのメッセージでした。'),
('space_ep2', '異星人との遭遇', 2, '2025-07-08T00:00:00Z', 3, '　信号の発信源に向かったホープ号のクルーたちは、巨大な宇宙ステーションを発見します。そこで出会ったのは、人類とは全く異なる姿をした知的生命体でした。

　彼らは「コスモス連邦」と名乗り、銀河系には数百の知的種族が平和に共存していることを太郎たちに教えます。人類の宇宙進出は、新たな段階に入ろうとしていました。');
```

## 3. Vercel-Supabaseインテグレーション

### 3.1 インテグレーション追加

1. Vercel Marketplace → Supabaseインテグレーションを検索
2. 対象プロジェクトを選択してインストール
3. Supabaseプロジェクトと連携

### 3.2 自動設定される環境変数

Vercel-Supabaseインテグレーションにより以下の環境変数が自動設定されます：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**注意**: 既存のコードは上記の環境変数名に対応済みです。

## 4. 接続確認とテスト

### 4.1 既存コードの自動切り替え

現在の実装では、環境変数が設定されると自動的にSupabaseに接続されます：

```typescript
// /lib/supabase/queries.ts の既存ロジック
export async function getNovelsList() {
  // 環境変数が設定されていない場合はモックデータを返す
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('Supabase環境変数が未設定のため、モックデータを使用します')
    return { data: mockNovels, error: null }
  }

  // Supabase接続処理
  const supabase = await createClient()
  const { data, error } = await supabase.from('novels').select('*')
  return { data, error }
}
```

### 4.2 ローカル接続テスト手順

```bash
# 1. 環境変数ファイル作成
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env.local

# 2. 開発サーバー起動
npm run dev

# 3. ブラウザでアクセス確認
# - コンソールでモックデータメッセージが表示されなくなることを確認
# - Supabaseからの実データが表示されることを確認
```

## 5. 段階的デプロイフロー

### ステップ1: Supabaseテーブル作成

1. Supabase Dashboardにログイン
2. SQL Editorを開く
3. 上記のCREATE文を実行してテーブル作成
4. INSERT文を実行してサンプルデータ投入
5. 作成完了を確認

### ステップ2: ローカル環境での接続確認

**⚠️ 重要**: `.env.local`は必ず`frontend/`フォルダ直下に作成してください

```bash
# 1. Vercelが作成した環境変数を取得
# Vercel Dashboard → プロジェクト → Settings → Environment Variables
# から NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を取得

# 2. frontendフォルダに移動して.env.localファイル作成
cd frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF

# 3. 開発サーバー起動（既にfrontendフォルダ内）
npm run dev

# 4. 動作確認
# - http://localhost:3000 にアクセス
# - ブラウザのコンソールで「Supabase環境変数が未設定のため、モックデータを使用します」が表示されないことを確認
# - 実際のSupabaseデータが表示されることを確認

# 5. Supabase接続確認のポイント
# - 小説一覧に3つの小説が表示される
# - 「現代魔法使いの日常」をクリックして詳細ページに移動
# - 話一覧で「隠された才能」「魔法界への招待」「初めての魔法使い」が表示される
# - エピソードをクリックして内容が正しく表示される（モックデータとは異なる内容）
```

#### 正しいファイル配置構造：
```
novel-viewer/
├── docs/
├── frontend/                    ← Next.jsプロジェクトルート
│   ├── .env.local              ← ここに作成！
│   ├── package.json
│   ├── next.config.ts
│   ├── src/
│   └── ...
└── その他のファイル
```

### ステップ3: Vercel本番環境デプロイ

```bash
# 1. VercelとGitHubリポジトリ接続
# Vercel Dashboard → Add New Project → Import Git Repository

# 2. ビルド設定は自動検出されます
# Framework Preset: Next.js (自動検出)
# Root Directory: frontend
# Build Command: npm run build (自動検出)
# Output Directory: .next (自動検出)

# 3. 環境変数は既に設定済み（Supabaseインテグレーションによる）

# 4. デプロイ実行
git add .
git commit -m "feat: Supabase接続対応とデプロイ準備"
git push origin main

# 5. 本番環境での動作確認
# - Vercelが提供するURLにアクセス
# - 実際のSupabaseデータが表示されることを確認
```

### ステップ4: プレビュー環境での確認（オプション）

```bash
# 今後の開発用：ブランチごとのプレビュー環境
git checkout -b feature/new-feature
git push origin feature/new-feature
# → 自動的にプレビューURLが生成される
```

### 各ステップでの確認チェックリスト

#### ステップ1完了チェック
- [ ] Supabaseでnovelsテーブルが作成されている
- [ ] Supabaseでepisodesテーブルが作成されている  
- [ ] サンプルデータが正しく投入されている
- [ ] RLSポリシーが設定されている

#### ステップ2完了チェック
- [ ] `.env.local`ファイルが`frontend/`フォルダ直下に作成されている
- [ ] 環境変数が正しく設定されている
- [ ] `npm run dev`でエラーが発生しない
- [ ] ブラウザでサイトにアクセスできる
- [ ] コンソールにモックデータメッセージが表示されない
- [ ] 小説一覧にSupabaseのデータが表示される
- [ ] 小説詳細ページが正常に動作する
- [ ] エピソード閲覧ページが正常に動作する

#### ステップ3完了チェック
- [ ] VercelとGitHubが接続されている
- [ ] Vercelで環境変数が設定されている
- [ ] ビルドが成功している
- [ ] デプロイが完了している
- [ ] 本番URLでサイトにアクセスできる
- [ ] 本番環境でSupabaseデータが表示される

## 6. 本番運用とパフォーマンス最適化

### 6.1 Next.js 15によるパフォーマンス最適化

Vercelで自動的に有効になる機能：
- **Automatic Static Optimization**: 静的ページの自動最適化
- **Image Optimization**: Next.js Imageコンポーネントによる自動画像最適化
- **Bundle Analyzer**: バンドルサイズの最適化
- **Edge Functions**: グローバルキャッシュとCDN
- **Incremental Static Regeneration**: 差分ビルドによる高速デプロイ

### 6.2 ドメイン設定

- Vercelダッシュボードでカスタムドメインを設定可能
- 自動HTTPS化とCDN配信

### 6.3 監視とアクセス解析

- **Vercel Analytics**: リアルタイムアクセス解析（無料プランでも利用可能）
- **Web Vitals**: Core Web Vitalsの自動測定
- **Supabase Dashboard**: データベースパフォーマンス監視

### 6.4 バックアップとセキュリティ

- Supabaseは自動バックアップ機能あり
- GitHubリポジトリがソースコードのバックアップ
- Vercelの自動セキュリティヘッダー設定

---

## 重要な注意事項

### 環境変数について
- `NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`は**フロントエンドで公開される**環境変数です
- 匿名キーは読み取り専用なので公開されても安全です
- RLSポリシーによりデータアクセスが適切に制限されています

### ファイル管理について
- `.env.local`は`frontend/.env.local`として**frontendフォルダ直下**に作成してください
- ローカル開発用のみで、**Gitにコミットしないでください**
- 既に`frontend/.gitignore`で除外設定済みです
- **よくある間違い**: プロジェクトルート（`novel-viewer/.env.local`）に作成するとNext.jsが読み込めません

### プロジェクト構成について
- `frontend/`フォルダがNext.jsプロジェクトルートです
- Vercelの**Root Directory**は必ず`frontend`に設定してください
- `package.json`、`next.config.ts`等はすべて`frontend/`内にあります

### デプロイ順序の重要性
1. **必ずSupabaseテーブル作成を先に行ってください**
2. ローカルテストで動作確認後にVercelデプロイ
3. 段階的に確認することでトラブルシューティングが容易になります

### トラブルシューティング

#### よくある問題と解決方法
- **ローカルで「モックデータを使用します」メッセージが表示される**
  → `.env.local`の配置場所を確認（`frontend/.env.local`に作成されているか）
  → 環境変数の値が正しく設定されているか確認

- **Vercelで500エラーが発生する**
  → Vercelの環境変数設定とSupabaseインテグレーション状況を確認

- **ビルドエラーが発生する**
  → `frontend/`フォルダがRoot Directoryに設定されているか確認
  → TypeScriptエラーの場合は型定義を確認

- **データが表示されない**
  → SupabaseのRLSポリシー設定確認
  → Supabaseテーブルが正しく作成されているか確認

- **スタイルが適用されない**
  → Tailwind CSS設定の確認（自動で処理されるはず）

#### デバッグ方法
```bash
# frontendフォルダに移動
cd frontend

# 環境変数の読み込み確認
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# .env.localファイルの存在確認
ls -la .env.local

# ローカルでビルドテスト
npm run build

# ローカルで本番環境テスト  
npm start

# 型チェック
npm run type-check
```
