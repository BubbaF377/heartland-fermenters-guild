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
