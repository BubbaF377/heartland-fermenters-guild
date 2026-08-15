<!-- devlore:test-plan source-hash:195a9cdbd632ce91774abfc81be0b88c222d9eb40bfacdaaf82e528ad6731343 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this test plan automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's tested, update `docs/PRODUCT.md` itself.

# Manual QA Test Plan — heartland-fermenters-guild

## 1. Landing Page Content

**TC-LP-01: Header banner image displays**
- **Requirement(s):** 5
- **Preconditions:** Site is live at heartlandfermentersguild.org (or PR preview/local build)
- **Steps:**
  1. Load the landing page.
  2. Scroll to top of page.
- **Expected:** A header banner image renders fully, no broken image icon, image is appropriately sized/not distorted.

**TC-LP-02: Circular crest logo displays**
- **Requirement(s):** 5
- **Preconditions:** Landing page loaded
- **Steps:**
  1. Locate the guild crest logo on the page.
- **Expected:** Logo renders, is circular, not stretched/cropped oddly, no broken image icon.

**TC-LP-03: Welcome paragraph present and readable**
- **Requirement(s):** 5
- **Preconditions:** Landing page loaded
- **Steps:**
  1. Read the welcome/intro paragraph.
- **Expected:** A short paragraph is present explaining what the guild is and who it's for (home brewers, bakers, picklers, cheesemakers audience implied); text is not a placeholder/lorem ipsum.

**TC-LP-04: Page renders as static HTML (no JS framework errors)**
- **Requirement(s):** 1
- **Preconditions:** Landing page loaded in browser with dev tools available
- **Steps:**
  1. Open browser dev tools console.
  2. Reload the page.
  3. View page source (Ctrl+U / "View Page Source").
- **Expected:** No console errors on load; view-source shows fully-formed static HTML content (not an empty shell waiting on client-side JS to render).

## 2. Join the Conversation Links

**TC-JOIN-01: Email link**
- **Requirement(s):** 5
- **Preconditions:** Landing page loaded
- **Steps:**
  1. Locate "Join the Conversation" section.
  2. Click the email link.
- **Expected:** Default mail client opens (or `mailto:` link triggers) addressed to the guild's contact email.

**TC-JOIN-02: Facebook Page link**
- **Requirement(s):** 5
- **Steps:**
  1. In "Join the Conversation" section, click the Facebook Page link.
- **Expected:** Opens the guild's Facebook Page in a new tab/window; URL and content correspond to the guild's Page (not the Group).

**TC-JOIN-03: Facebook Group link**
- **Requirement(s):** 5
- **Steps:**
  1. Click the Facebook Group link.
- **Expected:** Opens the guild's Facebook Group (distinct from the Page tested in TC-JOIN-02).

**TC-JOIN-04: Instagram link**
- **Requirement(s):** 5
- **Steps:**
  1. Click the Instagram link.
- **Expected:** Opens the guild's Instagram profile in a new tab/window.

**TC-JOIN-05: Meetup link**
- **Requirement(s):** 5
- **Steps:**
  1. Click the Meetup link.
- **Expected:** Opens the guild's Meetup page in a new tab/window.

**TC-JOIN-06: All external links open without navigating away from working state**
- **Requirement(s):** 5
- **Steps:**
  1. Click each of the five links (email, FB Page, FB Group, Instagram, Meetup) in turn, returning to the landing page tab between clicks.
- **Expected:** None of the links are dead (404, "page not found," or blank); each opens in a new tab so the landing page itself is never lost.

## 3. Deployment / CI

**TC-DEPLOY-01: Push to main triggers auto build & deploy**
- **Requirement(s):** 2
- **Preconditions:** Repo access with ability to push a trivial change (e.g. whitespace/content tweak) to `main`
- **Steps:**
  1. Push a small, visible content change to `main`.
  2. Go to the repo's Actions tab.
  3. Wait for the workflow run to complete.
  4. Reload heartlandfermentersguild.org.
- **Expected:** A workflow run starts automatically on push (no manual trigger needed) using `withastro/action`; run succeeds; the live site reflects the change once the run completes, with no manual build/upload step performed.

**TC-DEPLOY-02: Failed build does not silently deploy**
- **Requirement(s):** 2
- **Preconditions:** Ability to push a change that breaks the Astro build (e.g. invalid syntax)
- **Steps:**
  1. Push a change that causes the Astro build to fail.
  2. Check the Actions tab.
  3. Reload the live site.
