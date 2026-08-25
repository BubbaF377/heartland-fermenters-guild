# Heartland Fermenters Guild

The guild's website — built with [Astro](https://astro.build), deployed to GitHub Pages,
served at [heartlandfermentersguild.org](https://heartlandfermentersguild.org) via Porkbun DNS.

## Local development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to ./dist
npm run preview   # serve the production build locally
```

## Deployment

Deploy only triggers on a `v*.*.*` release tag (`.github/workflows/deploy.yml`), or
manually via `workflow_dispatch` — pushing to `main` alone does not deploy. Cut a
release with `git tag vX.Y.Z && git push origin vX.Y.Z`; the workflow builds the site
with the official `withastro/action` and publishes it to GitHub Pages, no manual
build/upload step needed. (`.github/workflows/test.yml` is separate and unrelated —
it runs the test suite on every PR/push to `main` as a quality gate, but doesn't
deploy anything.)

One-time repo setup on GitHub:

1. **Settings → Pages → Build and deployment → Source**: set to **GitHub Actions**.
2. **Settings → Pages → Custom domain**: enter `heartlandfermentersguild.org` and save
   (this repo already ships a `public/CNAME` file with that value, so GitHub should
   pick it up automatically — but setting it here too lets GitHub manage the HTTPS
   certificate and confirms DNS).
3. Once DNS (below) resolves, check **Enforce HTTPS** in the same settings panel.

## Porkbun DNS setup

In the Porkbun dashboard, under the domain's **DNS Records**, add:

| Type  | Host | Answer                  |
|-------|------|--------------------------|
| A     | @    | 185.199.108.153          |
| A     | @    | 185.199.109.153          |
| A     | @    | 185.199.110.153          |
| A     | @    | 185.199.111.153          |
| CNAME | www  | `<your-github-username>.github.io` |

Those four A records are GitHub Pages' current apex-domain IPs (verify against
[GitHub's Pages custom-domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
before adding, in case they've changed). The CNAME on `www` lets `www.heartlandfermentersguild.org`
redirect to the apex domain as well.

DNS propagation can take anywhere from a few minutes to 24 hours.

## Recipes, admin & members (Supabase) setup

Recipes live in a [Supabase](https://supabase.com) Postgres database, read directly by
the browser (no server of our own to run). Two ways content reaches it: a
password-gated admin can add/edit/delete/deactivate a recipe directly, or an active
guild member can submit one for admin approval. One-time setup:

1. **Create a Supabase project** (free tier is plenty) at [supabase.com](https://supabase.com).
2. **Create the tables, functions, and access rules**: open the project's SQL Editor
   and run `supabase/schema.sql` from this repo. It creates the `recipes` table
   (photo/video/yield/time-stages/notes/status columns), the `active_members` roster
   table, the `is_admin()`/`is_active_member()` helper functions RLS policies use to
   tell admin, members, and the public apart, Row Level Security across all of it, and
   the public `recipe-photos` Storage bucket with matching policies. The whole file is
   safe to run against an already-set-up project — every `create policy` is preceded
   by a matching `drop policy if exists`, so re-running it (e.g. after pulling a schema
   change) replaces policies cleanly instead of erroring on ones that already exist.
3. **Allow the magic-link redirect URL**: **Authentication → URL Configuration →
   Redirect URLs**, add both `http://localhost:4321/submit/` (local dev) and
   `https://heartlandfermentersguild.org/submit/` (production). Supabase rejects an
   OTP/magic-link redirect that isn't on this allowlist, so a member's login link
   won't work correctly without it.
4. **Create the one shared admin login**: there's no per-person account system for
   admin — anyone who knows the password has full admin access, per the requirement.
   In the dashboard, go to **Authentication → Users → Add user**, set the email to
   `admin@heartlandfermentersguild.org` (this exact address — it's hardcoded as the
   login identifier in `src/lib/constants.js`, not a secret itself), pick a password,
   and share that password with whoever should have admin access. Changing who can log
   in later just means changing this one password (**Authentication → Users →
   \[the user\] → Reset password**).
5. **Check the magic-link email template**: members log in via Supabase's email OTP
   (`signInWithOtp`), which this project hadn't used before this feature. In
   **Authentication → Email Templates → Magic Link**, confirm the template reads as a
   login link (not "Confirm signup" wording) — Supabase's default template usually
   works as-is, but it's worth a look before members start using it.
6. **Get your API keys**: **Settings → API Keys**. Copy the **Project URL** and the
   **Publishable key** (`sb_publishable_...` — safe to expose in client-side code; real
   protection comes from the RLS policies above, not from keeping this key secret).
7. **Set them for local development**: copy `.env.example` to `.env` and fill in both
   values.
8. **Set them for the GitHub Actions build**: repo **Settings → Secrets and variables →
   Actions → Variables tab** (variables, not secrets — these values aren't sensitive),
   add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `deploy.yml` already
   reads them from there.

Once that's done: `/recipes/` lists every **published** recipe from the table,
`/recipes/view?slug=...` renders one from a shared template (a query-string slug
rather than a path segment like `/recipes/my-recipe/`, since GitHub Pages can only
serve pre-built static files — there's no way to pre-build a page per database row
that updates without a redeploy, and recipes are meant to appear instantly once
approved). `/admin/` is the password-gated panel: a Pending Recipes queue
(Approve/Reject), the Recipes list (Edit/Deactivate/Delete), a Members list (add by
email, Deactivate/Reactivate), and the add-a-recipe form. `/submit/` is where an
active member logs in by email (a magic link, no password to set) and submits a
recipe, which lands as `pending` — invisible on the public site until an admin
approves it from `/admin/`.

## Project structure

```
src/
  layouts/Layout.astro     shared <head>, nav, footer, fonts, global styles
  lib/constants.js         admin email, recipe categories, time-stage suggestions, slugify/list/YouTube-ID helpers (no Supabase import)
  lib/supabase.js          Supabase client (client-side only — needs env vars set)
  lib/recipe-form.js       shared recipe-form logic (stage editor, field reading, photo upload) used by admin and /submit/
  pages/index.astro        the landing page
  pages/recipes/index.astro  recipe list (published only, fetches from Supabase client-side)
  pages/recipes/view.astro   single-recipe template (?slug=... from Supabase)
  pages/admin/index.astro  password login; pending-recipe review, recipes, and members management
  pages/submit/index.astro  member magic-link login + recipe submission (lands as pending)
  pages/404.astro          not-found page
public/
  assets/                 logo, header banner, favicons
  CNAME                   custom domain for GitHub Pages
  robots.txt
supabase/schema.sql       recipes + active_members tables, RLS policies, is_admin()/is_active_member() functions, recipe-photos Storage bucket
.github/workflows/deploy.yml   CI build + deploy (tag-only)
.github/workflows/test.yml     CI test suite (every PR/push to main)
```

## Roadmap

- [x] Landing page: header image, welcome text, guild links
- [x] Recipes section (Supabase-backed, template-driven)
- [x] Password-gated admin: add/edit/delete/deactivate recipes
- [x] Member accounts (email magic link) that can submit a recipe for admin approval
      — experimental, may not launch (see docs/PRODUCT.md Requirement #16)
- [ ] Full info site (About, Events)
- [ ] Auth-protected members-only *content* section (gating actual pages, beyond recipe submission)

## Devlore

This repo is linked to [Devlore](../devlore), Christian's cross-project documentation
tool — set up via Devlore's create-new-project wizard, which is where `docs/PRODUCT.md`,
`docs/TEST_PLAN.md`, `docs/USER_MANUAL.md`, `docs/VISUALIZER.md`, and the
`.github/workflows/devlore*.yml` files came from.

- `docs/PRODUCT.md` is the living discovery/requirements doc for this project — edit it
  directly as decisions firm up.
- `docs/TEST_PLAN.md`, `docs/USER_MANUAL.md`, and `docs/VISUALIZER.md` are machine-generated
  from `docs/PRODUCT.md`'s Requirements section and kept in sync automatically on every push
  — don't hand-edit them, they'll be overwritten.
- `.github/workflows/devlore.yml` drafts a documentation log entry into the Devlore vault on
  every push; `devlore-release.yml` consolidates docs on a `v*.*.*` tag; `devlore-analyze.yml`
  is the one-time codebase snapshot.
- This is separate from `.github/workflows/deploy.yml` above, which handles the actual site
  build/deploy and has nothing to do with Devlore.
