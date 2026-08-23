<!-- devlore:test-plan source-hash:59f165593a70a9e1188fcd4ca6188c253e6bf1d8dac39c806f28c8c5075098bc -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this test plan automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's tested, update `docs/PRODUCT.md` itself.
<!-- devlore:test-plan requirement-hashes
1=8c6a5f4fb077
2=74ba323e0a07
3=c1a27b1ede7c
4=d62dbc43a89f
5=6294ef378458
6=99d0e478982f
7=c5fb0daa7d8a
8=6cf7ff87fbd8
9=13d25ef62915
10=b54a7bf62738
11=3309ad72e833
12=e54aaeada7dc
13=2255b0761d84
-->

## Landing Page

### TC-LAND-01 — Header banner image displays
**Requirement(s):** #5
**Preconditions:** None; site is live or running locally.
**Steps:**
1. Load the landing page (`/`).
2. Observe the top of the page.
**Expected Result:** A header banner image is displayed at the top of the page.

### TC-LAND-02 — Welcome paragraph present
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Load the landing page.
2. Scroll to the area below the banner.
**Expected Result:** A short welcome paragraph is shown explaining what the guild is and who it's for.

### TC-LAND-03 — Crest logo is not present
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Load the landing page.
2. Inspect the area between the banner image and the page title.
**Expected Result:** No circular crest logo is shown; the removed logo does not reappear.

### TC-LAND-04 — "Join the Conversation" email link
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Load the landing page and locate the "Join the Conversation" section.
2. Click the email link.
**Expected Result:** The link opens a mail composer (or shows a `mailto:` address) addressed to the guild's contact email.

### TC-LAND-05 — "Join the Conversation" Facebook Page link
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. In the "Join the Conversation" section, click the Facebook Page link.
**Expected Result:** The link navigates to the guild's Facebook Page.

### TC-LAND-06 — "Join the Conversation" Facebook Group link
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. In the "Join the Conversation" section, click the Facebook Group link.
**Expected Result:** The link navigates to the guild's Facebook Group (distinct from the Facebook Page).

### TC-LAND-07 — "Join the Conversation" Instagram link
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. In the "Join the Conversation" section, click the Instagram link.
**Expected Result:** The link navigates to the guild's Instagram profile.

### TC-LAND-08 — "Join the Conversation" Meetup link
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. In the "Join the Conversation" section, click the Meetup link.
**Expected Result:** The link navigates to the guild's Meetup page.

## Site-wide Footer

### TC-FOOT-01 — Copyright notice displays
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Load the landing page.
2. Scroll to the footer.
**Expected Result:** A copyright notice is shown on the left side of the footer.

### TC-FOOT-02 — Admin link navigates to admin page
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Scroll to the footer on any page.
2. Click the "Admin" link.
**Expected Result:** The browser navigates to `/admin/`.

### TC-FOOT-03 — Starter Culture Studio logo links out correctly
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Scroll to the footer.
2. Click the Starter Culture Studio logo on the right side of the footer.
**Expected Result:** The link navigates to `starterculturestudio.com`.

### TC-FOOT-04 — Footer appears consistently across pages
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Load the landing page, the `/recipes/` page, and the `/admin/` page.
2. Compare the footer content on each.
**Expected Result:** The same footer (copyright + Admin link on left, Starter Culture Studio logo on right) appears on all three pages, since they share `Layout.astro`.

## Deployment & Release Trigger

### TC-DEPLOY-01 — Push to main does not trigger a deploy
**Requirement(s):** #2
**Preconditions:** Have push access to `main`; access to the Actions tab.
**Steps:**
1. Push a commit directly to `main` (or merge a PR into `main`).
2. Open the GitHub Actions tab for the repo.
**Expected Result:** No new deploy workflow run is started as a result of the push to `main`.

