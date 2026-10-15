> **Do not move, rename, or edit this file.** Devkeep generates and maintains this onboarding guide automatically at each release — manual edits will be overwritten the next time a release is tagged.

# Heartland Fermenters Guild — Start Here

Welcome. This is an orientation for making your first change, not a user manual. Read this, then `docs/PRODUCT.md` (requirements + history), then `AGENTS.md` for contribution conventions. Treat `docs/USER_MANUAL.md`, `docs/TEST_PLAN.md`, and `docs/VISUALIZER.md` as generated views of `docs/PRODUCT.md` — if they disagree with it, PRODUCT.md wins and the others are just stale.

## What this actually is, right now

A static Astro site (GitHub Pages) for a home-fermentation hobby guild, backed by **Firebase** (Firestore, Auth, Storage, AI Logic + App Check). It has three faces:

- Public: landing page, `/recipes/`, `/resources/` (curated links + AI-powered plain-English search).
- Member: `/submit/` — passwordless email-link login, then a recipe submission form that lands in a `pending` queue.
- Admin: `/admin/` — shared-password login, a two-level tabbed dashboard (Recipes: Stored/Pending/Add a Recipe; Members: Member List/Add a Member).

**Important: this was not always Firebase.** Earlier project history ran on Supabase/Postgres/RLS. That was fully replaced, not patched — Supabase's free tier pauses inactive projects after a week with no traffic, which was a real risk for a low-traffic hobby site. If you find anything in older notes, commit messages, or your own instincts referencing Supabase, Postgres, RLS policies, `is_admin()`/`is_active_member()` SQL functions, or `supabase/schema.sql`, that is **history, not current architecture**. The real current backend is Firestore + `firestore.rules` + `storage.rules`, with equivalent `isAdmin()` / `isActiveMember()` helpers.

## Where the logic actually lives — read these first

- `docs/PRODUCT.md` — the source of truth for intent and requirements, hand-maintained, with inline **History** notes explaining *why*. Read this before touching anything behavior-related.
- `src/lib/recipe-form.js` — shared logic (field reading, time-stage editor with category suggestions, photo upload) used **identically** by both the admin add/edit form and the member submission form. If you're changing recipe-form behavior, this is almost certainly where it belongs — don't duplicate logic into one form only.
- `src/lib/firebase-app.js` vs `src/lib/firebase.js` — deliberately split. `firebase-app.js` is just app/config init; `firebase.js` layers Auth/Firestore/Storage on top. This exists so `/resources/` (which only needs AI Logic, not Auth/Firestore/Storage) doesn't pull in clients it doesn't use. Respect this split — don't import `firebase.js` from something that doesn't need the heavier clients.
- `src/lib/constants.js` — shared constants, photo validation rules, phone normalization/formatting helpers.
- `src/lib/resources.js` / `src/lib/resource-ai.js` — resources dataset filtering, and the Gemini/App Check wrapper for "Ask in plain English," respectively.
- `firestore.rules` / `storage.rules` — authorization and validation boundary. Critically, these rules validate the **shape of a query**, not filter results server-side. The client is responsible for asking correctly (e.g. only ever querying `status = published` for public views); the rules are responsible for refusing anything shaped wrong. Don't assume "the backend will filter it out for me."
- `src/data/fermentation-resources.json` + `src/data/schemas/` — the resources directory is static JSON bundled at build time, not Firestore. No Firestore read path, no rules surface. It's edited directly (a contributor, Christian, supplies updated JSON) — there's no admin UI for it yet.

## Decisions you need to know the reasoning behind (so you don't undo them)

**`?slug=` query-string routing for recipe detail, not per-recipe static routes.** GitHub Pages can only serve what existed at the last build. A query-string-driven single template is the deliberate workaround. Any future per-item page on this site should follow the same pattern as long as it's on GitHub Pages.

**One shared admin password, separate from member auth.** Admin auth (`/admin/`) recognizes exactly one Firebase Auth identity — it is not "any authenticated user." Members authenticate separately via passwordless email-link at `/submit/`, specifically so they can contribute without ever holding the admin credential. A member's session never grants admin access. If you're adding any new authorization check, model it explicitly (`isAdmin()` / `isActiveMember()`-style) — never assume "logged in" implies "authorized." That exact bug (implicit authority via `to authenticated` policies) was found and fixed once already, back under Supabase/RLS.

**Member submissions are always gated through a pending queue.** Nothing a member submits reaches the public site without explicit admin Approve. This was added specifically to close a real gap: a member had no way to know whether their submission collided with an existing pending recipe. Don't build any new member-generated-content path that skips moderation.

**Member identity is email-keyed, or a generated `no-email-<uuid>` fallback.** Firestore keys member documents by email when one exists. Members without an email (real paper sign-up sheets sometimes only capture a name+phone) get a generated ID instead. Real emails always contain `@`; generated IDs never do — this is intentional, so the two ID spaces can never collide and a no-email record can never accidentally satisfy a sign-in lookup. Any code touching member lookup must go through the equivalent of `isEmailId`/`memberIdFor` helpers, not assume the ID is always an email. **Any change to a member's email-having status (add/remove/change email) is a transactional move** — write the new doc, delete the old one, refuse if the destination email is taken — never an in-place field update. `active` and `created_at` must survive the move unchanged.

**Phone format validation is client-side only — deliberately not in `firestore.rules`.** The live production dataset contains phone numbers stored before any normalization existed, in arbitrary formats. A rules-level enforcement would break writes against that real data without a migration. Pre-existing non-conforming values are displayed as-stored, never retroactively reformatted. Don't "fix" this by adding a rules-level check without first handling that existing data.

