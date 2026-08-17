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

The Heartland Fermenters Guild website is the public face of a real-world community of home brewers, bakers, picklers, and cheesemakers — a place people can be pointed to from social media or in person to learn what the guild is and how to get involved. Today that means a single landing page; over time it's meant to grow into a fuller site with event info, recipes/resources, and an About/history page, and eventually a members-only area for guild-specific content. This manual covers the site as it exists today: what a visitor sees and does on the landing page, and what the person maintaining the site does to publish changes and keep the repository and domain running.

## Table of Contents

- [Visiting the Landing Page](#visiting-the-landing-page)
- [Publishing Updates to the Site](#publishing-updates-to-the-site)
- [Accessing the Site at Its Custom Domain](#accessing-the-site-at-its-custom-domain)
- [Repository Access and Permissions](#repository-access-and-permissions)

## Visiting the Landing Page
<!-- requirements: #5 -->

When you go to the site, you'll land on a single welcoming page built around four things: a header banner image at the top, the guild's circular crest logo, a short welcome paragraph explaining what the guild is and who it's for, and a "Join the Conversation" section. That last section is where you connect with the actual community — it links out to the guild's email address, its Facebook Page, its separate Facebook Group, its Instagram, and its Meetup. Click any of those links to leave the site and go straight to that platform; there's nothing to log into or configure on the landing page itself, it's purely a jumping-off point.

[↑ Back to table of contents](#table-of-contents)

## Publishing Updates to the Site
<!-- requirements: #2 -->

If you maintain the site's content or code, publishing a change is intentionally hands-off: make your edits, commit them, and push (or merge) to the `main` branch. That push automatically triggers a GitHub Actions workflow (built on `withastro/action`) that builds the site and deploys it to GitHub Pages — there's no separate manual build step and nothing to upload yourself. Watch the Actions tab in the GitHub repo if you want to confirm a deploy succeeded; once it finishes, the live site at the guild's domain reflects your change.

[↑ Back to table of contents](#table-of-contents)

## Accessing the Site at Its Custom Domain
<!-- requirements: #3 -->

The site lives at `heartlandfermentersguild.org`. The domain is registered and its DNS is managed on Porkbun: A records point the bare domain at GitHub Pages' IP addresses, and a `www` CNAME handles the `www` subdomain. Nameservers are kept on Porkbun (`*.ns.porkbun.com`) rather than moved to a third party, so day-to-day this is nothing you need to touch — typing `heartlandfermentersguild.org` (with or without `www`) into a browser takes you straight to the GitHub Pages–hosted site. If you're the one managing DNS, any record changes are made directly in the Porkbun dashboard.

[↑ Back to table of contents](#table-of-contents)

## Repository Access and Permissions
<!-- requirements: #4 -->

The project's code lives in a public GitHub repo, `heartland-fermenters-guild`, made public so GitHub Pages hosting doesn't require a paid plan. Because it's public, access is locked down deliberately: BubbaF377 is the sole collaborator, and the `main` branch has protections in place — no force-pushes, no deleting the branch, and pull request conversations must be resolved before a merge is allowed. There's also a repository ruleset covering release tags: anyone without the admin role is blocked from creating, updating, or deleting `v*` tags. In practice, this means routine contribution and release-tagging work is restricted to the admin, and pull requests need their review comments addressed before they can merge.

[↑ Back to table of contents](#table-of-contents)

