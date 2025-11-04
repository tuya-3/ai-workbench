# Supabase Integration

This directory contains Supabase configuration and integration examples.

## What is Supabase?

Supabase is an open-source Firebase alternative providing:
- PostgreSQL database
- Authentication & authorization
- Auto-generated APIs
- Real-time subscriptions
- Storage for files
- Edge Functions

## Setup

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
- User profiles table
- AI conversations table
- Workflow runs table
- Row Level Security (RLS) policies

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

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Database Guide](https://supabase.com/docs/guides/database)
- [Auth Guide](https://supabase.com/docs/guides/auth)
