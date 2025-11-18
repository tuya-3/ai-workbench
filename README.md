# AI Workbench

AI stack for rapid project integration and DevOps automation. This is a minimal Next.js + TypeScript project configured for Vercel deployment with integrated AI capabilities through Dify and Supabase.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Dify Integration** for AI workflow orchestration
- **Supabase** for backend services (database, auth, real-time)
- **Vercel-ready** deployment configuration

## 🏗️ MVP Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Browser (http://localhost:3000)                            │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP
                         │
┌────────────────────────▼────────────────────────────────────┐
│                                                             │
│  Next.js Application (Port 3000)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Frontend                                           │   │
│  │  - app/page.tsx (Home)                              │   │
│  │  - app/layout.tsx                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes                                         │   │
│  │  - GET  /api/health                                 │   │
│  │  - GET  /api/supabase/test                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└───────────────┬─────────────────────┬───────────────────────┘
                │                     │
                │                     │
                │                     │ SQL Query
                │                     │
                │         ┌───────────▼──────────────┐
                │         │                          │
                │         │  Supabase (Local)        │
                │         │  ┌────────────────────┐  │
                │         │  │ PostgreSQL         │  │
                │         │  │ (Port 54322)       │  │
                │         │  │ - users table      │  │
                │         │  │ - samples table    │  │
                │         │  └────────────────────┘  │
                │         │  ┌────────────────────┐  │
                │         │  │ Supabase Studio    │  │
                │         │  │ (Port 54321)       │  │
                │         │  │ - Admin UI         │  │
                │         │  └────────────────────┘  │
                │         │                          │
                │         └──────────────────────────┘
                │
                │ HTTPS API Call (Optional)
                │
    ┌───────────▼──────────────┐
    │                          │
    │  Dify API (External)     │
    │  - AI Workflows          │
    │  - LLM Orchestration     │
    │  - Requires API Key      │
    │                          │
    └──────────────────────────┘

Legend:
  - Solid lines: Implemented in MVP
  - Dify integration: Optional (requires API key)
  - All components run locally except Dify
```

### MVP Components

| Component | Port | Status | Description |
|-----------|------|--------|-------------|
| Next.js App | 3000 | ✅ Ready | Frontend + API Routes |
| Supabase PostgreSQL | 54322 | ✅ Ready | Database (Docker) |
| Supabase Studio | 54321 | ✅ Ready | Admin UI (Docker) |
| Dify API | External | ⚠️ Optional | AI workflows (requires key) |

### API Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/health` | GET | Health check | None |
| `/api/supabase/test` | GET | Test Supabase connection | None |

## 📁 Project Structure

