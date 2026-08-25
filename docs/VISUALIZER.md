<!-- devlore:visualizer source-hash:3458f76c4608c85a10ca53ca5f52612dedb61408879b777a49ad71c827f49fb7 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this diagram automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's diagrammed, update `docs/PRODUCT.md` itself.

Since a codebase snapshot is provided, the diagrams below reflect the actual file/module layout described (pages, layout, lib modules, tests) alongside the external services and tooling connections named in the docs.

This diagram shows how the Astro pages, shared layout, and the two `src/lib` modules relate to each other inside the repo, plus how the test suites target each layer.

```mermaid
graph TD
    Layout["src/layouts/Layout.astro<br/>(header/nav/footer, social links,<br/>Starter Culture Studio credit)"]

    IndexPage["src/pages/index.astro<br/>(landing page)"]
    RecipesList["src/pages/recipes/index.astro<br/>(recipe list, category field only)"]
    RecipeView["src/pages/recipes/view.astro<br/>(single recipe via ?slug=)"]
    AdminPage["src/pages/admin/index.astro<br/>(login + add/edit/delete recipe form)"]
    NotFound["src/pages/404.astro"]

    Constants["src/lib/constants.js<br/>(categories, admin email,<br/>time-stage suggestions, slugify,<br/>list/newline parsing, YouTube ID parsing)"]
    SupabaseClient["src/lib/supabase.js<br/>(browser Supabase client,<br/>publishable key, env vars)"]

    Schema["supabase/schema.sql<br/>(recipes table, RLS policies,<br/>recipe-photos bucket + policies)"]

    IndexPage --> Layout
    RecipesList --> Layout
    RecipeView --> Layout
    AdminPage --> Layout
    NotFound --> Layout

    RecipesList --> SupabaseClient
    RecipeView --> SupabaseClient
    AdminPage --> SupabaseClient

    RecipesList --> Constants
    RecipeView --> Constants
    AdminPage --> Constants

    SupabaseClient -. "reads/writes governed by" .-> Schema

    VitestTest["src/lib/constants.test.js<br/>(Vitest)"] --> Constants
    PlaywrightTests["tests/e2e/*.spec.js<br/>(Playwright, against build+preview)"] --> IndexPage
    PlaywrightTests --> RecipesList
    PlaywrightTests --> RecipeView
    PlaywrightTests --> AdminPage
    MockSupabase["tests/e2e/mock-supabase.js<br/>(page.route() network mocks)"] --> PlaywrightTests
```

This diagram shows the outside services the live site talks to directly from the browser (no backend server of its own), plus the deploy/DNS chain that gets it onto the internet.

```mermaid
graph LR
    Browser["Site code running<br/>in visitor's/admin's browser"]

    SupaAuth["Supabase Auth<br/>(single admin@heartlandfermentersguild.org user)"]
    SupaDB["Supabase Postgres<br/>(recipes table, via REST/PostgREST,<br/>RLS-enforced)"]
    SupaStorage["Supabase Storage<br/>(recipe-photos public bucket)"]
    YouTube["YouTube<br/>(video embed via extracted video ID)"]
    SCS["starterculturestudio.com<br/>(footer logo link only)"]

    Browser -->|"login (Req #8)"| SupaAuth
    Browser -->|"read/write recipes"| SupaDB
    Browser -->|"upload/read recipe photos"| SupaStorage
    Browser -->|"render embedded video"| YouTube
    Browser -->|"outbound link"| SCS

    GHActions["GitHub Actions<br/>(withastro/action,<br/>triggered by v*.*.* tag push<br/>or manual dispatch)"]
    GHPages["GitHub Pages<br/>(static hosting)"]
    Porkbun["Porkbun DNS<br/>(A records + www CNAME,<br/>nameservers *.ns.porkbun.com,<br/>resolution backend on Cloudflare)"]
    Domain["heartlandfermentersguild.org"]

    GHActions -->|"astro build + deploy"| GHPages
    GHPages -->|"serves built site"| Browser
    Porkbun -->|"resolves domain to GH Pages IPs"| Domain
    Domain --> GHPages
```

The docs describe one real cross-repo connection — this project links to the external Devlore documentation tool via its workflows — so that's shown here rather than speculating about any other linked project.

```mermaid
graph TD
    ProductDoc["docs/PRODUCT.md<br/>(hand-edited source of truth)"]
    DevloreWorkflows[".github/workflows/devlore*.yml<br/>(devlore.yml, devlore-analyze.yml,<br/>devlore-release.yml)"]
    Devlore["Devlore<br/>(external, cross-project<br/>documentation automation tool)"]
    TestPlan["docs/TEST_PLAN.md<br/>(machine-generated)"]
    UserManual["docs/USER_MANUAL.md<br/>(machine-generated)"]
    Visualizer["docs/VISUALIZER.md<br/>(machine-generated)"]

    ProductDoc --> DevloreWorkflows
    DevloreWorkflows -->|"invokes"| Devlore
    Devlore -->|"generates/maintains"| TestPlan
    Devlore -->|"generates/maintains"| UserManual
    Devlore -->|"generates/maintains"| Visualizer

    Repo["heartland-fermenters-guild repo<br/>(public, linked via<br/>create-new-project wizard)"] --> Devlore
```
