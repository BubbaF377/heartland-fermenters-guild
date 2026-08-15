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
3. Served at the custom domain `heartlandfermentersguild.org`, registered and DNS-managed on Porkbun (A records pointed at GitHub Pages' IPs, plus a `www` CNAME). DNS stays on Porkbun rather than migrating to a provider like Cloudflare, to avoid handing over nameserver control for a single feature (see Open questions).
4. Repo is private on GitHub (`heartland-fermenters-guild`), linked to Devlore via the create-new-project wizard path.
5. Landing page (v1) contains: a header banner image, the guild's circular crest logo, a short welcome paragraph explaining what the guild is and who it's for, and a "Join the Conversation" section linking out to email, the guild's Facebook Page, its Facebook Group, Instagram, and Meetup.
6. Roadmap, not yet built: expand into a full info site (About/history, Events, Recipes/Resources pages), then add an auth-protected members-only section. Requirement #1's tech stack choice exists specifically to make this addition incremental rather than a rewrite.

## Open questions

- Auth approach for the future members-only section (roll-your-own vs. a hosted auth provider) — not yet decided.
- Whether the members-only section's server-side pieces stay on GitHub Pages via a bolted-on auth service, or need a different host entirely — leaning toward keeping the public site on GitHub Pages and adding one narrow separate service just for auth when that's actually built, rather than moving the whole site off Pages now. Not decided.
- Content for the eventual info site pages (About, Events, Recipes/Resources) — not yet drafted.
