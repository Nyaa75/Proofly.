-- ============================================================
-- Proofly — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROOFS ─────────────────────────────────────────────────
create table if not exists public.proofs (
  id                text        primary key,               -- PRF-XXXXXXXX
  user_id           uuid        not null references auth.users(id) on delete cascade,
  title             text        not null,
  type              text        not null check (type in ('text','image','pdf','video','url')),
  content_hash      text        not null,                  -- SHA-256
  analysis          jsonb       not null default '{}',     -- ProofAnalysis object
  credibility_score integer     not null default 0 check (credibility_score between 0 and 100),
  plan_at_creation  text        not null default 'free' check (plan_at_creation in ('free','pro','agency')),
  file_url          text,                                   -- Supabase Storage public URL
  source_url        text,                                   -- For type=url
  raw_content       text,                                   -- For type=text
  created_at        timestamptz not null default now()
);

-- Indexes
create index if not exists proofs_user_id_idx      on public.proofs(user_id);
create index if not exists proofs_created_at_idx   on public.proofs(created_at desc);
create index if not exists proofs_credibility_idx  on public.proofs(credibility_score desc);

-- RLS
alter table public.proofs enable row level security;

-- Users can read their own proofs
create policy "Users read own proofs"
  on public.proofs for select
  using (auth.uid() = user_id);

-- Public can read any proof (for /cert/[id] page)
create policy "Public can read proofs"
  on public.proofs for select
  using (true);

-- Users can insert their own proofs
create policy "Users insert own proofs"
  on public.proofs for insert
  with check (auth.uid() = user_id);

-- Users can update their own proofs
create policy "Users update own proofs"
  on public.proofs for update
  using (auth.uid() = user_id);

-- ─── SUBSCRIPTIONS ─────────────────────────────────────────
create table if not exists public.subscriptions (
  user_id                uuid        primary key references auth.users(id) on delete cascade,
  stripe_customer_id     text        not null unique,
  stripe_subscription_id text,
  plan                   text        not null default 'free' check (plan in ('free','pro','agency')),
  status                 text        not null default 'active' check (status in ('active','canceled','past_due','trialing')),
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Trigger: auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.subscriptions enable row level security;

create policy "Users read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role manages subscriptions"
  on public.subscriptions for all
  using (true)
  with check (true);

-- ─── STORAGE ───────────────────────────────────────────────
-- Create the 'proofs' storage bucket (run separately in dashboard or here)
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

-- Storage RLS: users can upload to their own folder
create policy "Users upload own files"
  on storage.objects for insert
  with check (
    bucket_id = 'proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public read proof files"
  on storage.objects for select
  using (bucket_id = 'proofs');

create policy "Users delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'proofs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── HELPER VIEW ───────────────────────────────────────────
-- Useful view for joining proofs with subscription plan
create or replace view public.proofs_with_plan as
select
  p.*,
  coalesce(s.plan, 'free')   as user_current_plan,
  coalesce(s.status, 'none') as subscription_status
from public.proofs p
left join public.subscriptions s on p.user_id = s.user_id;
