<!-- devlore:test-plan source-hash:195a9cdbd632ce91774abfc81be0b88c222d9eb40bfacdaaf82e528ad6731343 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this test plan automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's tested, update `docs/PRODUCT.md` itself.
<!-- devlore:test-plan requirement-hashes
1=8c6a5f4fb077
2=1df8dc66bebe
3=c1a27b1ede7c
4=d62dbc43a89f
5=93b096f790ce
6=9dfd0e0e55c8
-->

## Landing Page Content

### TC-LAND-01 — Header banner image displays
**Requirement(s):** #5
**Preconditions:** Landing page is deployed and reachable.
**Steps:**
1. Navigate to the landing page.
2. Scroll to the top of the page.
**Expected Result:** A header banner image is visible, loads without a broken-image icon, and renders above the fold.

### TC-LAND-02 — Circular crest logo displays
**Requirement(s):** #5
**Preconditions:** Landing page is deployed and reachable.
**Steps:**
1. Navigate to the landing page.
2. Locate the guild's crest logo.
**Expected Result:** The crest logo is visible, renders with a circular shape, and loads without a broken-image icon.

### TC-LAND-03 — Welcome paragraph is present and readable
**Requirement(s):** #5
**Preconditions:** Landing page is deployed and reachable.
**Steps:**
1. Navigate to the landing page.
2. Read the welcome paragraph text.
**Expected Result:** A short paragraph is present that explains what the guild is and who it's for; text is not placeholder/lorem-ipsum content.

### TC-LAND-04 — "Join the Conversation" section is present
**Requirement(s):** #5
**Preconditions:** Landing page is deployed and reachable.
**Steps:**
1. Navigate to the landing page.
2. Scroll to the "Join the Conversation" section.
**Expected Result:** A clearly labeled "Join the Conversation" section is visible containing outbound links.

