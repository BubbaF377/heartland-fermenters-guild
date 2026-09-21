> **Do not move, rename, or edit this file.** Devkeep generates and maintains this onboarding guide automatically at each release — manual edits will be overwritten the next time a release is tagged.

# Start Here: heartland-fermenters-guild

## What you're looking at
The public website for a hobbyist fermentation/brewing/baking community: an Astro static site on GitHub Pages that has been growing server-ish features (a live recipes database, a password-gated admin area, and an in-progress member-submission system) despite having no server of its own. Everything talks to a backend directly from the browser, and authorization is enforced by backend rules, not by anything secret in the client code.

## Read these first, in this order
1. **`docs/PRODUCT.md`** — the hand-edited requirements/decision log and the actual source of truth for *intent*. Everything else under `docs/` (`TEST_PLAN.md`, `USER_MANUAL.md`, `VISUALIZER.md`) is auto-generated from it by an external tool called "Devlore" (wired in via `.github/workflows/devlore*.yml`). Don't hand-edit the generated ones, and don't trust them over `PRODUCT.md` if they disagree.
2. **`src/lib/constants.js`** — deliberately has no backend import. Categories, the admin email, slugify helpers, time-stage suggestions. Safe, cheap way to learn the domain before touching anything live.
3. **Whatever file is currently the backend client, plus its accompanying rules/schema file** — this is where read/write authorization actually lives (see "the backend moved" below). Find and read this before trusting any page/component code's assumptions about what's allowed.
4. **`src/pages/` and `src/layouts/Layout.astro`** — page structure. Note that `recipes/view.astro` is a single template for *every* recipe (see gotchas).
5. **`tests/e2e/*`** — the specs are often a clearer, more current statement of actual behavior than the prose docs (e.g. `admin-manage-recipes.spec.js` documents edit/delete, which some other docs reportedly still list as unbuilt).

## The backend moved once already — know why, so you don't move it back
This project was originally built on **Supabase** (Postgres + Auth + Storage), queried straight from the browser with a public key, with a single shared admin account gating writes and Postgres **Row Level Security** policies (a `supabase/schema.sql`) doing the actual enforcement. That choice was deliberate: no server to run on GitHub Pages, a headless CMS was passed over, and pre-built per-recipe static pages were rejected because they'd need a redeploy for every new recipe.

That backend was later **replaced entirely with Firebase** (Firestore + Firebase Auth + Cloud Storage) — not patched, replaced — because Supabase's free tier pauses a project after a week of inactivity, an unacceptable risk for a low-traffic hobby site. This is the load-bearing fact for anyone reading old material in this repo:

- If you see `supabase/schema.sql`, `src/lib/supabase.js`, "RLS," or "security definer function" referenced anywhere (docs or code), that is the **pre-migration** picture. It no longer describes how authorization works.
- The current equivalents — a Firestore/Storage rules file and a Firebase client module — should exist in the tree, but this guide's source material doesn't pin down their exact names or paths post-migration. **Confirm them yourself before changing anything auth- or data-related.**
- A real, load-bearing behavioral difference from the switch: Firestore/Storage Security Rules **validate individual writes and queries**, they don't silently filter a result set the way Postgres RLS did. Any query you write has to be shaped so a rule can validate it directly — don't assume "the database will quietly hide what I can't see."
- Testing followed the backend: e2e tests now depend on the **Firebase Local Emulator Suite** (and a local Java install), not the older `tests/e2e/mock-supabase.js` network-mocking helper. If that file is still present, treat it as legacy scaffolding, not the pattern to extend.

## Two kinds of login exist on purpose — don't merge them
- **Admin**: one shared password, one auth account (`admin@heartlandfermentersguild.org`), used for direct actions — add/edit/delete recipes, manage members. This is deliberately not a per-admin account system.
- **Members**: a separate, lower-trust identity, added later — passwordless **email magic-link** sign-in, scoped to an admin-managed roster (`active_members`). Recipes a member submits land in a **pending queue** and only go public after explicit admin approval; nothing a member submits publishes itself. Members are never given the admin password, and were deliberately not given full account/password signup either.

The reason this separation is spelled out and not just implied: when member accounts were first added on top of the (then-current) Postgres backend, the existing RLS policies used blanket "if authenticated, allow" checks — which had implicitly meant "admin," because admin was the only account that could ever log in. Adding members broke that assumption; any logged-in member would have inherited admin-level update/delete rights until this was caught and fixed by checking roles explicitly (`is_admin()`, `is_active_member()`) instead of just "authenticated." That specific mechanism is gone along with Postgres, but **the lesson isn't**: any new role, account type, or write path added to this project needs an explicit authorization check, in the current rules layer — never inferred from "the request is logged in."

