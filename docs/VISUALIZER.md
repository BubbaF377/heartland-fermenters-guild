<!-- devlore:visualizer source-hash:980aed6e57a22c09431b1187fc6942e3ee95d23d1a284da6d7a1771e592cd3d0 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this diagram automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's diagrammed, update `docs/PRODUCT.md` itself.

Since a codebase snapshot is included, these diagrams are grounded in both the snapshot and `PRODUCT.md`.

This diagram shows how the site's own Astro pages, shared layout, and `src/lib` helper modules relate to each other, plus the schema file that defines the database shape they talk to.

```mermaid
graph TD
    Layout["src/layouts/Layout.astro<br/>(nav, footer, social links)"]

    Index["src/pages/index.astro<br/>(landing page)"]
    RecipesList["src/pages/recipes/index.astro<br/>(recipe list, filters TBD)"]
    RecipeView["src/pages/recipes/view.astro<br/>(?slug= detail page)"]
    AdminPage["src/pages/admin/index.astro<br/>(login, add/edit/delete recipes,<br/>members list, pending queue)"]
    SubmitPage["src/pages/submit/index.astro<br/>(member magic-link login + submit form)"]
    NotFound["src/pages/404.astro"]

    Constants["src/lib/constants.js<br/>(categories, slugify, time-stage suggestions,<br/>admin email — no Supabase import)"]
    SupabaseClient["src/lib/supabase.js<br/>(browser Supabase client, env vars)"]
    RecipeForm["src/lib/recipe-form.js<br/>(shared form logic: time-stage editor,<br/>field reading, photo upload)"]

    Schema["supabase/schema.sql<br/>(recipes table, status column,<br/>active_members, RLS policies,<br/>is_admin()/is_active_member() fns,<br/>recipe-photos bucket policies)"]

    Index --> Layout
    RecipesList --> Layout
    RecipeView --> Layout
    AdminPage --> Layout
    SubmitPage --> Layout
    NotFound --> Layout

    RecipesList --> SupabaseClient
    RecipesList --> Constants
    RecipeView --> SupabaseClient
    RecipeView --> Constants

    AdminPage --> SupabaseClient
    AdminPage --> Constants
    AdminPage --> RecipeForm

    SubmitPage --> SupabaseClient
    SubmitPage --> Constants
    SubmitPage --> RecipeForm

    SupabaseClient -.enforced by.-> Schema

    ConstTest["src/lib/constants.test.js<br/>(Vitest)"] --> Constants
    E2E["tests/e2e/*.spec.js<br/>(Playwright, against build+preview)"] --> AdminPage
    E2E --> SubmitPage
    E2E --> RecipesList
    E2E --> RecipeView
    MockSupabase["tests/e2e/mock-supabase.js<br/>(page.route() network mocks)"] --> E2E
```

This diagram shows the outside services and third-party destinations the site talks to at runtime and at deploy time — there's no backend of its own, so the browser calls Supabase directly.

```mermaid
graph LR
    Browser["Visitor's browser<br/>(runs Astro-rendered pages)"]

    subgraph Supabase["Supabase (managed Postgres + Auth + Storage)"]
        SupaAuth["Supabase Auth<br/>(admin password login;<br/>member email magic link)"]
        SupaDB["Postgres<br/>recipes, active_members<br/>(RLS-gated)"]
        SupaStorage["Storage bucket<br/>recipe-photos<br/>(public read, admin write/delete)"]
    end

    YouTube["YouTube<br/>(video_url embeds, ID extracted at render)"]
    SCS["starterculturestudio.com<br/>(footer logo link only)"]
    Social["Email / Facebook Page /<br/>Facebook Group / Instagram / Meetup<br/>(Join the Conversation links)"]

    Browser -->|"admin login / member OTP login"| SupaAuth
    Browser -->|"select/insert/update/delete recipes,<br/>active_members via publishable key"| SupaDB
    Browser -->|"upload/read/delete recipe photos"| SupaStorage
    Browser -->|"embed via extracted video ID"| YouTube
    Browser -->|"logo click-through"| SCS
    Browser -->|"click-through"| Social

    GHActions["GitHub Actions<br/>(withastro/action)"]
    GHPages["GitHub Pages<br/>(static hosting)"]
    Porkbun["Porkbun DNS<br/>(A records + www CNAME,<br/>nameservers stay on Porkbun;<br/>resolution backend on Cloudflare,<br/>not a traffic proxy)"]

    GHActions -->|"build on v*.*.* tag push<br/>or workflow_dispatch"| GHPages
    GHPages -->|"served at heartlandfermentersguild.org"| Porkbun
    Porkbun -->|"resolves to"| GHPages
    Browser -->|"HTTP"| GHPages
```

This diagram shows Devlore, the one external, cross-project tool with a real described connection to this repo — it isn't part of the shipped site, but it reads and generates project docs via dedicated workflows.

```mermaid
graph LR
    ProductDoc["docs/PRODUCT.md<br/>(hand-edited source of truth)"]
    Repo["heartland-fermenters-guild repo<br/>(public on GitHub)"]

    subgraph DevloreWorkflows[".github/workflows/devlore*.yml"]
        DevloreMain["devlore.yml"]
        DevloreAnalyze["devlore-analyze.yml"]
        DevloreRelease["devlore-release.yml"]
    end

    Devlore["Devlore<br/>(external documentation automation tool)"]

    Generated["Generated docs:<br/>docs/TEST_PLAN.md<br/>docs/USER_MANUAL.md<br/>docs/VISUALIZER.md"]

    ProductDoc --> DevloreWorkflows
    DevloreWorkflows --> Devlore
    Devlore -->|"builds/answers questions from"| ProductDoc
    Devlore -->|"maintains"| Generated
    Devlore -.->|"release tag pattern v*.*.* shared with"| Repo
    Repo --> DevloreWorkflows
```
