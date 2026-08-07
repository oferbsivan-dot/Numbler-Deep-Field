-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run.

create table if not exists numbers (
  number           text primary key check (number ~ '^[0-9]{20}$'),
  first_claimant   text not null,
  first_seen_at    timestamptz not null default now(),
  selection_count  integer not null default 0,
  pattern_label    text
);

create table if not exists selections (
  id             bigserial primary key,
  number         text not null references numbers(number),
  claimant_name  text not null,
  selected_at    timestamptz not null default now()
);

create index if not exists selections_number_idx on selections(number);
create index if not exists numbers_selection_count_idx on numbers(selection_count desc);
create index if not exists numbers_first_seen_idx on numbers(first_seen_at desc);

-- This function is the one piece of logic that has to be race-safe:
-- if two people submit the identical 20-digit string in the same instant,
-- exactly one of them can be "first." The unique primary key on `number`
-- plus INSERT ... ON CONFLICT enforces that at the database level, so it's
-- correct even under concurrent load — no application-level locking needed.
create or replace function claim_number(
  p_number text,
  p_name text,
  p_pattern_label text default null
)
returns table (
  number text,
  first_claimant text,
  first_seen_at timestamptz,
  selection_count integer,
  is_first boolean,
  pattern_label text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_first boolean := false;
begin
  insert into numbers (number, first_claimant, first_seen_at, selection_count, pattern_label)
  values (p_number, p_name, now(), 1, p_pattern_label)
  on conflict (number) do nothing;

  if found then
    v_is_first := true;
  else
    update numbers set selection_count = selection_count + 1
    where numbers.number = p_number;
  end if;

  insert into selections (number, claimant_name) values (p_number, p_name);

  return query
    select n.number, n.first_claimant, n.first_seen_at, n.selection_count, v_is_first, n.pattern_label
    from numbers n
    where n.number = p_number;
end;
$$;

-- Row Level Security: anyone can read, but writes only happen through the
-- claim_number function above (called with elevated rights), never directly.
alter table numbers enable row level security;
alter table selections enable row level security;

create policy "Anyone can read numbers" on numbers for select using (true);
create policy "Anyone can read selections" on selections for select using (true);

-- The function runs as its owner (security definer), so it bypasses RLS
-- to perform its insert/update — that's intentional and is the only
-- write path into these tables. Make sure the public/anon role can call it:
grant execute on function claim_number(text, text, text) to anon, authenticated;
