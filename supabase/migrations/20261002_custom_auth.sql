-- ============================================================
-- Youth Assam — migrate an existing database to custom JWT auth
-- Safe to run more than once. Run in Supabase → SQL Editor.
-- ============================================================
-- Fixes:
--  * users.uid referenced auth.users(id), but accounts are now created by the
--    backend (custom JWT) — every registration failed with a foreign-key error.
--  * users had no "passwordHash" column — registration/login could not work.
--  * otp_codes gains a "purpose" column (signup / password reset).
--  * Users could promote themselves to admin by updating their own row.
--  * Password hashes were readable through the public API.

-- 1. users.uid no longer tied to Supabase Auth
do $$
declare c record;
begin
  for c in
    select con.conname from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace n on n.oid = rel.relnamespace
    where n.nspname = 'public' and rel.relname = 'users' and con.contype = 'f'
  loop
    execute format('alter table public.users drop constraint %I', c.conname);
  end loop;
end $$;
alter table public.users alter column uid set default gen_random_uuid();

-- 2. credentials + unique email
alter table public.users add column if not exists "passwordHash" text;
update public.users set email = lower(trim(email)) where email is not null and email <> lower(trim(email));
do $$
begin
  if not exists (select 1 from pg_indexes where schemaname = 'public' and tablename = 'users' and indexdef ilike '%unique%(email)%') then
    create unique index users_email_unique on public.users(email);
  end if;
end $$;

-- 3. OTP storage
create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(), email text not null, purpose text not null default 'signup', "otpHash" text not null,
  attempts integer not null default 0, verified boolean not null default false,
  "expiresAt" timestamptz not null, "createdAt" timestamptz not null default now()
);
alter table public.otp_codes add column if not exists purpose text not null default 'signup';
create index if not exists otp_email_purpose_created_idx on public.otp_codes(email, purpose, "createdAt" desc);
create index if not exists otp_expiry_idx on public.otp_codes("expiresAt");
alter table public.otp_codes enable row level security;
revoke all on public.otp_codes from anon, authenticated;

-- 4. never expose password hashes to the browser
revoke select on public.users from anon, authenticated;
grant select (id, uid, email, "displayName", role, "profilePicture", bio, location, phone, "educationLevel", interests, "createdAt", "updatedAt", "isVerified", "isActive") on public.users to authenticated;

-- 5. block self-promotion to admin
create or replace function public.protect_user_columns()
returns trigger language plpgsql set search_path = public as $$ -- runs as the caller so current_user is the API role
begin
  if current_user in ('anon', 'authenticated') and not public.is_admin() then
    new.role := old.role;
    new."isActive" := old."isActive";
    new."isVerified" := old."isVerified";
    new.email := old.email;
    new.uid := old.uid;
    new."passwordHash" := old."passwordHash";
  elsif current_user in ('anon', 'authenticated') then
    new."passwordHash" := old."passwordHash";
  end if;
  return new;
end;
$$;
drop trigger if exists users_protect_columns on public.users;
create trigger users_protect_columns before update on public.users for each row execute function public.protect_user_columns();

-- 6. make yourself admin (edit the email, then run):
-- update public.users set role = 'admin' where email = 'you@example.com';
