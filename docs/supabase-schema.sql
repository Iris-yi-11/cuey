-- PM Cue P1.5 Supabase schema
-- Run in Supabase SQL Editor after reviewing privacy and access rules.

create table if not exists public.source_allowlist (
  id text primary key,
  name text not null,
  category_id text not null,
  homepage_url text not null,
  feed_url text,
  enabled boolean not null default true,
  authority_weight numeric not null default 0.7,
  max_items_per_day integer not null default 1,
  cost_tier text,
  refresh_method text,
  updated_at timestamptz not null default now()
);

create table if not exists public.cue_bank_items (
  id text not null,
  client_id text,
  user_id uuid,
  cue_item jsonb not null,
  is_saved boolean not null default true,
  is_done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (id, client_id)
);

alter table public.cue_bank_items add column if not exists user_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cue_bank_items_id_user_id_key'
  ) then
    alter table public.cue_bank_items add constraint cue_bank_items_id_user_id_key unique (id, user_id);
  end if;
end $$;

comment on column public.cue_bank_items.client_id is
  'Legacy preview identity. Retained for backward compatibility only.';

comment on column public.cue_bank_items.user_id is
  'Supabase Auth user id. Production Cue Bank sync should use this field.';

create index if not exists cue_bank_items_client_id_updated_at_idx
  on public.cue_bank_items (client_id, updated_at desc);

create index if not exists cue_bank_items_user_id_updated_at_idx
  on public.cue_bank_items (user_id, updated_at desc);

create table if not exists public.daily_cue_snapshots (
  date text primary key,
  payload jsonb not null,
  generated_from text not null,
  item_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists daily_cue_snapshots_updated_at_idx
  on public.daily_cue_snapshots (updated_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists source_allowlist_set_updated_at on public.source_allowlist;
create trigger source_allowlist_set_updated_at
before update on public.source_allowlist
for each row execute function public.set_updated_at();

drop trigger if exists cue_bank_items_set_updated_at on public.cue_bank_items;
create trigger cue_bank_items_set_updated_at
before update on public.cue_bank_items
for each row execute function public.set_updated_at();

drop trigger if exists daily_cue_snapshots_set_updated_at on public.daily_cue_snapshots;
create trigger daily_cue_snapshots_set_updated_at
before update on public.daily_cue_snapshots
for each row execute function public.set_updated_at();

alter table public.source_allowlist enable row level security;
alter table public.cue_bank_items enable row level security;
alter table public.daily_cue_snapshots enable row level security;

-- The current MVP uses server-side REST calls with SUPABASE_SERVICE_ROLE_KEY.
-- Do not expose SUPABASE_SERVICE_ROLE_KEY to frontend code.
grant usage on schema public to service_role;
grant select, insert, update, delete on public.source_allowlist to service_role;
grant select, insert, update, delete on public.cue_bank_items to service_role;
grant select, insert, update, delete on public.daily_cue_snapshots to service_role;

drop policy if exists "Users can read own cue bank items" on public.cue_bank_items;
create policy "Users can read own cue bank items"
on public.cue_bank_items
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own cue bank items" on public.cue_bank_items;
create policy "Users can insert own cue bank items"
on public.cue_bank_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own cue bank items" on public.cue_bank_items;
create policy "Users can update own cue bank items"
on public.cue_bank_items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own cue bank items" on public.cue_bank_items;
create policy "Users can delete own cue bank items"
on public.cue_bank_items
for delete
to authenticated
using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
