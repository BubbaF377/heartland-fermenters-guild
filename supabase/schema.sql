-- Heartland Fermenters Guild — recipes table + Row Level Security policies.
--
-- Run this once in the Supabase dashboard's SQL Editor for your project
-- (Settings are per-project, so this only needs running once per environment).
-- See README.md's "Recipes & admin (Supabase) setup" section for the full walkthrough,
-- including creating the one shared admin login — that part is done in the
-- Authentication tab, not here, since Supabase doesn't support creating auth users
-- via plain SQL.

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  summary text not null default '',
  ingredients text not null default '',
  instructions text not null default '',
  submitted_by text,
  created_at timestamptz not null default now()
);

-- Added after the initial launch (wireframe-reviewed field additions): a photo,
-- a how-to video link, a freeform yield line, an open list of time stages, and
-- notes/tips. `add column if not exists` makes re-running this file against an
-- already-created table safe.
alter table recipes add column if not exists photo_path text;
alter table recipes add column if not exists video_url text;
alter table recipes add column if not exists yield_text text;
alter table recipes add column if not exists time_stages text;
alter table recipes add column if not exists notes text;

alter table recipes enable row level security;

-- Anyone (including a logged-out visitor) can read recipes — this is a public site.
create policy "Public read access"
  on recipes for select
  to anon, authenticated
  using ( true );

-- Only the signed-in admin session can add recipes. There's just one shared admin
-- login (see ADMIN_EMAIL in src/lib/supabase.js), so this doesn't check *which*
-- user is authenticated, only that the request carries a valid session at all.
create policy "Authenticated insert"
  on recipes for insert
  to authenticated
  with check ( (select auth.uid()) is not null );

-- No update/delete policies yet — Christian mentioned there may be other admin
-- actions later (edit/delete a recipe); add policies here when those are built.

-- Recipe photos (Requirement #11): a public bucket, since anyone can view a
-- recipe's photo without logging in — the same public-read / admin-write split
-- as the `recipes` table above, just enforced on storage.objects instead.
insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', true)
on conflict (id) do nothing;

create policy "Public read access to recipe photos"
  on storage.objects for select
  to anon, authenticated
  using ( bucket_id = 'recipe-photos' );

create policy "Authenticated upload of recipe photos"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'recipe-photos' and (select auth.uid()) is not null );
