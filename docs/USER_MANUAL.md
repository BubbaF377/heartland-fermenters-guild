<!-- devlore:user-manual source-hash:b0a4293e3476ff1d2cd052d851cf191ff34e61ac08105d967f201fe544c46ffd -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this user manual automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's documented, update `docs/PRODUCT.md` itself.
<!-- devlore:user-manual requirement-hashes
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

The Heartland Fermenters Guild website is the public home for a real-world community of home brewers, bakers, picklers, and cheesemakers. It's where anyone — a curious newcomer or a longtime member — can learn what the guild is, find ways to connect with other members, and browse a growing collection of guild-submitted recipes for beer, wine, bread, pickled vegetables, kombucha, and cheese. A small admin area lets designated guild members add and manage those recipes. This manual walks through what you can do on the site today and how to do it.

## Table of Contents

- [Visiting the Landing Page](#visiting-the-landing-page)
- [Joining the Conversation](#joining-the-conversation)
- [Browsing the Recipe Collection](#browsing-the-recipe-collection)
- [Viewing a Recipe](#viewing-a-recipe)
- [Logging Into the Admin Area](#logging-into-the-admin-area)
- [Adding a New Recipe](#adding-a-new-recipe)
- [Setting Time Stages for a Recipe](#setting-time-stages-for-a-recipe)
- [Editing and Deleting Recipes](#editing-and-deleting-recipes)

## Visiting the Landing Page
<!-- requirements: #5 -->

When you go to `heartlandfermentersguild.org`, you land on the guild's welcome page. At the top is a header banner image, followed by a short paragraph introducing the guild — what it is and who it's for. This is the page you'd point a friend to if you wanted to introduce them to the guild, or the link you'd share on social media.

At the very bottom of every page on the site, including this one, is a footer: on the left you'll find the copyright notice and a link to the Admin area, and on the right a Starter Culture Studio logo that links out to `starterculturestudio.com`.

[↑ Back to table of contents](#table-of-contents)

## Joining the Conversation
<!-- requirements: #5 -->

Below the welcome paragraph on the landing page is a "Join the Conversation" section — this is how you connect with the guild beyond the website itself. It links out to:

- The guild's email address
- The guild's Facebook Page
- The guild's Facebook Group
- The guild's Instagram
- The guild's Meetup page

Click any of these to open that platform and follow, join, or message the guild directly.

[↑ Back to table of contents](#table-of-contents)

## Browsing the Recipe Collection
<!-- requirements: #7 -->

The recipes section lives at `/recipes/` and lists recipes submitted by the guild. Because the list is pulled live from the guild's database, newly added recipes show up here right away — you don't need to wait for the site to be rebuilt or redeployed to see something new.

Click on any recipe in the list to open its full detail page.

[↑ Back to table of contents](#table-of-contents)

## Viewing a Recipe
<!-- requirements: #7, #9, #10, #11 -->

Each recipe has its own detail page, reached by clicking through from the recipe list (the page address will look like `/recipes/view?slug=...`). A recipe page includes:

- **Title, category, and summary** — the category is one of a fixed set: Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, or Other.
- **A photo**, if the submitter included one.
- **A how-to video**, if the submitter included one — this appears as an embedded YouTube player right on the page, so you can watch it without leaving the site.
- **Yield/servings**, a freeform line describing what the recipe makes (if the submitter filled it in).
- **Time stage chips** — small labeled badges showing timing at a glance, such as "Active Prep: 20 min" or "Ferment: 2 weeks." Different recipes show different stages depending on what the submitter entered; a bread recipe might show Prep/Rise/Bake, while a cheese recipe might show Prep/Culture/Age, and some may have extra stages like an added "Cold Proof."
- **Ingredients**, listed one per line.
- **Instructions**, listed one per line, in order.
- **Notes/tips**, if the submitter added any extra guidance.
- **Submitted by**, if the submitter chose to share their name.

Not every recipe has every field — photo, video, yield, time stages, notes, and submitted-by are all optional, so a given recipe page may be shorter than others depending on what was filled in when it was added.

[↑ Back to table of contents](#table-of-contents)

## Logging Into the Admin Area
<!-- requirements: #8 -->

Recipe creation and management are gated behind a login at `/admin/`. The guild uses a single shared password rather than individual member accounts — if you've been given the current admin password, you can log in there regardless of who you are. Entering the correct password proves you're authorized to make changes; it doesn't identify you personally, so there's no separate "your account" to manage.

Once logged in, you'll see the admin dashboard, which lists every existing recipe and gives you tools to add, edit, and delete recipes (covered below).

If you don't have the password, ask whoever administers the guild's site for it.

[↑ Back to table of contents](#table-of-contents)

## Adding a New Recipe
<!-- requirements: #9, #11, #12 -->

After logging into the admin area, you can add a new recipe using the recipe form. Fill in:

- **Title**
- **Category** — choose from Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, or Other.
- **Short summary**
- **Photo** (optional) — use the file input to upload an image. If the upload fails for some reason, the form will show an error and the recipe won't be saved, so you can just try again rather than ending up with a recipe that's missing its picture.
- **Video URL** (optional) — paste a link to a YouTube video, either a `youtube.com/watch?v=...` or `youtu.be/...` link. The form shows placeholder text as a reminder of the expected format. You don't need to do anything special to make it embed — the site handles that automatically from the link you paste.
- **Yield/servings** (optional) — a freeform text line, e.g. "makes about a dozen jars."
- **Time stages** — see the next section for details on filling this in.
- **Ingredients** — type one ingredient per line.
- **Instructions** — type one step per line.
- **Notes/tips** (optional)
- **Submitted by** (optional) — your name or the name of whoever's recipe this is, if you'd like it credited.

A photo and a video are entirely independent of one another — a recipe can have both, either one, or neither. When you're done, submit the form to save the recipe. It will appear on the public recipes list right away.

[↑ Back to table of contents](#table-of-contents)

## Setting Time Stages for a Recipe
<!-- requirements: #10, #12 -->

Time stages let you describe the timing of a recipe as a short, flexible list — things like "Prep: 20 min," "Ferment: 2 weeks," or "Cold Proof: overnight." Unlike ingredients or instructions, this is built as a small repeatable section in the admin form: each row has a label field and a duration field, plus a button to remove that row, and a button below the list to add a new blank row.

When you pick a category, the form automatically fills in a suggested starting set of stages for you — but only if the stages section is still empty. This means if you've already started typing in your own stages and then change the category dropdown, your work won't be overwritten. The suggested starting points are:

- **Beer**: Prep, Ferment, Condition/Carbonate
- **Wine**: Prep, Ferment, Age
- **Bread & Sourdough**: Prep, Rise, Bake
- **Vegetables & Pickles**: Prep, Ferment
- **Kombucha**: Prep, Ferment
- **Cheese**: Prep, Culture, Age
- **Other**: no suggestions — add rows freely

These are just a starting point, not a requirement — you can rename any label, change any duration, remove rows you don't need, or add extra rows for stages that aren't in the suggested list (like an added "Cold Proof" step for an overnight-proofed sourdough). Leave the section empty entirely if the recipe doesn't need timing chips at all. Whatever rows you end up with, in whatever order, is exactly what gets saved and shown as chips on the recipe page.

[↑ Back to table of contents](#table-of-contents)

## Editing and Deleting Recipes
<!-- requirements: #14 -->

The admin dashboard (at `/admin/`, once logged in) lists every recipe currently on the site, showing its title, category, a photo thumbnail if it has one, and the date it was added. From this list you can edit or delete any recipe.

**Editing** a recipe opens the same form used to add a new one, pre-filled with that recipe's existing details, so you can change any field the same way you would when creating it. Note that the recipe's web address (its slug) never changes when you edit it — this keeps any links to that recipe that have already been shared working correctly.

**Deleting** a recipe asks you to confirm first, since it can't be undone. Once confirmed, the recipe and its data are removed from the site. If the recipe had a photo, the system also attempts to clean up the stored image — though if that particular cleanup step happens to fail, the recipe is still deleted rather than left stuck in place.

[↑ Back to table of contents](#table-of-contents)

