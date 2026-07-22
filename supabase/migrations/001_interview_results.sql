-- Interview persistence for authenticated users (max 5 results per user).
-- Run this in the Supabase SQL editor.

create table if not exists public.user_interview_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_interview_at timestamptz,
  last_score numeric(5, 2),
  best_score numeric(5, 2),
  interviews_completed integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.interview_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Software Engineering Interview',
  overall_score numeric(5, 2),
  questions_answered integer not null default 0,
  duration_seconds integer,
  strengths text[] not null default '{}',
  feedback_summary text,
  qa_pairs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists interview_results_user_created_idx
  on public.interview_results (user_id, created_at desc);

alter table public.user_interview_stats enable row level security;
alter table public.interview_results enable row level security;

drop policy if exists "Users read own interview stats" on public.user_interview_stats;
create policy "Users read own interview stats"
  on public.user_interview_stats
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users upsert own interview stats" on public.user_interview_stats;
create policy "Users upsert own interview stats"
  on public.user_interview_stats
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users read own interview results" on public.interview_results;
create policy "Users read own interview results"
  on public.interview_results
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own interview results" on public.interview_results;
create policy "Users insert own interview results"
  on public.interview_results
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own interview results" on public.interview_results;
create policy "Users delete own interview results"
  on public.interview_results
  for delete
  using (auth.uid() = user_id);
