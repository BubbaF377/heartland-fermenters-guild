<!-- devlore:product-doc -->
> **Do not move, rename, or delete this file.** Devlore depends on finding it at exactly `docs/PRODUCT.md` to build your project's documentation and answer questions about it. Its content is yours — use it as your living discovery/product doc, and as source-of-truth context when brainstorming or planning with an AI agent.

# heartland-fermenters-guild

The public website for the Heartland Fermenters Guild, a real-world community of home brewers, bakers, picklers, and cheesemakers. Starts as a single landing page and is meant to grow into a full information site with an auth-protected members-only section.

## Vision

Give the guild a real home on the web at `heartlandfermentersguild.org`: first a simple, welcoming landing page people can be pointed to from social media and in person, then over time a fuller site (event info, resources/recipes, an About/history page), and eventually a members-only area gated behind login for guild-specific content.

## Requirements

Hard requirements as they get locked in, separate from the discovery narrative above. Append to this list as decisions firm up.

1. Built with [Astro](https://astro.build), chosen specifically because it ships plain static HTML/CSS for a fast, simple landing page today, while allowing server-rendered pages/endpoints to be added incrementally later (for the members-only section) without a framework migration.
2. Deployed to GitHub Pages via GitHub Actions (`withastro/action`) — build and deploy trigger only when a `v*.*.*` release tag is pushed (same tag pattern the Devlore release workflow listens for), or manually via `workflow_dispatch`. Pushes to `main` alone no longer deploy; cutting a release is now `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. Served at the custom domain `heartlandfermentersguild.org`, registered and DNS-managed on Porkbun (A records pointed at GitHub Pages' IPs, plus a `www` CNAME). Nameservers stay on Porkbun (`*.ns.porkbun.com`) rather than migrating to a provider like Cloudflare, to avoid handing over nameserver control for a single feature. Note: Porkbun's DNS *resolution* backend runs on Cloudflare's network by default for all domains (shown as "DNS Powered by Cloudflare" in Porkbun's dashboard, both view modes) — this isn't an opt-in toggle and can't be disabled. It's DNS-answering infrastructure only, not a traffic proxy: A records resolve directly to GitHub Pages' real IPs rather than Cloudflare's proxy ranges, so it doesn't violate the intent of this requirement (Porkbun/GitHub retain nameserver and traffic control).
4. Repo is public on GitHub (`heartland-fermenters-guild`), linked to Devlore via the create-new-project wizard path. Made public because GitHub Pages for a private repo requires a paid plan (Pro/Team/Enterprise); the site has no secrets in it, so this tradeoff was accepted. To compensate, the repo is locked down: BubbaF377 is the sole collaborator, `main` has branch protection (no force-pushes, no deletion, conversations must resolve before merge), and a repository ruleset blocks anyone without the admin role from creating/updating/deleting `v*` release tags.
5. Landing page (v1) contains: a header banner image, a short welcome paragraph explaining what the guild is and who it's for, and a "Join the Conversation" section linking out to email, the guild's Facebook Page, its Facebook Group, Instagram, and Meetup. (The guild's circular crest logo, originally shown between the banner and the page title, was removed.) The site-wide footer (in the shared `Layout.astro`, since the recipes/admin pages also use it) shows the copyright notice and Admin link on the left and a Starter Culture Studio logo on the right, linking out to `starterculturestudio.com`.
6. Roadmap: expand into a full info site (About/history, Events pages), then add an auth-protected members-only section. Requirement #1's tech stack choice exists specifically to make this addition incremental rather than a rewrite. Recipes (originally listed here as a possible info-site page) shipped as its own database-backed section instead — see Requirements #7–13.
7. A recipes section, backed by [Supabase](https://supabase.com) (managed Postgres). GitHub Pages can't run server code or reach a database directly, so `/recipes/` and `/recipes/view?slug=...` call Supabase's API straight from the browser using its client-safe publishable key — protected by Postgres Row Level Security (`supabase/schema.sql`), not by keeping that key secret. Recipes appear live with no rebuild, which is why the detail page is a single template driven by a `?slug=` query string rather than a pre-built static path per recipe — GitHub Pages can only serve pages that existed at the last build, so a real per-recipe route would mean every new recipe needs a redeploy before it's visible.
8. An admin page (`/admin/`) gates recipe creation behind a login — but a single shared password for the whole guild, not individual accounts ("anyone who has the password can log in"), so there's one fixed Supabase Auth user (`admin@heartlandfermentersguild.org`) whose password is shared with whoever should have admin access. The password check happens server-side via Supabase Auth (never a client-side-only comparison, which would be trivially readable in page source) — a successful login just proves "knows the current password," not who someone is.
9. Recipe fields: title, category (fixed list — Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, Other), short summary, an optional photo, an optional how-to video, a freeform yield/servings line, an open list of time stages (Requirement #10), ingredients, instructions, an optional notes/tips field, and an optional submitted-by name. Ingredients and instructions stay plain newline-separated text rather than a structured/array field, to keep the schema and the admin form simple — this same "plain text, one item per line" convention now also covers time stages (Requirement #10). Photo and video (Requirement #11) are independent of each other — a recipe can have a photo, a video, both, or neither.

   This field list — and the recipe detail page layout it feeds — was worked out against a reviewed wireframe based on patterns from popular recipe sites (SideChef, food.com), adapted for a small hobbyist guild: no ratings, no ad-driven layout, no nutrition calculator. See the [recipe page wireframe](https://claude.ai/code/artifact/a0e5e645-1c4e-4d55-a903-18d51f1b2bc0) for the reviewed layout (desktop, mobile, and a second category example), including where each new field sits on the page.

10. Time stages (prep, ferment, rise, bake, age, etc.) are stored as a single optional text field per recipe (`time_stages`), one `Label: Duration` pair per line — the same newline-separated convention as ingredients and instructions, parsed into individual metadata chips at render time (e.g. "Prep: 20 min" becomes a chip labeled "Active Prep" reading "20 min"). This is deliberately an open, repeatable list rather than a fixed set of named columns (no `prep_time` / `ferment_time` / `rise_time` columns): different categories need different sets of stages, and even recipes within the same category can differ — most sourdough recipes are Prep/Rise/Bake, but one that's cold-proofed overnight needs a fourth "Cold Proof" stage, and a fixed column set can't absorb that without a schema change every time a new combination shows up.

    The admin form (Requirement #12) pre-populates suggested starting stages based on the selected category, but the submitter can add, remove, or relabel any stage before saving. Suggested starting points per category:
    - Beer: Prep, Ferment, Condition/Carbonate
    - Wine: Prep, Ferment, Age
    - Bread & Sourdough: Prep, Rise, Bake
    - Vegetables & Pickles: Prep, Ferment
    - Kombucha: Prep, Ferment
    - Cheese: Prep, Culture, Age
    - Other: no suggested stages — added freely

    These are starting suggestions only, never enforced — the stored value is whatever list of stages the submitter actually ends up with, in whatever order they leave them in.

11. An optional recipe photo, uploaded to a new public Supabase Storage bucket (`recipe-photos`); the row stores the uploaded object's path (`photo_path`), not a bare public URL, so the display URL is derived at render time via Supabase's `getPublicUrl`. Upload is admin-only, gated the same way table writes already are (Requirement #8's shared admin auth) — the bucket's write policy checks for an authenticated session the same way the `recipes` table's insert policy does, while read access is public (anyone can view a recipe's photo without logging in).

    An optional how-to video, stored as a plain YouTube URL (`video_url`) exactly as pasted by whoever submits the recipe (a `youtube.com/watch?v=...` or `youtu.be/...` link) — the recipe page extracts the video ID at render time to build the embed, rather than asking the submitter to know how to do that themselves. No new bucket or storage needed for video; it's just a link to something already hosted on YouTube.

12. The admin recipe form (Requirement #8) grows to capture the new fields:
    - An optional photo upload (file input). The upload happens as part of submit, before the database insert — if the upload fails, the form shows an error and the recipe is not saved, rather than saving a recipe with a broken photo reference.
    - An optional video URL text input, with placeholder text showing the expected format.
    - A freeform yield/servings text input (optional).
    - An optional notes/tips textarea.
    - A dynamic time-stages section: a repeatable row list (a label input plus a duration input per row, each with a way to remove that row, and a way to add a new blank row). Selecting a category auto-populates this section with that category's suggested starting stages (Requirement #10) — but only when the section is still empty, so switching categories after the submitter has already started filling in stages never overwrites what they've typed. On submit, the rows collapse into the newline-separated `time_stages` value.

    Existing fields (title, category, summary, ingredients, instructions, submitted-by) are unchanged.

13. Two ideas that came out of the wireframe review are deliberately deferred rather than built now, since neither needs a schema change to add later: a "related recipes" strip on the recipe detail page (other recipes in the same category, queried against the existing `category` field), and category filter pills on the recipe list page (client-side filtering, also against the existing `category` field).

## Open questions

- Auth approach for the future members-only section (roll-your-own vs. a hosted auth provider) — not yet decided. Separate from Requirement #8's single shared admin password, which is deliberately simpler (no per-member accounts).
- Whether the members-only section's server-side pieces stay on GitHub Pages via a bolted-on auth service, or need a different host entirely — leaning toward keeping the public site on GitHub Pages and adding one narrow separate service just for auth when that's actually built, rather than moving the whole site off Pages now. Not decided.
- Content for the eventual info site pages (About, Events) — not yet drafted.
- Other admin actions beyond adding a recipe (edit, delete) — mentioned as likely but deliberately deferred; no RLS policies or UI for them yet. Now that recipes can carry an uploaded photo (Requirement #11), a future delete action should also account for cleaning up the corresponding Storage object, not just the database row.
- Related recipes strip and category filter pills (Requirement #13) — deferred, no ETA.
