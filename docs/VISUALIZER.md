<!-- devlore:visualizer source-hash:59f165593a70a9e1188fcd4ca6188c253e6bf1d8dac39c806f28c8c5075098bc -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this diagram automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's diagrammed, update `docs/PRODUCT.md` itself.

Since PRODUCT.md describes the recipes/admin database-backed section in the present tense (Requirements #7–13) even though the codebase snapshot text predates it, I've grounded the internal-structure and external-dependency diagrams in what PRODUCT.md describes as shipped, while noting via the snapshot which pieces (Layout, index, 404) are independently confirmed on disk.

This first diagram shows how the site's own pages and the shared layout relate, including the client-side calls the recipes and admin pages make out to Supabase (no server code runs in this repo itself — GitHub Pages can't run it).

```mermaid
graph TD
    Layout["src/layouts/Layout.astro<br/>(shared head/fonts/styles + site-wide footer)"]

    Index["src/pages/index.astro<br/>Landing page: banner, welcome text,<br/>'Join the Conversation' links"]
    NotFound["src/pages/404.astro"]
    RecipesList["/recipes/<br/>list page"]
    RecipeView["/recipes/view?slug=...<br/>single template, driven by query string"]
    Admin["/admin/<br/>login + recipe creation form"]

    Layout --> Index
    Layout --> NotFound
    Layout --> RecipesList
    Layout --> RecipeView
    Layout --> Admin

    Layout -. "footer: Admin link" .-> Admin
    Layout -. "footer: Starter Culture Studio logo" .-> SCS["starterculturestudio.com (external)"]

    RecipesList -- "fetch recipes (publishable key,<br/>RLS-protected)" --> SupaDB[(Supabase Postgres:<br/>recipes table)]
    RecipeView -- "fetch single recipe by slug" --> SupaDB
    RecipeView -- "getPublicUrl(photo_path)" --> SupaStorage[(Supabase Storage:<br/>recipe-photos bucket)]
    RecipeView -- "extract video ID, build embed" --> YouTube["YouTube (video_url)"]

    Admin -- "password check via Supabase Auth<br/>(admin@heartlandfermentersguild.org)" --> SupaAuth[(Supabase Auth)]
    Admin -- "upload photo before insert" --> SupaStorage
    Admin -- "insert recipe row incl. time_stages,<br/>yield, notes, photo_path, video_url" --> SupaDB

    Schema["supabase/schema.sql<br/>(RLS policies)"] -. "defines access rules for" .-> SupaDB
    Schema -. "defines write policy for" .-> SupaStorage
```

This second diagram shows the outside services and third-party destinations the static site talks to at runtime or deploy time — everything here is called directly from the browser or from CI, since there's no backend server in this project.

```mermaid
graph LR
    subgraph Browser["Static pages served from GitHub Pages"]
        Land["Landing page"]
        RecList["/recipes/"]
        RecView["/recipes/view"]
        AdminPg["/admin/"]
    end

    RecList -- "REST calls (publishable key)" --> Supa[(Supabase project)]
    RecView -- "REST calls" --> Supa
    AdminPg -- "Auth + insert + upload" --> Supa
    Supa --- SupaDB["Postgres: recipes table"]
    Supa --- SupaAuthSvc["Auth: single admin user"]
    Supa --- SupaStore["Storage: recipe-photos bucket"]

    RecView -- "embed by video ID" --> YT["YouTube"]

    Land -- "outbound links" --> Email["Email"]
    Land -- "outbound links" --> FBPage["Facebook Page"]
    Land -- "outbound links" --> FBGroup["Facebook Group"]
    Land -- "outbound links" --> IG["Instagram"]
    Land -- "outbound links" --> Meetup["Meetup"]

    Footer["Site-wide footer (all pages)"] -- "logo link" --> SCS2["starterculturestudio.com"]

    subgraph CI["GitHub Actions"]
        DeployWF["deploy.yml (withastro/action)<br/>triggers on v*.*.* tag or manual dispatch"]
    end
    DeployWF -- "build + deploy" --> Pages["GitHub Pages"]
    Pages -- "custom domain resolution" --> Porkbun["Porkbun DNS<br/>(A records + www CNAME,<br/>Cloudflare-backed resolution only)"]
    Porkbun -- "resolves to" --> Pages
```

This third diagram shows the repo's real, documented connection to Devlore, the separate cross-project documentation tool this project's own docs are generated for/by — omitting anything about Starter Culture Studio or other outbound links since those are just outbound URLs, not linked repos/projects.

```mermaid
graph TD
    ProductDoc["docs/PRODUCT.md<br/>(hand-edited source of truth)"]
    TestPlan["docs/TEST_PLAN.md<br/>(auto-generated)"]
    UserManual["docs/USER_MANUAL.md<br/>(auto-generated)"]
    Visualizer["docs/VISUALIZER.md<br/>(auto-generated)"]

    DevloreWF[".github/workflows/devlore.yml"]
    DevloreAnalyzeWF[".github/workflows/devlore-analyze.yml"]
    DevloreReleaseWF[".github/workflows/devlore-release.yml<br/>(triggers on v*.*.* tag, same pattern as deploy.yml)"]

    Devlore["Devlore (external, cross-project tool)"]

    ProductDoc -- "read as source-of-truth" --> Devlore
    Devlore -- "generates" --> TestPlan
    Devlore -- "generates" --> UserManual
    Devlore -- "generates" --> Visualizer

    DevloreWF -- "sync/logging" --> Devlore
    DevloreAnalyzeWF -- "analysis" --> Devlore
    DevloreReleaseWF -- "release automation" --> Devlore
```
