<!-- devlore:product-doc -->
> **Do not move, rename, or delete this file.** Devlore depends on finding it at exactly `docs/PRODUCT.md` to build your project's documentation and answer questions about it. Its content is yours — use it as your living discovery/product doc, and as source-of-truth context when brainstorming or planning with an AI agent.

# heartland-fermenters-guild

The public website for the Heartland Fermenters Guild, a real-world community of home brewers, bakers, picklers, and cheesemakers. Starts as a single landing page and is meant to grow into a full information site with an auth-protected members-only section.

## Vision

Give the guild a real home on the web at `heartlandfermentersguild.org`: first a simple, welcoming landing page people can be pointed to from social media and in person, then over time a fuller site (event info, resources/recipes, an About/history page), and eventually a members-only area gated behind login for guild-specific content.

## Requirements

Hard requirements as they get locked in, separate from the discovery narrative above. Append to this list as decisions firm up.

1. Built with [Astro](https://astro.build), chosen specifically because it ships plain static HTML/CSS for a fast, simple landing page today, while allowing server-rendered pages/endpoints to be added incrementally later (for the members-only section) without a framework migration.
2. Deployed to GitHub Pages via GitHub Actions (`withastro/action`) — every push to `main` triggers an automatic build and deploy, no manual build/upload step.
3. Served at the custom domain `heartlandfermentersguild.org`, registered and DNS-managed on Porkbun (A records pointed at GitHub Pages' IPs, plus a `www` CNAME). Nameservers stay on Porkbun (`*.ns.porkbun.com`) rather than migrating to a provider like Cloudflare, to avoid handing over nameserver control for a single feature. Note: Porkbun's DNS *resolution* backend runs on Cloudflare's network by default for all domains (shown as "DNS Powered by Cloudflare" in Porkbun's dashboard, both view modes) — this isn't an opt-in toggle and can't be disabled. It's DNS-answering infrastructure only, not a traffic proxy: A records resolve directly to GitHub Pages' real IPs rather than Cloudflare's proxy ranges, so it doesn't violate the intent of this requirement (Porkbun/GitHub retain nameserver and traffic control).
4. Repo is public on GitHub (`heartland-fermenters-guild`), linked to Devlore via the create-new-project wizard path. Made public because GitHub Pages for a private repo requires a paid plan (Pro/Team/Enterprise); the site has no secrets in it, so this tradeoff was accepted. To compensate, the repo is locked down: BubbaF377 is the sole collaborator, `main` has branch protection (no force-pushes, no deletion, conversations must resolve before merge), and a repository ruleset blocks anyone without the admin role from creating/updating/deleting `v*` release tags.
5. Landing page (v1) contains: a header banner image, the guild's circular crest logo, a short welcome paragraph explaining what the guild is and who it's for, and a "Join the Conversation" section linking out to email, the guild's Facebook Page, its Facebook Group, Instagram, and Meetup.
6. Roadmap, not yet built: expand into a full info site (About/history, Events, Recipes/Resources pages), then add an auth-protected members-only section. Requirement #1's tech stack choice exists specifically to make this addition incremental rather than a rewrite.

## Open questions

- Auth approach for the future members-only section (roll-your-own vs. a hosted auth provider) — not yet decided.
- Whether the members-only section's server-side pieces stay on GitHub Pages via a bolted-on auth service, or need a different host entirely — leaning toward keeping the public site on GitHub Pages and adding one narrow separate service just for auth when that's actually built, rather than moving the whole site off Pages now. Not decided.
- Content for the eventual info site pages (About, Events, Recipes/Resources) — not yet drafted.
- **Known limitation:** Devlore's auto-doc-sync (`devlore.yml`'s `sync-test-plan`/`sync-user-manual`/`sync-visualizer`/`draft-log-entry` jobs, plus `devlore-release.yml`'s release-notes job) is currently broken as a side effect of requirement #4 — this repo is public, and its reusable workflows live in the private `devlore` repo; GitHub disallows a public repo from calling reusable workflows hosted in a private one, regardless of the private repo's "accessible from repositories owned by the user" access setting. `docs/TEST_PLAN.md` and `docs/VISUALIZER.md` were brought up to date manually as a one-time fix on 2026-08-15 and will drift again on future `docs/PRODUCT.md` edits until this is resolved (options: make `devlore` public, or restructure the sync to not depend on cross-repo reusable workflows). Not yet decided which way to go.
