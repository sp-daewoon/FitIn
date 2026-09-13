begin;
insert into auth.users(id,email,raw_app_meta_data) values
 ('10000000-0000-0000-0000-000000000001','email@example.invalid','{"provider":"email"}'),
 ('10000000-0000-0000-0000-000000000002','google@example.invalid','{"provider":"google"}');
insert into auth.identities(user_id,provider,provider_id) values
 ('10000000-0000-0000-0000-000000000001','email','email@example.invalid'),
 ('10000000-0000-0000-0000-000000000002','google','provider-subject-123');
do $$ begin
  begin
    insert into auth.identities(user_id,provider,provider_id) values
      ('10000000-0000-0000-0000-000000000001','google','unrequested');
    raise exception 'Automatic linking accepted';
  exception when raise_exception then
    if SQLERRM not like 'FITIN_USE_EXISTING_PROVIDER:%' then raise; end if;
  end;
  if public.fitin_access_token_hook('{"user_id":"10000000-0000-0000-0000-000000000002","authentication_method":"otp","claims":{}}')->'error' is null then
    raise exception 'Social account accepted email OTP';
  end if;
  if public.fitin_access_token_hook('{"user_id":"10000000-0000-0000-0000-000000000001","authentication_method":"otp","claims":{}}')->'error' is not null then
    raise exception 'Email OTP rejected';
  end if;
end $$;
set local role authenticated;
set local request.jwt.claim.sub='10000000-0000-0000-0000-000000000002';
do $$ begin
  begin
    perform public.request_identity_link('apple');
    raise exception 'Social account requested another provider';
  exception when raise_exception then
    if SQLERRM<>'FITIN_EMAIL_ACCOUNTS_ONLY' then raise; end if;
  end;
end $$;
set local request.jwt.claim.sub='10000000-0000-0000-0000-000000000001';
select public.request_identity_link('google');
reset role;
insert into auth.identities(user_id,provider,provider_id) values
 ('10000000-0000-0000-0000-000000000001','google','explicitly-linked-subject');
do $$ begin
  if exists(select from fitin_private.identity_link_requests) then raise exception 'Link ticket not consumed'; end if;
end $$;
set local role anon;
do $$ begin
  if public.account_login_route('GOOGLE@example.invalid')<>'google' then raise exception 'Wrong route'; end if;
end $$;
reset role;
rollback;
