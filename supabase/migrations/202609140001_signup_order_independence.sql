-- The account mirror and the identity guard both assumed a particular order between the two rows
-- the auth service writes at signup, and both fail closed when that order differs. Reproduced
-- against this database: inserting a user before its email is known aborts signup on the mirror's
-- not-null email, and inserting the first identity before the mirror row exists raises
-- FITIN_ACCOUNT_NOT_READY. Neither is a rule worth enforcing; they are assumptions about
-- internals we do not control.
begin;

-- Wait for the email instead of refusing the signup. Recording an account without one would break
-- the one-email-one-account rule, and the trigger already fires again when the email is set.
create or replace function fitin_private.capture_account() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if NEW.email is null then return NEW; end if;
  insert into public.accounts(id, email, signup_provider, display_name)
  values (
    NEW.id,
    lower(NEW.email),
    NEW.raw_app_meta_data->>'provider',
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.accounts.display_name, excluded.display_name);
  return NEW;
end;
$$;
revoke all on function fitin_private.capture_account() from public;

-- Same rule, no ordering assumption: when the mirror row is not written yet, the provider that
-- created the user is already recorded on the user itself. A provider other than that one is still
-- always refused, and the error still names the owner so the app can say which button to press.
create or replace function fitin_private.guard_identity_link() returns trigger
language plpgsql security definer set search_path = '' as $$
declare origin text;
begin
  select signup_provider into origin from public.accounts where id = NEW.user_id;
  if origin is null then
    select raw_app_meta_data->>'provider' into origin from auth.users where id = NEW.user_id;
  end if;
  if origin is null or NEW.provider = origin then return NEW; end if;
  raise exception 'FITIN_USE_EXISTING_PROVIDER:%', origin;
end;
$$;
revoke all on function fitin_private.guard_identity_link() from public;

commit;