**The bulk-email toolbar (Member List) is deliberately dumb.** "Email all members" opens the admin's own mail client via `mailto:`; "Copy emails" copies to clipboard. The site has **no mail-sending credential anywhere in the stack** — that's by design, one less secret to protect on a donated, static-hosted site. If a future requirement wants the site to actually *send* mail itself, that is a materially different feature requiring new server-side (or scheduled Cloud Function) infrastructure that does not exist today. Don't assume it's a small step from what's there.

**Resources AI search goes through Firebase AI Logic + App Check, not a bare Gemini key.** Firebase AI Logic outright rejects requests without App Check enforcement — this isn't optional hardening, the feature doesn't work without it (limited-use tokens specifically; ordinary tokens were also rejected). The real spend backstop is an **AI Studio prepaid spend cap**, not Firebase's per-user rate limit — the rate limit never tripped in testing, so it wasn't trusted as the sole safeguard. If you're touching this feature, go through the same `compare-ai-models.js`-style comparison before swapping the model (2.5 Flash-Lite is unavailable to new projects; 3.1 Flash-Lite failed a safety test; 3.5 Flash-Lite is what's actually in use).

**Deploy trigger has flip-flopped multiple times** (push-to-main → tag-only → push-to-main again, across project history). **Do not infer current deploy behavior from any doc, including this one — read `.github/workflows/deploy.yml` directly.** This has changed direction enough times that trusting a remembered/documented version instead of the actual file is a real, demonstrated way to be wrong.

## Gotchas — things that look like bugs but aren't, and things that were actually bugs

- **`hidden` attribute silently overridden by CSS.** `.button-link`'s `display: inline-flex` was found overriding the `hidden` attribute on the "Email all members" link, keeping it visibly rendered when it should have vanished. Lesson: toggling `hidden` is not safe to assume works without checking for a competing `display` rule in CSS. This pattern could recur elsewhere.
- **HEIC photo upload behavior is unverified, not confirmed-safe.** There's a long-standing *unconfirmed* assumption that iOS auto-converts HEIC to JPEG before upload. It has never actually been tested on a device. Don't treat it as settled; if you touch photo upload, the concrete check is: upload a photo from an iPhone's default camera roll through `/admin/` or `/submit/` and see what actually happens.
- **Requirement numbering collision at #20 in PRODUCT.md.** There are two historically-numbered "Requirement 20"s floating around in docs/commit history — the admin dashboard navigation requirement (now renumbered to 22) and the resources-directory requirement (which kept 20). If you see "Requirement 20" referenced somewhere, check which one is actually meant rather than assuming.
- **Several AI-search specifics are explicitly unverified**, not just undocumented: whether Gemini Developer API or Vertex AI is the underlying surface, the exact field scope of keyword search on `/resources/`, whether CI runs schema validation against the resources dataset, the precise rate-limit mechanism, and budget-alert scope beyond the AI Studio spend cap. These are open questions in `docs/PRODUCT.md` — don't fill them in with a plausible-sounding answer.
- **Legacy unvalidated phone data exists in production.** Don't write code or rules that assume every stored phone value matches the current normalized format.
- **Devlore/Devkeep workflow files come and go.** The automation tool was renamed Devlore → Devkeep; its generated `.github/workflows/devkeep-*.yml` files appear and disappear as its own feature set changes. Don't treat their presence/absence as a signal about this project's architecture.
- **Re-running a failed release job via GitHub's native "re-run failed jobs" button is unsafe** for this project's release automation — it can re-resolve a moving tag (`@v1`) to a stale, already-broken version instead of the intended fix. Recovery from a failed release run should go through manual `workflow_dispatch` with an explicit tag/job, not the re-run button.

## Getting from a clean checkout to a working change

The provided material doesn't give exact local setup commands, so don't invent them — but structurally:

1. Read `docs/PRODUCT.md` for the requirement you're touching, including its History note if present.
2. Check whether `src/lib/recipe-form.js`, `src/lib/constants.js`, `firestore.rules`/`storage.rules`, or the resources dataset/schemas are the right place for your change, per the map above — avoid duplicating logic between the admin and member recipe forms.
3. Testing is layered: **Vitest** for unit tests, **Playwright** for e2e (run against the *built/previewed* site, not `astro dev`, and pinned to its own local port so tests can't hit production Firebase), and the **Firebase Local Emulator Suite** (requires Java) backing both rules tests and e2e seeding. If your change touches auth/data/storage behavior, expect to verify it against the emulator rather than production.
4. If your change affects a tracked requirement in `docs/PRODUCT.md`, Devkeep will regenerate `USER_MANUAL.md`/`TEST_PLAN.md`/`VISUALIZER.md` from it — don't hand-edit those generated docs to match your change; edit PRODUCT.md and let the hash-triggered regeneration catch up.
5. Before merging, re-check `.github/workflows/deploy.yml` for the actual current deploy trigger if your change is time-sensitive — per the gotcha above, don't assume.

## What's genuinely unverified — say so, don't guess

A fair amount of this project's own documentation explicitly flags things as unconfirmed rather than asserting them as fact: HEIC upload behavior, several AI-search implementation details, whether CI validates the resources dataset against its JSON Schemas, and the Gemini pricing figure used in cost estimates. If your work touches any of these, treat them as open questions to resolve with a concrete check — not settled behavior to build on top of.
