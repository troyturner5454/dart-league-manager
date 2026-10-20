-- Run in THIS league's Supabase SQL editor (dart-league-manager).
-- Part 1: add lockout columns - run BEFORE deploying the new code.
alter table public.players
  add column if not exists failed_attempts integer not null default 0,
  add column if not exists locked_until timestamptz;

-- Part 2: lock the database - run AFTER the new code is deployed and working.
alter table public.players enable row level security;
alter table public.stats   enable row level security;

revoke all on public.players from anon, authenticated;
revoke all on public.stats   from anon, authenticated;

revoke execute on function public.merge_nightly_stats(
  bigint, date, integer, integer, integer, integer, integer, integer
) from public, anon, authenticated;
