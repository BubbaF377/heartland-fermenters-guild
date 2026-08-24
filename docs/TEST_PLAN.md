<!-- devlore:test-plan source-hash:b0a4293e3476ff1d2cd052d851cf191ff34e61ac08105d967f201fe544c46ffd -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this test plan automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's tested, update `docs/PRODUCT.md` itself.
<!-- devlore:test-plan requirement-hashes
1=8c6a5f4fb077
2=74ba323e0a07
3=c1a27b1ede7c
4=d62dbc43a89f
5=6294ef378458
6=dbcec06c817c
7=c5fb0daa7d8a
8=6cf7ff87fbd8
9=13d25ef62915
10=b54a7bf62738
11=3309ad72e833
12=e54aaeada7dc
13=2255b0761d84
14=4a26a4be6d0f
-->

## Landing Page

### TC-LAND-01 — Header banner image displays
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Open the site's root URL.
2. Look at the top of the page.
**Expected Result:** A header banner image is displayed at the top of the landing page.

### TC-LAND-02 — Welcome paragraph text present
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Open the landing page.
2. Locate the paragraph beneath the banner.
**Expected Result:** A short welcome paragraph explaining what the guild is and who it's for is displayed.

### TC-LAND-03 — Crest logo no longer present
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Open the landing page.
2. Inspect the area between the banner image and the page title.
**Expected Result:** No circular crest logo appears there (it was removed and should not reappear).

### TC-LAND-04 — "Join the Conversation" section present
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Open the landing page.
2. Scroll to the "Join the Conversation" section.
**Expected Result:** The section is present and lists links for email, Facebook Page, Facebook Group, Instagram, and Meetup.

### TC-LAND-05 — Email link
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. In "Join the Conversation", click the email link.
**Expected Result:** A mailto: link is triggered, addressed to the guild's email.

### TC-LAND-06 — Facebook Page link
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Click the Facebook Page link.
**Expected Result:** The guild's Facebook Page opens, at a URL distinct from the Facebook Group link.

### TC-LAND-07 — Facebook Group link
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Click the Facebook Group link.
**Expected Result:** The guild's Facebook Group opens, at a URL distinct from the Facebook Page link.

### TC-LAND-08 — Instagram link
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Click the Instagram link.
**Expected Result:** The guild's Instagram profile opens.

### TC-LAND-09 — Meetup link
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Click the Meetup link.
**Expected Result:** The guild's Meetup page opens.

## Footer

### TC-FOOT-01 — Copyright notice and Admin link on left
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Open the landing page and scroll to the footer.
2. Observe the left side of the footer.
**Expected Result:** A copyright notice and an "Admin" link are shown on the left.

### TC-FOOT-02 — Admin link navigates to /admin/
**Requirement(s):** #5, #8
**Preconditions:** None.
**Steps:**
1. Click the "Admin" link in the footer.
**Expected Result:** The browser navigates to `/admin/`.

### TC-FOOT-03 — Starter Culture Studio logo on right
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Observe the right side of the footer.
2. Click the logo shown there.
**Expected Result:** A Starter Culture Studio logo is displayed on the right; clicking it navigates to `starterculturestudio.com`.

### TC-FOOT-04 — Footer appears on all pages
**Requirement(s):** #5
**Preconditions:** None.
**Steps:**
1. Navigate to `/recipes/` and check the footer.
2. Navigate to `/admin/` and check the footer.
**Expected Result:** The same footer (copyright + Admin link left, Starter Culture Studio logo right) appears on both pages, matching the landing page footer.

## Custom Domain

### TC-DOM-01 — Apex domain loads the site
**Requirement(s):** #3
**Preconditions:** None.
**Steps:**
1. Navigate to `https://heartlandfermentersguild.org`.
**Expected Result:** The landing page loads successfully over HTTPS.

### TC-DOM-02 — www subdomain loads the site
**Requirement(s):** #3
**Preconditions:** None.
**Steps:**
1. Navigate to `https://www.heartlandfermentersguild.org`.
**Expected Result:** The same site loads successfully.

## Recipes List Page

### TC-REC-01 — Recipe list loads from Supabase
**Requirement(s):** #7
**Preconditions:** At least one recipe exists in the database.
**Steps:**
1. Navigate to `/recipes/`.
2. Observe the rendered list.
**Expected Result:** Recipes stored in Supabase are displayed (e.g., titles/categories visible).

