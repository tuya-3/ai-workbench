# AI Stack - Phase 1 Architecture

This folder contains the AI stack integration examples and configurations for the AI Workbench project.

## Overview

The AI Workbench Phase 1 architecture integrates two key services:
- **Dify**: AI workflow orchestration and LLM management
- **Supabase**: Backend-as-a-Service for database, authentication, and real-time features

## Architecture Components

### 1. Dify Integration (`/dify`)
Dify provides AI workflow orchestration, allowing you to:
- Create and manage AI workflows visually
- Integrate multiple LLM providers
- Build conversational AI applications
- Monitor and analyze AI performance

**Key Features:**
- Workflow orchestration
- LLM provider abstraction
- Conversation management
- Analytics and monitoring

### 2. Supabase Setup (`/supabase`)
Supabase serves as the backend infrastructure:
- PostgreSQL database
- Authentication and authorization
- Row-level security
- Real-time subscriptions
- Storage for files and media

**Key Features:**
- Auto-generated REST APIs
- Real-time data synchronization
- User authentication (email, OAuth, magic links)
- File storage with CDN
- Database migrations and versioning

## Getting Started

### Prerequisites
- Node.js 20+ and npm
- Dify account (https://dify.ai)
- Supabase account (https://supabase.com)

### Setup Steps

1. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Dify and Supabase credentials.

2. **Dify Setup**
   - Create a Dify account and project
   - Configure your first workflow (see `/dify/example-workflow.json`)
   - Copy your API key to `.env.local`

3. **Supabase Setup**
   - Create a Supabase project
   - Run the initial schema (see `/supabase/schema.sql`)
   - Copy your project URL and keys to `.env.local`

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Phase 1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
│                  (TypeScript + Tailwind)                │
└─────────────────┬───────────────────────┬───────────────┘
                  │                       │
                  │                       │
         ┌────────▼────────┐    ┌────────▼─────────┐
         │  Dify Workflows │    │    Supabase      │
         │                 │    │                  │
         │ - LLM Calls     │    │ - PostgreSQL     │
         │ - Orchestration │    │ - Auth           │
         │ - Analytics     │    │ - Real-time      │
         └─────────────────┘    │ - Storage        │
                                └──────────────────┘
```

## Integration Examples

### Dify Workflow Example
See `dify/example-workflow.json` for a sample AI workflow configuration.

### Supabase Schema Example
See `supabase/schema.sql` for the initial database schema.

### Client Integration
See `dify/client-example.ts` and `supabase/client-example.ts` for TypeScript integration examples.

## Directory Structure

```
ai-stack/
├── README.md                 # This file
├── dify/
│   ├── README.md            # Dify-specific documentation
│   ├── example-workflow.json # Sample workflow configuration
│   └── client-example.ts    # TypeScript client example
└── supabase/
    ├── README.md            # Supabase-specific documentation
    ├── schema.sql           # Database schema
    └── client-example.ts    # TypeScript client example
```

## Deployment

This project is configured for Vercel deployment:

1. **Connect Repository to Vercel**
   - Import your GitHub repository in Vercel dashboard
   - Vercel will auto-detect Next.js configuration

2. **Configure Environment Variables**
   - Add all variables from `.env.example` in Vercel project settings
   - Use production credentials for Dify and Supabase

3. **Deploy**
   - Push to main branch for automatic deployment
   - Or use `vercel` CLI for manual deployment

## Next Steps

- [ ] Implement specific AI workflows in Dify
- [ ] Define database schema in Supabase
- [ ] Add authentication flows
- [ ] Create API routes for Dify integration
- [ ] Set up real-time features
- [ ] Add monitoring and analytics

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Dify Documentation](https://docs.dify.ai)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
