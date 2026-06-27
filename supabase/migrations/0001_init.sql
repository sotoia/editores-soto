-- supabase/migrations/0001_init.sql

create extension if not exists "pgcrypto";

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  age int not null check (age between 16 and 80),
  country text not null,
  email text not null,
  whatsapp text,
  price_per_clip numeric(10,2) not null check (price_per_clip >= 0),
  currency text not null default 'EUR' check (currency in ('EUR','USD')),
  software text[] not null check (cardinality(software) > 0),
  experience_years int not null check (experience_years >= 0),
  experience_text text,
  work_links jsonb not null default '[]'::jsonb,
  portfolio_url text,
  test_video_path text not null,
  test_video_size_mb numeric,
  status text not null default 'pending' check (status in ('pending','shortlisted','rejected')),
  admin_notes text
);

create unique index applications_email_unique on public.applications (lower(email));

alter table public.applications enable row level security;

-- Public anon role can insert (validated server-side)
create policy "anon can insert applications"
  on public.applications for insert
  to anon
  with check (true);

-- Only service_role can read/update (admin API uses service role)
-- No select/update/delete policy for anon -> blocked by RLS.

-- Storage bucket
insert into storage.buckets (id, name, public, file_size_limit)
  values ('test-videos', 'test-videos', false, 52428800)  -- 50 MB (Supabase free tier cap)
  on conflict (id) do nothing;

-- Storage policies: anon can insert via signed upload URL only.
-- (Signed URLs bypass RLS; we restrict reads to service_role.)
create policy "anon can upload via signed URL"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'test-videos');

-- No select policy for anon -> reads only via service_role signed download URLs.