### TC-DEPLOY-02 — Pushing a v*.*.* tag triggers the deploy workflow
**Requirement(s):** #2
**Preconditions:** Have push access; admin role needed to create the tag (per ruleset in #4).
**Steps:**
1. Run `git tag vX.Y.Z && git push origin vX.Y.Z` on a valid commit.
2. Open the GitHub Actions tab.
**Expected Result:** A new workflow run starts, builds with `withastro/action`, and deploys to GitHub Pages.

### TC-DEPLOY-03 — Manual workflow_dispatch triggers a deploy
**Requirement(s):** #2
**Preconditions:** Have permission to run workflows manually.
**Steps:**
1. Go to the Actions tab, select the deploy workflow.
2. Click "Run workflow" and confirm.
**Expected Result:** The workflow runs and deploys the site, independent of any tag push.

## Custom Domain

### TC-DOM-01 — Root domain resolves to the site
**Requirement(s):** #3
**Preconditions:** DNS has propagated.
**Steps:**
1. Navigate to `https://heartlandfermentersguild.org` in a browser.
**Expected Result:** The landing page loads successfully over HTTPS.

### TC-DOM-02 — www subdomain resolves to the site
**Requirement(s):** #3
**Preconditions:** DNS has propagated.
**Steps:**
1. Navigate to `https://www.heartlandfermentersguild.org` in a browser.
**Expected Result:** The site loads (directly or via redirect to the root domain).

## Repository Access Control

### TC-REPO-01 — Repository is publicly visible
**Requirement(s):** #4
**Preconditions:** A logged-out browser session or incognito window.
**Steps:**
1. Navigate to the repo's GitHub URL without being logged in.
**Expected Result:** The repository contents are visible without authentication.

### TC-REPO-02 — Only one collaborator is listed
**Requirement(s):** #4
**Preconditions:** Admin access to repo settings.
**Steps:**
1. Go to Settings > Collaborators and teams.
**Expected Result:** BubbaF377 is the only listed collaborator.

### TC-REPO-03 — Force-push to main is blocked
**Requirement(s):** #4
**Preconditions:** Local clone with push access; a rewritten local history on `main`.
**Steps:**
1. Attempt `git push --force origin main`.
**Expected Result:** The push is rejected by branch protection.

### TC-REPO-04 — Deleting main is blocked
**Requirement(s):** #4
**Preconditions:** Push access.
**Steps:**
1. Attempt to delete the `main` branch via CLI or GitHub UI.
**Expected Result:** The deletion is rejected.

### TC-REPO-05 — PR merge blocked while conversations are unresolved
**Requirement(s):** #4
**Preconditions:** An open PR against `main` with at least one unresolved review comment.
**Steps:**
1. Attempt to merge the PR while a conversation thread is unresolved.
**Expected Result:** The merge button is disabled/blocked until all conversations are marked resolved.

### TC-REPO-06 — Non-admin blocked from creating a v* tag
**Requirement(s):** #4
**Preconditions:** A repo contributor without the admin role.
**Steps:**
1. As that non-admin user, attempt `git push origin vX.Y.Z` for a new tag matching `v*`.
**Expected Result:** The push is rejected by the repository ruleset.

## Admin Login

### TC-ADMIN-01 — Correct shared password logs in
**Requirement(s):** #8
**Preconditions:** Know the current shared admin password.
**Steps:**
1. Navigate to `/admin/`.
2. Enter the correct password and submit.
**Expected Result:** Login succeeds and the recipe creation form becomes accessible.

### TC-ADMIN-02 — Incorrect password is rejected
**Requirement(s):** #8
**Preconditions:** None.
**Steps:**
1. Navigate to `/admin/`.
2. Enter an incorrect password and submit.
**Expected Result:** Login fails with an error message; the recipe form is not shown.

### TC-ADMIN-03 — Recipe form is inaccessible without login
**Requirement(s):** #8
**Preconditions:** Not logged in (fresh session).
**Steps:**
1. Navigate directly to `/admin/` without entering a password.
**Expected Result:** The recipe creation form is not displayed/usable; a login prompt is shown instead.

## Recipes List Page

### TC-REC-01 — New recipe appears without a rebuild
**Requirement(s):** #7
**Preconditions:** Admin logged in; ability to add a recipe.
**Steps:**
1. Note the current recipes shown on `/recipes/`.
2. Add a new recipe via the admin form.
3. Reload `/recipes/` (same deployed build, no new deploy triggered).
**Expected Result:** The newly added recipe appears in the list immediately, without needing a new site deploy.

### TC-REC-02 — Recipe card links to detail page via slug query string
**Requirement(s):** #7
**Preconditions:** At least one recipe exists.
**Steps:**
1. On `/recipes/`, click a recipe card/link.
**Expected Result:** The browser navigates to `/recipes/view?slug=<that-recipe's-slug>` and shows the correct recipe.

## Recipe Detail Page

### TC-REC-03 — Detail page loads the recipe matching the slug
**Requirement(s):** #7
**Preconditions:** A known recipe slug.
**Steps:**
1. Navigate to `/recipes/view?slug=<known-slug>` directly.
**Expected Result:** The page displays that recipe's data (not a different recipe).

### TC-REC-04 — Recipe with a photo displays it
**Requirement(s):** #9, #11
**Preconditions:** A recipe exists with a photo uploaded.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** The photo is displayed, loaded from the derived public Storage URL.

### TC-REC-05 — Recipe without a photo shows no photo
**Requirement(s):** #9, #11
**Preconditions:** A recipe exists with no photo uploaded.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** No broken image or placeholder photo is shown; the photo area is simply absent.

### TC-REC-06 — Recipe with a `youtube.com/watch?v=` video embeds correctly
**Requirement(s):** #11
**Preconditions:** A recipe exists with `video_url` set to a `youtube.com/watch?v=...` link.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** A working YouTube embed is shown using the extracted video ID.

### TC-REC-07 — Recipe with a `youtu.be/` video embeds correctly
**Requirement(s):** #11
**Preconditions:** A recipe exists with `video_url` set to a `youtu.be/...` link.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** A working YouTube embed is shown using the extracted video ID.

### TC-REC-08 — Recipe without a video shows no video section
**Requirement(s):** #9, #11
**Preconditions:** A recipe exists with no `video_url`.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** No video embed or empty embed placeholder is shown.

### TC-REC-09 — Recipe with both photo and video shows both
**Requirement(s):** #9, #11
**Preconditions:** A recipe exists with both a photo and a video URL set.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** Both the photo and the video embed are displayed independently.

### TC-REC-10 — Time stages render as labeled chips
**Requirement(s):** #10
**Preconditions:** A recipe exists with `time_stages` containing `Prep: 20 min`.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** A chip labeled "Active Prep" reading "20 min" is displayed (per the doc's stated parsing example).

### TC-REC-11 — Recipe with no time stages shows no chips
**Requirement(s):** #10
**Preconditions:** A recipe exists with an empty `time_stages` field.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** No time-stage chips are shown.

### TC-REC-12 — Ingredients render as a list from newline text
**Requirement(s):** #9
**Preconditions:** A recipe exists with multi-line ingredients text.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** Each line of the stored ingredients text appears as a separate list item.

### TC-REC-13 — Instructions render as a list from newline text
**Requirement(s):** #9
**Preconditions:** A recipe exists with multi-line instructions text.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** Each line of the stored instructions text appears as a separate step/list item.

### TC-REC-14 — Yield/servings line displays when present
**Requirement(s):** #9
**Preconditions:** A recipe exists with a yield/servings value set.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** The yield/servings text is displayed on the page.

### TC-REC-15 — Notes/tips display when present
**Requirement(s):** #9
**Preconditions:** A recipe exists with a notes/tips value set.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** The notes/tips content is displayed.

### TC-REC-16 — Submitted-by name displays when present
**Requirement(s):** #9
**Preconditions:** A recipe exists with a submitted-by name set.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** The submitted-by name is displayed on the page.

## Admin Recipe Creation Form

### TC-ADMIN-04 — Creating a recipe with all required fields succeeds
**Requirement(s):** #8, #9
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Fill in title, category, summary, ingredients, and instructions.
2. Submit the form.
**Expected Result:** The recipe saves successfully and becomes visible on `/recipes/`.

### TC-ADMIN-05 — Category dropdown shows the fixed list
**Requirement(s):** #9
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Open the category dropdown/select on the recipe form.
**Expected Result:** Exactly these options are present: Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, Other.

### TC-ADMIN-06 — Selecting a category auto-populates suggested stages when empty
**Requirement(s):** #10, #12
**Preconditions:** Logged into `/admin/`; time-stages section is empty.
**Steps:**
1. Select "Bread & Sourdough" as the category.
2. Observe the time-stages section.
**Expected Result:** Rows for Prep, Rise, and Bake are auto-populated.

### TC-ADMIN-07 — Changing category does not overwrite already-edited stages
**Requirement(s):** #10, #12
**Preconditions:** Logged into `/admin/`; time-stages section already has manually entered/edited rows.
**Steps:**
1. Manually edit or add a stage row.
2. Change the category selection to a different category.
**Expected Result:** The existing stage rows remain unchanged; no auto-population overwrites them.

### TC-ADMIN-08 — "Other" category populates no suggested stages
**Requirement(s):** #10, #12
**Preconditions:** Logged into `/admin/`; time-stages section is empty.
**Steps:**
1. Select "Other" as the category.
2. Observe the time-stages section.
**Expected Result:** No stage rows are auto-added.

### TC-ADMIN-09 — Add a new blank time-stage row
**Requirement(s):** #12
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Click the "add row" control in the time-stages section.
**Expected Result:** A new blank label/duration row appears, editable and removable.

### TC-ADMIN-10 — Remove a time-stage row
**Requirement(s):** #12
**Preconditions:** Logged into `/admin/`; at least one stage row exists.
**Steps:**
1. Click the remove control on an existing stage row.
**Expected Result:** That row is removed from the section; other rows remain intact.

### TC-ADMIN-11 — Edit a stage row's label and duration
**Requirement(s):** #12
**Preconditions:** Logged into `/admin/`; at least one stage row exists.
**Steps:**
1. Change the label text and duration text in an existing row.
**Expected Result:** The row reflects the edited values.

### TC-ADMIN-12 — Stage rows collapse into newline-separated value on submit
**Requirement(s):** #10, #12
**Preconditions:** Logged into `/admin/`; time-stages section has rows: "Prep"/"20 min", "Rise"/"4 hr".
**Steps:**
1. Fill remaining required fields and submit the form.
2. View the resulting recipe's detail page.
**Expected Result:** Chips render for both "Active Prep: 20 min" and the Rise stage, matching the entered rows in the order left by the submitter.

### TC-ADMIN-13 — Photo upload succeeds and recipe saves with photo
**Requirement(s):** #11, #12
**Preconditions:** Logged into `/admin/`; a valid image file available.
**Steps:**
1. Fill required fields, attach a photo file.
2. Submit the form.
**Expected Result:** The photo uploads, the recipe saves, and the photo displays on the recipe's detail page.

### TC-ADMIN-14 — Failed photo upload blocks the save
**Requirement(s):** #12
**Preconditions:** Logged into `/admin/`; a condition that causes upload failure (e.g. simulate network failure or invalid file).
**Steps:**
1. Fill required fields, attach a photo that triggers an upload failure.
2. Submit the form.
**Expected Result:** The form shows an error and the recipe is not saved (no row appears on `/recipes/`).

### TC-ADMIN-15 — Video URL field shows placeholder and accepts a pasted link
**Requirement(s):** #11, #12
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Inspect the empty video URL input for placeholder text.
2. Paste a valid YouTube URL and submit the form with other required fields filled.
**Expected Result:** Placeholder text shows the expected format; after submit, the recipe saves and the video embeds correctly on its detail page.

### TC-ADMIN-16 — Yield/servings field can be left blank
**Requirement(s):** #9, #12
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Fill required fields, leave yield/servings blank.
2. Submit the form.
**Expected Result:** The recipe saves successfully; no yield/servings line appears on the detail page.

### TC-ADMIN-17 — Notes/tips field can be left blank
**Requirement(s):** #9, #12
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Fill required fields, leave notes/tips blank.
2. Submit the form.
**Expected Result:** The recipe saves successfully; no notes/tips section appears on the detail page.

### TC-ADMIN-18 — Submitted-by field can be left blank
**Requirement(s):** #9, #12
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Fill required fields, leave submitted-by blank.
2. Submit the form.
**Expected Result:** The recipe saves successfully; no submitted-by name appears on the detail page.

### TC-ADMIN-19 — Ingredients and instructions accept plain multi-line text
**Requirement(s):** #9
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Enter several lines of plain text (one item per line) into the ingredients and instructions fields.
2. Submit the form.
**Expected Result:** The recipe saves; the detail page correctly splits each field into one item per line, in the order entered.

## Out of scope

- **Members-only auth section** — auth approach and hosting are explicitly undecided open questions; nothing is built yet.
- **Related recipes strip on the detail page** — explicitly deferred with no ETA (Requirement #13).
- **Category filter pills on the recipe list page** — explicitly deferred with no ETA (Requirement #13).
- **Editing or deleting an existing recipe (including Storage cleanup on delete)** — explicitly deferred; no RLS policies or UI exist yet.
- **About/Events info pages** — content not yet drafted, pages not yet built.
- **Row Level Security policy enforcement on `recipes` table/`recipe-photos` bucket** — architectural/backend guarantee (Postgres RLS, Storage policies), not something to click through in the UI; belongs to automated/policy-level testing.
- **Server-side (vs. client-side) password comparison for admin login** — architectural implementation detail; observable login success/failure is covered in TC-ADMIN-01/02, but the "never client-side-only" guarantee itself isn't independently clickable.
- **Astro static-output architecture and incremental server-rendering readiness (Requirement #1)** — purely a build/tooling choice with no distinct manual UI behavior to verify.
- **Porkbun/Cloudflare DNS-resolution backend note (Requirement #3)** — internal DNS infrastructure detail with no user-facing behavior difference to test.
