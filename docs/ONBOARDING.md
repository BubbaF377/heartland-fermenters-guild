> **Do not move, rename, or edit this file.** Devkeep generates and maintains this onboarding guide automatically at each release — manual edits will be overwritten the next time a release is tagged.

# Start Here: heartland-fermenters-guild

## What you're joining
The public website for the Heartland Fermenters Guild — a static Astro site on GitHub Pages that has grown a database-backed recipes section and a password-gated admin area, with member accounts (magic-link login, moderated submissions) recently designed on top of that. There is no server of this project's own; the browser talks directly to a managed backend.

Read this guide before `docs/PRODUCT.md`. `PRODUCT.md` is the hand-edited source of intent and is the closest thing to ground truth, but even it has been observed to lag reality on specific details (see Gotchas below) — treat it as the best available account, not an infallible one, and prefer actual code/config when the two disagree.

## The architecture as it actually stands now
This is the single most important thing to get right before reading code: **the backend was migrated from Supabase (Postgres) to Firebase.** If you find any description — in old docs, comments, or your own assumptions — of a Supabase client, Postgres RLS policies, or a `supabase/schema.sql`-style file being the current data layer, that description is superseded. It was replaced entirely, not patched, because Supabase's free tier pauses a project after a week of inactivity, which is a real risk for a low-traffic hobby site with no budget for guaranteed uptime.

Current shape:
- **Firestore** holds recipe data, keyed by slug (previously Postgres rows).
- **Firebase Authentication** backs both the admin login and member login (previously Supabase Auth).
- **Cloud Storage** holds recipe photos (previously a Supabase Storage bucket).
- **Firestore/Storage Security Rules** are the only real authorization boundary — there's no secret key to protect, same philosophy as before, but a different mechanism with a real behavioral difference: these rules validate individual requests/queries rather than filtering result sets the way Postgres RLS did. A query shaped in a way the rules don't expect can be rejected outright. Keep this in mind before assuming a query will just "come back filtered."
- Testing against this backend depends on the **Firebase Local Emulator Suite** (and therefore a working Java install), not a hand-written network mock. If you find a Supabase-mocking helper file still in the repo, treat it as likely legacy and confirm it's actually wired into anything before trusting it.

Two things about the app's shape are unrelated to which backend it uses and are still true regardless:
- The recipe detail page is a single template driven by a `?slug=` query string rather than per-recipe static routes — deliberate, because GitHub Pages can only serve what existed at the last build.
- Ingredients, instructions, and time-stages are stored as plain newline-separated text, not structured arrays — a deliberate simplicity tradeoff for the admin form and schema, not an oversight. Time-stages are an open, freeform per-recipe list; per-category suggested starting values exist but are never enforced.

## Two identities, kept deliberately separate
- **Admin**: one shared credential (`admin@heartlandfermentersguild.org`-style account) gates all direct writes — add/edit/delete recipes, manage the member roster. Deliberately not a per-admin-account system.
- **Members**: authenticate separately via passwordless email magic-link, scoped to an admin-managed roster. Anything a member submits lands in a pending queue and requires explicit admin approval before it's public — it is never auto-published. This was a deliberate choice over extending the admin password to members or letting them sign up with passwords.

**A mistake this project already made and fixed once, worth not repeating**: when admin was the only account that could ever authenticate, every rule effectively (if implicitly) meant "is this the admin." Adding member accounts broke that assumption — any authenticated member would otherwise have inherited admin-level write access under the old rules. The fix was to make every authorization check explicit (admin vs. active-member vs. public), never inferred from "is logged in." The original fix was implemented as Postgres security-definer functions and no longer literally exists post-Firebase-migration, but the principle carries forward: if you touch Firestore/Storage Security Rules, check explicit roles, never treat "signed in" as "authorized." Any new role or account type added in the future needs the same explicit treatment.

## Deploys: what happens when you push
Currently: **every push to `main` builds and deploys to GitHub Pages**, with in-progress deploys cancelled in favor of the latest push — continuous deployment, no tagging step required.

This has changed direction twice already: push-to-main → tag-only (`v*.*.*` push or manual dispatch, added to force a deliberate release step) → back to push-to-main (reverted once Supabase config needed wiring into the build, to remove the manual-tagging overhead). If you encounter instructions, comments, or docs telling you to cut a `vX.Y.Z` tag to ship, that reflects the middle phase and is stale — merging to `main` ships immediately now. If anything looks inconsistent, check `.github/workflows/deploy.yml` directly rather than any prose description; this exact trigger has been a point of doc disagreement before.

