# Setup Guide

## Prerequisites
- Node.js 18+
- A Supabase account (free tier works): https://supabase.com
- A Grok API key: https://console.x.ai

## Step 1 — Get your Supabase credentials

1. Go to https://supabase.com and sign in
2. Create a new project (name it anything, e.g. `cv-screening`)
3. Wait ~2 minutes for provisioning
4. Go to **Project Settings → API**
5. Copy:
   - **Project URL** → paste as `VITE_SUPABASE_URL` and `SUPABASE_URL` in `.env.local`
   - **anon / public** key → paste as `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → paste as `SUPABASE_SERVICE_ROLE_KEY`

## Step 2 — Get your Grok API key

1. Go to https://console.x.ai
2. Sign in and create an API key
3. Paste it as `GROK_API_KEY` in `.env.local`

## Step 3 — Apply database migrations

Go to your Supabase project → **SQL Editor** → run each file in order:

1. Copy and paste `supabase/migrations/001_initial_schema.sql` → click **Run**
2. Copy and paste `supabase/migrations/002_rls_policies.sql` → click **Run**
3. Copy and paste `supabase/migrations/003_storage_bucket.sql` → click **Run**

## Step 4 — Enable Realtime

In Supabase dashboard:
1. Go to **Database → Replication**
2. Enable replication for the `candidates` table

## Step 5 — Run locally

```bash
npm run dev
```

Open http://localhost:5173 — you'll see the Login page.

## Step 6 — Deploy to Vercel

1. Push the project to a GitHub repository
2. Go to https://vercel.com → **New Project** → import your repo
3. Add all environment variables from `.env.local` in Vercel's project settings
   (Settings → Environment Variables)
4. Deploy — Vercel automatically detects the `api/` folder as serverless functions

## Notes

- `.env.local` is gitignored — your keys are never committed
- The `GROK_API_KEY` only lives in server-side environment (Vercel Functions) — it never reaches the browser
- Supabase Row Level Security is enabled — each recruiter only sees their own data
