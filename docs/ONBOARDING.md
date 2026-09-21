> **Do not move, rename, or edit this file.** Devkeep generates and maintains this onboarding guide automatically at each release — manual edits will be overwritten the next time a release is tagged.

# Start Here: heartland-fermenters-guild

## What this is
The public website for the Heartland Fermenters Guild, a hobbyist community (home brewing, baking, pickling, cheesemaking). It's an Astro static site on GitHub Pages, with a growing set of dynamic features — recipes, an admin area, and a member-submission system — implemented by talking *directly from browser JS* to a hosted backend. **That backend is currently Firebase (Firestore + Firebase Auth + Cloud Storage), not Supabase**, despite what some project documentation and even some file/module names may still suggest. Get this straight before you start reading code — it's the single biggest trap in this codebase right now.

## Read these first, in this order
1. **`docs/PRODUCT.md`** — the hand-edited requirements/decision log, the actual source of truth for intent. The other `docs/*.md` files (`TEST_PLAN.md`, `USER_MANUAL.md`, `VISUALIZER.md`) are auto-generated from it by an external tool ("Devlore") and can lag behind reality; README has also been observed drifting out of sync with actual behavior more than once. Trust PRODUCT.md and the code over either.
2. Whatever the current Firebase client-init module is. This replaced the old `src/lib/supabase.js`; find its actual current location before touching any data-related code, since this guide's source material predates the migration's file-level detail.
3. **`src/lib/constants.js`** — deliberately backend-free (categories, admin email constant, slugify helpers, time-stage suggestions), unit-tested via Vitest (`src/lib/constants.test.js`). A safe place to learn the domain model without wading into data-layer complexity.
4. **`src/pages/`** — `index.astro` (landing), `recipes/index.astro` + `recipes/view.astro` (list + single-recipe-by-`?slug=`), `admin/index.astro`, `404.astro`. `src/layouts/Layout.astro` is the shared nav/footer shell.
5. The current Firestore/Storage **security rules** file — the Firebase equivalent of the old `supabase/schema.sql`. This is where read/write authorization actually lives, not in application code.
6. **`.github/workflows/deploy.yml`** — read the actual trigger condition here rather than trusting prose descriptions of it (see below — this has changed direction multiple times and the docs have disagreed about it before).

## The architecture, and why it's shaped this way
- **No server of its own.** Everything dynamic runs from browser JS against a managed backend using a public/non-secret client key, because GitHub Pages can't run a server. Building a separate backend, or pre-building a static page per recipe, were both rejected: the former needs infrastructure this project doesn't want, the latter would require a redeploy every time a recipe is added — defeating the point.
- **Authorization lives in backend security rules, not in secret keys.** Since the client key is public by design, "security" is whatever the database/storage rules allow, not what the JS hides. This was Postgres Row-Level Security under Supabase; it is now Firestore/Storage Security Rules under Firebase. Check the rules, not the UI, to know what's actually enforced.
- **The recipe detail page uses `?slug=` in a query string, not a per-recipe route.** This is deliberate: GitHub Pages only serves pages baked in at the last build, and a single template read via query param is how new recipes appear without a rebuild. Don't "clean this up" into pretty per-slug routes without re-solving that constraint.
- **Recipe fields (ingredients, instructions, time-stages) are plain newline-separated text, not structured arrays.** Deliberate simplicity trade-off for the admin form/schema. Time-stages are an open, freeform per-recipe list; per-category suggested values are *never* enforced — don't assume validation exists that you're just not seeing.
- **Two intentionally separate identity systems:** one fixed, shared admin credential with full write access, and a separate member identity system (passwordless email magic-link, scoped to an admin-managed roster) for regular members submitting recipes. Members do **not** get the admin password or full account signup, and member-submitted recipes always land in a pending queue requiring explicit admin approval — there is no auto-publish path, even conceptually for "trusted" members. Don't blur these two mechanisms together.
- **Authorization must be modeled explicitly per role, never inferred from "is logged in."** Early on, every write rule effectively meant "admin," because admin was the only account able to authenticate at all. Adding member accounts turned that implicit assumption into a real bug — any authenticated member would have inherited admin-level update/delete rights. The fix was explicit role checks (is this the admin email? is this an active, approved member?) enforced at the data layer, plus a server-side constraint that a member's own recipe insert can only be created in "pending" status — not something left to the form to enforce. Carry this principle into any new role or feature: check role explicitly where the data actually lives, never trust "authenticated" or UI logic alone.

