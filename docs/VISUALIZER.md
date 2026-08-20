<!-- devlore:visualizer source-hash:57af53d0b2b114a61a641e107efd365064cd9d52da2d6a6d50e2c1d140d82f61 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this diagram automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's diagrammed, update `docs/PRODUCT.md` itself.

Below are diagrams grounded in the file tree, `PRODUCT.md`, and the baseline codebase snapshot.

**1. Internal structure** — how the Astro site's own pages/layout/assets and Devlore-support docs relate within the repo.

```mermaid
graph TD
    Layout["src/layouts/Layout.astro<br/>(shared head/fonts/global styles)"]
    Index["src/pages/index.astro<br/>(landing page v1: banner, welcome text,<br/>Join the Conversation links, footer)"]
    NotFound["src/pages/404.astro"]
    Assets["public/assets/<br/>(banner images, favicons/touch icons)"]
    CNAME["public/CNAME<br/>(heartlandfermentersguild.org)"]
    Robots["public/robots.txt"]

    Index --> Layout
    NotFound --> Layout
    Index --> Assets
    Layout --> Assets

    ProductDoc["docs/PRODUCT.md<br/>(source of truth)"]
    TestPlan["docs/TEST_PLAN.md<br/>(auto-generated, currently stale)"]
    UserManual["docs/USER_MANUAL.md<br/>(auto-generated)"]
    Visualizer["docs/VISUALIZER.md<br/>(auto-generated, currently stale)"]

    ProductDoc -.->|intended sync| TestPlan
    ProductDoc -.->|intended sync| UserManual
    ProductDoc -.->|intended sync| Visualizer
```

**2. External dependencies** — the outside services the built site and its deploy pipeline actually rely on.

```mermaid
graph LR
    Site["heartland-fermenters-guild<br/>(Astro static site)"]

    GHPages["GitHub Pages<br/>(static hosting)"]
    GHActions["GitHub Actions<br/>(withastro/action,<br/>runs on v*.*.* tag push or workflow_dispatch)"]
    Porkbun["Porkbun<br/>(domain registrar + DNS,<br/>A records + www CNAME)"]
    CFDNS["Cloudflare<br/>(Porkbun's DNS-answering backend only —<br/>not a traffic proxy)"]

    Email["Email"]
    FBPage["Facebook Page"]
    FBGroup["Facebook Group"]
    Instagram["Instagram"]
    Meetup["Meetup"]
    SCS["starterculturestudio.com<br/>(footer logo link)"]

    GHActions -->|builds & deploys| GHPages
    Site -->|served via| GHPages
    Porkbun -->|DNS resolution for heartlandfermentersguild.org| GHPages
    Porkbun -->|resolution backend| CFDNS

    Site -->|"Join the Conversation" links| Email
    Site --> FBPage
    Site --> FBGroup
    Site --> Instagram
    Site --> Meetup
    Site -->|footer logo link| SCS
```

**3. Linked repos/projects** — the documented connection to the separate Devlore tool and its private repo of reusable workflows.

```mermaid
graph LR
    Repo["heartland-fermenters-guild<br/>(public GitHub repo)"]

    DevloreYml[".github/workflows/devlore.yml<br/>(sync-test-plan, sync-user-manual,<br/>sync-visualizer, draft-log-entry)"]
    AnalyzeYml[".github/workflows/devlore-analyze.yml<br/>(one-time codebase snapshot)"]
    ReleaseYml[".github/workflows/devlore-release.yml<br/>(release-notes job)"]

    DevloreRepo["devlore repo<br/>(reusable workflows, now made public<br/>to fix the cross-repo call restriction)"]

    Repo --> DevloreYml
    Repo --> AnalyzeYml
    Repo --> ReleaseYml

    DevloreYml -->|calls reusable workflow| DevloreRepo
    AnalyzeYml -->|calls reusable workflow| DevloreRepo
    ReleaseYml -->|calls reusable workflow| DevloreRepo
```
