> **Do not move, rename, or edit this file.** Devkeep generates and maintains this onboarding guide automatically at each release — manual edits will be overwritten the next time a release is tagged.

# Start Here: heartland-fermenters-guild

## What this is
The public site for a hobbyist fermentation/brewing/baking/pickling/cheesemaking guild. It's an Astro static site (GitHub Pages, custom domain via Porkbun DNS) that has grown a database-backed recipes section, an admin area, and a members feature. There is no server of this project's own — all dynamic behavior happens client-side against a managed backend, with security enforced by that backend's rules engine, not by keeping anything secret.

**Read `docs/PRODUCT.md` first.** It's the hand-edited, living requirements/decision log and is the source of truth for *intent*. Everything else under `docs/` (`TEST_PLAN.md`, `USER_MANUAL.md`, `VISUALIZER.md`) is auto-generated from it by an external tool called Devlore and should be treated as derived, not authoritative.

## The backend is Firebase now, not Supabase — this matters
The project **started** on Supabase (Postgres + Auth + Storage, accessed straight from the browser with a publishable key, secured by Row Level Security). That architecture is why you may see older material — including a "baseline overview" some newcomers get handed — describing `src/lib/supabase.js`, `supabase/schema.sql`, and RLS policies as if they're current. **They are not.** Supabase was fully replaced with Firebase (Cloud Firestore, Firebase Authentication, Cloud Storage) because Supabase's free tier pauses a project after a week of inactivity, which is a real availability risk for a low-traffic hobby site. The Postgres schema, the Supabase client, and all RLS policies were deliberately replaced, not patched around.

Consequences you'll actually hit:
- Recipes are Firestore documents keyed by slug, not Postgres rows.
- Security lives in Firestore/Storage **Security Rules**, and those rules *validate* writes/queries rather than *filtering* results the way RLS did — a real behavioral difference to keep in mind whenever you write a new query.
- Testing now depends on the **Firebase Local Emulator Suite** (which needs Java installed) instead of the hand-rolled Supabase network-mocking helper described in older material. If e2e tests aren't running against an emulator, something's misconfigured.
- Don't go looking for `supabase/schema.sql` as the schema source of truth — look for the equivalent Firestore/Storage rules files (`firestore.rules` is referenced directly in decision history; confirm the exact current file layout from the repo tree itself rather than trusting either the old Supabase-era doc or this guide).

The one thing that *didn't* change across the migration: the site is still 100% client-driven, with a single template recipe-detail page addressed via a `?slug=` query string instead of per-recipe static routes. That's deliberate — GitHub Pages can only serve pages that existed at last build, so any future per-item page on this site should follow the same query-string pattern rather than trying to pre-generate a route per item.

## Auth model — three distinct tiers, don't conflate them
1. **Admin** — one shared Firebase Auth credential (`admin@heartlandfermentersguild.org`). Deliberately not per-admin accounts. Gates recipe writes and direct admin actions (add/edit/delete/deactivate).
2. **Members** — a separate, later addition: passwordless email magic-link sign-in, scoped to an admin-managed roster (the `active_members` collection), *not* the shared admin password and *not* full account signup. Members can submit recipes, but every submission lands in a pending queue and needs explicit admin approval before it's public — auto-publish was explicitly rejected.
3. **Public** — read-only, no auth.

**The lesson baked into the rules design:** "authenticated" was once treated as synonymous with "admin," because admin was the only account that could ever log in. Adding members broke that assumption — any signed-in member would otherwise have inherited admin-level write access under the old rules. If you add any new role or account type, model it *explicitly* in the security rules (equivalent checks to what "is this an admin" and "is this an active member" used to be, expressed via security-definer functions on the old Postgres schema — the concrete mechanism is gone with the Supabase migration, but the principle — never assume "logged in" implies "authorized" — still applies to whatever the current Firestore rules do).

The member roster has one more wrinkle: it's keyed by email for members who have one (needed for sign-in lookups), but paper sign-up sheets sometimes only have a name and phone. Email-less members get a generated `no-email-<uuid>` document ID instead — real emails always contain "@", generated IDs never do, so the two ID spaces can't collide and a no-email record can never accidentally satisfy a sign-in lookup. **Always go through the `isEmailId`/`memberIdFor` helpers to compute a member's document ID** — don't assume the ID is always the email.

