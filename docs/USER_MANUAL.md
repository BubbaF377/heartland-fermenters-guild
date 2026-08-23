<!-- devlore:user-manual source-hash:59f165593a70a9e1188fcd4ca6188c253e6bf1d8dac39c806f28c8c5075098bc -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this user manual automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's documented, update `docs/PRODUCT.md` itself.
<!-- devlore:user-manual requirement-hashes
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

The Heartland Fermenters Guild website is the public home for a real-world community of home brewers, bakers, picklers, and cheesemakers. It's where guild members and curious newcomers alike can learn what the guild is about, find ways to connect with other members, and browse a shared collection of guild recipes covering beer, wine, bread and sourdough, pickled vegetables, kombucha, and cheese. Most of the site is open to anyone who visits; a small admin area is reserved for guild organizers who know the shared admin password and use it to add new recipes to the collection.

## Table of Contents

- [Visiting the Landing Page](#visiting-the-landing-page)
- [Browsing the Recipe Collection](#browsing-the-recipe-collection)
- [Viewing a Recipe](#viewing-a-recipe)
- [Logging In as an Admin](#logging-in-as-an-admin)
- [Adding a New Recipe](#adding-a-new-recipe)

## Visiting the Landing Page
<!-- requirements: #5 -->

When you first arrive at the site, you'll land on a simple welcome page. At the top is a header banner image, followed by a short paragraph introducing the guild — what it is and who it's for. Below that is a "Join the Conversation" section with links out to the guild's email address, its Facebook Page, its Facebook Group, its Instagram, and its Meetup page — click any of these to head to that platform and connect with the guild there.

At the bottom of every page on the site, including the landing page, you'll find a footer with a copyright notice and an Admin link on the left (see [Logging In as an Admin](#logging-in-as-an-admin)) and a Starter Culture Studio logo on the right — clicking that logo takes you to `starterculturestudio.com`.

[↑ Back to table of contents](#table-of-contents)

## Browsing the Recipe Collection
<!-- requirements: #7, #9, #10 -->

The `/recipes/` page lists recipes submitted by guild members. Each recipe belongs to one of a fixed set of categories — Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, or Other — and shows enough at a glance (like its title and short summary) to help you decide what to click into.

Because the recipe list is pulled live from the guild's database rather than baked into the site at build time, newly added recipes show up here right away — you don't need to wait for a site update to see something a fellow member just submitted.

[↑ Back to table of contents](#table-of-contents)

## Viewing a Recipe
<!-- requirements: #7, #9, #10, #11 -->

Clicking a recipe from the list takes you to its detail page, which lays out everything that recipe's submitter provided:

- Title, category, and a short summary
- A photo, if the submitter included one
- An embedded how-to video, if the submitter linked a YouTube video
- A yield/servings line (e.g. "makes one loaf" or "serves 6"), if provided
- Time stage chips — small labeled badges like "Active Prep: 20 min" or "Ferment: 5 days" that summarize how long each stage of the process takes. Different recipes show different stages depending on what's relevant (a sourdough recipe might show Prep, Rise, and Bake, while a cold-proofed one adds a fourth Cold Proof stage) — there's no fixed set, so pay attention to what's actually listed for that recipe rather than expecting the same stages everywhere
- Ingredients, listed one per line
- Step-by-step instructions, listed one per line
- Notes/tips, if the submitter added any
- A submitted-by name, if the submitter chose to include one

Like the recipe list, this page is loaded live from the guild's database each time you visit, so it always reflects the latest version of that recipe.

[↑ Back to table of contents](#table-of-contents)

## Logging In as an Admin
<!-- requirements: #8 -->

Recipe submission is restricted to guild organizers. To get to the submission form, click the Admin link in the site footer to reach `/admin/`, then enter the shared admin password. This isn't an individual account system — everyone with admin access uses the same login (`admin@heartlandfermentersguild.org`), and the password itself is simply shared with whoever the guild has decided should be able to add recipes. If you don't have the current password, ask another guild organizer who does.

Once logged in, you'll see the recipe submission form described in [Adding a New Recipe](#adding-a-new-recipe).

[↑ Back to table of contents](#table-of-contents)

## Adding a New Recipe
<!-- requirements: #9, #10, #11, #12 -->

After logging into `/admin/`, you'll find a form for submitting a new recipe. Fill in:

- **Title** — the recipe's name
- **Category** — pick one of Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, or Other
- **Summary** — a short description
- **Photo** (optional) — upload an image file; it'll be attached to the recipe and shown on its detail page
- **Video URL** (optional) — paste a YouTube link (either a `youtube.com/watch?v=...` or `youtu.be/...` style URL); the placeholder text in the field shows the expected format. The page will automatically turn this into an embedded video for viewers — you don't need to do anything special to make that happen
- **Yield/servings** (optional) — a freeform line like "makes 2 dozen cookies"
- **Time stages** — a repeatable list of stage rows, each with a label (like "Prep" or "Ferment") and a duration (like "20 min" or "3 days"). When you pick a category, this section automatically fills in with suggested starting stages for that category:
  - Beer: Prep, Ferment, Condition/Carbonate
  - Wine: Prep, Ferment, Age
  - Bread & Sourdough: Prep, Rise, Bake
  - Vegetables & Pickles: Prep, Ferment
  - Kombucha: Prep, Ferment
  - Cheese: Prep, Culture, Age
  - Other: nothing pre-filled — add stages freely

  These are just starting suggestions, not requirements — you can add more rows, remove rows you don't need, or relabel any row before saving. Note that this auto-fill only happens while the section is still empty, so if you've already started typing in stages and then change the category, your existing entries are left alone rather than getting overwritten.
- **Ingredients** — one ingredient per line
- **Instructions** — one step per line
- **Notes/tips** (optional) — anything else worth mentioning
- **Submitted by** (optional) — your name or the name of whoever's recipe this is

When you submit the form, if you included a photo, it uploads first. If that upload fails for any reason, the form will show an error and nothing is saved — you'll need to try again rather than ending up with a recipe that's missing its photo. Once everything succeeds, the recipe becomes visible on `/recipes/` right away.

[↑ Back to table of contents](#table-of-contents)