## Devlore: adjacent tooling, not the app
`docs/TEST_PLAN.md`, `docs/USER_MANUAL.md`, and `docs/VISUALIZER.md` are auto-generated from `docs/PRODUCT.md` by an external tool called Devlore, via `.github/workflows/devlore*.yml`. It once broke because GitHub won't let a public repo call reusable workflows hosted in a private repo — fixed by making Devlore's workflows public, not by restructuring this repo. You don't need to touch this to ship app changes; just don't mistake its generated output for hand-authored intent. `docs/PRODUCT.md` is the one a human edits and the one to trust.

## Where to read the code first
1. `docs/PRODUCT.md` — requirements/decisions as currently understood by the team. Cross-check against the history above, since it can lag on things like the deploy trigger.
2. `src/lib/constants.js` (+ `src/lib/constants.test.js`) — categories, admin email, slugify, suggested time-stages. Deliberately free of any backend import so it stays trivially unit-testable; a good low-risk place to get oriented.
3. The Firebase client/config module — the current equivalent of what used to be `src/lib/supabase.js`. These documents don't specify its current filename; find it by searching for Firebase imports rather than assuming the old path.
4. Whatever currently defines the Firestore data model and security rules — the equivalent of the old `supabase/schema.sql` (previously the single source of truth for schema + RLS). Look for something like `firestore.rules` / `storage.rules`, but confirm rather than assume, since this isn't spelled out in the material available.
5. `src/pages/` — landing, recipes list, recipe detail (`recipes/view.astro`, driven by `?slug=`), admin, 404 — plus `src/layouts/Layout.astro` as the shared nav/footer shell everything sits inside.
6. `tests/e2e/` — Playwright specs, including one specifically covering admin edit/delete. Given the backend migration, verify these currently run against the Firebase emulator rather than a Supabase mock before trusting what they claim to cover.

## Getting from a clean checkout to a working change
The site is Astro-based with Vitest for unit tests and Playwright for e2e — but exact install/run commands, required environment variables, and which Firebase project/emulator config to point at locally are not specified in the material available to this guide. Don't guess at these — check `package.json`, `README.md`, and any local `.env`/Firebase config example in the repo. Because of the Firebase migration, expect e2e testing to require the Firebase Local Emulator Suite (and a working Java install) rather than the hand-written network mocking the project used to rely on; confirm the current setup steps before assuming the old flow still works.

## Gotchas: deliberate weirdness vs. actual past mistakes
**Deliberate — don't "fix" these:**
- `?slug=` query-string routing for recipes instead of per-recipe static pages (GitHub Pages constraint).
- Plain newline-separated text instead of structured arrays for recipe fields.
- One shared admin password instead of per-admin accounts, kept deliberately separate from the member magic-link system.
- Firestore/Storage Security Rules validating individual requests rather than filtering query results — a different model from the old Postgres RLS, not a defect.

**Actually-happened issues, worth checking rather than assuming resolved:**
- Editing a recipe's photo doesn't clean up the old Storage object, unlike delete, which does — an acknowledged orphaned-file gap as of the last note taken. Unknown whether it's been fixed, and unknown whether it still manifests the same way now that Storage is Cloud Storage rather than Supabase Storage.
- Project docs have disagreed with each other before (README vs. `PRODUCT.md` on the deploy trigger; README's roadmap once showed edit/delete as unbuilt when an e2e spec for it already existed). Treat any single doc's claim about current behavior as provisional until checked against the actual code/config.
- The role-conflation bug described above (authenticated ≠ authorized) already happened once, in the Postgres era. If you're writing or reviewing new Security Rules, that's the specific class of mistake to watch for.

## Bottom line
No server of this project's own — all data, auth, and file storage go straight from client-side code to Firebase, with Security Rules as the only real boundary. Two separate identities (one shared admin login; roster-gated member magic-links feeding a moderation queue) sit on top of that. `main` deploys straight to production on every push. Where these documents don't give you a concrete answer (exact filenames, setup commands, whether a known gap has since been fixed), say so to yourself and go check — don't carry over Supabase-era assumptions by default.
