# Heartland Fermenters Guild

The guild's website — built with [Astro](https://astro.build), deployed to GitHub Pages,
served at [heartlandfermentersguild.org](https://heartlandfermentersguild.org) via Porkbun DNS.

## Local development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to ./dist
npm run preview   # serve the production build locally
```

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site with
the official `withastro/action` and publishes it to GitHub Pages. No manual build/upload
step is needed.

One-time repo setup on GitHub:

1. **Settings → Pages → Build and deployment → Source**: set to **GitHub Actions**.
2. **Settings → Pages → Custom domain**: enter `heartlandfermentersguild.org` and save
   (this repo already ships a `public/CNAME` file with that value, so GitHub should
   pick it up automatically — but setting it here too lets GitHub manage the HTTPS
   certificate and confirms DNS).
3. Once DNS (below) resolves, check **Enforce HTTPS** in the same settings panel.

## Porkbun DNS setup

In the Porkbun dashboard, under the domain's **DNS Records**, add:

| Type  | Host | Answer                  |
|-------|------|--------------------------|
| A     | @    | 185.199.108.153          |
| A     | @    | 185.199.109.153          |
| A     | @    | 185.199.110.153          |
| A     | @    | 185.199.111.153          |
| CNAME | www  | `<your-github-username>.github.io` |

Those four A records are GitHub Pages' current apex-domain IPs (verify against
[GitHub's Pages custom-domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
before adding, in case they've changed). The CNAME on `www` lets `www.heartlandfermentersguild.org`
redirect to the apex domain as well.

DNS propagation can take anywhere from a few minutes to 24 hours.

## Project structure

```
src/
  layouts/Layout.astro   shared <head>, fonts, global styles
  pages/index.astro      the landing page
  pages/404.astro        not-found page
public/
  assets/                logo, header banner, favicons
  CNAME                  custom domain for GitHub Pages
  robots.txt
.github/workflows/deploy.yml   CI build + deploy
```

## Roadmap

- [x] Landing page: header image, welcome text, guild links
- [ ] Full info site (About, Events, Recipes/Resources)
- [ ] Auth-protected members-only section

## Devlore

This repo is linked to [Devlore](../devlore), Christian's cross-project documentation
tool — set up via Devlore's create-new-project wizard, which is where `docs/PRODUCT.md`,
`docs/TEST_PLAN.md`, `docs/USER_MANUAL.md`, `docs/VISUALIZER.md`, and the
`.github/workflows/devlore*.yml` files came from.

- `docs/PRODUCT.md` is the living discovery/requirements doc for this project — edit it
  directly as decisions firm up.
- `docs/TEST_PLAN.md`, `docs/USER_MANUAL.md`, and `docs/VISUALIZER.md` are machine-generated
  from `docs/PRODUCT.md`'s Requirements section and kept in sync automatically on every push
  — don't hand-edit them, they'll be overwritten.
- `.github/workflows/devlore.yml` drafts a documentation log entry into the Devlore vault on
  every push; `devlore-release.yml` consolidates docs on a `v*.*.*` tag; `devlore-analyze.yml`
  is the one-time codebase snapshot.
- This is separate from `.github/workflows/deploy.yml` above, which handles the actual site
  build/deploy and has nothing to do with Devlore.
