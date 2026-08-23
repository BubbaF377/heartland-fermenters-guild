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

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site with
the official `withastro/action` and publishes it to GitHub Pages. No manual build/upload
step is needed.

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

## Recipes & admin (Supabase) setup

Recipes live in a [Supabase](https://supabase.com) Postgres database, read directly by
the browser (no server of our own to run) and written to through a password-gated admin
page. One-time setup:

1. **Create a Supabase project** (free tier is plenty) at [supabase.com](https://supabase.com).
2. **Create the table, its columns, and its access rules**: open the project's SQL
   Editor and run `supabase/schema.sql` from this repo. It creates the `recipes` table
   (including the photo/video/yield/time-stages/notes columns), turns on Row Level
   Security with public-read / signed-in-insert policies, and creates the public
   `recipe-photos` Storage bucket with the matching public-read / signed-in-upload
   policies. The whole file is safe to re-run against an already-set-up project — it
   only adds what's missing.
3. **Create the one shared admin login**: there's no per-person account system — anyone
   who knows the password can add a recipe, per the requirement. In the dashboard, go to
   **Authentication → Users → Add user**, set the email to `admin@heartlandfermentersguild.org`
   (this exact address — it's hardcoded as the login identifier in `src/lib/constants.js`,
   not a secret itself), pick a password, and share that password with whoever should
   have admin access. Changing who can log in later just means changing this one
   password (**Authentication → Users → \[the user\] → Reset password**).
4. **Get your API keys**: **Settings → API Keys**. Copy the **Project URL** and the
   **Publishable key** (`sb_publishable_...` — safe to expose in client-side code; real
   protection comes from the RLS policies above, not from keeping this key secret).
5. **Set them for local development**: copy `.env.example` to `.env` and fill in both
   values.
6. **Set them for the GitHub Actions build**: repo **Settings → Secrets and variables →
   Actions → Variables tab** (variables, not secrets — these values aren't sensitive),
   add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `deploy.yml` already
   reads them from there.

Once that's done: `/recipes/` lists everything in the table, `/recipes/view?slug=...`
renders one recipe from a shared template (a query-string slug rather than a path
segment like `/recipes/my-recipe/`, since GitHub Pages can only serve pre-built static
files — there's no way to pre-build a page per database row that updates without a
redeploy, and recipes are meant to appear instantly when added), and `/admin/` is the
password-gated form that lists every recipe with Edit/Delete actions alongside the
form for adding a new one.

## Project structure

```
src/
  layouts/Layout.astro     shared <head>, nav, footer, fonts, global styles
  lib/constants.js         admin email, recipe categories, time-stage suggestions, slugify/list/YouTube-ID helpers (no Supabase import)
  lib/supabase.js          Supabase client (client-side only — needs env vars set)
  pages/index.astro        the landing page
  pages/recipes/index.astro  recipe list (fetches from Supabase client-side)
  pages/recipes/view.astro   single-recipe template (?slug=... from Supabase)
  pages/admin/index.astro  password login + add-recipe form
  pages/404.astro          not-found page
public/
  assets/                 logo, header banner, favicons
  CNAME                   custom domain for GitHub Pages
  robots.txt
supabase/schema.sql       recipes table, Row Level Security policies, recipe-photos Storage bucket + policies
.github/workflows/deploy.yml   CI build + deploy
```

## Roadmap

- [x] Landing page: header image, welcome text, guild links
- [x] Recipes section (Supabase-backed, template-driven) + password-gated admin add-recipe form
- [ ] Other admin actions (edit/delete a recipe)
- [ ] Full info site (About, Events)
- [ ] Auth-protected members-only section (separate from the single-password admin area above)

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