### TC-LAND-05 — Email link opens mail client
**Requirement(s):** #5
**Preconditions:** Landing page is deployed and reachable; test machine has a mail client (or handler) configured.
**Steps:**
1. In the "Join the Conversation" section, click the email link.
**Expected Result:** The link triggers a `mailto:` action (opens default mail client or browser's mail handler prompt) addressed to a guild email.

### TC-LAND-06 — Facebook Page link navigates correctly
**Requirement(s):** #5
**Preconditions:** Landing page is deployed and reachable.
**Steps:**
1. In the "Join the Conversation" section, click the Facebook Page link.
**Expected Result:** A new tab/window opens to the guild's Facebook Page (not the Group), URL loads successfully (no 404).

### TC-LAND-07 — Facebook Group link navigates correctly
**Requirement(s):** #5
**Preconditions:** Landing page is deployed and reachable.
**Steps:**
1. In the "Join the Conversation" section, click the Facebook Group link.
**Expected Result:** A new tab/window opens to the guild's Facebook Group (not the Page), URL loads successfully (no 404).

### TC-LAND-08 — Instagram link navigates correctly
**Requirement(s):** #5
**Preconditions:** Landing page is deployed and reachable.
**Steps:**
1. In the "Join the Conversation" section, click the Instagram link.
**Expected Result:** A new tab/window opens to the guild's Instagram profile, URL loads successfully (no 404).

### TC-LAND-09 — Meetup link navigates correctly
**Requirement(s):** #5
**Preconditions:** Landing page is deployed and reachable.
**Steps:**
1. In the "Join the Conversation" section, click the Meetup link.
**Expected Result:** A new tab/window opens to the guild's Meetup page, URL loads successfully (no 404).

## Domain & Hosting

### TC-DOM-01 — Root domain loads over HTTPS
**Requirement(s):** #3
**Preconditions:** DNS has propagated for `heartlandfermentersguild.org`.
**Steps:**
1. Enter `https://heartlandfermentersguild.org` in the browser address bar.
2. Observe the page load and the browser's security indicator.
**Expected Result:** The landing page loads successfully over HTTPS with a valid certificate (no security warnings).

### TC-DOM-02 — www subdomain resolves to the same site
**Requirement(s):** #3
**Preconditions:** DNS has propagated, including the `www` CNAME.
**Steps:**
1. Enter `https://www.heartlandfermentersguild.org` in the browser address bar.
**Expected Result:** The request resolves and either serves the same landing page or redirects to the apex domain, without error.

### TC-DOM-03 — A records resolve to GitHub Pages IPs, not a proxy
**Requirement(s):** #3
**Preconditions:** Access to a DNS lookup tool (e.g. `dig`, `nslookup`, or an online lookup service).
**Steps:**
1. Run an A-record lookup against `heartlandfermentersguild.org`.
2. Compare returned IPs against GitHub Pages' published IP ranges.
**Expected Result:** Returned IPs match GitHub Pages' documented IPs directly (not a Cloudflare proxy IP range), confirming traffic isn't being proxied despite Porkbun's Cloudflare-backed DNS resolution.

## Deployment Pipeline

### TC-DEPLOY-01 — Push to main triggers automatic build and deploy
**Requirement(s):** #2
**Preconditions:** Push access to `main` (or a merged, approved PR); GitHub Actions enabled on the repo.
**Steps:**
1. Merge a small, visible content change (e.g. edit welcome paragraph text) into `main`.
2. Open the repo's Actions tab and watch for a new workflow run using `withastro/action`.
3. Wait for the workflow run to complete.
**Expected Result:** A workflow run starts automatically without any manual build/upload step, completes successfully, and the deployed site reflects the change.

### TC-DEPLOY-02 — Live site reflects latest deployed content
**Requirement(s):** #2
**Preconditions:** TC-DEPLOY-01 completed successfully.
**Steps:**
1. Navigate to `https://heartlandfermentersguild.org` after the deploy workflow finishes.
2. Hard-refresh the page to bypass cache.
**Expected Result:** The live page shows the newly deployed content change, confirming the deploy actually published.

## Repository Access Controls

### TC-REPO-01 — Repository is publicly visible
**Requirement(s):** #4
**Preconditions:** Logged out of GitHub, or using a browser session with no repo permissions.
**Steps:**
1. Navigate to the `heartland-fermenters-guild` repo URL while logged out.
**Expected Result:** The repository and its contents are visible without authentication.

### TC-REPO-02 — BubbaF377 is the sole collaborator
**Requirement(s):** #4
**Preconditions:** Access to the repo's Settings > Collaborators page (requires admin access).
**Steps:**
1. Open Settings > Collaborators and teams.
2. Review the list of people with access.
**Expected Result:** Only BubbaF377 is listed as a collaborator with access.

### TC-REPO-03 — Force-push to main is blocked
**Requirement(s):** #4
**Preconditions:** Local clone of the repo with a divergent commit history on `main`.
**Steps:**
1. Attempt `git push --force origin main`.
**Expected Result:** The push is rejected by GitHub due to branch protection.

### TC-REPO-04 — Deletion of main branch is blocked
**Requirement(s):** #4
**Preconditions:** Repo access sufficient to attempt branch deletion via UI or CLI.
**Steps:**
1. Attempt to delete the `main` branch via the GitHub UI or `git push origin --delete main`.
**Expected Result:** The deletion is rejected due to branch protection.

### TC-REPO-05 — PR merge blocked while conversations unresolved
**Requirement(s):** #4
**Preconditions:** An open pull request against `main` with at least one unresolved review comment.
**Steps:**
1. Open the pull request in GitHub.
2. Attempt to merge it while a review conversation is unresolved.
**Expected Result:** The merge button is disabled/blocked with a message indicating conversations must be resolved first.

### TC-REPO-06 — Non-admin blocked from creating a v* release tag
**Requirement(s):** #4
**Preconditions:** A collaborator/user without the admin role on the repo (if none exists, test with a role downgraded temporarily, or verify ruleset configuration directly).
**Steps:**
1. As a non-admin user, attempt to push a new tag matching `v*` (e.g. `v0.0.1-test`).
**Expected Result:** The tag push is rejected by the repository ruleset.

## Static Site Output

### TC-BUILD-01 — Landing page renders as plain static HTML
**Requirement(s):** #1
**Preconditions:** Landing page is deployed and reachable.
**Steps:**
1. Navigate to the landing page.
2. View page source (not the rendered DOM) via the browser's "View Page Source" feature.
**Expected Result:** The visible landing page content (header, crest, welcome text, links) is present directly in the raw HTML source, confirming it's shipped as static HTML rather than requiring client-side JS to render.

## Out of scope

- **Auth-protected members-only section** — explicitly listed as roadmap/not yet built (req #6).
- **Full info site pages (About/history, Events, Recipes/Resources)** — explicitly listed as roadmap/not yet built (req #6).
- **Auth approach decision (roll-your-own vs. hosted provider)** — open question, not decided.
- **Hosting location for future members-only server-side pieces** — open question, not decided.
- **Content drafting for future info site pages** — not yet drafted.
- **Devlore auto-doc-sync jobs (sync-test-plan, sync-user-manual, sync-visualizer, draft-log-entry, release-notes)** — internal tooling limitation affecting Devlore itself, not a user-facing site feature; known broken with no fix decided yet.