```
ai-workbench/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── health/
│   │   │   └── route.ts   # Health check endpoint
│   │   └── supabase/
│   │       └── test/
│   │           └── route.ts # Supabase test endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── ai-stack/              # AI integration and infrastructure
│   ├── README.md          # Phase 1 architecture docs
│   ├── dify/              # Dify workflow integration
│   │   ├── README.md
│   │   ├── example-workflow.json
│   │   ├── client-example.ts
│   │   └── api-example.ts
│   └── supabase/          # Supabase setup
│       ├── README.md
│       ├── docker-compose.yml
│       ├── config.toml
│       ├── schema.sql
│       ├── migrations/
│       │   └── 001_initial.sql
│       └── client-example.ts
├── .github/
│   └── workflows/         # CI/CD workflows
│       └── ci.yml
├── public/                # Static assets
├── .env.example           # Environment variables template
├── vercel.json            # Vercel deployment config
└── package.json           # Dependencies and scripts
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker & Docker Compose (for local Supabase)
- Dify account (optional, for AI features)
- Supabase account (optional, for backend features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tuya-3/ai-workbench.git
   cd ai-workbench
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   ルートディレクトリに `.env.local` を作成：
   ```bash
   # テンプレートを参考に作成（.env.exampleがあればコピー）
   # または ai-stack/supabase/README.md を参考に手動作成
   ```
   
   最低限必要な環境変数：
   ```bash
   # Supabase (ローカル開発用)
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   
   # Dify (オプション)
   NEXT_PUBLIC_DIFY_API_URL=https://api.dify.ai/v1
   DIFY_API_KEY=your_dify_api_key_here
   ```

4. **Start local Supabase (Docker Compose)**

   ローカル開発環境を起動：
   ```bash
   docker compose -f ai-stack/supabase/docker-compose.yml up -d
   ```
   
   または、Supabase CLI を使用する場合：
   ```bash
   npm install -g supabase
   cd ai-stack/supabase
   supabase start
   ```

5. **Apply database migrations**

   Docker Compose を使用している場合、スキーマは自動で適用されます。
   手動で適用する場合：
   ```bash
   docker exec -i ai-workbench-supabase psql -U postgres -d postgres < ai-stack/supabase/schema.sql
   ```
   
   Supabase CLI を使用している場合：
   ```bash
   cd ai-stack/supabase
   supabase db push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Next.js アプリ: [http://localhost:3000](http://localhost:3000)
   - Supabase Studio: [http://localhost:54321](http://localhost:54321)

詳細なセットアップ手順は [ai-stack/supabase/README.md](ai-stack/supabase/README.md) を参照してください。

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## ✅ MVP 動作確認手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
# .env.example をコピーして .env.local を作成
cp .env.example .env.local

# .env.local を編集（ローカル開発の場合、デフォルト値で動作します）
```

### 3. Supabase ローカル環境の起動

```bash
# Docker Compose で Supabase を起動
docker compose -f ai-stack/supabase/docker-compose.yml up -d

# 起動確認（PostgreSQL と Studio が起動していることを確認）
docker compose -f ai-stack/supabase/docker-compose.yml ps
```

### 4. Next.js 開発サーバーの起動

```bash
npm run dev
```

### 5. 動作確認

#### ブラウザでの確認

1. **ホームページ**: http://localhost:3000
   - AI Workbench のホームページが表示される

2. **Supabase Studio**: http://localhost:54321
   - Supabase の管理画面が表示される
   - `users` と `samples` テーブルが作成されていることを確認

#### API エンドポイントの確認

```bash
# ヘルスチェック
curl http://localhost:3000/api/health

# 期待される出力:
# {
#   "status": "ok",
#   "message": "AI Workbench API is running",
#   "timestamp": "2024-...",
#   "version": "0.1.0"
# }

# Supabase 接続テスト
curl http://localhost:3000/api/supabase/test

# 期待される出力:
# {
#   "status": "success",
#   "message": "Successfully connected to Supabase",
#   "data": {
#     "userCount": 0,
#     "users": []
#   },
#   "timestamp": "2024-..."
# }
```

### 6. テストデータの追加（オプション）

Supabase Studio (http://localhost:54321) でテストデータを追加できます：

1. 左メニューから **Table Editor** を選択
2. `users` テーブルを選択
3. **Insert row** をクリック
4. 以下のデータを入力：
   - `email`: test@example.com
   - `full_name`: Test User
5. **Save** をクリック

再度 `/api/supabase/test` を呼び出すと、追加したユーザーが表示されます。

### 7. 停止

```bash
# Next.js 開発サーバーを停止（Ctrl+C）

# Supabase を停止
docker compose -f ai-stack/supabase/docker-compose.yml down
```

### トラブルシューティング

**Supabase 接続エラーが発生する場合:**
1. Docker が起動していることを確認
2. `.env.local` の設定を確認
3. Supabase コンテナが起動しているか確認: `docker ps`

**ポートが既に使用されている場合:**
- Port 3000: Next.js の代替ポート `npm run dev -- -p 3001`
- Port 54321/54322: `docker-compose.yml` のポート番号を変更

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically detect the Next.js configuration and deploy your application.

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤖 AI Stack Integration

This project includes examples for integrating AI capabilities:

### Dify Integration
- AI workflow orchestration
- LLM management
- Conversation handling
- API examples for Next.js integration
- See `/ai-stack/dify/` for examples

### Supabase Integration
- PostgreSQL database (ローカル開発環境対応)
- Authentication & authorization (Email認証)
- Database migrations
- Row Level Security (RLS) policies
- See `/ai-stack/supabase/` for examples

For detailed architecture information, see [ai-stack/README.md](ai-stack/README.md).

## 📚 Documentation

- [Phase 1 Architecture](ai-stack/README.md)
- [Supabase Setup Guide](ai-stack/supabase/README.md) - ローカル開発環境のセットアップ
- [Dify Integration Guide](ai-stack/dify/README.md)
- [Next.js Documentation](https://nextjs.org/docs)

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Dify
NEXT_PUBLIC_DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=your_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the GitHub repository.
