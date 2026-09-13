-- Prepared migration. Apply to a development Supabase project before production.
begin;

create table public.routine_libraries (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint routine_document_shape check (
    jsonb_typeof(document) = 'object'
    and document ?& array['version', 'preferences']
    and document->'version' = '1'::jsonb
    and jsonb_typeof(document->'preferences') = 'object'
    and not document ?| array['session', 'history']
    and octet_length(document::text) <= 131072
  )
);

alter table public.routine_libraries enable row level security;
revoke all on public.routine_libraries from anon, authenticated;
grant select, insert, update, delete on public.routine_libraries to authenticated;
create policy own_routine_library on public.routine_libraries
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create function public.stamp_routine_library() returns trigger
language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    NEW.revision := 1;
  else
    NEW.revision := OLD.revision + 1;
  end if;
  NEW.updated_at := now();
  return NEW;
end;
$$;
revoke all on function public.stamp_routine_library() from public;
create trigger stamp_routine_library before insert or update on public.routine_libraries
  for each row execute function public.stamp_routine_library();

commit;