## A live gotcha: there is (or recently was) an older version still in production
At least one decision was made explicitly to avoid breaking "the still-live v1.2.0 site" while its replacement was being built — e.g., phone-number format validation for members was added only in admin application code, not in `firestore.rules`, specifically because a stricter rule would have broken member creation on the version still deployed in production at the time. **Before changing any Firestore/Storage rule, check what's actually live** — this project has a history of a new version being developed against the same backend/rules that a currently-shipping older version depends on. Tightening a rule for the new code path can silently break the old one.

## Recipes data shape
- Ingredients, instructions, and time-stages are all stored as **plain newline-separated text**, not arrays/structured data — this is deliberate, to keep the admin form and schema simple, not an oversight.
- Time-stages are a freeform, open list per recipe. There are per-category *suggested* starting values, but they're never enforced — don't try to "fix" a recipe that doesn't match the suggestions.
- Optional recipe photos go through Cloud Storage; optional videos are just stored/embedded YouTube URLs (no upload path for video).
- **Known unfixed gap:** editing a recipe's photo does not clean up the old storage object — deleting a recipe does. If you touch the edit-photo path, know that orphaned files are an existing, acknowledged issue, not something you broke.

## The AI-backed search on the Resources page
Calls Gemini through **Firebase AI Logic**, not a bare API key — App Check (with `useLimitedUseAppCheckTokens` and reCAPTCHA Enterprise) is required, because ordinary tokens are rejected outright. The current model is Gemini 3.5 Flash-Lite, chosen after other candidates failed (one unavailable to new projects, one failed a basic "ignore your instructions" safety test). If you're touching this feature:
- Any future model swap should go through the same kind of comparison testing as `compare-ai-models.js` before changing `AI_MODEL`.
- Firebase's own per-minute per-user quota did **not** trip in testing and is *not* trusted as the real cost control. The actual financial backstop is the Google AI Studio prepaid-credit spend cap. Don't assume Firebase quotas alone protect against runaway spend.

## Deploy pipeline — verify before you assume
The deploy trigger for this site has changed more than once (push-to-`main` → tag-only (`v*.*.*` + manual dispatch) → back to push-to-`main`, at minimum), and the two docs that describe it disagree with each other as of the last known snapshot: README described push-to-`main` as current, while `docs/PRODUCT.md` described tag-based-only as the newer intended policy. **Don't trust either doc in isolation — read `.github/workflows/deploy.yml` itself** before assuming how (or when) a merge to `main` goes live. If you're about to merge something time-sensitive, confirm the actual trigger first.

## Devlore (documentation automation) — separate from the app
`.github/workflows/devlore*.yml` auto-generate `docs/TEST_PLAN.md`, `docs/USER_MANUAL.md`, `docs/VISUALIZER.md` from `docs/PRODUCT.md`. This has nothing to do with shipping the site itself. One infrastructural note: these jobs call reusable workflows from a separate `devlore` repo, which had to be made **public** because GitHub won't let a public repo call reusable workflows in a private one. If someone proposes making `devlore` private again, that will re-break doc sync — it's a known tradeoff, not an oversight.

## Getting from a clean checkout to a working change
The provided project material doesn't spell out exact install/run commands, so check the actual README for those rather than trusting a guide to invent them. Structurally, expect to need:
1. A Firebase project (or the Local Emulator Suite) to develop against — this is a browser-direct client, so you'll need local config/env values wired in, analogous to how Supabase env vars used to be required.
2. Java installed locally if you want to run the e2e suite, since it now runs against the Firebase Local Emulator Suite rather than mocked network calls.
3. Vitest for the dependency-free pure-logic modules (e.g. the constants/slugify helpers) — these intentionally have no backend import, so they should run without any Firebase setup at all.
4. If you're touching security rules, roster logic, or recipe writes, read the current rules file and `docs/PRODUCT.md`'s relevant requirement entries before changing anything — several of the existing rules exist to prevent a specific bug (implicit admin access) or to avoid breaking a specific still-live version, and that context isn't visible from the code alone.

## Reading order for a first pass
1. `docs/PRODUCT.md` — what's actually intended, and why, in the maintainers' own words.
2. The current Firestore/Storage rules file(s) — the real security boundary.
3. `src/lib/` — shared constants/helpers first (backend-independent), then the Firebase client setup.
4. `src/pages/` — landing, recipes list/detail (`?slug=` pattern), admin, and whatever member-facing pages exist.
5. `tests/e2e/` — treat these as executable documentation of expected admin/member behavior, but confirm they're running against the emulator, not stale Supabase-mock fixtures.
