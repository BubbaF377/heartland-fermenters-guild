<!-- devlore:onboarding -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this onboarding guide automatically at every release — manual edits will be overwritten at the next one. To change what's documented, update the underlying sources (`docs/PRODUCT.md`, decisions, master docs) instead.

# heartland-fermenters-guild — Onboarding Guide

# Onboarding Guide

## Where the important logic lives

This is a small, static Astro site, so "logic" is mostly layout, content, and deployment config rather than application code.

- **`src/layouts/Layout.astro`** — the shared shell (head, fonts, global styles). Any site-wide visual or metadata change goes through here first.
- **`src/pages/index.astro`** — the landing page. As of this snapshot, this *is* the site — there's only one real content page.
- **`src/pages/404.astro`** — not-found page, minor but worth knowing exists.
- **`public/`** — static assets (logo, banner images, favicons), plus two files that matter more than they look: `CNAME` (custom domain binding for GitHub Pages) and `robots.txt`.
- **`.github/workflows/deploy.yml`** — the actual build/deploy pipeline. This is arguably the highest-leverage file in the repo right now, since it controls *when* anything goes live (see decisions below).
- **`docs/PRODUCT.md`** — not code, but treated as the authoritative product/architecture doc. Read this before making structural changes; it's hand-maintained and is the source of truth the other docs are (supposed to be) generated from.
- **`astro.config.mjs` / `tsconfig.json`** — presumably near-default config; contents weren't available in this snapshot, so verify current state directly rather than assuming.

There is no server-rendered code, no auth, and no members-only section yet — those are explicitly future work, not something to go looking for in the current tree.

## Why past decisions were made

Three recorded decisions, all converging on one theme: **deploys are now gated behind release tags, not automatic on merge.**

- The site originally deployed on every push to `main`. This was changed so that deploys only trigger on `v*.*.*` tag pushes (or manual `workflow_dispatch`), matching the tagging convention already used by the separate Devlore tooling. The rationale given: continuous deploy on every push gave no way to stage, batch, or deliberately control what went live (e.g., batching content/image changes before publishing).
- **Practical consequence for you:** merging to `main` is now safe and inert — it does *not* publish anything. Publishing requires an explicit `git tag vX.Y.Z && git push origin vX.Y.Z` or a manual Actions run. Don't assume a merged PR is live; check for a tag.
- Separately, the Devlore auto-doc-sync integration (unrelated to the site itself) was broken because a public repo can't call reusable workflows in a private repo. This was resolved by making the Devlore workflows repo public, rather than restructuring the sync jobs to avoid cross-repo calls. This preserved the existing shared-workflow structure, but it means the doc-sync pipeline now has a standing dependency on `devlore` staying public — a future decision to make it private again would re-break sync and need to be revisited deliberately.

No decisions are recorded yet about the members-only section's auth approach, hosting model, or future page content — these are open per `PRODUCT.md`, not resolved.

## Common gotchas

- **Merging ≠ deploying.** This is the single biggest trap for a new contributor coming from a more conventional CI/CD setup: pushing to `main` used to deploy automatically, but no longer does. You must cut a `v*.*.*` tag (or trigger manually) to actually publish.
- **`docs/TEST_PLAN.md` and `docs/VISUALIZER.md` may be stale.** They're supposed to auto-generate from `PRODUCT.md`, but that sync is currently broken/was last fixed manually on 2026-08-15. Don't treat them as ground truth without checking dates/content against `PRODUCT.md` directly.
- **`docs/PRODUCT.md` says not to move or rename it.** It has a header comment to that effect; respect it since tooling (however currently broken) depends on its path.
- **DNS/nameservers are deliberately *not* on Cloudflare**, despite that being a common default move — nameservers stay on Porkbun per a documented rationale in `PRODUCT.md`. Don't "fix" this without reading why first.
- **The repo is public but has compensating controls** (single collaborator, branch protection on `main`, a ruleset restricting `v*` tag creation to admins) — per `PRODUCT.md`. If you're not an admin, expect that you can't cut release tags yourself even after a merge is approved.
- **Devlore tooling is not part of the site** — don't confuse `.github/workflows/devlore*.yml` with the actual deploy pipeline (`deploy.yml`); they're unrelated and independent.

## Where to start

1. Read `docs/PRODUCT.md` in full — it's short-ish and is the authoritative context for everything else, including the DNS/hosting rationale and the open decisions still on the table.
2. Skim `src/layouts/Layout.astro` and `src/pages/index.astro` — together they're basically the entire current site.
3. Look at `.github/workflows/deploy.yml` to understand the tag-triggered deploy flow described in the decisions above, and confirm current trigger config matches what's documented.
4. Check the dates/content of `docs/TEST_PLAN.md` and `docs/VISUALIZER.md` against `PRODUCT.md` before relying on them for anything — they're known to potentially drift.
5. If your task touches deploy behavior, DNS, or the tagging convention, re-read the three recorded decisions above first — they represent deliberate, discussed tradeoffs, not defaults.
