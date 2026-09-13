#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
test_container="fitin-rls-test-$$"
trap 'docker rm -f "$test_container" >/dev/null 2>&1 || true' EXIT
# Disposable database, no network or exposed ports. Never uses another project's database.
docker run -d --name "$test_container" --network none \
  --tmpfs /var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16-alpine >/dev/null
for attempt in {1..30}; do
  if docker exec "$test_container" sh -c 'test "$(cat /proc/1/comm)" = postgres && pg_isready -U postgres' >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec -i "$test_container" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL'
create role anon;
create role authenticated;
create role supabase_auth_admin;
create schema auth;
create table auth.users(id uuid primary key, email text default (gen_random_uuid()::text||'@example.invalid'),
  raw_app_meta_data jsonb default '{"provider":"email"}', raw_user_meta_data jsonb default '{}');
create table auth.identities(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete cascade,
  provider text not null, provider_id text not null, unique(provider,provider_id));
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
SQL
for migration in supabase/migrations/*.sql; do
  docker exec -i "$test_container" psql -U postgres -v ON_ERROR_STOP=1 < "$migration"
done
docker exec -i "$test_container" psql -U postgres -v ON_ERROR_STOP=1 < supabase/tests/private_routines.sql
docker exec -i "$test_container" psql -U postgres -v ON_ERROR_STOP=1 < supabase/tests/accounts.sql
echo 'PASS: private routines RLS, revision conflict and account deletion cascade (Postgres; Auth mocked).'
