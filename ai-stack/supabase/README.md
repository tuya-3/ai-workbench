# Supabase Integration

This directory contains Supabase configuration and integration examples for local development and production.

## What is Supabase?

Supabase is an open-source Firebase alternative providing:
- PostgreSQL database
- Authentication & authorization
- Auto-generated APIs
- Real-time subscriptions
- Storage for files
- Edge Functions

## 📦 含まれるファイル

- `docker-compose.yml` - ローカル開発環境用のSupabaseコンテナ設定
- `config.toml` - Supabase CLI設定ファイル
- `schema.sql` - データベーススキーマ定義
- `migrations/001_initial.sql` - 初期マイグレーションファイル
- `client-example.ts` - TypeScriptクライアント統合例

## 🚀 ローカル開発環境のセットアップ

### 1. 環境変数の設定

ルートディレクトリに `.env.local` を作成：

```bash
cd /path/to/ai-workbench
cp .env.example .env.local
```

`.env.local` を編集して、必要に応じて値を変更してください。

**必要な環境変数：**

```bash
# Supabase Local Development
POSTGRES_PASSWORD=postgres
POSTGRES_USER=postgres
POSTGRES_DB=postgres
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Supabase URLs
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Dify
NEXT_PUBLIC_DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=your_dify_api_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase ローカル環境の起動

#### 方法1: Docker Compose を使用

```bash
# プロジェクトルートから
docker compose -f ai-stack/supabase/docker-compose.yml up -d
```

#### 方法2: Supabase CLI を使用

```bash
# Supabase CLI をインストール（まだの場合）
npm install -g supabase

# Supabase ローカル環境を起動
cd ai-stack/supabase
supabase start
```

### 3. データベーススキーマの適用

#### Docker Compose を使用している場合

スキーマは自動で適用されます。手動で実行する場合：

```bash
docker exec -i ai-workbench-supabase psql -U postgres -d postgres < ai-stack/supabase/schema.sql
```

#### Supabase CLI を使用している場合

```bash
cd ai-stack/supabase
supabase db push
```

### 4. Next.js 開発サーバーの起動

別のターミナルで：

```bash
npm run dev
```

## 🌐 アクセス

- **Next.js アプリ**: http://localhost:3000
- **Supabase Studio**: http://localhost:54321
- **Postgres**: localhost:54322

## 🛑 停止

### Docker Compose の場合

```bash
docker compose -f ai-stack/supabase/docker-compose.yml down
```

### Supabase CLI の場合

```bash
cd ai-stack/supabase
supabase stop
```

## 🏗️ 本番環境のセットアップ

1. **Create a Supabase Project**
   - Visit [Supabase](https://supabase.com)
   - Create a new project
   - Wait for database to be provisioned

2. **Get API Credentials**
   - Go to Project Settings → API
   - Copy the project URL and anon key
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
     SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
     ```

3. **Run Initial Schema**
   - Go to SQL Editor in Supabase dashboard
   - Run the `schema.sql` file to create initial tables

## Database Schema

The `schema.sql` file includes:
- User profiles table (`users`)
- Sample data table (`samples`)
- Row Level Security (RLS) policies
- Indexes for performance

### Migration Files

- `migrations/001_initial.sql` - Initial migration with users and samples tables

## Client Integration

The `client-example.ts` file provides a **minimal starting point** for integrating Supabase into your application. This is an initial template that you should expand based on your project needs.

**Current implementation includes:**
- Basic client creation
- Simple data fetching example
- Insert operation example

**You can extend this with:**
- Authentication flows (sign up, sign in, OAuth)
- Real-time subscriptions for live data
- File storage and uploads
- Row Level Security (RLS) policies
- Advanced queries (joins, filters, pagination)
- Server-side operations with service role

Copy and customize `client-example.ts` into your application code as you build out features.

## Authentication

Supabase supports multiple auth methods:
- Email/Password
- Magic Links
- OAuth (Google, GitHub, etc.)
- Phone/SMS

Example:
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

## Real-time Subscriptions

Subscribe to database changes:
```typescript
const channel = supabase
  .channel('conversations')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'conversations' },
    (payload) => {
      console.log('New conversation:', payload.new)
    }
  )
  .subscribe()
```

## Storage

Upload and manage files:
```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-123.png', file)

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-123.png')
```

## Row Level Security (RLS)

All tables have RLS policies to ensure:
- Users can only access their own data
- Service role can bypass for admin operations
- Public read access where appropriate

## Best Practices

1. **Use RLS**: Always enable Row Level Security
2. **Service Role**: Only use service role key server-side
3. **Type Safety**: Generate TypeScript types from schema
4. **Migrations**: Version control your schema changes
5. **Indexes**: Add indexes for frequently queried columns

## Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

## 📝 注意事項

- `.env.local` は Git にコミットしないでください（`.gitignore` に含まれています）
- 本番環境では、適切な JWT シークレットとキーを生成してください
- Docker Compose と Supabase CLI の両方が使用可能ですが、同時に起動しないでください

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Database Guide](https://supabase.com/docs/guides/database)
- [Auth Guide](https://supabase.com/docs/guides/auth)
