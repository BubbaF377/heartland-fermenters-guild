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

`npm run dev` talks to the real Firebase project. To work against local, throwaway
data instead, run `npm run dev:emulators`. It starts the Firebase Local Emulator
Suite (Auth, Firestore, Storage, plus its web UI at http://127.0.0.1:4000 for
poking at data and reading "sent" login emails) and serves the site pointed at it.
The emulators need **Java 21+** installed (`brew install openjdk@21` on macOS).

## Tests

```sh
npm run test:unit    # Vitest: pure helpers in src/lib/constants.js
npm run test:rules   # firestore.rules + storage.rules, against the emulators
npm run test:e2e     # Playwright: built site against the emulators
npm test             # all three
```

`test:rules` and `test:e2e` start the emulators themselves, so they need Java too.
No real Firebase project or secrets are involved. CI (`.github/workflows/test.yml`)
runs all three on every PR and push to `main`.

## Deployment

Deploy only triggers on a `v*.*.*` release tag (`.github/workflows/deploy.yml`), or
manually via `workflow_dispatch` — pushing to `main` alone does not deploy. Cut a
release with `git tag vX.Y.Z && git push origin vX.Y.Z`; the workflow builds the site
with the official `withastro/action` and publishes it to GitHub Pages, no manual
build/upload step needed. (`.github/workflows/test.yml` is separate and unrelated —
it runs the test suite on every PR/push to `main` as a quality gate, but doesn't
deploy anything.)

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

## Recipes, admin & members (Firebase) setup

Recipes live in [Firebase](https://firebase.google.com): Cloud Firestore for the
data, Firebase Authentication for logins, and Cloud Storage for recipe photos. The
browser reads and writes them directly, so there's no server of our own to run.
Content reaches the site two ways: a password-gated admin can add, edit, delete, or
deactivate a recipe directly, or an active guild member can submit one for admin
approval. One-time setup:

1. **Create a Firebase project** in the [Firebase console](https://console.firebase.google.com).
   Google Analytics isn't needed.
2. **Upgrade to the Blaze (pay-as-you-go) plan and set a budget alert.** Cloud Storage
   (recipe photos) isn't available on the free Spark plan. Blaze keeps the same
   no-cost usage allowance, and a guild-sized site should stay well inside it. In the
   Google Cloud console under **Billing → Budgets & alerts**, add a budget (e.g. $1)
   so any unexpected charge sends an email.
3. **Create the Firestore database** (**Build → Firestore Database → Create
   database**, production mode) and **the Storage bucket** (**Build → Storage → Get
   started**). Pick a US location for both.
4. **Turn on sign-in methods**: **Build → Authentication → Sign-in method**. Enable
   **Email/Password** and, inside it, **Email link (passwordless sign-in)**. Then on the
   **Settings** tab, under **Authorized domains**, add `heartlandfermentersguild.org` so members'
   login links can return there (`localhost` is already listed).
5. **Create the one shared admin login, before deploying the rules.** Admin has no
   per-person accounts: anyone who knows the password has full admin access, per the
   requirement. Under **Authentication → Users → Add user**, use
   `admin@heartlandfermentersguild.org`. That exact address is hardcoded in
   `src/lib/constants.js`, `firestore.rules`, and `storage.rules`; it isn't a secret.
   Pick a password and share it with whoever should have admin access. To change who
   can log in later, change this password. Create this user first: the rules grant
   admin to whoever holds that email, so until the account exists, anyone could
   register it.
6. **Copy the web config into the code.** Under **Project settings → General → Your
   apps**, add a Web app. Copy its config values into `PRODUCTION_CONFIG` in
   `src/lib/firebase.js` (already done for the `heartland-fermenters-guild` project).
   These values only identify the project and are safe to commit. Access control comes from the rules below, so nothing needs to go into
   `.env` or GitHub Actions secrets.
7. **Deploy the rules and index**: run `npx firebase login`, then
   `npx firebase deploy --only firestore,storage` (`.firebaserc` points it at the
   `heartland-fermenters-guild` project). This
   uploads `firestore.rules`, `storage.rules`, and the composite index in
   `firestore.indexes.json` that the public recipe list's query needs. Re-run it
   whenever any of those files change. They are not deployed by the GitHub Pages
   workflow.
8. **Optional: brand the login email.** Under **Authentication → Templates**, set the
   sender name, reply-to address, and subject. Sending from the guild's own domain
   takes a separate custom-domain setup (see docs/PRODUCT.md, Open questions).

Once that's done: `/recipes/` lists every **published** recipe,
`/recipes/view?slug=...` renders one from a shared template (a query-string slug
rather than a path segment like `/recipes/my-recipe/`, since GitHub Pages can only
serve pre-built static files — there's no way to pre-build a page per recipe
that updates without a redeploy, and recipes are meant to appear instantly once
approved). `/admin/` is the password-gated panel: a Pending Recipes queue
(Approve/Reject), the Recipes list (Edit/Deactivate/Delete), a Members list (add by
email, Deactivate/Reactivate), and the add-a-recipe form. `/submit/` is where an
active member logs in by email (a one-time login link, no password to set) and submits a
recipe, which lands as `pending` — invisible on the public site until an admin
approves it from `/admin/`.

## Project structure

```
src/
  layouts/Layout.astro     shared <head>, nav, footer, fonts, global styles
  lib/constants.js         admin email, recipe categories, time-stage suggestions, slugify/list/YouTube-ID helpers (no Firebase import)
  lib/firebase.js          Firebase app + web config, emulator switch, photo/slug-safe-create helpers (client-side only)
  lib/recipe-form.js       shared recipe-form logic (stage editor, field reading) used by admin and /submit/
  pages/index.astro        the landing page
  pages/recipes/index.astro  recipe list (published only, fetched from Firestore client-side)
  pages/recipes/view.astro   single-recipe template (?slug=... = the Firestore document ID)
  pages/admin/index.astro  password login; pending-recipe review, recipes, and members management
  pages/submit/index.astro  member email-link login + recipe submission (lands as pending)
  pages/404.astro          not-found page
public/
  assets/                 logo, header banner, favicons
  CNAME                   custom domain for GitHub Pages
  robots.txt
firestore.rules           who can read/write recipes and the active_members roster (isAdmin()/isActiveMember())
storage.rules             who can view/upload/delete recipe photos
firestore.indexes.json    composite index for the public recipe list query
firebase.json             ties the above together + emulator ports
tests/e2e/                Playwright specs; emulator.js seeds/reads the emulators
tests/rules/              Security Rules tests
.github/workflows/deploy.yml   CI build + deploy (tag-only)
.github/workflows/test.yml     CI test suite (every PR/push to main)
```

## Roadmap

- [x] Landing page: header image, welcome text, guild links
- [x] Recipes section (Firebase-backed, template-driven)
- [x] Password-gated admin: add/edit/delete/deactivate recipes
- [x] Member accounts (email login link) that can submit a recipe for admin approval
      — experimental, may not launch (see docs/PRODUCT.md Requirement #16)
- [ ] Full info site (About, Events)
- [ ] Auth-protected members-only *content* section (gating actual pages, beyond recipe submission)

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
