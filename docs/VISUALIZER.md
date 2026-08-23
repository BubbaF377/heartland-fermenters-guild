<!-- devlore:visualizer source-hash:5633442e5406f0981136f58b9ad83fda94cc061088ed6f6d6fe3d8bc2002e921 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this diagram automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's diagrammed, update `docs/PRODUCT.md` itself.

Internal structure: how the Astro pages, the shared layout, and the Supabase schema file relate to each other within the repo.

```mermaid
flowchart TD
    Layout["src/layouts/Layout.astro<br/>(head/fonts/styles, shared footer:<br/>copyright + Admin link + Starter Culture Studio logo link)"]

    Index["src/pages/index.astro<br/>(landing page: banner image, welcome paragraph,<br/>'Join the Conversation' links)"]
    RecipesList["src/pages/recipes/index.astro<br/>(lists recipes, calls Supabase from browser)"]
    RecipeView["src/pages/recipes/view.astro<br/>(single recipe template, driven by ?slug= query string)"]
    Admin["src/pages/admin/ (/admin/)<br/>(login gate + recipe creation form)"]
    NotFound["src/pages/404.astro"]

    Schema["supabase/schema.sql<br/>(tables + Row Level Security policies)"]

    Index --> Layout
    RecipesList --> Layout
    RecipeView --> Layout
    Admin --> Layout
    NotFound --> Layout

    RecipesList -. "reads recipe rows (per RLS)" .-> Schema
    RecipeView -. "reads one recipe by slug (per RLS)" .-> Schema
    Admin -. "inserts recipe rows (per RLS, post-login)" .-> Schema
```

External dependencies: the outside services the static site talks to directly from the browser, plus the DNS/hosting chain that makes the domain work.

```mermaid
flowchart LR
    Browser["Visitor's browser<br/>(static Astro pages)"]

    subgraph Supabase["Supabase (managed Postgres)"]
        SupaAuth["Supabase Auth<br/>(single shared admin@heartlandfermentersguild.org user)"]
        SupaDB["Supabase Postgres API<br/>(RLS-protected tables)"]
    end

    GHPages["GitHub Pages<br/>(static hosting)"]
    Porkbun["Porkbun DNS<br/>(A records + www CNAME → GitHub Pages IPs;<br/>nameservers stay on Porkbun)"]

    Email["Email link"]
    FBPage["Facebook Page"]
    FBGroup["Facebook Group"]
    Instagram["Instagram"]
    Meetup["Meetup"]
    SCS["starterculturestudio.com"]

    Browser -- "loads site" --> GHPages
    Porkbun -- "resolves heartlandfermentersguild.org" --> GHPages

    Browser -- "recipes/admin: fetch via publishable key" --> SupaDB
    Browser -- "admin login (server-side password check)" --> SupaAuth

    Browser -- "Join the Conversation links" --> Email
    Browser -- "Join the Conversation links" --> FBPage
    Browser -- "Join the Conversation links" --> FBGroup
    Browser -- "Join the Conversation links" --> Instagram
    Browser -- "Join the Conversation links" --> Meetup
    Browser -- "footer logo link" --> SCS
```

Other linked project: the repo's real, documented connection to Devlore, which treats `docs/PRODUCT.md` as source-of-truth and drives its own automation and generated docs from it, separate from the site's own deploy pipeline.

```mermaid
flowchart TD
    ProductDoc["docs/PRODUCT.md<br/>(hand-edited source of truth)"]

    subgraph RepoAutomation["Repo's GitHub Actions"]
        DeployWF[".github/workflows/deploy.yml<br/>(withastro/action, triggered by v*.*.* tag push or workflow_dispatch)"]
        DevloreWF[".github/workflows/devlore.yml"]
        DevloreAnalyzeWF[".github/workflows/devlore-analyze.yml"]
        DevloreReleaseWF[".github/workflows/devlore-release.yml"]
    end

    GHPages["GitHub Pages<br/>(heartlandfermentersguild.org)"]
    Devlore["Devlore<br/>(external documentation tool)"]
    GeneratedDocs["docs/TEST_PLAN.md<br/>docs/USER_MANUAL.md<br/>docs/VISUALIZER.md<br/>(auto-generated, not hand-edited)"]

    ProductDoc -- "read as source-of-truth context" --> Devlore
    DevloreWF -- "sync/logging" --> Devlore
    DevloreAnalyzeWF -- "analysis" --> Devlore
    DevloreReleaseWF -- "release-tag driven (v*.*.* pattern)" --> Devlore
    Devlore -- "generates" --> GeneratedDocs

    DeployWF -- "builds & deploys on v*.*.* tag" --> GHPages
```
