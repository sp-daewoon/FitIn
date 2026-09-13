begin;
create schema if not exists fitin_private;
revoke all on schema fitin_private from public, anon, authenticated;

create table public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  signup_provider text not null check (signup_provider in ('email','google','apple')),
  display_name text,
  created_at timestamptz not null default now()
);
create unique index accounts_email_unique on public.accounts(lower(email));
alter table public.accounts enable row level security;
revoke all on public.accounts from anon, authenticated;
grant select on public.accounts to authenticated;
create policy own_account on public.accounts for select to authenticated using (id = (select auth.uid()));

create function fitin_private.capture_account() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.accounts(id,email,signup_provider,display_name)
    values (NEW.id,lower(NEW.email),NEW.raw_app_meta_data->>'provider',
      coalesce(NEW.raw_user_meta_data->>'full_name',NEW.raw_user_meta_data->>'name'));
  else
    update public.accounts set email=lower(NEW.email),
      display_name=coalesce(display_name,NEW.raw_user_meta_data->>'full_name',NEW.raw_user_meta_data->>'name')
    where id=NEW.id;
  end if;
  return NEW;
end;
$$;
revoke all on function fitin_private.capture_account() from public;
create trigger fitin_capture_account after insert or update of email,raw_user_meta_data on auth.users
  for each row execute function fitin_private.capture_account();

create table fitin_private.identity_link_requests (
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null check(provider in ('google','apple')),
  expires_at timestamptz not null,
  primary key(user_id,provider)
);
create function public.request_identity_link(provider text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select from public.accounts where id=auth.uid() and signup_provider='email') then
    raise exception 'FITIN_EMAIL_ACCOUNTS_ONLY';
  end if;
  if provider not in ('google','apple') then raise exception 'FITIN_INVALID_PROVIDER'; end if;
  insert into fitin_private.identity_link_requests values(auth.uid(),provider,now()+interval '2 minutes')
  on conflict on constraint identity_link_requests_pkey do update set expires_at=excluded.expires_at;
end;
$$;
revoke all on function public.request_identity_link(text) from public,anon;
grant execute on function public.request_identity_link(text) to authenticated;

-- Supabase auto-linking must never attach a second identity without a settings action.
create function fitin_private.guard_identity_link() returns trigger
language plpgsql security definer set search_path = '' as $$
declare origin text; permitted boolean;
begin
  select signup_provider into origin from public.accounts where id=NEW.user_id for update;
  if origin is null then raise exception 'FITIN_ACCOUNT_NOT_READY'; end if;
  if NEW.provider=origin then return NEW; end if;
  if origin='email' then
    delete from fitin_private.identity_link_requests
      where user_id=NEW.user_id and provider=NEW.provider and expires_at>now()
      returning true into permitted;
    if permitted then return NEW; end if;
  end if;
  raise exception 'FITIN_USE_EXISTING_PROVIDER:%',origin;
end;
$$;
revoke all on function fitin_private.guard_identity_link() from public;
create trigger fitin_guard_identity_link before insert on auth.identities
  for each row execute function fitin_private.guard_identity_link();

-- Configure this function as the Supabase Custom Access Token hook before enabling social auth.
-- Identity insertion guards OAuth; the hook also blocks OTP/password bypass for social-only users.
create function public.fitin_access_token_hook(event jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare origin text; method text;
begin
  select signup_provider into origin from public.accounts where id=(event->>'user_id')::uuid;
  method:=event->>'authentication_method';
  if origin is null or method not in ('otp','magiclink','email/signup','oauth','token_refresh')
    or (origin<>'email' and method in ('otp','magiclink','email/signup')) then
    return jsonb_build_object('error',jsonb_build_object('http_code',403,
      'message','FITIN_USE_EXISTING_PROVIDER:'||coalesce(origin,'unknown')));
  end if;
  return jsonb_build_object('claims',jsonb_set(event->'claims','{fitin_signup_provider}',to_jsonb(origin)));
end;
$$;
revoke all on function public.fitin_access_token_hook(jsonb) from public,anon,authenticated;
grant execute on function public.fitin_access_token_hook(jsonb) to supabase_auth_admin;

-- Intentional email-existence disclosure, per the product contract. No account contents are returned.
create function public.account_login_route(address text) returns text
language sql stable security definer set search_path = '' as $$
  select signup_provider from public.accounts where lower(email)=lower(trim(address)) limit 1;
$$;
revoke all on function public.account_login_route(text) from public;
grant execute on function public.account_login_route(text) to anon,authenticated;

create table public.workout_backups (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null check (
    jsonb_typeof(document)='object' and document ?& array['version','preferences','history']
    and document->'version'='1'::jsonb
    and jsonb_typeof(document->'preferences')='object'
    and jsonb_typeof(document->'history')='array'
    and not document ? 'session' and octet_length(document::text)<=4194304
  ),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.workout_backups enable row level security;
revoke all on public.workout_backups from anon,authenticated;
grant select,insert,update,delete on public.workout_backups to authenticated;
create policy own_workout_backup on public.workout_backups for all to authenticated
  using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create trigger stamp_workout_backup before insert or update on public.workout_backups
  for each row execute function public.stamp_routine_library();

create function public.delete_email_or_google_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'FITIN_SIGN_IN_REQUIRED'; end if;
  if exists(select from auth.identities where user_id=auth.uid() and provider='apple') then
    raise exception 'FITIN_APPLE_REVOCATION_REQUIRED';
  end if;
  delete from auth.users where id=auth.uid();
end;
$$;
revoke all on function public.delete_email_or_google_account() from public,anon;
grant execute on function public.delete_email_or_google_account() to authenticated;

create table public.content_releases (
  revision bigint generated always as identity primary key,
  document jsonb not null check (jsonb_typeof(document)='object' and document->'version'='1'::jsonb
    and octet_length(document::text)<=1048576),
  published boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.content_releases enable row level security;
revoke all on public.content_releases from anon,authenticated;
grant select on public.content_releases to anon,authenticated;
create policy published_content on public.content_releases for select to anon,authenticated using(published);
commit;
