<!-- devlore:visualizer source-hash:b0a4293e3476ff1d2cd052d851cf191ff34e61ac08105d967f201fe544c46ffd -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this diagram automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's diagrammed, update `docs/PRODUCT.md` itself.

Two caveats before the diagrams: the codebase snapshot only shows the pre-recipes landing-page skeleton (`Layout.astro`, `index.astro`, `404.astro`, deploy/Devlore workflows) — the recipes/admin/Supabase pieces from PRODUCT.md Requirements #7–14 aren't reflected in any file listing I have, so the internal-structure diagram below is reconstructed from PRODUCT.md's description of routes and behavior, not from verified source files.

This first diagram shows how the site's own pages relate: the shared layout wrapping every page, the static landing page, and the recipes/admin pages that PRODUCT.md describes as browser-driven Supabase clients.

```mermaid
graph TD
    Layout["src/layouts/Layout.astro<br/>(shared head/fonts/footer)"]
    Index["src/pages/index.astro<br/>(landing page)"]
    NotFound["src/pages/404.astro"]
    RecipesList["/recipes/<br/>(recipe list page)"]
    RecipeView["/recipes/view?slug=...<br/>(single template, slug-driven)"]
    Admin["/admin/<br/>(login + add/edit recipe form + recipe list w/ Edit-Delete)"]
    Schema["supabase/schema.sql<br/>(RLS policies for recipes table + recipe-photos bucket)"]

    Layout --> Index
    Layout --> NotFound
    Layout --> RecipesList
    Layout --> RecipeView
    Layout --> Admin

    RecipesList -->|"link to detail via ?slug="| RecipeView
    Admin -->|"defines allowed access patterns for"| Schema
    RecipesList -.->|"reads under"| Schema
    RecipeView -.->|"reads under"| Schema
```

This second diagram shows the outside services and destinations the site talks to directly from the browser (no backend of its own), plus the deploy and DNS chain.

```mermaid
graph LR
    Browser["Site pages (client-side JS)"]

    subgraph Supabase["Supabase (managed Postgres)"]
        AuthSvc["Supabase Auth<br/>(single shared admin@... user)"]
        DB["Postgres: recipes table<br/>(publishable key + RLS)"]
        Storage["Supabase Storage:<br/>recipe-photos bucket"]
    end

    YouTube["YouTube<br/>(video_url embed, ID extracted client-side)"]

    Browser -->|"login (server-side password check)"| AuthSvc
    Browser -->|"select/insert/update/delete recipes"| DB
    Browser -->|"admin-only upload / public read / admin-only delete"| Storage
    Browser -->|"embed how-to video"| YouTube

    Index2["Landing page 'Join the Conversation'"]
    Index2 -->|"mailto link"| Email["Email"]
    Index2 -->|"link out"| FBPage["Facebook Page"]
    Index2 -->|"link out"| FBGroup["Facebook Group"]
    Index2 -->|"link out"| Instagram["Instagram"]
    Index2 -->|"link out"| Meetup["Meetup"]

    Footer["Shared footer (Layout.astro)"] -->|"logo link"| SCS["starterculturestudio.com"]

    GHActions["GitHub Actions<br/>(withastro/action, on v*.*.* tag or manual dispatch)"] -->|"build & deploy"| GHPages["GitHub Pages"]
    Porkbun["Porkbun DNS<br/>(nameservers + A/CNAME records)"] -->|"resolves to"| GHPages
    Porkbun -.->|"DNS-answering backend only, not a proxy"| Cloudflare["Cloudflare (DNS resolution infra)"]
```

This third diagram covers the one other real cross-project connection described in the docs: the Devlore tooling that reads this repo's `docs/PRODUCT.md` and drives its own generated docs and release workflow.

```mermaid
graph TD
    ProductDoc["docs/PRODUCT.md<br/>(hand-edited source of truth)"]
    Devlore["Devlore<br/>(separate documentation/automation tool)"]

    TestPlan["docs/TEST_PLAN.md (generated)"]
    UserManual["docs/USER_MANUAL.md (generated)"]
    Visualizer["docs/VISUALIZER.md (generated)"]

    WfSync[".github/workflows/devlore.yml"]
    WfAnalyze[".github/workflows/devlore-analyze.yml"]
    WfRelease[".github/workflows/devlore-release.yml"]

    ProductDoc -->|"read as source of truth"| Devlore
    Devlore -->|"generates"| TestPlan
    Devlore -->|"generates"| UserManual
    Devlore -->|"generates"| Visualizer
    WfSync -->|"syncs/logs to"| Devlore
    WfAnalyze -->|"triggers analysis in"| Devlore
    WfRelease -->|"listens for same v*.*.* tag pattern as site deploy"| Devlore
```