## Deploy trigger — verify, don't trust either doc
The deploy pipeline has flip-flopped: push-to-`main` (continuous deploy) → switched to only deploying on `v*.*.*` tag pushes plus manual dispatch (to make releases deliberate) → reverted back to push-to-`main` with in-progress runs cancelled in favor of the latest. The most recent recorded decision favors continuous deployment on push to `main`. But this project's own docs have previously disagreed with each other about which policy is actually wired up (README vs. `docs/PRODUCT.md`) — **open `.github/workflows/deploy.yml` yourself** before assuming either. Don't ship a change assuming it will (or won't) go live on merge without checking first.

## Structure at a glance (per the docs — confirm against the live tree)
- `src/pages/` — landing, recipes list, `recipes/view.astro` (single template, `?slug=` query param), `admin/index.astro`, 404.
- `src/layouts/Layout.astro` — shared nav/footer.
- `src/lib/constants.js` — backend-free domain constants.
- Backend client + rules — name/location not settled by the material available post-Firebase-migration; find it.
- `public/` — static assets, including `CNAME` (custom domain, DNS on Porkbun).
- `docs/PRODUCT.md` — hand-edited source of truth; rest of `docs/` is Devlore-generated from it.
- `.github/workflows/` — `deploy.yml` plus three `devlore-*.yml` files (docs automation, unrelated to shipping the site).

## Gotchas — things that look wrong but are deliberate
- **`?slug=` instead of per-recipe routes.** GitHub Pages can only serve what existed at the last build; a single template reading a query param is how new recipes can appear without a redeploy. Don't "fix" this into static per-recipe routes without solving that constraint.
- **Ingredients/instructions/time-stages are plain newline-separated text**, not structured data — deliberate, to keep the admin form and schema simple. Time-stages are an open, freeform per-recipe list; the per-category suggested starting values are suggestions only, never enforced.
- **Member phone numbers are validated only in the admin UI**, not in backend rules — deliberate, because tightening the rule would break writes coming from an older, still-live production version of the site that doesn't conform to the format. This is a known, temporary gap, not an oversight — revisit once that older version is fully retired, not before.
- **One shared admin credential** is deliberate, not a half-finished multi-admin system — it exists to avoid building account management for a single guild-admin function, and is a separate system from member login. Don't conflate the two.

## Mistakes this codebase has actually made
- In the pre-Firebase codebase, **editing a recipe's photo left the old Storage object orphaned** (delete cleaned up correctly, edit didn't). Whether this survived the Firebase rewrite isn't established anywhere in the available material — check current edit behavior yourself rather than assuming either way.
- Documentation has drifted from actual behavior before: a deploy-trigger disagreement between README and `docs/PRODUCT.md`, and a roadmap checklist reportedly still marking edit/delete admin actions as unbuilt after they were already implemented and covered by an e2e spec. **Treat checklists/READMEs as claims to verify, not facts.**
- The Devlore docs-automation depends on an external `devlore` repo's reusable workflows being *public*; it broke once already when that repo went private and GitHub's cross-repo rules blocked the call. If Devlore workflows start failing, check that repo's visibility before assuming this project's YAML is broken.

## Getting from a clean checkout to a working change
The available material doesn't give exact install/run commands, so confirm each of these against `package.json`/README rather than trusting this list blindly:
- Install JS dependencies and run the Astro dev server for page/UI-only work.
- For anything touching recipes, admin, or members, you'll need the **Firebase Local Emulator Suite** running locally (and a Java install), plus whatever environment variables the Firebase client currently expects (the pre-migration Supabase client required env vars and was browser-only by design — expect the same shape).
- **Vitest** for fast unit-level logic (`src/lib/*.test.js`) — no emulator needed.
- **Playwright** for e2e (`tests/e2e/*`), against the emulator for anything auth/data-related. If `tests/e2e/mock-supabase.js` is still present, treat it as legacy, not a pattern to copy for new tests.
- Authorization changes (who can read/write what) belong in the backend rules file, and should be tested there — that's the actual enforcement point, the way Postgres RLS used to be, not the admin form's own logic.
- Don't assume a merge to `main` does or doesn't ship — check the live deploy workflow first.
- Any new role, account type, or write path needs an explicit rule-level check — this project has already shipped the bug of assuming "logged in" meant "authorized" once.
