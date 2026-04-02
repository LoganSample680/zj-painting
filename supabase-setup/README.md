# Supabase Cloud Sync Setup

Connects the app to a free Supabase database so data syncs across devices and survives phone replacements.

---

## Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → Sign up free
2. Click **New project**
3. Name it `zj-painting`
4. Set a database password (save it somewhere)
5. Region: **US East** (closest to Wichita)
6. Click **Create new project** — takes about 2 minutes

---

## Step 2 — Create the database table

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy the entire contents of `supabase-setup.sql` and paste it in
4. Click **Run** (or Ctrl+Enter)
5. You should see "Success. No rows returned"

---

## Step 3 — Get your API keys

1. In Supabase, click **Project Settings** (gear icon, bottom left)
2. Click **API** in the left menu
3. Copy two values:
   - **Project URL** — looks like `https://abcdefghijkl.supabase.co`
   - **anon public** key — long string starting with `eyJ...`

---

## Step 4 — Add keys to the app

Open `index.html` in a text editor. Find these two lines near the top of the `<script>` section:

```javascript
const SUPA_URL = '';
const SUPA_KEY = '';
```

Fill them in:

```javascript
const SUPA_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPA_KEY = 'eyJ...YOUR_ANON_KEY...';
```

Save the file.

---

## Step 5 — Push updated app to GitHub

```bash
cd /path/to/zj-painting
git add index.html
git commit -m "Add Supabase cloud sync"
git push
```

GitHub Pages updates automatically within 60 seconds.

---

## How it works after setup

1. First time Zach opens the app, a sign-in screen appears
2. He creates an account with his email + a password
3. After signing in, all his existing data (if any is on the phone) uploads to the cloud
4. Every time data changes, it syncs to Supabase in the background (2-second debounce)
5. On a new device, he signs in and all his data downloads instantly
6. A tiny status indicator at the bottom shows: **✅ Synced** or **🔄 Saving...**

---

## Free tier limits

Supabase free tier includes:
- 500MB database storage (more than enough — even 10 years of bids is a few MB)
- 50,000 monthly active users
- Unlimited API requests
- Automatic backups

No credit card required. Free forever at this scale.

---

## Security

- Each user can only read and write their own row (Row Level Security enabled)
- All data is encrypted in transit (HTTPS)
- Supabase is SOC2 certified
- The anon key in the app is safe to be public — it can only access data for the authenticated user