### TC-REC-02 — Selecting a recipe opens its detail page
**Requirement(s):** #7
**Preconditions:** At least one recipe exists.
**Steps:**
1. On `/recipes/`, click a recipe entry.
**Expected Result:** The browser navigates to `/recipes/view?slug=<that recipe's slug>` and the matching recipe's detail loads.

### TC-REC-03 — Newly added recipe appears without a redeploy
**Requirement(s):** #7
**Preconditions:** Admin access.
**Steps:**
1. Add a new recipe via the admin form and save.
2. Reload `/recipes/` immediately, without any new site build/deploy.
**Expected Result:** The new recipe appears in the list right away.

## Recipe Detail Page

### TC-RVIEW-01 — Detail page loads via slug query string
**Requirement(s):** #7
**Preconditions:** A known recipe slug exists.
**Steps:**
1. Navigate to `/recipes/view?slug=<known-slug>`.
**Expected Result:** The detail page for that specific recipe loads and displays its content.

### TC-RVIEW-02 — Core fields render
**Requirement(s):** #9
**Preconditions:** A recipe with all fields populated (title, category, summary, yield, ingredients, instructions, notes, submitted-by).
**Steps:**
1. Open that recipe's detail page.
2. Check each field is displayed.
**Expected Result:** All populated fields are shown; ingredients and instructions render as separate items, one per line as entered.

### TC-RVIEW-03 — Optional fields absent when not entered
**Requirement(s):** #9
**Preconditions:** A recipe saved with notes and submitted-by left blank.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** No notes/tips section and no submitted-by credit are shown; other fields render normally.

### TC-RVIEW-04 — Photo displays when present
**Requirement(s):** #11
**Preconditions:** A recipe with an uploaded photo.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** The recipe photo is displayed.

### TC-RVIEW-05 — No photo shown when absent
**Requirement(s):** #9, #11
**Preconditions:** A recipe saved without a photo.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** No photo/placeholder is shown.

### TC-RVIEW-06 — Video embeds from a `watch?v=` URL
**Requirement(s):** #11
**Preconditions:** A recipe with `video_url` in `youtube.com/watch?v=...` format.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** A working embedded YouTube player is shown, correctly built from that URL.

### TC-RVIEW-07 — Video embeds from a `youtu.be` URL
**Requirement(s):** #11
**Preconditions:** A recipe with `video_url` in `youtu.be/...` format.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** A working embedded YouTube player is shown, correctly built from that URL.

### TC-RVIEW-08 — No video section when absent
**Requirement(s):** #9, #11
**Preconditions:** A recipe saved without a `video_url`.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** No video/embed section is shown.

### TC-RVIEW-09 — Time stages render as labeled chips
**Requirement(s):** #10
**Preconditions:** A recipe with `time_stages` containing a line "Prep: 20 min".
**Steps:**
1. Open that recipe's detail page.
2. Locate the time-stage chips.
**Expected Result:** A chip labeled "Active Prep" reading "20 min" is displayed, with one chip per stored line, in stored order.

### TC-RVIEW-10 — No chips when time_stages is empty
**Requirement(s):** #10
**Preconditions:** A recipe saved with `time_stages` left blank.
**Steps:**
1. Open that recipe's detail page.
**Expected Result:** No time-stage chip row is shown.

## Admin Login

### TC-ALOGIN-01 — Login form shown when logged out
**Requirement(s):** #8
**Preconditions:** Not currently logged in.
**Steps:**
1. Navigate to `/admin/`.
**Expected Result:** A password login form is shown; no recipe list or add-recipe form is visible.

### TC-ALOGIN-02 — Correct password logs in
**Requirement(s):** #8
**Preconditions:** Know the current shared admin password.
**Steps:**
1. Navigate to `/admin/`.
2. Enter the correct password and submit.
**Expected Result:** Login succeeds; the admin recipe list and add-recipe controls become visible.

### TC-ALOGIN-03 — Incorrect password is rejected
**Requirement(s):** #8
**Preconditions:** None.
**Steps:**
1. Navigate to `/admin/`.
2. Enter an incorrect password and submit.
**Expected Result:** An error is shown and admin content stays hidden.

## Admin Add/Edit Recipe Form

### TC-AFORM-01 — Category dropdown shows the fixed list
**Requirement(s):** #9
**Preconditions:** Logged in as admin.
**Steps:**
1. Open the add-recipe form.
2. Open the category dropdown.
**Expected Result:** Exactly these options appear: Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, Other.

