<!-- devlore:onboarding -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this onboarding guide automatically at every release — manual edits will be overwritten at the next one. To change what's documented, update the underlying sources (`docs/PRODUCT.md`, decisions, master docs) instead.

# heartland-fermenters-guild — Onboarding Guide

## Where the important logic lives

This is a small, mostly-static Astro site, so there isn't much surface area — but a few places matter more than the rest:

- **`src/pages/index.astro`** and **`src/layouts/Layout.astro`** — the entire current front-end. Layout holds shared head/fonts/styles; index is the one real page. Start here to understand how markup and styling are organized before touching anything else.
- **`docs/PRODUCT.md`** — not code, but functionally the spec. It's described as the authoritative source-of-truth doc that drives this project's workflow (and auto-generates `TEST_PLAN.md`, `USER_MANUAL.md`, `VISUALIZER.md` via Devlore). If you're planning a change, check here first — and don't hand-edit the generated docs.
- **`.github/workflows/deploy.yml`** — this is where "does my merge actually go live" gets decided, and per the decision history below, that answer has changed more than once. Read this file directly rather than trusting any prose description of it.
- **Any future recipes/admin code** — per the recorded decision on Supabase, recipe data and admin auth are meant to live in Supabase, queried directly from client-side JS with Postgres RLS doing the enforcement (public read, admin write). There's no server of this project's own and there isn't meant to be one. If you see (or are asked to write) server-side logic for recipes, that's a red flag against the recorded architecture.
- **`.github/workflows/devlore*.yml`** — separate from the site deploy; these sync docs to the external Devlore tool. Don't confuse a failure here with a site deploy failure, they're independent pipelines.

## Why past decisions were made

Several architectural choices are recorded and worth internalizing before you second-guess them:

- **Supabase for recipes/admin** (decision `1562a9c`): chosen because the site is static with no server, but recipes need to be addable without a rebuild and gated behind a shared admin password. Supabase (managed Postgres + Auth) is queried directly from the browser using a publishable key, with RLS enforcing public-read/admin-write. A single shared admin account (`admin@heartlandfermentersguild.org`) stands in for per-member auth for now. The recipe detail page uses `?slug=` query-string routing rather than per-recipe static pages, specifically because GitHub Pages can only serve pages that existed at the last build — this query-string pattern is meant to be the template for any future per-item page as long as the site stays on Pages. Client-side-only password checks were explicitly rejected as insecure (readable in page source).
- **Deploy trigger history** (decisions `1c58078`, `70bac2c`, then `ed7d42f`): the project moved *from* deploy-on-every-push-to-`main` *to* deploy-only-on-`v*.*.*`-tag (to align with Devlore's tagging convention and add a deliberate release gate), and then a later decision (`ed7d42f`) moved it *back* to deploy-on-every-push-to-`main`, specifically tied to needing Supabase config wired into the build, with in-progress deploys cancelled in favor of the latest. This reversal is real and recorded, not a mistake in the docs — see gotcha below.
- **Making the `devlore` reusable-workflows repo public** (decision `2b36777`): GitHub disallows a public repo from calling reusable workflows in a private repo. Rather than vendor/duplicate the sync workflow logic locally, the `devlore` repo itself was made public. Future auto-doc-sync depends on it staying public.

No decisions are recorded yet about auth strategy for a members-only area, or where members-only server logic would run — both are explicitly still open per PRODUCT.md.

## Common gotchas

- **The deploy trigger is genuinely in flux, and sources disagree.** The baseline snapshot's own README is described as stale (claims every push to `main` deploys). PRODUCT.md apparently claims tag-only deploys are authoritative. But the *most recent recorded decision* (`ed7d42f`) says the trigger was switched back to deploy-on-push-to-`main`. Don't trust any of these secondhand — **read `.github/workflows/deploy.yml` directly** before assuming how a merge will behave, and be aware the trigger has flip-flopped at least twice already.
- **Merging to `main` may or may not be safe to do casually**, depending on which deploy trigger is currently live. If it's tag-based, accumulating merges on `main` is fine; if it's push-based (per the latest decision), every merge goes live immediately. Confirm current behavior before treating `main` as a staging area.
- **Devlore docs (`TEST_PLAN.md`, `USER_MANUAL.md`, `VISUALIZER.md`) are generated, not hand-edited.** Only `PRODUCT.md` is meant to be edited directly; changes to the others will presumably be overwritten by the sync workflow.
- **There is no server for this project, on purpose.** Any recipe/admin feature work should route through Supabase's client-safe API + RLS, not a bolted-on backend — that was explicitly rejected as an option given GitHub Pages hosting.
- **New "pages" for dynamic content should follow the `?slug=` query-string convention**, not new static routes, as long as GitHub Pages remains the host — this was a deliberate workaround for Pages only serving what existed at last build, not an accidental pattern.
- **The `devlore` public/private status is load-bearing.** If someone later decides to make `devlore` private again for any reason, the doc-sync workflows in this repo will break, per the recorded decision — that's a known tripwire, not a mystery failure if it happens.

## Where to start

1. Read `docs/PRODUCT.md` first — it's the actual spec/source of truth this whole project is built against.
2. Skim `src/layouts/Layout.astro` and `src/pages/index.astro` to see the entire current site in about five minutes.
3. Open `.github/workflows/deploy.yml` and resolve for yourself, right now, which trigger is actually live — don't inherit the ambiguity described above.
4. If you're touching anything recipe- or admin-related, re-read decision `1562a9c` in full before writing code; it sets the pattern (Supabase, RLS, `?slug=` routing, no project-owned server) that any related work is expected to follow.
5. Leave the auto-generated docs (`TEST_PLAN.md`, `USER_MANUAL.md`, `VISUALIZER.md`) alone and check the `devlore*.yml` workflows only if doc-sync itself seems broken.
