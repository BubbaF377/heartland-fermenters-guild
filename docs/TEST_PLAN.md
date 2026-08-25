<!-- devlore:test-plan source-hash:980aed6e57a22c09431b1187fc6942e3ee95d23d1a284da6d7a1771e592cd3d0 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this test plan automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's tested, update `docs/PRODUCT.md` itself.
<!-- devlore:test-plan requirement-hashes
1=8c6a5f4fb077
2=74ba323e0a07
3=c1a27b1ede7c
4=d62dbc43a89f
5=db8dcdbbefec
6=dbcec06c817c
7=c5fb0daa7d8a
8=6cf7ff87fbd8
9=13d25ef62915
10=b54a7bf62738
11=3309ad72e833
12=e54aaeada7dc
13=2255b0761d84
14=4a26a4be6d0f
15=9c1694d7b565
16=60f784e9c539
-->

## Landing Page

### TC-LAND-01 — Header banner image displays
**Requirement(s):** #5
**Preconditions:** Landing page URL is reachable in a browser.
**Steps:**
1. Navigate to the landing page.
2. Observe the top of the page.
**Expected Result:** A header banner image is displayed at the top of the page, above the welcome paragraph.

### TC-LAND-02 — Welcome paragraph explains the guild
**Requirement(s):** #5
**Preconditions:** Landing page URL is reachable in a browser.
**Steps:**
1. Navigate to the landing page.
2. Read the short paragraph below the banner.
**Expected Result:** A short welcome paragraph is present explaining what the Heartland Fermenters Guild is and who it's for.

