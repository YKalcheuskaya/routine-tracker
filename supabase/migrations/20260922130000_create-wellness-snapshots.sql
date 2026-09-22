-- One private JSON journal per authenticated account. All access is restricted
-- to the authenticated user; never put a service-role key in the frontend.
create table if not exists public.wellness_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  journal jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.wellness_snapshots enable row level security;

create policy "Users read only their own wellness journal"
  on public.wellness_snapshots for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users create only their own wellness journal"
  on public.wellness_snapshots for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update only their own wellness journal"
  on public.wellness_snapshots for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete only their own wellness journal"
  on public.wellness_snapshots for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_wellness_snapshot_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_wellness_snapshot_updated_at on public.wellness_snapshots;
create trigger set_wellness_snapshot_updated_at
before update on public.wellness_snapshots
for each row execute function public.set_wellness_snapshot_updated_at();
