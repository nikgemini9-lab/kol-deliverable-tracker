# KOL Deliverable Tracker

A production-ready SaaS dashboard to track whether KOLs/influencers completed their monthly X/Twitter deliverables.

## Features

- **Auto X/Twitter tracking** via Rettiwt-API
- **Deliverable management** with progress tracking
- **Payout recommendations** (Pay / Review / Hold)
- **Monthly reports** with export
- **Manual logging** for newsletters, spaces, etc.
- **Multi-workspace** support

## Tech Stack

- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- Supabase (Auth + Database)
- Rettiwt-API (X/Twitter data)
- Deployed on Render

---

## Setup

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project URL and keys from **Settings > API**

### 2. Rettiwt API Key

The Rettiwt API key is your X/Twitter `auth_token` cookie:

1. Log in to [x.com](https://x.com) in your browser
2. Open DevTools (F12) → Application → Cookies → `https://x.com`
3. Find the cookie named `auth_token` and copy its value
4. Use this as your `RETTIWT_API_KEY`

> **Note:** Keep this token private. It gives full access to your X account.

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RETTIWT_API_KEY=your_x_auth_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Load Demo Data (Optional)

After creating your first account, run the seed script in Supabase SQL Editor:

```sql
-- Contents of supabase/seed.sql
```

---

## Deploying to Render

1. Push this repo to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Add all environment variables from `.env.example`
5. Set `NEXT_PUBLIC_APP_URL` to your Render URL

---

## User Flow

1. **Sign up** → create workspace
2. **Onboarding** → add your company/brand + keywords
3. **Settings** → add company X handle and tracking keywords
4. **Add KOLs** → name, handle, monthly fee, campaign dates
5. **Create campaigns** → set promised deliverables per KOL per month
6. **Sync** → click "Sync Now" on KOL page to fetch tweets via Rettiwt
7. **Track** → view completion %, payout recommendations
8. **Report** → generate monthly reports

---

## Deliverable Classification

The app classifies tweets as:

| Type | Criteria |
|------|----------|
| `original` | Tweet not a reply or quote, by KOL |
| `mention` | Contains company name or keywords |
| `handle_tag` | Contains `@companyhandle` |
| `reply` | Reply to company account |
| `quote_tweet` | Quote tweet of company content |

---

## Payout Logic

| Completion | Recommendation |
|-----------|----------------|
| ≥ 90% | ✓ **Pay** |
| 50–89% | ~ **Review** |
| < 50% | ✗ **Hold** |

## Status Logic

| Condition | Status |
|-----------|--------|
| 100% complete | Completed |
| Campaign ended, incomplete | Overdue |
| ≤7 days left, <70% done | At Risk |
| Otherwise | On Track |
