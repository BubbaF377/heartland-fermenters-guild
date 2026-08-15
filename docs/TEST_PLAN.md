<!-- devlore:test-plan source-hash:926d22579dfb7a99c819f13b5bf0df1576d380720acb271f7695e7092a5fb207 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this test plan automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's tested, update `docs/PRODUCT.md` itself.

# QA Test Plan — heartland-fermenters-guild

Manual test plan for clicking through the live landing page, its outbound links, hosting/domain setup, and deployment behavior, based on `docs/PRODUCT.md`.

---

## Landing Page Content

**TC-01 — Header banner image displays**
- Requirement(s): 5
- Preconditions: Site is live at `heartlandfermentersguild.org`
- Steps:
  1. Navigate to the homepage.
  2. Observe the top of the page.
- Expected result: A header banner image is visible, loads without a broken-image icon, and is positioned at the top of the page above other content.

**TC-02 — Guild crest logo displays**
- Requirement(s): 5
- Preconditions: Site is live
- Steps:
  1. Navigate to the homepage.
  2. Locate the guild's circular crest logo.
- Expected result: The circular crest logo renders correctly (not broken/blank), is visually distinct from the header banner, and is legibly rendered (not stretched/distorted).

**TC-03 — Welcome paragraph is present and readable**
- Requirement(s): 5
- Preconditions: Site is live
- Steps:
  1. Navigate to the homepage.
  2. Locate the short welcome paragraph.
  3. Read the text.
- Expected result: A short paragraph is present that explains what the guild is and who it's for. Text is not a placeholder/lorem-ipsum and is legible against its background.

---

## "Join the Conversation" Links

**TC-04 — Email link works**
- Requirement(s): 5
- Preconditions: Site is live; test device has (or can simulate) a mail handler
- Steps:
  1. Navigate to homepage, scroll to "Join the Conversation" section.
  2. Click the email link.
- Expected result: Link either opens the default mail client with a `mailto:` pre-filled address, or is clearly a correct, working email address as displayed text. No broken/dead link.

**TC-05 — Facebook Page link works**
- Requirement(s): 5
- Preconditions: Site is live
- Steps:
  1. In "Join the Conversation," click the Facebook Page link.
- Expected result: Opens the Guild's Facebook Page (not a Group, not a 404/login wall for an unrelated page) in a new tab or same tab per site convention.

**TC-06 — Facebook Group link works**
- Requirement(s): 5
- Preconditions: Site is live
- Steps:
  1. In "Join the Conversation," click the Facebook Group link.
- Expected result: Opens the Guild's Facebook Group (distinct from the Page), landing on a real, active group.

**TC-07 — Instagram link works**
- Requirement(s): 5
- Preconditions: Site is live
- Steps:
  1. In "Join the Conversation," click the Instagram link.
- Expected result: Opens the Guild's actual Instagram profile.

**TC-08 — Meetup link works**
- Requirement(s): 5
- Preconditions: Site is live
- Steps:
  1. In "Join the Conversation," click the Meetup link.
- Expected result: Opens the Guild's actual Meetup group/page.

**TC-09 — All "Join the Conversation" links present together**
- Requirement(s): 5
- Preconditions: Site is live
- Steps:
  1. Navigate to homepage.
  2. Scroll to the "Join the Conversation" section.
  3. Count and identify each link.
- Expected result: All five link types are present in this section: email, Facebook Page, Facebook Group, Instagram, Meetup. None missing, none duplicated.

---

## Domain & Hosting

**TC-10 — Root custom domain loads the site**
- Requirement(s): 3
- Preconditions: DNS has propagated
- Steps:
  1. In a browser, navigate to `https://heartlandfermentersguild.org`.
- Expected result: The landing page loads successfully (no DNS error, no GitHub Pages 404, no "site not found").

**TC-11 — `www` subdomain resolves to the site**
- Requirement(s): 3
- Preconditions: DNS has propagated
- Steps:
  1. Navigate to `https://www.heartlandfermentersguild.org`.
- Expected result: Site loads successfully (either serving the same page directly or redirecting cleanly to the root domain) — no broken CNAME error.

**TC-12 — HTTPS is valid on the custom domain**
- Requirement(s): 3
- Preconditions: DNS has propagated, GitHub Pages HTTPS enforcement active
- Steps:
  1. Navigate to `http://heartlandfermentersguild.org` (plain http).
  2. Check the resulting URL and certificate.
- Expected result: Connection is served over HTTPS (either auto-upgraded or redirected), with a valid, non-expired TLS certificate matching the domain — no browser security warning.

---

## Deployment Pipeline

**TC-13 — Push to `main` deploys automatically**
- Requirement(s): 2
- Preconditions: Repo access with permission to push to `main`; site currently live
- Steps:
  1. Make a small, visible content change (e.g. edit the welcome paragraph text) and push directly to `main` (or merge a PR into it).
  2. Wait a few minutes without performing any manual build/upload step.
  3. Reload the live site.
- Expected result: The change appears on the live site without any manual deploy action — confirming the GitHub Actions build/deploy ran automatically off the push.

---

## Repository & Project Setup

**TC-14 — Repo is private on GitHub**
- Requirement(s): 4
- Preconditions: Access to GitHub, viewer is not a repo collaborator (for a true negative check) and separately as a collaborator
- Steps:
  1. As a logged-out or unaffiliated GitHub user, attempt to navigate to `github.com/<org-or-user>/heartland-fermenters-guild`.
  2. As an authorized collaborator, navigate to the repo and check its visibility badge/settings.
- Expected result: Unaffiliated users get a 404 (repo not visible/accessible). Authorized collaborators see the repo marked "Private" in GitHub's UI.

**TC-15 — Project correctly linked in Devlore**
- Requirement(s): 4
- Preconditions: Devlore access to the project workspace
- Steps:
  1. Open the project in Devlore.
  2. Check that it references the `heartland-fermenters-guild` GitHub repo (e.g. shown in project settings/integration panel).
- Expected result: Devlore shows the project linked to the correct GitHub repo, confirming the create-new-project wizard path completed successfully.

---

## Static-Site Behavior

**TC-16 — Page content renders with JavaScript disabled**
- Requirement(s): 1
- Preconditions: Browser with ability to disable JS (e.g. dev tools setting)
- Steps:
  1. Disable JavaScript in the browser.
  2. Navigate to the homepage.
- Expected result: Header banner, crest logo, welcome paragraph, and "Join the Conversation" links all render and remain clickable — confirming content is plain static HTML, not client-JS-dependent.

**TC-17 — Full content present in raw page source**
- Requirement(s): 1
- Preconditions: none
- Steps:
  1. Navigate to homepage.
  2. Use "View Page Source" (not just DevTools rendered DOM).
  3. Search for the welcome paragraph text.
- Expected result: The welcome paragraph text and link URLs are present directly in the raw HTML response, confirming static HTML output rather than content injected later via a client framework.

---

## Out of scope

- **Members-only section / login gating** — not yet built; auth approach explicitly undecided (Open questions).
- **Auth provider behavior (roll-your-own vs. hosted)** — decision not yet made, nothing to test.
- **About/History, Events, Recipes/Resources pages** — roadmap only, not yet built (Requirement 6).
- **Content accuracy for future info pages** — content not yet drafted (Open questions).
- **DNS provider choice (Porkbun vs. migrating to Cloudflare)** — open architectural question, no user-facing behavior change to verify; current DNS records are covered by TC-10/TC-11.
- **Hosting model for future members-only server-side pieces** — undecided, purely architectural, nothing shippable to click through yet.
