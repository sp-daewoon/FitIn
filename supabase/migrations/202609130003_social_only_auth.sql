-- Email sign-in is removed from the product. Accounts are created only through a social provider,
-- and identity linking disappears with it: linking existed solely so an email account could add a
-- social button, and there are no email accounts any more.
--
-- Disable the email provider in the project's auth settings as well. This migration is the second
-- lock, not the first: if the provider stays enabled, the database still refuses the session.
begin;

-- A social-only account cannot add a second provider, so the request table and its entry point go.
drop trigger if exists fitin_guard_identity_link on auth.identities;
drop function if exists public.request_identity_link(text);
drop table if exists fitin_private.identity_link_requests;

-- Nothing asks "which provider owns this address" now, and dropping it removes a deliberate
-- account-existence disclosure that no longer buys anything.
drop function if exists public.account_login_route(text);

alter table public.accounts drop constraint if exists accounts_signup_provider_check;
alter table public.accounts add constraint accounts_signup_provider_check
  check (signup_provider in ('google', 'apple'));

-- A provider other than the one that created the account is always refused. The error carries the
-- original provider so the app can name it instead of showing a generic failure.
create or replace function fitin_private.guard_identity_link() returns trigger
language plpgsql security definer set search_path = '' as $$
declare origin text;
begin
  select signup_provider into origin from public.accounts where id = NEW.user_id for update;
  if origin is null then raise exception 'FITIN_ACCOUNT_NOT_READY'; end if;
  if NEW.provider = origin then return NEW; end if;
  raise exception 'FITIN_USE_EXISTING_PROVIDER:%', origin;
end;
$$;
revoke all on function fitin_private.guard_identity_link() from public;
create trigger fitin_guard_identity_link before insert on auth.identities
  for each row execute function fitin_private.guard_identity_link();

-- Defense in depth against a re-enabled email provider. This is a denylist on purpose: an
-- allowlist would lock everyone out the day a provider reports a method name we did not predict,
-- and the methods we actually removed are the ones worth naming.
create or replace function public.fitin_access_token_hook(event jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare origin text; method text;
begin
  select signup_provider into origin from public.accounts where id = (event->>'user_id')::uuid;
  method := event->>'authentication_method';
  if origin is null or method in ('otp', 'magiclink', 'email/signup', 'email_change', 'password') then
    return jsonb_build_object('error', jsonb_build_object('http_code', 403,
      'message', 'FITIN_USE_EXISTING_PROVIDER:' || coalesce(origin, 'unknown')));
  end if;
  return jsonb_build_object('claims', jsonb_set(event->'claims', '{fitin_signup_provider}', to_jsonb(origin)));
end;
$$;
revoke all on function public.fitin_access_token_hook(jsonb) from public, anon, authenticated;
grant execute on function public.fitin_access_token_hook(jsonb) to supabase_auth_admin;

-- Same rule, honest name: Apple accounts need token revocation and are handled elsewhere.
drop function if exists public.delete_email_or_google_account();
create function public.delete_non_apple_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'FITIN_SIGN_IN_REQUIRED'; end if;
  if exists (select from auth.identities where user_id = auth.uid() and provider = 'apple') then
    raise exception 'FITIN_APPLE_REVOCATION_REQUIRED';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_non_apple_account() from public, anon;
grant execute on function public.delete_non_apple_account() to authenticated;

commit;
