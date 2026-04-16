-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Create the books table
drop table if exists public.books;
create table public.books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null,
  subtitle text,
  author_name text not null,
  isbn text unique,
  publisher text,
  publication_date date,
  page_count integer,
  language text default 'English',
  genre text,
  description text,
  book_width_cm numeric(5,1),
  book_height_cm numeric(5,1),
  cover_image_url text,
  tokopedia_link text,
  shopee_link text,
  whatsapp_link text,
  sales_link text,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.books enable row level security;

-- 3. Policies: only the owner can see/edit their own books
drop policy if exists "Users can view their own books" on public.books;
drop policy if exists "Users can insert their own books" on public.books;
drop policy if exists "Users can update their own books" on public.books;
drop policy if exists "Users can delete their own books" on public.books;

create policy "Users can view their own books"
  on public.books for select
  using (auth.uid() = user_id);

create policy "Users can insert their own books"
  on public.books for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own books"
  on public.books for update
  using (auth.uid() = user_id);

create policy "Users can delete their own books"
  on public.books for delete
  using (auth.uid() = user_id);

-- 4. Create a storage bucket for book covers
-- Run this in the SQL Editor, then also enable "Public" on the bucket in Storage settings
insert into storage.buckets (id, name, public)
  values ('book-covers', 'book-covers', true)
  on conflict (id) do nothing;

-- Allow authenticated users to upload covers
drop policy if exists "Authenticated users can upload covers" on storage.objects;
create policy "Authenticated users can upload covers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'book-covers');

-- Allow public read access to covers
drop policy if exists "Public can view covers" on storage.objects;
create policy "Public can view covers"
  on storage.objects for select
  using (bucket_id = 'book-covers');

-- 5. Create your login user via Supabase Dashboard:
--    Authentication → Users → Add User
--    (Do NOT store credentials in this file)
