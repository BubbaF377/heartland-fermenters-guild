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

-- Member submissions + admin approval (Requirement #16). Every existing row (and
-- every admin-created row) defaults to 'published', so this needed no backfill.
alter table recipes add column if not exists status text not null default 'published';
alter table recipes drop constraint if exists recipes_status_check;
alter table recipes add constraint recipes_status_check
  check ( status in ('pending', 'published', 'deactivated') );

alter table recipes enable row level security;

-- Members are checked against this roster, not against Supabase's user table — admin
-- manages it directly (add/deactivate a row), no service-role key or Edge Function
-- needed. RLS below is admin-only: a member never queries this table themselves, only
-- passes its gate (via is_active_member()) when inserting a recipe.
create table if not exists active_members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table active_members enable row level security;

-- Identity helpers used across the policies below. security definer matters
-- specifically for is_active_member: it lets a member's own insert policy check
-- their membership without granting members (or the public) read access to the
-- active_members roster itself.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select auth.email() = 'admin@heartlandfermentersguild.org';
$$;

create or replace function public.is_active_member(check_email text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from active_members where email = check_email and active = true
  );
$$;

create policy "Admin manages the member roster"
  on active_members for all
  to authenticated
  using ( is_admin() )
  with check ( is_admin() );

-- Recipes: three read/write identities now, not two (public, admin, and members —
-- see docs/PRODUCT.md Requirement #16 for why the old "any authenticated session"
-- policies had to be replaced rather than left in place once members exist).
drop policy if exists "Public read access" on recipes;
drop policy if exists "Authenticated insert" on recipes;
drop policy if exists "Authenticated update" on recipes;
drop policy if exists "Authenticated delete" on recipes;

-- Anyone (including a logged-out visitor) can read published recipes — this is a
-- public site. Pending/deactivated rows are invisible here, which is also what makes
-- an unapproved or deactivated recipe's detail page 404 for the public automatically.
create policy "Public read access to published recipes"
  on recipes for select
  to anon, authenticated
  using ( status = 'published' );

-- Admin's own session sees every status, for the admin panel's lists.
create policy "Admin read access to all recipes"
  on recipes for select
  to authenticated
  using ( is_admin() );

create policy "Admin insert"
  on recipes for insert
  to authenticated
  with check ( is_admin() );

-- A member may only ever create a pending row — never publish directly — enforced
-- here, not just hidden in the UI.
create policy "Active member insert as pending"
  on recipes for insert
  to authenticated
  with check ( is_active_member(auth.email()) and status = 'pending' );

create policy "Admin update"
  on recipes for update
  to authenticated
  using ( is_admin() )
  with check ( is_admin() );

create policy "Admin delete"
  on recipes for delete
  to authenticated
  using ( is_admin() );

-- Recipe photos (Requirement #11): a public bucket, since anyone can view a
-- recipe's photo without logging in — the same public-read / admin-write split
-- as the `recipes` table above, just enforced on storage.objects instead.
insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to recipe photos" on storage.objects;
drop policy if exists "Authenticated upload of recipe photos" on storage.objects;
drop policy if exists "Authenticated delete of recipe photos" on storage.objects;

create policy "Public read access to recipe photos"
  on storage.objects for select
  to anon, authenticated
  using ( bucket_id = 'recipe-photos' );

-- Admin or an active member may attach a photo (a member submitting a recipe).
create policy "Admin or active member upload of recipe photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'recipe-photos'
    and ( is_admin() or is_active_member(auth.email()) )
  );

-- Deleting a recipe (Requirement #14) best-effort removes its photo object too —
-- admin-only, since only admin can delete a recipe row in the first place.
create policy "Admin delete of recipe photos"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'recipe-photos' and is_admin() );
