-- Consolidated schema snapshot of the Supabase project (obxrisavtddfydqurxfl / "AI Brain Project")
-- as of the date this file was generated. This is a reconstruction from the live database
-- (via introspection), not the original migration history — the original migrations were:
--   20260803043858  create_documents_table
--   20260803105000  create_memory_events_table
--   20260805025951  create_integration_feed_table
--   20260805081732  add_is_seed_columns_for_reset
-- Re-running this file against a fresh Supabase project reproduces the same schema.

create extension if not exists pgcrypto;

-- Uploaded documents the AI Brain can answer questions about (via the "upload" and "chat" Edge Functions)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  content text not null,
  char_count integer not null default 0,
  created_at timestamptz not null default now(),
  is_seed boolean not null default false
);

-- Institutional decision/lesson/loss/project timeline entries (Timeline & Decision Memory tabs)
create table if not exists public.memory_events (
  id uuid primary key default gen_random_uuid(),
  occurred_on text not null,
  type text not null default 'decision', -- 'decision' | 'lesson' | 'loss' | 'project'
  title text not null,
  summary text not null,
  detail text not null default '',
  created_at timestamptz not null default now(),
  is_seed boolean not null default false
);

-- Simulated integration feed (illustrative — shows the "learns from every system" concept)
create table if not exists public.integration_feed (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  title text not null,
  snippet text not null,
  created_at timestamptz not null default now(),
  is_seed boolean not null default false
);

-- Row Level Security
alter table public.documents enable row level security;
alter table public.memory_events enable row level security;
alter table public.integration_feed enable row level security;

-- Demo-mode policies: open read/insert (no auth layer yet — this is a public demo, not multi-tenant SaaS).
-- Tighten these before onboarding real customer data.
create policy demo_allow_all_select on public.documents for select using (true);
create policy demo_allow_all_insert on public.documents for insert with check (true);

create policy demo_allow_all_select on public.memory_events for select using (true);
create policy demo_allow_all_insert on public.memory_events for insert with check (true);

create policy demo_allow_all_select on public.integration_feed for select using (true);
create policy demo_allow_all_insert on public.integration_feed for insert with check (true);
