-- Youth Assam Supabase setup
-- Run this once in Supabase SQL Editor.
-- Then enable Realtime for posts and notifications in Database > Publications.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  uid uuid unique not null references auth.users(id) on delete cascade,
  email text,
  "displayName" text,
  role text not null default 'student',
  "profilePicture" text,
  bio text default '', location text default '', phone text default '', "educationLevel" text default '',
  interests jsonb not null default '[]'::jsonb,
  "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now(),
  "isVerified" boolean not null default true, "isActive" boolean not null default true
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(), "userId" uuid, "userName" text, content text, image text, category text,
  status text not null default 'pending', likes jsonb not null default '[]'::jsonb,
  "likeCount" integer not null default 0, "commentCount" integer not null default 0,
  "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(), "postId" uuid not null references public.posts(id) on delete cascade,
  "userId" uuid, "userName" text, content text, "createdAt" timestamptz not null default now()
);

create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(), title text not null, description text, "applyLink" text,
  eligibility text, deadline text, country text, category text,
  "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(), title text not null, description text, "enrollLink" text,
  platform text, category text, duration text, level text,
  "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);

create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(), "userId" uuid, "userName" text, email text, subject text, message text,
  category text, status text not null default 'pending', "adminReply" text,
  "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(), title text, description text, "targetAmount" numeric default 0,
  "totalRaised" numeric default 0, image text, category text, "userId" uuid, status text not null default 'pending',
  donors jsonb not null default '[]'::jsonb, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);

create table if not exists public.govt_works (
  id uuid primary key default gen_random_uuid(), title text, description text, department text, location text,
  link text, deadline text, category text, status text, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);

create table if not exists public.govt_issues (
  id uuid primary key default gen_random_uuid(), title text, description text, category text, location text, image text,
  "userId" uuid, "userName" text, status text not null default 'reported', "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), "userId" uuid not null, title text, message text, type text, link text,
  read boolean not null default false, "createdAt" timestamptz not null default now()
);

-- Server-only OTP storage. Never expose this table through anon/authenticated policies.
create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(), email text not null, "otpHash" text not null,
  attempts integer not null default 0, verified boolean not null default false,
  "expiresAt" timestamptz not null, "createdAt" timestamptz not null default now()
);
create index if not exists otp_email_created_idx on public.otp_codes(email, "createdAt" desc);
create index if not exists otp_expiry_idx on public.otp_codes("expiresAt");
alter table public.otp_codes enable row level security;

create index if not exists posts_status_created_idx on public.posts(status, "createdAt" desc);
create index if not exists notifications_user_created_idx on public.notifications("userId", "createdAt" desc);
create index if not exists notifications_user_read_idx on public.notifications("userId", read);
create index if not exists comments_post_created_idx on public.comments("postId", "createdAt" asc);

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.users where uid = auth.uid() and role = 'admin' and "isActive" = true);
$$;

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.scholarships enable row level security;
alter table public.courses enable row level security;
alter table public.help_requests enable row level security;
alter table public.donations enable row level security;
alter table public.govt_works enable row level security;
alter table public.govt_issues enable row level security;
alter table public.notifications enable row level security;

create policy "users_select_self_or_admin" on public.users for select to authenticated using (uid = auth.uid() or public.is_admin());
create policy "users_insert_self" on public.users for insert to authenticated with check (uid = auth.uid());
create policy "users_update_self_or_admin" on public.users for update to authenticated using (uid = auth.uid() or public.is_admin()) with check (uid = auth.uid() or public.is_admin());
create policy "users_delete_admin" on public.users for delete to authenticated using (public.is_admin());

create policy "posts_public_read_approved" on public.posts for select to anon, authenticated using (status = 'approved' or public.is_admin() or "userId" = auth.uid());
create policy "posts_create_authenticated" on public.posts for insert to authenticated with check ("userId" = auth.uid() or "userId" is null);
create policy "posts_update_owner_or_admin" on public.posts for update to authenticated using ("userId" = auth.uid() or public.is_admin()) with check ("userId" = auth.uid() or public.is_admin());
create policy "posts_delete_owner_or_admin" on public.posts for delete to authenticated using ("userId" = auth.uid() or public.is_admin());

create policy "comments_read_public" on public.comments for select to anon, authenticated using (true);
create policy "comments_create_authenticated" on public.comments for insert to authenticated with check ("userId" = auth.uid() or "userId" is null);
create policy "comments_update_owner_or_admin" on public.comments for update to authenticated using ("userId" = auth.uid() or public.is_admin());
create policy "comments_delete_owner_or_admin" on public.comments for delete to authenticated using ("userId" = auth.uid() or public.is_admin());

create policy "scholarships_public_read" on public.scholarships for select to anon, authenticated using (true);
create policy "scholarships_admin_write" on public.scholarships for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "courses_public_read" on public.courses for select to anon, authenticated using (true);
create policy "courses_admin_write" on public.courses for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "govt_works_public_read" on public.govt_works for select to anon, authenticated using (true);
create policy "govt_works_admin_write" on public.govt_works for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "help_select_owner_or_admin" on public.help_requests for select to authenticated using ("userId" = auth.uid() or public.is_admin());
create policy "help_insert_authenticated" on public.help_requests for insert to authenticated with check ("userId" = auth.uid() or "userId" is null);
create policy "help_update_admin" on public.help_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "donations_public_read_approved" on public.donations for select to anon, authenticated using (status = 'approved' or public.is_admin() or "userId" = auth.uid());
create policy "donations_insert_authenticated" on public.donations for insert to authenticated with check ("userId" = auth.uid() or "userId" is null);
create policy "donations_admin_update" on public.donations for update to authenticated using (public.is_admin() or "userId" = auth.uid()) with check (public.is_admin() or "userId" = auth.uid());
create policy "donations_admin_delete" on public.donations for delete to authenticated using (public.is_admin());

create policy "issues_read_public" on public.govt_issues for select to anon, authenticated using (true);
create policy "issues_insert_authenticated" on public.govt_issues for insert to authenticated with check ("userId" = auth.uid() or "userId" is null);
create policy "issues_update_owner_or_admin" on public.govt_issues for update to authenticated using ("userId" = auth.uid() or public.is_admin()) with check ("userId" = auth.uid() or public.is_admin());

create policy "notifications_select_owner" on public.notifications for select to authenticated using ("userId" = auth.uid() or public.is_admin());
create policy "notifications_insert_admin_or_self" on public.notifications for insert to authenticated with check ("userId" = auth.uid() or public.is_admin());
create policy "notifications_update_owner_or_admin" on public.notifications for update to authenticated using ("userId" = auth.uid() or public.is_admin()) with check ("userId" = auth.uid() or public.is_admin());
create policy "notifications_delete_admin" on public.notifications for delete to authenticated using (public.is_admin());

insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true) on conflict (id) do nothing;
create policy "uploads_public_read" on storage.objects for select using (bucket_id = 'uploads');
create policy "uploads_authenticated_write" on storage.objects for insert to authenticated with check (bucket_id = 'uploads');
create policy "uploads_owner_update" on storage.objects for update to authenticated using (bucket_id = 'uploads' and owner = auth.uid()) with check (bucket_id = 'uploads' and owner = auth.uid());
create policy "uploads_owner_delete" on storage.objects for delete to authenticated using (bucket_id = 'uploads' and owner = auth.uid());

alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.notifications;