### TC-LAND-03 — Join the Conversation links point to correct destinations
**Requirement(s):** #5
**Preconditions:** Landing page URL is reachable in a browser.
**Steps:**
1. Navigate to the landing page and locate the "Join the Conversation" section.
2. Click/inspect the email link.
3. Click/inspect the Facebook Page link.
4. Click/inspect the Facebook Group link.
5. Click/inspect the Instagram link.
6. Click/inspect the Meetup link.
**Expected Result:** Each link is present and opens the correct corresponding destination (mailto for email, the guild's Facebook Page, Facebook Group, Instagram profile, and Meetup group respectively).

### TC-LAND-04 — Crest logo is not present between banner and title
**Requirement(s):** #5
**Preconditions:** Landing page URL is reachable in a browser.
**Steps:**
1. Navigate to the landing page.
2. Inspect the area between the header banner image and the page title.
**Expected Result:** No circular crest logo is displayed there (it was removed from the layout).

## Footer

### TC-FOOT-01 — Footer left side shows copyright and Admin link
**Requirement(s):** #5
**Preconditions:** Any page using the shared Layout (landing page, recipes list, admin) is loaded.
**Steps:**
1. Scroll to the footer on the landing page.
2. Observe the left side of the footer.
3. Click the Admin link.
**Expected Result:** A copyright notice and an "Admin" link are shown on the left; clicking Admin navigates to `/admin/`.

### TC-FOOT-02 — Footer right side shows donation credit with only the logo linking out
**Requirement(s):** #5
**Preconditions:** Any page using the shared Layout is loaded.
**Steps:**
1. Scroll to the footer.
2. Observe the right side: "Website development donated by" text next to the Starter Culture Studio logo.
3. Click the plain text credit.
4. Click the logo.
**Expected Result:** The text "Website development donated by" is plain, non-clickable text; only the logo is a link, and it opens `starterculturestudio.com`.

### TC-FOOT-03 — Footer stays pinned to bottom on sparse pages
**Requirement(s):** #5
**Preconditions:** A page with little content is available (e.g. the recipe list with zero recipes, or a narrow browser viewport with a short page).
**Steps:**
1. Navigate to a page with minimal content (e.g. an empty recipe list).
2. Observe the vertical position of the footer.
**Expected Result:** The footer remains pinned to the bottom of the viewport rather than floating up directly under the sparse content.

## Custom Domain

### TC-DOM-01 — Site loads at the apex custom domain
**Requirement(s):** #3
**Preconditions:** DNS has propagated for `heartlandfermentersguild.org`.
**Steps:**
1. Navigate a browser to `https://heartlandfermentersguild.org`.
**Expected Result:** The landing page loads successfully over HTTPS at the apex domain.

### TC-DOM-02 — Site loads at the www subdomain
**Requirement(s):** #3
**Preconditions:** DNS has propagated for `www.heartlandfermentersguild.org`.
**Steps:**
1. Navigate a browser to `https://www.heartlandfermentersguild.org`.
**Expected Result:** The site loads successfully (via the `www` CNAME to GitHub Pages).

*Note: Porkbun/Cloudflare DNS-resolution backend and nameserver control (#3) are infrastructure configuration with no click-through UI beyond the domain resolving correctly, as verified above.*

## Deployment & CI Workflows

### TC-DEPLOY-01 — Pushing to main alone does not deploy
**Requirement(s):** #2
**Preconditions:** Repo access with permission to push to `main`; GitHub Actions tab visible.
**Steps:**
1. Push a commit directly to `main` (or merge a PR into `main`).
2. Open the Actions tab and look for a `deploy.yml` run.
**Expected Result:** No `deploy.yml` run is triggered by the push to `main`.

### TC-DEPLOY-02 — Pushing a v*.*.* tag triggers build and deploy
**Requirement(s):** #2
**Preconditions:** Repo access with permission to create release tags.
**Steps:**
1. Run `git tag vX.Y.Z && git push origin vX.Y.Z`.
2. Open the Actions tab and locate the triggered `deploy.yml` run.
3. Wait for the run to complete and reload the live site.
**Expected Result:** The tag push triggers `deploy.yml`, the workflow completes successfully, and the live site reflects the latest build.

### TC-DEPLOY-03 — Manual workflow_dispatch triggers deploy
**Requirement(s):** #2
**Preconditions:** Repo access with permission to run workflows manually.
**Steps:**
1. Open the Actions tab, select the deploy workflow.
2. Click "Run workflow" (workflow_dispatch).
**Expected Result:** The deploy workflow runs and completes successfully without a tag push.

### TC-CI-01 — Opening a PR triggers the test workflow
**Requirement(s):** #15
**Preconditions:** Repo access with permission to open a PR.
**Steps:**
1. Open a pull request against `main`.
2. Open the Actions tab and locate the `test.yml` run for the PR.
**Expected Result:** `test.yml` (Vitest + Playwright) runs automatically on the PR.

### TC-CI-02 — Push to main triggers the test workflow, not deploy
**Requirement(s):** #15
**Preconditions:** Repo access with permission to push to `main`.
**Steps:**
1. Push/merge a commit into `main`.
2. Open the Actions tab.
**Expected Result:** `test.yml` runs on the push; no `deploy.yml` run is triggered (deploy remains tag-only).

## Repository Access Controls

### TC-REPO-01 — Force-push to main is rejected
**Requirement(s):** #4
**Preconditions:** Local clone of the repo with push access to `main`.
**Steps:**
1. Attempt `git push --force origin main` after rewriting local history.
**Expected Result:** The push is rejected by branch protection.

### TC-REPO-02 — Deletion of main branch is rejected
**Requirement(s):** #4
**Preconditions:** Local clone of the repo with push access.
**Steps:**
1. Attempt to delete the `main` branch (`git push origin --delete main`).
**Expected Result:** The deletion is rejected by branch protection.

### TC-REPO-03 — PR cannot merge with unresolved conversations
**Requirement(s):** #4
**Preconditions:** An open PR with at least one unresolved review comment thread.
**Steps:**
1. Attempt to merge the PR while a conversation is unresolved.
**Expected Result:** The merge button is blocked until all conversations are marked resolved.

### TC-REPO-04 — Non-admin cannot create a v* release tag
**Requirement(s):** #4
**Preconditions:** A collaborator account without the admin role on the repo.
**Steps:**
1. As the non-admin account, attempt to push a new `v*.*.*` tag.
**Expected Result:** The repository ruleset blocks the tag creation for the non-admin account.

## Recipe List Page

### TC-RECLIST-01 — Published recipes load live from Supabase
**Requirement(s):** #7
**Preconditions:** At least one recipe with `status = published` exists in Supabase.
**Steps:**
1. Navigate to `/recipes/`.
**Expected Result:** The published recipe(s) load and display without requiring a site rebuild.

### TC-RECLIST-02 — Newly added recipe appears without a rebuild
**Requirement(s):** #7
**Preconditions:** Admin access to add a recipe.
**Steps:**
1. Add a new recipe via the admin form.
2. Navigate (or refresh) to `/recipes/` without triggering a deploy.
**Expected Result:** The newly added recipe appears in the list immediately.

### TC-RECLIST-03 — Pending/deactivated recipes are excluded from the public list
**Requirement(s):** #16
**Preconditions:** At least one recipe exists with `status = pending` and one with `status = deactivated`.
**Steps:**
1. Navigate to `/recipes/` as a public (logged-out) visitor.
**Expected Result:** Neither the pending nor the deactivated recipe appears in the list; only `published` recipes are shown.

## Recipe Detail Page

### TC-RECVIEW-01 — Recipe detail page loads via slug query string
**Requirement(s):** #7
**Preconditions:** A published recipe with a known slug exists.
**Steps:**
1. Navigate to `/recipes/view?slug=<known-slug>`.
**Expected Result:** The correct recipe's detail page renders.

### TC-RECVIEW-02 — Recipe with neither photo nor video renders cleanly
**Requirement(s):** #9, #11
**Preconditions:** A published recipe exists with no photo and no video URL.
**Steps:**
1. Navigate to that recipe's detail page.
**Expected Result:** No photo or video section is rendered; the rest of the recipe (title, category, summary, etc.) displays normally.

### TC-RECVIEW-03 — Recipe with photo only renders photo, no video
**Requirement(s):** #11
**Preconditions:** A published recipe exists with a photo but no video URL.
**Steps:**
1. Navigate to that recipe's detail page.
**Expected Result:** The photo displays; no video embed is present.

### TC-RECVIEW-04 — Recipe with video only renders embed, no photo
**Requirement(s):** #11
**Preconditions:** A published recipe exists with a `youtube.com/watch?v=...` or `youtu.be/...` URL but no photo.
**Steps:**
1. Navigate to that recipe's detail page.
**Expected Result:** A YouTube embed renders using the video ID extracted from the URL; no photo is present.

### TC-RECVIEW-05 — Recipe with both photo and video renders both
**Requirement(s):** #11
**Preconditions:** A published recipe exists with both a photo and a video URL.
**Steps:**
1. Navigate to that recipe's detail page.
**Expected Result:** Both the photo and the video embed render on the page.

### TC-RECVIEW-06 — Time stages render as individual chips
**Requirement(s):** #10
**Preconditions:** A published recipe exists with `time_stages` containing lines such as `Prep: 20 min` and `Ferment: 3 days`.
**Steps:**
1. Navigate to that recipe's detail page.
2. Observe the time-stage metadata chips.
**Expected Result:** Each line becomes its own chip (e.g. "Prep: 20 min" renders as a chip labeled "Active Prep" reading "20 min"), in the stored order.

### TC-RECVIEW-07 — Ingredients and instructions render as line items
**Requirement(s):** #9
**Preconditions:** A published recipe exists with multi-line ingredients and instructions text.
**Steps:**
1. Navigate to that recipe's detail page.
2. Observe the ingredients and instructions sections.
**Expected Result:** Each newline-separated entry displays as its own list item/step.

### TC-RECVIEW-08 — Optional notes and submitted-by name show only when present
**Requirement(s):** #9
**Preconditions:** One published recipe with notes and a submitted-by name; one published recipe with both left blank.
**Steps:**
1. Navigate to the recipe with notes/submitted-by filled in.
2. Navigate to the recipe with both left blank.
**Expected Result:** Notes/tips and submitted-by name display when present, and are simply absent (no empty placeholder) when not provided.

### TC-RECVIEW-09 — Pending/deactivated recipe detail page 404s for the public
**Requirement(s):** #16
**Preconditions:** A recipe exists with `status = pending` (or `deactivated`) and a known slug.
**Steps:**
1. As a logged-out visitor, navigate to `/recipes/view?slug=<that-slug>`.
**Expected Result:** The page shows a 404/not-found state rather than the recipe content.

## Admin Login

### TC-ADMLOG-01 — Correct shared password logs in
**Requirement(s):** #8
**Preconditions:** Know the current admin password.
**Steps:**
1. Navigate to `/admin/`.
2. Enter the correct password and submit.
**Expected Result:** Login succeeds and the admin dashboard (recipe list, add form, etc.) is shown.

### TC-ADMLOG-02 — Incorrect password is rejected
**Requirement(s):** #8
**Preconditions:** None (logged out).
**Steps:**
1. Navigate to `/admin/`.
2. Enter an incorrect password and submit.
**Expected Result:** Login fails with an error message; no admin access is granted.

*Note: the server-side (vs. client-side-only) nature of the password check (#8) is an architectural guarantee with no separate manual UI step beyond the pass/fail behavior above.*

## Admin Recipe Form — Add

### TC-ADMFORM-01 — All base and new fields are present
**Requirement(s):** #9, #12
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Open the "add recipe" form.
2. Inspect the available fields.
**Expected Result:** Title, category, summary, ingredients, instructions, submitted-by, photo upload, video URL, yield/servings, notes/tips, and the time-stages section are all present.

### TC-ADMFORM-02 — Category dropdown contains the fixed list
**Requirement(s):** #9
**Preconditions:** Logged into `/admin/`, add form open.
**Steps:**
1. Open the category dropdown.
**Expected Result:** Exactly these options appear: Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, Other.

### TC-ADMFORM-03 — Yield/servings field is optional freeform text
**Requirement(s):** #9, #12
**Preconditions:** Logged into `/admin/`, add form open.
**Steps:**
1. Fill out all required fields, leave yield/servings blank, and submit.
**Expected Result:** The recipe saves successfully with no yield/servings value.

### TC-ADMFORM-04 — Notes/tips field is optional
**Requirement(s):** #9, #12
**Preconditions:** Logged into `/admin/`, add form open.
**Steps:**
1. Fill out all required fields, leave notes/tips blank, and submit.
**Expected Result:** The recipe saves successfully with no notes/tips value.

### TC-ADMFORM-05 — Video URL input accepts both supported YouTube formats
**Requirement(s):** #11, #12
**Preconditions:** Logged into `/admin/`, add form open.
**Steps:**
1. Observe the placeholder text in the video URL field.
2. Enter a `youtube.com/watch?v=...` URL and submit.
3. Repeat with a `youtu.be/...` URL on a new recipe.
**Expected Result:** Placeholder text shows the expected format; both URL styles are accepted and saved, and each recipe's detail page embeds the video correctly.

### TC-ADMFORM-06 — Submitting a valid new recipe saves and is retrievable
**Requirement(s):** #7, #9, #12
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Fill in all required fields with valid data and submit.
2. Navigate to `/recipes/` and then to the new recipe's detail page.
**Expected Result:** The recipe appears in the list and its detail page shows the submitted data.

## Time Stages Editor

### TC-TSTAGE-01 — Selecting a category auto-populates suggested stages
**Requirement(s):** #10, #12
**Preconditions:** Logged into `/admin/`, add form open with an empty time-stages section.
**Steps:**
1. Select "Bread & Sourdough" as the category.
2. Observe the time-stages section.
**Expected Result:** Rows for Prep, Rise, and Bake are auto-populated (matching the mapping for each category, e.g. Beer → Prep/Ferment/Condition-Carbonate, Cheese → Prep/Culture/Age, etc.).

### TC-TSTAGE-02 — "Other" category adds no suggested stages
**Requirement(s):** #10, #12
**Preconditions:** Logged into `/admin/`, add form open with an empty time-stages section.
**Steps:**
1. Select "Other" as the category.
2. Observe the time-stages section.
**Expected Result:** No rows are auto-added; the section remains empty until the submitter adds rows manually.

### TC-TSTAGE-03 — Switching category after editing stages does not overwrite them
**Requirement(s):** #10, #12
**Preconditions:** Logged into `/admin/`, add form open.
**Steps:**
1. Select "Beer" (auto-populates Prep/Ferment/Condition-Carbonate).
2. Edit one row's label/duration.
3. Switch category to "Wine".
**Expected Result:** The manually edited stages remain unchanged; the Wine suggestions are not applied since the section was no longer empty.

### TC-TSTAGE-04 — Add-row control adds a new blank row
**Requirement(s):** #12
**Preconditions:** Logged into `/admin/`, add form open.
**Steps:**
1. Click the "add row" control in the time-stages section.
**Expected Result:** A new blank label/duration row appears.

### TC-TSTAGE-05 — Remove control deletes the targeted row
**Requirement(s):** #12
**Preconditions:** Logged into `/admin/`, add form open with two or more stage rows present.
**Steps:**
1. Click the remove control on one specific row.
**Expected Result:** Only that row is removed; the others remain intact.

### TC-TSTAGE-06 — Submitted stages persist in the order and labels left by the submitter
**Requirement(s):** #10, #12
**Preconditions:** Logged into `/admin/`, add form open.
**Steps:**
1. Auto-populate stages for "Cheese", then reorder/relabel/remove rows freely (e.g. rename "Culture" to "Curdle", add a custom "Wax" row).
2. Submit the recipe.
3. Open the recipe's detail page.
**Expected Result:** The chips shown match exactly the final labels/order the submitter left, not the original suggestions.

## Recipe Photo Upload

### TC-PHOTO-01 — Uploaded photo displays via derived public URL
**Requirement(s):** #11, #12
**Preconditions:** Logged into `/admin/`, add form open.
**Steps:**
1. Fill required fields and attach a valid image file.
2. Submit the form.
3. Open the new recipe's detail page.
**Expected Result:** The photo displays correctly on the detail page.

### TC-PHOTO-02 — Recipe can be saved with no photo
**Requirement(s):** #9, #11
**Preconditions:** Logged into `/admin/`, add form open.
**Steps:**
1. Fill required fields, leave the photo input empty, and submit.
**Expected Result:** The recipe saves successfully with no photo shown on its detail page.

### TC-PHOTO-03 — Failed photo upload blocks the save
**Requirement(s):** #12
**Preconditions:** Logged into `/admin/`, add form open; ability to simulate an upload failure (e.g. network blocked to Storage, or an oversized/invalid file if the environment rejects it).
**Steps:**
1. Fill required fields and attach a photo under conditions that cause the upload to fail.
2. Submit the form.
**Expected Result:** An error is shown, and no recipe row is created (the recipe is not saved with a broken photo reference).

### TC-PHOTO-04 — Recipe photo is publicly viewable while logged out
**Requirement(s):** #11
**Preconditions:** A published recipe with a photo exists.
**Steps:**
1. Log out of `/admin/` (or use a private browser window).
2. Navigate to that recipe's detail page.
**Expected Result:** The photo displays without requiring any login.

## Admin Recipe List, Edit & Delete

### TC-ADMLIST-01 — Admin recipe list shows title, category, thumbnail, and date
**Requirement(s):** #14
**Preconditions:** Logged into `/admin/`; at least one recipe with a photo and one without exist.
**Steps:**
1. Open the admin recipe list.
**Expected Result:** Every recipe shows its title, category, a thumbnail if it has a photo (nothing/placeholder if not), and its date.

### TC-ADMLIST-02 — Edit reuses the add form, pre-filled
**Requirement(s):** #14
**Preconditions:** Logged into `/admin/`; at least one existing recipe.
**Steps:**
1. Click "Edit" on an existing recipe.
**Expected Result:** The same form used for adding recipes opens in an "edit" mode, pre-filled with that recipe's current data (including time stages).

### TC-ADMLIST-03 — Editing a recipe never changes its slug
**Requirement(s):** #14
**Preconditions:** Logged into `/admin/`; an existing recipe with a known slug and shared `/recipes/view?slug=...` link.
**Steps:**
1. Edit the recipe, change its title, and save.
2. Revisit the original `/recipes/view?slug=...` link.
**Expected Result:** The original link still resolves to the (now-updated) recipe; the slug is unchanged.

### TC-ADMLIST-04 — Delete requires confirmation
**Requirement(s):** #14
**Preconditions:** Logged into `/admin/`; at least one existing recipe.
**Steps:**
1. Click "Delete" on a recipe.
**Expected Result:** A confirmation prompt appears before anything is removed; dismissing it leaves the recipe intact.

### TC-ADMLIST-05 — Confirmed delete removes the recipe everywhere
**Requirement(s):** #14
**Preconditions:** Logged into `/admin/`; a recipe (with a photo) exists and its slug is known.
**Steps:**
1. Click "Delete" on the recipe and confirm.
2. Navigate to `/recipes/` and to `/recipes/view?slug=<its-slug>`.
**Expected Result:** The recipe no longer appears in the list, and its detail page 404s.

### TC-ADMLIST-06 — Deactivate/Reactivate toggles public visibility without deleting
**Requirement(s):** #16
**Preconditions:** Logged into `/admin/`; a published recipe exists.
**Steps:**
1. Click "Deactivate" on the recipe.
2. As a public visitor, check `/recipes/` and the recipe's detail page.
3. Return to admin and click "Reactivate".
4. Recheck the public list and detail page.
**Expected Result:** After deactivating, the recipe disappears from the public list and its detail page 404s, but it still exists in the admin list. After reactivating, it reappears publicly.

## Members Login & Submission

### TC-MEMBER-01 — Requesting a magic link shows a confirmation
**Requirement(s):** #16
**Preconditions:** An email address exists in the `active_members` roster.
**Steps:**
1. Navigate to `/submit/`.
2. Enter the roster email and request a login link.
**Expected Result:** The page confirms a login link has been sent, with no password prompt.

### TC-MEMBER-02 — Clicking the magic link logs the member in
**Requirement(s):** #16
**Preconditions:** A magic link email has been requested and received for a roster email.
**Steps:**
1. Open the received email and click the login link.
**Expected Result:** The browser is logged into `/submit/` as that member and the recipe submission form is shown.

### TC-MEMBER-03 — Non-roster email can authenticate but cannot submit
**Requirement(s):** #16
**Preconditions:** An email not present in `active_members`.
**Steps:**
1. Request and use a magic link for that email at `/submit/`.
2. Fill out and submit a recipe.
**Expected Result:** Login via magic link succeeds, but the submission is rejected (authorization fails at the database level) rather than being saved.

### TC-MEMBER-04 — Active member can submit a recipe
**Requirement(s):** #16
**Preconditions:** Logged into `/submit/` as an email present in `active_members`.
**Steps:**
1. Fill out the recipe submission form (same fields as the admin form) and submit.
**Expected Result:** The submission succeeds and confirms receipt to the member.

### TC-MEMBER-05 — Member-submitted recipe is pending, not public
**Requirement(s):** #16
**Preconditions:** A member has just submitted a recipe via TC-MEMBER-04.
**Steps:**
1. As a public visitor, navigate to `/recipes/`.
2. Attempt `/recipes/view?slug=<the-new-recipe-slug>`.
**Expected Result:** The recipe does not appear in the public list, and its detail page 404s (it is `pending`, not `published`).

### TC-MEMBER-06 — Deactivated member cannot submit
**Requirement(s):** #16
**Preconditions:** A member's roster entry has been deactivated by admin.
**Steps:**
1. Log that member into `/submit/` via magic link.
2. Attempt to submit a recipe.
**Expected Result:** The submission is rejected.

### TC-MEMBER-07 — Slug collision against pending/deactivated recipe isn't caught
**Requirement(s):** #16
**Preconditions:** A pending or deactivated recipe exists with a given title/slug.
**Steps:**
1. Log in as an active member.
2. Submit a new recipe using the same title as the existing pending/deactivated recipe.
**Expected Result:** The submission fails with a generic error rather than resolving with an auto-suffixed slug (e.g. `-2`), since the member's session cannot see the colliding pending/deactivated row.

### TC-MEMBER-08 — Logged-in member cannot access admin actions
**Requirement(s):** #16
**Preconditions:** Logged into `/submit/` as an active member (not the admin account).
**Steps:**
1. Attempt to navigate to `/admin/` and perform an admin action (e.g. edit/delete another recipe) using the member's session.
**Expected Result:** Admin-only actions are refused; only the fixed `is_admin()` account can perform them, even though the member session is authenticated.

## Admin — Pending Recipes Queue

### TC-PEND-01 — Pending queue lists submitted recipes awaiting review
**Requirement(s):** #16
**Preconditions:** Logged into `/admin/`; at least one member-submitted recipe is pending.
**Steps:**
1. Open the Pending Recipes queue in admin.
**Expected Result:** The pending recipe(s) are listed with enough detail to review them.

### TC-PEND-02 — Approve publishes the recipe
**Requirement(s):** #16
**Preconditions:** Logged into `/admin/`; a pending recipe exists.
**Steps:**
1. Click "Approve" on the pending recipe.
2. Navigate to `/recipes/` as a public visitor.
**Expected Result:** The recipe's status becomes `published` and it now appears on the public recipe list and detail page.

### TC-PEND-03 — Reject hard-deletes the pending recipe
**Requirement(s):** #16
**Preconditions:** Logged into `/admin/`; a pending recipe (with a photo) exists.
**Steps:**
1. Click "Reject" on the pending recipe.
2. Check the pending queue and the admin recipe list afterward.
**Expected Result:** The recipe is permanently deleted (not just hidden) from both the queue and the recipe list, using the same best-effort photo cleanup as an ordinary delete.

## Admin — Members Management

### TC-MEMBERSADM-01 — Members list shows the full roster
**Requirement(s):** #16
**Preconditions:** Logged into `/admin/`; roster has active and deactivated entries.
**Steps:**
1. Open the Members section in admin.
**Expected Result:** All roster entries display with their current active/deactivated status.

### TC-MEMBERSADM-02 — Admin can add a new member by email
**Requirement(s):** #16
**Preconditions:** Logged into `/admin/`.
**Steps:**
1. Enter a new email address in the Members section and submit.
**Expected Result:** The email is added to `active_members` and appears in the list as active.

### TC-MEMBERSADM-03 — Admin can deactivate a member
**Requirement(s):** #16
**Preconditions:** Loggedinto `/admin/`; an active member exists.
**Steps:**
1. Click "Deactivate" on that member's row.
**Expected Result:** The member's status changes to deactivated in the list, and (per TC-MEMBER-06) they can no longer submit recipes.

### TC-MEMBERSADM-04 — Admin can reactivate a deactivated member
**Requirement(s):** #16
**Preconditions:** Logged into `/admin/`; a deactivated member exists.
**Steps:**
1. Click "Reactivate" on that member's row.
**Expected Result:** The member's status changes back to active in the list, and they can submit recipes again.

## Out of scope

- Requirement #16 launch decision (whether Members/`/submit/` ships at all) — explicitly open, not yet decided.
- Custom SMTP / branded magic-link email (subject, body, sender) — deferred, not implemented; currently sends from Supabase's generic shared address.
- Gating actual site content (not just recipe submission) behind members-only login — not built yet, only the auth mechanism exists.
- Related recipes strip on the recipe detail page (Requirement #13) — deferred, no ETA.
- Category filter pills on the recipe list page (Requirement #13) — deferred, no ETA.
- Orphaned Storage photo cleanup on photo replacement via edit — known gap, no cleanup job exists.
- About/history and Events info-site pages — content not yet drafted, not being worked on.
- Vitest unit tests for `src/lib/constants.js` and Playwright e2e suite against the built/previewed site — already covered by automated CI (`test.yml`), not manual QA territory.
- Supabase network-layer mocking strategy in Playwright — internal test-infrastructure detail, not user-facing behavior.
- Porkbun/Cloudflare DNS-resolution backend specifics (nameserver control, non-proxying A records) — architectural DNS configuration, not something to click through beyond domain resolution already covered in TC-DOM-01/02.
