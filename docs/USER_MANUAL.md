<!-- devlore:user-manual source-hash:5633442e5406f0981136f58b9ad83fda94cc061088ed6f6d6fe3d8bc2002e921 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this user manual automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's documented, update `docs/PRODUCT.md` itself.
<!-- devlore:user-manual requirement-hashes
1=8c6a5f4fb077
2=74ba323e0a07
3=c1a27b1ede7c
4=d62dbc43a89f
5=6294ef378458
6=773d44048551
7=c5fb0daa7d8a
8=6cf7ff87fbd8
9=bc23fd892fad
-->

Heartland Fermenters Guild's website is the public home for a real-world community of home brewers, bakers, picklers, and cheesemakers. If you're a guild member, a prospective member, or just someone who got pointed here from social media or a flyer, this site is where you go to learn what the guild is about, find ways to connect with other members, and — if you're a home cook — browse recipes shared by the community. This manual walks through what's currently on the site and how to use each part of it.

## Table of Contents

- [Visiting the Landing Page](#visiting-the-landing-page)
- [Joining the Conversation](#joining-the-conversation)
- [Using the Site Footer](#using-the-site-footer)
- [Browsing Recipes](#browsing-recipes)
- [Viewing a Recipe](#viewing-a-recipe)
- [Logging In as an Admin](#logging-in-as-an-admin)
- [Adding a New Recipe](#adding-a-new-recipe)

## Visiting the Landing Page

<!-- requirements: #5 -->

When you go to `heartlandfermentersguild.org`, you land on the guild's homepage. At the top is a header banner image, followed by a short welcome paragraph that explains what the Heartland Fermenters Guild is and who it's for — home brewers, bakers, picklers, and cheesemakers looking for a community. There's nothing to click or configure here; it's meant to be a quick, welcoming introduction you can point a friend to.

[↑ Back to table of contents](#table-of-contents)

## Joining the Conversation

<!-- requirements: #5 -->

Below the welcome paragraph is a "Join the Conversation" section. This is where you'll find links to connect with the guild elsewhere:

- An email link to get in touch directly.
- The guild's Facebook Page.
- The guild's Facebook Group.
- Instagram.
- Meetup.

Click any of these to open that platform in a new destination and follow, join, or message the guild from there. This section is the main way the site directs people toward the guild's actual community spaces.

[↑ Back to table of contents](#table-of-contents)

## Using the Site Footer

<!-- requirements: #5 -->

Every page on the site — the homepage, the recipes pages, and the admin page — shares the same footer at the bottom. On the left side you'll see the site's copyright notice and a link labeled "Admin," which takes you to the admin login page (see "Logging In as an Admin" below). On the right side is a Starter Culture Studio logo; clicking it takes you to `starterculturestudio.com`. Use the footer any time you need to jump to the admin page from wherever you are on the site.

[↑ Back to table of contents](#table-of-contents)

## Browsing Recipes

<!-- requirements: #7 -->

The `/recipes/` page lists recipes shared by the guild. Recipes are loaded live from the guild's database each time you visit, so anything newly added by an admin shows up right away — no need to wait for a site update. Each recipe in the list is a fixed category from: Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, or Other, along with its title and short summary, so you can scan for something that fits what you're working on. Click a recipe to open its full detail page.

[↑ Back to table of contents](#table-of-contents)

## Viewing a Recipe

<!-- requirements: #7, #9 -->

Clicking into a recipe takes you to its detail page, which shows the full recipe: the title, category, short summary, ingredients, instructions, and — if the person who submitted it chose to include one — a submitted-by name. Ingredients and instructions are shown as plain text lists rather than fancy structured steps, so they're easy to read straight through or copy into your own notes. Because each recipe's page is loaded by an ID in the page's URL rather than being a separate pre-built page, links to specific recipes will only work if you got them from the site itself (e.g., by clicking through from the recipe list) rather than guessing a URL.

[↑ Back to table of contents](#table-of-contents)

## Logging In as an Admin

<!-- requirements: #8 -->

Recipe submission is limited to guild admins. To get to the login screen, visit `/admin/` directly or click the "Admin" link in the site footer. Enter the shared admin password when prompted — this isn't a personal account with your own username, it's a single password shared among whoever the guild has designated as able to add recipes. If you don't know the current password, ask whoever manages the guild's admin access. Once logged in, you'll be able to access the recipe submission form described below. A successful login only proves you know the current password — it doesn't identify you personally, so there's no per-person history of who added what.

[↑ Back to table of contents](#table-of-contents)

## Adding a New Recipe

<!-- requirements: #8, #9 -->

After logging in at `/admin/`, you'll see a form for submitting a new recipe. Fill in:

- **Title** — the name of the recipe.
- **Category** — pick one from the fixed list: Beer, Wine, Bread & Sourdough, Vegetables & Pickles, Kombucha, Cheese, or Other.
- **Short summary** — a brief description shown in the recipe list.
- **Ingredients** — type each ingredient on its own line.
- **Instructions** — type each step on its own line.
- **Submitted by** (optional) — a name to credit, if you want one shown on the recipe.

Submit the form and the recipe is saved immediately to the guild's shared recipe database — it will appear on `/recipes/` and be viewable on its own detail page right away, with no need to rebuild or redeploy the site.

[↑ Back to table of contents](#table-of-contents)