- **Expected:** Workflow run shows a failure; live site is unchanged (still serving last good deploy).

## 4. Custom Domain / DNS

**TC-DNS-01: Root domain resolves and serves the site**
- **Requirement(s):** 3
- **Steps:**
  1. Navigate to `http://heartlandfermentersguild.org` and `https://heartlandfermentersguild.org`.
- **Expected:** Both load the landing page (HTTPS should work, ideally HTTP redirects to HTTPS per GitHub Pages default).

**TC-DNS-02: www subdomain resolves**
- **Requirement(s):** 3
- **Steps:**
  1. Navigate to `https://www.heartlandfermentersguild.org`.
- **Expected:** Loads the same site (either serves directly or redirects to the apex domain).

**TC-DNS-03: A records point to GitHub Pages IPs**
- **Requirement(s):** 3
- **Preconditions:** Access to a terminal/DNS lookup tool
- **Steps:**
  1. Run `dig A heartlandfermentersguild.org` (or equivalent).
- **Expected:** Returned A records match GitHub Pages' published IP addresses, not Cloudflare proxy IP ranges.

**TC-DNS-04: Nameservers remain on Porkbun**
- **Requirement(s):** 3
- **Steps:**
  1. Run `dig NS heartlandfermentersguild.org` (or equivalent).
- **Expected:** Nameservers returned are `*.ns.porkbun.com`, not a third-party provider like Cloudflare.

*(Note: Porkbun's DNS-answering backend running on Cloudflare infrastructure is explicitly called out as expected/unavoidable per the doc and not itself a defect — do not fail a test case for this alone.)*

## 5. Repository Access & Protection Settings

**TC-REPO-01: Repo is public**
- **Requirement(s):** 4
- **Steps:**
  1. Visit the repo URL logged out / in a private browser window.
- **Expected:** Repo contents are visible without authentication.

**TC-REPO-02: Sole collaborator is BubbaF377**
- **Requirement(s):** 4
- **Preconditions:** Admin access to repo settings
- **Steps:**
  1. Go to Settings → Collaborators and teams.
- **Expected:** BubbaF377 is the only listed collaborator.

**TC-REPO-03: Branch protection on main — no force-push/deletion**
- **Requirement(s):** 4
- **Preconditions:** Admin access
- **Steps:**
  1. Attempt to force-push to `main` (or inspect Settings → Branches → `main` rule).
  2. Attempt to delete the `main` branch.
- **Expected:** Force-push is rejected; branch deletion is blocked/unavailable.

**TC-REPO-04: Branch protection — conversations must resolve before merge**
- **Requirement(s):** 4
- **Preconditions:** Open a test PR with an unresolved review comment
- **Steps:**
  1. Open a PR into `main` with an outstanding unresolved conversation.
  2. Attempt to merge.
- **Expected:** Merge is blocked until the conversation is marked resolved.

**TC-REPO-05: Ruleset blocks non-admins from managing v* tags**
- **Requirement(s):** 4
- **Preconditions:** A non-admin collaborator account for testing (or documented review of ruleset config if no second account is available)
- **Steps:**
  1. As a non-admin, attempt to create/push a tag matching `v*` (e.g. `v9.9.9`).
  2. Attempt to delete an existing `v*` tag.
- **Expected:** Both actions are rejected for non-admin roles; an admin can still perform them.

## 6. Architectural / Not Independently Clickable

- **Requirement 1 (Astro chosen to allow incremental SSR later without migration):** This is a technology/architecture choice about future extensibility, not an observable UI behavior today. Covered indirectly by TC-LP-04 (page is static HTML now); the "no migration needed later" guarantee isn't something to click-test until the members-only section is built.

## Out of Scope

- **Full info site (About/history, Events, Recipes/Resources pages)** — Requirement 6, explicitly "not yet built."
- **Auth-protected members-only section** — Requirement 6, explicitly "not yet built"; auth approach itself is an open question, not decided.
- **Content for About/Events/Recipes pages** — listed under Open Questions as "not yet drafted."
- **Auto-doc-sync jobs (`sync-test-plan`, `sync-user-manual`, `sync-visualizer`, `draft-log-entry`, release-notes job)** — documented as currently broken due to public/private reusable workflow restriction; resolution path not yet decided, nothing to click-test on the site itself.
