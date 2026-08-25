<!-- devkeep:user-manual source-hash:980aed6e57a22c09431b1187fc6942e3ee95d23d1a284da6d7a1771e592cd3d0 -->
> **Do not move, rename, or edit this file.** Devkeep generates and maintains this user manual automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devkeep detects the requirements have changed. To change what's documented, update `docs/PRODUCT.md` itself.
<!-- devkeep:user-manual requirement-hashes
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

Heartland Fermenters Guild is the public website for a real-world community of home brewers, bakers, picklers, and cheesemakers, reachable at `heartlandfermentersguild.org`. It's meant for two kinds of people: visitors from social media or in-person meetups who want to learn about the guild and find its recipes, and guild admins/members who keep that recipe collection growing. This manual walks through what's actually on the site today and how to use each part of it.

## Table of Contents

- [Visiting the Landing Page](#visiting-the-landing-page)
- [Browsing Recipes](#browsing-recipes)
- [Logging In as Admin](#logging-in-as-admin)
- [Adding and Editing Recipes](#adding-and-editing-recipes)
- [Managing Recipes as Admin](#managing-recipes-as-admin)
- [Submitting a Recipe as a Member](#submitting-a-recipe-as-a-member)
- [Managing Members and Pending Recipes](#managing-members-and-pending-recipes)

## Visiting the Landing Page
<!-- requirements: #5 -->

The homepage is a simple, welcoming landing page. At the top is a header banner image, followed by a short welcome paragraph explaining what the Heartland Fermenters Guild is and who it's for. Below that is a "Join the Conversation" section with links out to the guild's email, its Facebook Page, its Facebook Group, its Instagram, and its Meetup — use these to reach the guild or follow along on whichever platform you already use.

Every page on the site, including the landing page, shares a common footer. On the left it shows the copyright notice and a link to the Admin page. On the right it reads "Website development donated by" next to a Starter Culture Studio logo — only the logo itself is clickable, linking out to `starterculturestudio.com`. The footer stays pinned to the bottom of your browser window even on pages with very little content, rather than floating up partway up the page.

[↑ Back to table of contents](#table-of-contents)

## Browsing Recipes
<!-- requirements: #7, #9, #10, #11 -->

The recipes section lists recipes the guild has shared — beer, wine, bread & sourdough, vegetables & pickles, kombucha, cheese, and a catch-all "Other" category. Recipes appear on the list as soon as an admin adds them, with no need to wait for a site rebuild.

Clicking a recipe takes you to its detail page, which shows:

- Title, category, and a short summary
- A photo, if the submitter added one
- An embedded how-to video, if the submitter linked one (pasted from YouTube)
- A freeform yield/servings line (e.g. "makes 2 loaves"), if given
- Time-stage chips such as "Active Prep: 20 min" or "Ferment: 5 days" — however many stages the recipe actually has, since different recipes (even in the same category) can use different combinations
- Ingredients and instructions, each listed one item per line
- An optional notes/tips section with extra guidance from the submitter
- Who submitted the recipe, if they chose to share their name

If a recipe has neither a photo nor a video, the page simply omits both — they're independent and optional.

[↑ Back to table of contents](#table-of-contents)

## Logging In as Admin
<!-- requirements: #8 -->

Recipe management is gated behind an Admin login at `/admin/`. This isn't an individual account system — it's a single shared password known to whoever the guild has entrusted with admin access. Enter the password on the admin login screen; it's checked securely rather than compared in a way that could be read from the page itself. A successful login just confirms you know the current shared password, not who you are personally, so treat the password itself as the thing to keep within the trusted group.

[↑ Back to table of contents](#table-of-contents)

## Adding and Editing Recipes
<!-- requirements: #9, #10, #11, #12 -->

Once logged in as admin, you can add a new recipe or edit an existing one using the same form. The fields are:

- **Title** — the recipe's name
- **Category** — chosen from the fixed list (Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, Other)
- **Summary** — a short description
- **Photo** (optional) — upload an image file; if the upload fails, the form shows an error and nothing is saved, so you won't end up with a recipe pointing at a broken image
- **Video URL** (optional) — paste a `youtube.com/watch?v=...` or `youtu.be/...` link; the placeholder text in the field shows the expected format, and the site builds the embedded player from it automatically
- **Yield/servings** (optional) — a freeform line like "serves 6" or "makes one 1-gallon batch"
- **Time stages** — a repeatable list of label-and-duration rows (e.g. "Prep" / "20 min"). Choosing a category auto-fills suggested starting stages for that category (for example, Bread & Sourdough suggests Prep, Rise, Bake; Cheese suggests Prep, Culture, Age; Other suggests none) — but only if you haven't already started typing stages yourself, so switching categories partway through never wipes out your work. You can add, remove, or relabel any row before saving; whatever you leave in place is what gets stored.
- **Ingredients** and **Instructions** — plain text, one item per line
- **Notes/tips** (optional) — a free text area for extra guidance
- **Submitted by** (optional) — a name to credit

When editing an existing recipe, the same form is reused in an "edit" mode, pre-filled with that recipe's current values. The recipe's underlying link (its slug) never changes when you edit it, so any link to that recipe already shared elsewhere keeps working.

[↑ Back to table of contents](#table-of-contents)

## Managing Recipes as Admin
<!-- requirements: #14 -->

The admin page lists every existing recipe with its title, category, photo thumbnail (if it has one), and the date it was added. From this list you can:

- **Edit** a recipe, which opens the same add-a-recipe form pre-filled with that recipe's details
- **Delete** a recipe, which asks for confirmation first. Deleting also best-effort removes the recipe's uploaded photo from storage; if that cleanup step fails for some reason, the recipe itself is still deleted rather than left stuck

[↑ Back to table of contents](#table-of-contents)

## Submitting a Recipe as a Member
<!-- requirements: #16 -->

Guild members who've been added to the guild's member roster by an admin can submit their own recipes through the members submission page at `/submit/`, without needing the admin password.

To log in, enter your email address and follow the magic link sent to your inbox — there's no password to remember. Note that only email addresses an admin has actually added to the member roster are able to submit; anyone can request a login link, but only recognized member emails can successfully submit a recipe.

The submission form captures the same fields as the admin recipe form (title, category, summary, photo, video URL, yield/servings, time stages, ingredients, instructions, notes/tips, submitted-by). Recipes submitted this way don't appear on the public recipe list right away — they go into a pending queue for an admin to review first. This is a deliberate moderation step, so nothing a member submits reaches the public site without an admin approving it.

[↑ Back to table of contents](#table-of-contents)

## Managing Members and Pending Recipes
<!-- requirements: #16 -->

The admin page includes a Members section where you can see the current member roster, add a new member by email (granting them access to the submission form), and deactivate or reactivate an existing member's access without deleting their record.

There's also a Pending Recipes queue listing every recipe submitted by members that hasn't been reviewed yet. From here you can:

- **Approve** a pending recipe, which publishes it to the public recipe list immediately
- **Reject** a pending recipe, which permanently deletes it (with the same best-effort photo cleanup used elsewhere)

The main Recipes list also gains a Deactivate/Reactivate toggle, separate from the hard Delete action, letting you pull a published recipe out of public view without permanently removing it.

[↑ Back to table of contents](#table-of-contents)

