-- ChapterNode: Supabase user tables and RLS policies.
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- These tables live in Supabase's Postgres, NOT your recommender database.

-- 1. Profiles table
-- Extends the built-in auth.users with app-specific fields.
-- The id column references auth.users so rows auto-delete when a user is removed.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  reading_goal  integer,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. User libraries table
-- Stores the full TrackedBook[] array as JSONB.
-- One row per user. The frontend upserts on every library change.
create table if not exists public.user_libraries (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  book_data   jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.user_libraries enable row level security;

create policy "Users manage own library"
  on public.user_libraries for all
  using (auth.uid() = user_id);

-- 3. Auto-create a profile row when a new user signs up.
-- This trigger fires on auth.users insert and creates the matching profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
