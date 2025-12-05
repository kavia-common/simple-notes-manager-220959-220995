# Simple Notes App (React + Supabase)

A modern, minimal notes app with magic-link auth, realtime updates, and an Ocean Professional theme.

## Tech stack

- React 18 + react-router-dom
- Supabase JS v2 (Auth + Postgres + Realtime)
- date-fns, clsx
- CRA build tooling

## Getting started

1) Install dependencies
- npm install

2) Configure environment
- Create .env in notes_app_frontend root with:
```
REACT_APP_SUPABASE_URL=YOUR_SUPABASE_URL
REACT_APP_SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_API_BASE=
REACT_APP_BACKEND_URL=
REACT_APP_WS_URL=
REACT_APP_NODE_ENV=development
REACT_APP_NEXT_TELEMETRY_DISABLED=1
REACT_APP_ENABLE_SOURCE_MAPS=true
REACT_APP_PORT=3000
REACT_APP_TRUST_PROXY=false
REACT_APP_LOG_LEVEL=info
REACT_APP_HEALTHCHECK_PATH=/health
REACT_APP_FEATURE_FLAGS=
REACT_APP_EXPERIMENTS_ENABLED=false
```

3) Run the app
- npm start
- Visit http://localhost:3000

## Supabase setup

Run the following SQL (SQL Editor > New query):

```sql
-- Enable UUID extension (if not enabled)
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Notes table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row
execute procedure public.set_updated_at();
```

Row Level Security (RLS) policies:

```sql
alter table public.notes enable row level security;

-- Users can read their own notes
create policy "Select own notes"
on public.notes for select
using (auth.uid() = user_id);

-- Users can insert their own notes
create policy "Insert own notes"
on public.notes for insert
with check (auth.uid() = user_id);

-- Users can update their own notes
create policy "Update own notes"
on public.notes for update
using (auth.uid() = user_id);

-- Users can delete their own notes
create policy "Delete own notes"
on public.notes for delete
using (auth.uid() = user_id);
```

Realtime
- In Supabase > Database > Replication > Publication: ensure notes table is in the "supabase_realtime" publication.

Auth
- Enable Email auth with Magic Link.
- Under Authentication > URL configuration > Redirect URLs, add: http://localhost:3000
- The app uses REACT_APP_FRONTEND_URL for emailRedirectTo.

## App routes

- /auth - Email sign-in with magic link
- /notes - Protected dashboard with list + search + new note
- /notes/:noteId - Protected editor for a note

## Theming

The Ocean Professional look & feel is implemented via CSS in src/App.css:
- Blue primary (#2563EB) and amber accents (#F59E0B)
- Minimalist cards, rounded corners, subtle shadows
- Responsive notes grid

## Scripts

- npm start - Start dev server
- npm run build - Production build
- npm test - Run tests

## Environment variables

This project reads configuration from process.env:
- REACT_APP_SUPABASE_URL - Supabase project URL
- REACT_APP_SUPABASE_KEY - Supabase anon key
- REACT_APP_FRONTEND_URL - Used for magic link redirect

Do not commit secrets. Provide these via your CI environment or local .env file.
