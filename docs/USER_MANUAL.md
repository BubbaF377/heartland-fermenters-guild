<!-- devlore:user-manual source-hash:3458f76c4608c85a10ca53ca5f52612dedb61408879b777a49ad71c827f49fb7 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this user manual automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's documented, update `docs/PRODUCT.md` itself.
<!-- devlore:user-manual requirement-hashes
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
-->

The Heartland Fermenters Guild website is the online home for a real-world community of home brewers, bakers, picklers, and cheesemakers. It's meant for two audiences: the general public who land on it from social media or a friend's recommendation and want to learn what the guild is about and how to connect with it, and guild members who browse (and, for the small group with admin access, contribute to) a shared collection of fermentation and baking recipes. This manual walks through what you can do on the site today, as a visitor, a recipe reader, and as an admin.

## Table of Contents

- [The Landing Page](#the-landing-page)
- [Browsing Recipes](#browsing-recipes)
- [Viewing a Recipe](#viewing-a-recipe)
- [Logging In as an Admin](#logging-in-as-an-admin)
- [Adding a New Recipe](#adding-a-new-recipe)
- [Managing Existing Recipes](#managing-existing-recipes)

## The Landing Page
<!-- requirements: #5 -->

When you visit `heartlandfermentersguild.org`, you land on a simple welcome page. At the top is a header banner image, followed by a short paragraph introducing the guild — what it is and who it's for. Below that is a "Join the Conversation" section with links out to the ways you can connect with the guild: email, the guild's Facebook Page, its Facebook Group, Instagram, and Meetup. Click any of these to go to that platform and follow, join, or message the guild directly.

At the bottom of every page on the site, including this one, you'll find a footer. On the left is the copyright notice and a link to the Admin area (see "Logging In as an Admin" below). On the right, the text "Website development donated by" sits next to a Starter Culture Studio logo — only the logo itself is a link, and it goes to `starterculturestudio.com`. The footer always stays pinned to the bottom of your browser window, even on pages with very little content, like an empty recipe list.

[↑ Back to table of contents](#table-of-contents)

## Browsing Recipes
<!-- requirements: #7 -->

The `/recipes/` page lists recipes submitted by the guild. Because recipes are stored in a live database rather than baked into the site at build time, anything an admin adds shows up here right away — no need to wait for a site rebuild. Each entry links to that recipe's own page. If no recipes have been added yet, you'll simply see an empty list rather than an error.

[↑ Back to table of contents](#table-of-contents)

## Viewing a Recipe
<!-- requirements: #7, #9, #10, #11 -->

Clicking a recipe from the list takes you to its detail page, reached via a link that includes the recipe's slug (its short URL identifier), for example `/recipes/view?slug=sourdough-boule`. On this page you'll find:

- The recipe's title, category (one of Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, or Other), and a short summary.
- A photo, if the submitter included one.
- An embedded how-to video, if the submitter linked one — paste-friendly YouTube links are automatically turned into a playable embed right on the page.
- A yield/servings line, if one was given (e.g. "makes one 9-inch loaf" or "serves 6").
- A row of small metadata chips showing time stages relevant to that recipe — things like "Active Prep: 20 min," "Ferment: 5 days," or "Bake: 45 min." Different recipes show different stages depending on what the submitter entered; a cold-proofed sourdough recipe, for instance, might show an extra "Cold Proof" chip that a same-day loaf wouldn't have.
- The ingredient list and step-by-step instructions.
- A notes/tips section, if the submitter added any extra advice.
- A submitted-by credit, if the submitter chose to include their name.

Anyone can view a recipe's page and photo — you don't need to log in to read recipes.

[↑ Back to table of contents](#table-of-contents)

## Logging In as an Admin
<!-- requirements: #8 -->

Recipe submission and management is gated behind a login at `/admin/`. This isn't an individual account system — there's a single shared admin password for the whole guild, so anyone who's been given that password can log in and manage recipes. Enter the password on the admin login form and submit it; the site checks it against the guild's admin account before letting you in. If the password is wrong, you won't be let past the login form. Once logged in, you'll see the admin recipe-management page described in the next two sections.

[↑ Back to table of contents](#table-of-contents)

## Adding a New Recipe
<!-- requirements: #9, #10, #11, #12 -->

After logging into `/admin/`, you'll find a form for adding a new recipe. Fill in:

- **Title** — the recipe's name.
- **Category** — pick one of Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, or Other.
- **Summary** — a short description shown on the recipe page.
- **Photo** (optional) — upload an image file. If you also fill in a video URL, both will show on the recipe page; you can include a photo, a video, both, or neither.
- **Video URL** (optional) — paste a YouTube link (either a `youtube.com/watch?v=...` or `youtu.be/...` style URL); the input shows placeholder text reminding you of the expected format.
- **Yield/servings** (optional) — a freeform line like "serves 4" or "makes 2 loaves."
- **Time stages** — a repeatable list of rows, each with a label (like "Prep" or "Ferment") and a duration (like "20 min" or "3 days"). Use the "add a row" control to add more stages, and each row has its own way to remove it. When you pick a category, this section automatically fills in with suggested starting stages for that category (for example, choosing Bread & Sourdough suggests Prep, Rise, and Bake). This only happens if the stages section is still empty — if you've already started typing in stages and then change the category, your entries are left alone. You're free to add, remove, relabel, or reorder any stage before saving; the suggestions are just a starting point, not a requirement.
- **Ingredients** — one ingredient per line.
- **Instructions** — one step per line.
- **Notes/tips** (optional) — any extra advice, freeform text.
- **Submitted by** (optional) — a name to credit on the recipe page.

When you submit the form, if you included a photo, it's uploaded first; if that upload fails for any reason, you'll see an error and the recipe won't be saved — this avoids ending up with a recipe pointing at a missing photo. Otherwise, the recipe is saved and becomes visible on `/recipes/` and its own detail page immediately.

[↑ Back to table of contents](#table-of-contents)

## Managing Existing Recipes
<!-- requirements: #14 -->

The admin page also shows a list of every recipe that's been added, with its title, category, a photo thumbnail (if it has one), and the date it was added. From this list you can:

- **Edit** a recipe — this opens the same form used for adding a recipe, pre-filled with that recipe's existing details, so you can update any field (title, category, summary, photo, video, yield, time stages, ingredients, instructions, notes, submitted-by) and save your changes. The recipe's underlying link (its slug) never changes when you edit it, so any links to it that have already been shared keep working.
- **Delete** a recipe — you'll be asked to confirm before anything happens. Once confirmed, the recipe is removed from the list and its page becomes unavailable. If the recipe had a photo, the system also tries to clean up that stored photo as part of the deletion.

[↑ Back to table of contents](#table-of-contents)