### TC-AFORM-02 — Category selection auto-populates suggested time stages
**Requirement(s):** #10, #12
**Preconditions:** Logged in as admin, blank form.
**Steps:**
1. Select "Bread & Sourdough" as the category.
2. Observe the time-stages section.
**Expected Result:** Rows for Prep, Rise, and Bake are pre-filled, matching the documented suggestions for that category.

### TC-AFORM-03 — "Other" category yields no suggested stages
**Requirement(s):** #10, #12
**Preconditions:** Logged in as admin, blank form.
**Steps:**
1. Select "Other" as the category.
**Expected Result:** The time-stages section stays empty; no rows are pre-filled.

### TC-AFORM-04 — Switching category after editing stages does not overwrite them
**Requirement(s):** #12
**Preconditions:** Logged in as admin, blank form.
**Steps:**
1. Select "Beer" (auto-populates Prep/Ferment/Condition-Carbonate).
2. Edit one row's label or duration, or add a custom row.
3. Change the category to "Wine".
**Expected Result:** The submitter's already-edited/added stages remain unchanged; Wine's suggestions are not applied over them.

### TC-AFORM-05 — Add a blank time-stage row
**Requirement(s):** #12
**Preconditions:** Logged in as admin, form open.
**Steps:**
1. Click the control to add a new stage row.
**Expected Result:** A new blank label/duration row appears with its own remove control.

### TC-AFORM-06 — Remove a time-stage row
**Requirement(s):** #12
**Preconditions:** Form has at least one stage row.
**Steps:**
1. Click the remove control on a stage row.
**Expected Result:** That row disappears; remaining rows are unaffected.

### TC-AFORM-07 — Submitted stages render correctly after save
**Requirement(s):** #10, #12
**Preconditions:** Logged in as admin.
**Steps:**
1. Fill in required fields; add rows "Cold Proof"/"12 hr" and "Bake"/"45 min"; submit.
2. Open the new recipe's detail page.
**Expected Result:** Both stages appear as chips on the detail page with the exact labels/durations entered, in the order left in the form.

### TC-AFORM-08 — Save a recipe with no photo
**Requirement(s):** #9, #11
**Preconditions:** Logged in as admin.
**Steps:**
1. Fill in required fields, leave the photo upload empty.
2. Submit.
**Expected Result:** The recipe saves successfully; its detail page has no photo section.

### TC-AFORM-09 — Save a recipe with a photo
**Requirement(s):** #11, #12
**Preconditions:** Logged in as admin; a valid image file available.
**Steps:**
1. Fill in required fields; choose a valid image in the photo upload field.
2. Submit.
**Expected Result:** The recipe saves; the photo appears on the resulting detail page.

### TC-AFORM-10 — Failed photo upload blocks the save
**Requirement(s):** #12
**Preconditions:** Logged in as admin; a way to force the upload to fail (e.g., interrupt network connectivity right after submitting).
**Steps:**
1. Fill in required fields, attach a photo.
2. Interrupt connectivity so the upload fails.
3. Observe the result.
**Expected Result:** The form shows an error and no recipe row is saved.

### TC-AFORM-11 — Video URL field shows placeholder text
**Requirement(s):** #12
**Preconditions:** Logged in as admin, blank form.
**Steps:**
1. Open the add-recipe form.
2. Look at the empty video URL input.
**Expected Result:** Placeholder text illustrating the expected YouTube URL format is shown.

### TC-AFORM-12 — Save a recipe with a video URL
**Requirement(s):** #11, #12
**Preconditions:** Logged in as admin.
**Steps:**
1. Fill in required fields; paste a `youtube.com/watch?v=...` link into the video URL field.
2. Submit and open the resulting detail page.
**Expected Result:** The recipe saves and the video embeds correctly on the detail page.

### TC-AFORM-13 — Optional yield/servings field saves and displays
**Requirement(s):** #9, #12
**Preconditions:** Logged in as admin.
**Steps:**
1. Fill in required fields plus a freeform yield line (e.g., "makes 2 loaves").
2. Submit and open the detail page.
**Expected Result:** The yield/servings text is displayed exactly as entered.

### TC-AFORM-14 — Optional notes/tips field saves and displays
**Requirement(s):** #9, #12
**Preconditions:** Logged in as admin.
**Steps:**
1. Fill in required fields plus text in the notes/tips textarea.
2. Submit and open the detail page.
**Expected Result:** The notes/tips text is shown on the detail page.