## The Supabase → Firebase switch
The project originally built recipes/admin/members entirely on Supabase (Postgres + Auth + Storage + RLS policies in `supabase/schema.sql`). That was later **replaced outright**, not patched, with Firebase, because Supabase's free tier pauses an inactive project after a week — judged an unacceptable availability risk for a low-traffic hobby site with no ops budget. A keep-alive-ping workaround was explicitly considered and rejected in favor of the platform switch. Concretely:
- Recipes are Firestore documents keyed by slug, not Postgres rows.
- Firestore/Storage rules **validate** queries rather than **filter** result sets the way Postgres RLS did — a real behavioral difference to account for in any new query code.
- Member login is Firebase's own email-link sign-in.
- Tests now depend on the **Firebase Local Emulator Suite** (which needs Java installed locally) instead of the old hand-rolled `tests/e2e/mock-supabase.js` network mocks. If you see Supabase-mocking references in test files or docs, they're stale.
- Any surviving references to `src/lib/supabase.js`, `supabase/schema.sql`, RLS policies, or the `recipe-photos` Supabase Storage bucket describe the *old* architecture — confirm what actually exists before relying on it.

## Deploy trigger: read the YAML, don't trust the prose
This has flipped direction more than once, and README and `docs/PRODUCT.md` have disagreed about it before:
- It started as deploy-on-every-push-to-`main`.
- It was switched to deploy-only-on-`v*.*.*`-tag-push (plus manual dispatch), to match the tagging convention used by the separate Devlore doc-automation workflows.
- It was later switched **back** to deploy-on-every-push-to-`main` (cancelling in-progress runs in favor of the latest), specifically to support continuous deployment while backend config needed to flow through the build — tagging was judged too much manual overhead for that.

As of the most recent decision, pushing to `main` deploys immediately and there is no tagging step. But given the history, treat `.github/workflows/deploy.yml` itself as the only reliable source for this, not any doc.

## Devlore (docs automation) — a separate concern
`.github/workflows/devlore*.yml` auto-generate `docs/TEST_PLAN.md`, `docs/USER_MANUAL.md`, and `docs/VISUALIZER.md` from `docs/PRODUCT.md`, using reusable workflows hosted in a separate `devlore` repo (which had to be made public, since GitHub won't let a public repo call reusable workflows in a private one — if doc-sync starts failing with a cross-repo permissions error, that's the likely cause). This has no bearing on the app or its deploy pipeline; don't debug it as if it were part of shipping the site.

## Gotchas: deliberate-but-surprising vs. actual past mistakes
**Looks wrong but is deliberate:**
- `?slug=`-based recipe routing instead of clean per-recipe URLs.
- Plain-text (not structured) ingredients/instructions/time-stages.
- Per-category time-stage suggestions that are never enforced.
- One fixed, shared admin credential instead of individual admin accounts — members are a separate, lower-trust system, not a path to more admins.
- Member submissions always require explicit admin approval; there's no auto-publish tier.

**Actual past mistakes / open gaps to know about:**
- Editing a recipe's photo doesn't clean up the old stored file (orphaned object) — acknowledged under the old Supabase Storage setup; delete *does* clean up correctly. Nothing in the record confirms whether this was fixed in the Firebase rebuild — check current behavior rather than assuming.
- Treating "authenticated" as "authorized" was a real bug once member accounts existed; the fix was explicit per-role checks in the security rules. Don't reintroduce implicit role assumptions in new features.
- Docs (README especially) have been observed out of sync with actual behavior more than once (deploy trigger; whether edit/delete admin actions existed vs. a stale roadmap checklist). Verify against code and rules, not just docs.

## From a clean checkout to a working change
The source material behind this guide doesn't give exact setup commands, so treat this as the shape of the process and confirm specifics (env var names, scripts) against `package.json` and whatever setup docs currently exist in the repo:
1. Install dependencies for the Astro project.
2. Get local Firebase config for the browser-only client (public key, security enforced by rules — same trust model as before, just a different backend). For testing, run the **Firebase Local Emulator Suite**, which requires Java installed locally.
3. Run the dev server; the recipe detail page needs a `?slug=` query param to render anything — that's expected, not broken.
4. Unit tests run under Vitest (e.g. `src/lib/constants.test.js`) and need no backend, since `constants.js` is intentionally dependency-free.
5. E2e tests run under Playwright (`tests/e2e/*`), now against Firebase emulators rather than hand-written mocks — check `playwright.config.js` and any emulator-startup step for current wiring; exact commands aren't available in this guide's source material.
6. For any change touching recipes/admin/members, check the current security rules alongside your code change. Code that works against your own admin session locally can still be wrong if the rules would reject or over-permit it for another role (e.g. a pending member).
7. To ship: merge to `main`. Per the latest deploy-trigger decision, that alone publishes the site — there's no tag to cut. Re-check `.github/workflows/deploy.yml` before relying on this, since it has changed direction multiple times before.
