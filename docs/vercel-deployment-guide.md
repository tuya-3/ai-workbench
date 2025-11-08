# Vercelデプロイ手順書

このガイドでは、ai-workbenchプロジェクトをVercelにデプロイしてホームページを公開する手順を説明します。

## 📋 事前準備

### 必要なアカウント
- [GitHub](https://github.com)アカウント
- [Vercel](https://vercel.com)アカウント（GitHubアカウントでサインアップ可能）

### ローカル環境での確認
デプロイ前に、ローカルでプロジェクトが正しく動作することを確認してください。

```bash
# 開発サーバーの起動
npm run dev

# ビルドテスト
npm run build
```

## 🚀 デプロイ手順

### 方法1: Vercel CLI を使用（推奨）

#### 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

#### 2. Vercelにログイン

```bash
vercel login
```

ブラウザが開き、認証を求められます。GitHubアカウントで認証してください。

#### 3. プロジェクトのデプロイ

プロジェクトのルートディレクトリで以下のコマンドを実行：

```bash
vercel
```

初回デプロイ時に以下の質問が表示されます：

```
? Set up and deploy "~/ai-workbench"? [Y/n] y
? Which scope do you want to deploy to? <your-account>
? Link to existing project? [y/N] n
? What's your project's name? ai-workbench
? In which directory is your code located? ./
```

**推奨設定：**
- Set up and deploy: `Y`
- Link to existing project: `N` (初回の場合)
- Project name: `ai-workbench` (または任意の名前)
- Code directory: `./` (デフォルト)

#### 4. 本番環境へのデプロイ

プレビューデプロイが成功したら、本番環境にデプロイ：

```bash
vercel --prod
```

### 方法2: Vercel Dashboard を使用

#### 1. GitHubにプッシュ

コードがまだGitHubにない場合、プッシュします：

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

#### 2. Vercelにインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. **"Add New..."** → **"Project"** をクリック
3. GitHubリポジトリから `ai-workbench` を選択
4. **"Import"** をクリック

#### 3. プロジェクト設定

Vercelが自動的に以下を検出します：
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

これらの設定は `vercel.json` で既に定義されています。

#### 4. 環境変数の設定（必要な場合）

DifyやSupabaseを使用する場合：

1. **"Environment Variables"** セクションを展開
2. 以下の変数を追加：

```
NEXT_PUBLIC_DIFY_API_KEY=your_dify_api_key
NEXT_PUBLIC_DIFY_API_URL=https://api.dify.ai/v1
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 5. デプロイ実行

**"Deploy"** ボタンをクリックして、デプロイを開始します。

## 🔍 デプロイ確認

### デプロイステータス

ビルドプロセスは通常2〜3分で完了します。進行状況は以下で確認できます：

- **CLI使用時:** ターミナルにログが表示されます
- **Dashboard使用時:** デプロイメントページでリアルタイムログを確認

### 公開URLの確認

デプロイ完了後、以下の形式のURLが割り当てられます：

```
https://ai-workbench-<random-id>.vercel.app
```

または、カスタムドメインを設定した場合はそのドメインでアクセスできます。

### 動作確認

1. 公開URLにアクセス
2. ホームページが正しく表示されることを確認
3. 各ページのナビゲーションをテスト

## 🌐 カスタムドメインの設定（オプション）

### 1. ドメインの追加

Vercel Dashboardで：

1. プロジェクトを選択
2. **"Settings"** → **"Domains"** に移動
3. カスタムドメインを入力（例：`www.example.com`）
4. **"Add"** をクリック

### 2. DNSレコードの設定

ドメインレジストラで以下のレコードを追加：

**Aレコード（@）：**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAMEレコード（www）：**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. SSL証明書

Vercelが自動的にSSL証明書を発行します（数分〜数時間）。

## 🔄 継続的デプロイ（CI/CD）

### 自動デプロイの設定

Vercel Dashboardを使用してデプロイした場合、以下が自動的に有効になります：

- **Production:** `main` ブランチへのプッシュで自動デプロイ
- **Preview:** プルリクエストごとにプレビューデプロイ

### ブランチ戦略

```bash
# 開発ブランチで作業
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# GitHubでプルリクエストを作成
# → Vercelが自動的にプレビューデプロイを作成

# mainブランチにマージ
# → 自動的に本番環境にデプロイ
```

## 📊 デプロイ後の管理

### ログとモニタリング

Vercel Dashboardで確認できる情報：
- **Deployments:** デプロイ履歴
- **Analytics:** アクセス統計（Pro以上）
- **Logs:** 実行時ログ
- **Speed Insights:** パフォーマンス分析

### ロールバック

問題が発生した場合、簡単にロールバックできます：

1. Vercel Dashboard → **"Deployments"**
2. 以前の正常なデプロイを選択
3. **"Promote to Production"** をクリック

## 🛠️ トラブルシューティング

### ビルドエラー

**症状:** ビルドが失敗する

**解決策:**
```bash
# ローカルでビルドテスト
npm run build

# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install
```

### 環境変数が反映されない

**症状:** 環境変数が正しく読み込まれない

**解決策:**
1. Vercel Dashboard → **"Settings"** → **"Environment Variables"**
2. 変数が正しく設定されているか確認
3. 変数名が `NEXT_PUBLIC_` で始まっているか確認（クライアントサイドで使用する場合）
4. 再デプロイを実行

### 404エラー

**症状:** ページが見つからない

**解決策:**
- `vercel.json` の設定を確認
- `app/` ディレクトリのルーティングを確認
- ビルドログでエラーがないか確認

## 📝 チェックリスト

デプロイ前に以下を確認してください：

- [ ] ローカル環境で `npm run build` が成功する
- [ ] `.env.local` の機密情報がコミットされていない
- [ ] `package.json` の依存関係が最新
- [ ] `vercel.json` が正しく設定されている
- [ ] 環境変数が Vercel に設定されている
- [ ] GitHubリポジトリが最新の状態

## 🎉 完了！

デプロイが成功すると、以下のような出力が表示されます：

```
✅ Production: https://ai-workbench.vercel.app [copied to clipboard]
```

おめでとうございます！ホームページが公開されました。

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
