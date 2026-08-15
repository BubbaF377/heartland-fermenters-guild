<!-- devlore:visualizer source-hash:195a9cdbd632ce91774abfc81be0b88c222d9eb40bfacdaaf82e528ad6731343 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this diagram automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's diagrammed, update `docs/PRODUCT.md` itself.

The codebase snapshot shows only a fresh scaffold (three GitHub Actions workflow files, a placeholder README, and the templated `docs/PRODUCT.md`) — no Astro source, pages, or components exist yet. The diagrams below are therefore drawn from what the product doc describes as built/decided (the workflow files, the planned landing-page content, and the hosting/DNS setup), not from actual application code.

Internal structure — the repo's current files plus the planned v1 landing-page content and roadmap pages described in the requirements (nothing here is implemented in code yet, only specified):

```mermaid
graph TD
    subgraph Repo["heartland-fermenters-guild (public repo)"]
        PRODUCT["docs/PRODUCT.md<br/>(source-of-truth product doc)"]
        README["README.md<br/>(placeholder stub)"]
        TESTPLAN["docs/TEST_PLAN.md<br/>(manually patched 2026-08-15)"]
        VIZ["docs/VISUALIZER.md<br/>(manually patched 2026-08-15)"]

        subgraph Workflows[".github/workflows/"]
            DEVLORE["devlore.yml<br/>(sync-test-plan, sync-user-manual,<br/>sync-visualizer, draft-log-entry)"]
            ANALYZE["devlore-analyze.yml"]
            RELEASE["devlore-release.yml<br/>(release-notes job)"]
        end

        subgraph PlannedSite["Astro site (planned, not yet built)"]
            LANDING["Landing page (v1)"]
            HEADER["Header banner image"]
            CREST["Circular crest logo"]
            WELCOME["Welcome paragraph"]
            JOIN["Join the Conversation section"]
            FUTURE["Future pages:<br/>About/History, Events, Recipes/Resources"]
            MEMBERS["Future: auth-gated members-only section"]
        end
    end

    PRODUCT -.->|drives docs sync| DEVLORE
    PRODUCT -.->|drives release notes| RELEASE
    LANDING --> HEADER
    LANDING --> CREST
    LANDING --> WELCOME
    LANDING --> JOIN
    LANDING -.->|roadmap expansion| FUTURE
    FUTURE -.->|roadmap expansion| MEMBERS
```

External dependencies — the hosting, DNS, and outbound social links the site relies on, as described in the requirements:

```mermaid
graph LR
    ACTIONS["GitHub Actions<br/>(withastro/action build)"] -->|deploys on push to main| PAGES["GitHub Pages<br/>(static hosting)"]
    DOMAIN["heartlandfermentersguild.org"] -->|A records| PAGES
    WWW["www subdomain"] -->|CNAME| PAGES
    PORKBUN["Porkbun<br/>(domain registrar + DNS mgmt,<br/>nameservers *.ns.porkbun.com)"] -->|manages| DOMAIN
    PORKBUN -->|manages| WWW
    CLOUDFLARE["Cloudflare<br/>(Porkbun's DNS-answering backend only,<br/>not a traffic proxy)"] -.->|resolves queries for| PORKBUN

    JOIN["Join the Conversation section"] --> EMAIL["Email"]
    JOIN --> FBPAGE["Facebook Page"]
    JOIN --> FBGROUP["Facebook Group"]
    JOIN --> INSTA["Instagram"]
    JOIN --> MEETUP["Meetup"]
```

Other linked repos/projects — the documented (currently broken) connection between this repo's workflows and the private `devlore` repo's reusable workflows:

```mermaid
graph TD
    subgraph ThisRepo["heartland-fermenters-guild (public)"]
        DEVLORE_YML["devlore.yml<br/>(sync-test-plan, sync-user-manual,<br/>sync-visualizer, draft-log-entry)"]
        RELEASE_YML["devlore-release.yml<br/>(release-notes job)"]
    end

    subgraph DevloreRepo["devlore (private repo)"]
        REUSABLE["Reusable workflows"]
    end

    DEVLORE_YML -.->|"calls (currently broken:\npublic repo can't call\nreusable workflow in private repo)"| REUSABLE
    RELEASE_YML -.->|"calls (currently broken, same reason)"| REUSABLE
```
