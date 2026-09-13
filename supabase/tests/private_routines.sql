-- Executes inside a disposable Postgres test DB; auth.uid() and roles are supplied by the runner.
begin;
insert into auth.users(id) values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002');
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
insert into public.routine_libraries(owner_id, document, revision) values
  (auth.uid(), '{"version":1,"preferences":{}}', 999);
do $$ begin
  if (select revision from public.routine_libraries) <> 1 then
    raise exception 'Client-controlled initial revision';
  end if;
end $$;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
do $$ declare touched integer; begin
  if exists (select from public.routine_libraries) then raise exception 'Cross-user read'; end if;
  update public.routine_libraries set document = '{"version":1,"preferences":{}}';
  get diagnostics touched = row_count;
  if touched <> 0 then raise exception 'Cross-user update'; end if;
  delete from public.routine_libraries;
  get diagnostics touched = row_count;
  if touched <> 0 then raise exception 'Cross-user delete'; end if;
  begin
    insert into public.routine_libraries(owner_id, document) values
      ('00000000-0000-0000-0000-000000000001', '{"version":1,"preferences":{}}');
    raise exception 'Cross-user insert';
  exception when insufficient_privilege then null;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
do $$ declare touched integer; begin
  update public.routine_libraries set document = '{"version":1,"preferences":{"globalRest":60}}'
    where owner_id = auth.uid() and revision = 1;
  if (select revision from public.routine_libraries) <> 2 then raise exception 'Missing revision'; end if;
  update public.routine_libraries set document = '{"version":1,"preferences":{}}' where revision = 1;
  get diagnostics touched = row_count;
  if touched <> 0 then raise exception 'Stale revision overwrote newer data'; end if;
  begin
    update public.routine_libraries set owner_id = '00000000-0000-0000-0000-000000000002';
    raise exception 'Ownership reassignment';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.routine_libraries set document = '{"version":1,"preferences":{},"session":{}}';
    raise exception 'Session accepted in routine document';
  exception when check_violation then null;
  end;
end $$;

set local role anon;
do $$ begin
  begin
    perform * from public.routine_libraries;
    raise exception 'Anonymous read';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
delete from auth.users where id = '00000000-0000-0000-0000-000000000001';
do $$ begin
  if exists (select from public.routine_libraries) then raise exception 'Account delete did not cascade'; end if;
end $$;
rollback;
