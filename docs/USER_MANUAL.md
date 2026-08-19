<!-- devlore:user-manual source-hash:195a9cdbd632ce91774abfc81be0b88c222d9eb40bfacdaaf82e528ad6731343 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this user manual automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's documented, update `docs/PRODUCT.md` itself.
<!-- devlore:user-manual requirement-hashes
1=8c6a5f4fb077
2=1df8dc66bebe
3=c1a27b1ede7c
4=d62dbc43a89f
5=93b096f790ce
6=9dfd0e0e55c8
-->

The Heartland Fermenters Guild website is the public home for a real-world community of home brewers, bakers, picklers, and cheesemakers, reachable at `heartlandfermentersguild.org`. Today it's a single landing page meant to welcome newcomers and point them toward the guild's social channels; over time it will grow into a fuller site. This manual is for two kinds of people: guild members and prospective members visiting the site to learn about the group and connect with it, and the site's maintainer(s) who push updates and manage the underlying GitHub repository.

## Table of Contents

- [Visiting the Landing Page](#visiting-the-landing-page)
- [Joining the Conversation](#joining-the-conversation)
- [Finding the Site at Its Custom Domain](#finding-the-site-at-its-custom-domain)
- [Publishing Updates to the Site](#publishing-updates-to-the-site)
- [Repository Access and Contribution Rules](#repository-access-and-contribution-rules)

## Visiting the Landing Page
<!-- requirements: #5 -->

When you go to `heartlandfermentersguild.org`, you land on a single welcoming page designed to be shared on social media or given out in person. At the top is a header banner image, followed by the guild's circular crest logo. Below that is a short welcome paragraph explaining what the Heartland Fermenters Guild is and who it's for — home brewers, bakers, picklers, and cheesemakers looking for a community. There's nothing to log into or configure here; the page is meant to be read in a minute and used as a jumping-off point to the guild's other channels.

[↑ Back to table of contents](#table-of-contents)

## Joining the Conversation
<!-- requirements: #5 -->

Further down the landing page is a "Join the Conversation" section, which is the main call to action for visitors. From here you can click through to:

- An email link to contact the guild directly.
- The guild's Facebook Page.
- The guild's Facebook Group.
- The guild's Instagram.
- The guild's Meetup listing.

If you're new to the guild, this is the fastest way to find where the community is actually active day-to-day and to introduce yourself. If you're an existing member, these are the same channels you'd already be using — the landing page just collects them in one place so they're easy to hand to someone new.

[↑ Back to table of contents](#table-of-contents)

## Finding the Site at Its Custom Domain
<!-- requirements: #3 -->

The site lives at the custom domain `heartlandfermentersguild.org`, so that's the address to share instead of a generic hosting URL. The domain is registered and managed through Porkbun. Visitors don't need to do anything special — typing or clicking the domain takes you straight to the current landing page — but if you're the one managing the site's DNS, be aware that Porkbun's DNS records point directly at GitHub Pages' hosting IPs (with a `www` record included as well), and nameserver management stays with Porkbun rather than a third party. This means visiting the plain domain or the `www` version both land you on the same site.

[↑ Back to table of contents](#table-of-contents)

## Publishing Updates to the Site
<!-- requirements: #2 -->

If you're the maintainer making changes to the site (editing page content, swapping images, etc.), publishing is automatic: every push to the `main` branch of the repository triggers a build and deploy of the site with no manual build or upload step required. In practice this means your workflow is simply to make your changes, commit them, and push (or merge a pull request) into `main` — within a short time, the live site at `heartlandfermentersguild.org` reflects the update. There's no separate "publish" button or manual file upload to remember.

[↑ Back to table of contents](#table-of-contents)

## Repository Access and Contribution Rules
<!-- requirements: #4 -->

The project's source code lives in a public GitHub repository named `heartland-fermenters-guild`. It's public so the site can be hosted on GitHub Pages without a paid plan, and since the repository contains no secrets, this is considered an acceptable tradeoff — but access to *changing* the site is still tightly controlled. If you're looking to contribute or check on the project's guardrails:

- Only one collaborator (BubbaF377) has write access to the repository.
- The `main` branch is protected: changes can't be force-pushed or have the branch deleted, and any open review conversations on a pull request must be resolved before it can be merged.
- A separate repository ruleset prevents anyone without the admin role from creating, updating, or deleting release tags (tags matching `v*`).

For most visitors and guild members this is invisible — it simply means the live site can be trusted to reflect deliberate, reviewed changes rather than accidental or unauthorized ones.

[↑ Back to table of contents](#table-of-contents)