### TC-AFORM-15 — Optional submitted-by field saves and displays
**Requirement(s):** #9
**Preconditions:** Logged in as admin.
**Steps:**
1. Fill in required fields plus a submitted-by name.
2. Submit and open the detail page.
**Expected Result:** The submitted-by name is displayed on the detail page.

### TC-AFORM-16 — Multi-line ingredients and instructions render as separate items
**Requirement(s):** #9
**Preconditions:** Logged in as admin.
**Steps:**
1. Enter several lines in the ingredients field (one item per line) and several in instructions.
2. Submit and open the detail page.
**Expected Result:** Each line appears as a distinct ingredient/instruction item, in the order entered.

## Admin Recipe Management (List, Edit, Delete)

### TC-AMGMT-01 — Admin recipe list shows all recipes with expected columns
**Requirement(s):** #14
**Preconditions:** Logged in as admin; at least one recipe with a photo and one without exist.
**Steps:**
1. Open `/admin/` while logged in.
2. Review the recipe list.
**Expected Result:** Every recipe is listed with title, category, date, and a photo thumbnail where a photo exists (no thumbnail for the one without a photo).

### TC-AMGMT-02 — Edit opens the add-recipe form pre-filled
**Requirement(s):** #14
**Preconditions:** Logged in as admin; an existing recipe.
**Steps:**
1. Click "Edit" on a recipe in the admin list.
**Expected Result:** The same form used to add a recipe opens in an edit mode, pre-populated with that recipe's current values, including its existing time stages.

### TC-AMGMT-03 — Editing preserves the recipe's slug
**Requirement(s):** #14
**Preconditions:** Logged in as admin; note the recipe's current `/recipes/view?slug=...` URL.
**Steps:**
1. Edit the recipe's title (or other fields) and save.
2. Revisit the originally noted URL.
**Expected Result:** The original URL still resolves and now shows the updated content; the slug did not change.

### TC-AMGMT-04 — Delete requires confirmation
**Requirement(s):** #14
**Preconditions:** Logged in as admin; an existing recipe.
**Steps:**
1. Click "Delete" on a recipe in the admin list.
**Expected Result:** A confirmation prompt appears before anything is removed.

### TC-AMGMT-05 — Confirming delete removes the recipe
**Requirement(s):** #14
**Preconditions:** Logged in as admin; an existing recipe.
**Steps:**
1. Click "Delete" on a recipe and confirm.
2. Check `/admin/` and `/recipes/`.
**Expected Result:** The recipe no longer appears in either list, and its `/recipes/view?slug=...` page no longer shows the recipe.

### TC-AMGMT-06 — Deleting a recipe with a photo removes the stored photo
**Requirement(s):** #14
**Preconditions:** Logged in as admin; a recipe with an uploaded photo; note the photo's public URL beforehand.
**Steps:**
1. Delete that recipe and confirm.
2. Attempt to load the previously noted photo URL directly.
**Expected Result:** The photo is no longer served (best-effort removal from Storage alongside the row deletion).

## Out of scope

- Related recipes strip on the recipe detail page (#13) — deferred, no ETA.
- Category filter pills on the recipe list page (#13) — deferred, no ETA.
- Cleanup of the old photo object when a recipe's photo is replaced via edit (#14 / open questions) — explicitly a known, unbuilt gap.
- Auth approach for the future members-only section — not yet decided/built.
- Hosting model for members-only section's server-side pieces — not yet decided/built.
- Content for About/Events info pages — not yet drafted; pages don't exist.

## Not manually testable (architecture/backend only)

- Astro static-output-with-incremental-server-rendering choice (#1) — internal tech decision, no distinct clickable behavior.
- GitHub Actions deploy trigger on `v*.*.*` tag push / `workflow_dispatch` (#2) — CI/CD pipeline behavior verified via repo Actions runs, not through the website UI.
- Repo visibility, branch protection, sole-collaborator restriction, and tag-creation ruleset (#4) — GitHub repository administration settings, not app UI.
- Row Level Security policies gating writes/reads on `recipes` and the `recipe-photos` bucket (#7, #8, #11, #14) — enforced server-side in Postgres/Storage; their observable effect (only a logged-in admin can add/edit/delete/upload, anyone can read) is already exercised by the Admin Login and Admin Recipe Management test cases above.
- Server-side (not client-side) password verification via Supabase Auth (#8) — internal implementation guarantee; only the resulting login/reject behavior is testable (see TC-ALOGIN-02/03).
