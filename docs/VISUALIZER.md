<!-- devlore:visualizer source-hash:926d22579dfb7a99c819f13b5bf0df1576d380720acb271f7695e7092a5fb207 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this diagram automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's diagrammed, update `docs/PRODUCT.md` itself.

> **Note:** This file was updated manually, not by Devlore's automation, because `devlore.yml`'s `sync-visualizer` job currently fails — this repo is public and its reusable workflow lives in the private `devlore` repo, which GitHub disallows. See `docs/PRODUCT.md` requirement 4 and `docs/TEST_PLAN.md`'s Out of scope section. Devlore will resync (and may overwrite this) once that's resolved.

The repo now contains a working Astro static site (v1 landing page, built and deployed), not just the Devlore scaffold. The diagrams below reflect the actual current structure, distinguishing what's built from what's only planned.

Caption: Internal structure of the repo — the built Astro site, its content sections, the CI/deploy and Devlore workflows, and what's still roadmap-only.

```mermaid
flowchart TB
    subgraph Repo["heartland-fermenters-guild (repo root)"]
        PDOC["docs/PRODUCT.md<br/>(living product doc)"]

        subgraph Workflows[".github/workflows/"]
            WFDeploy["deploy.yml<br/>(withastro/action → GitHub Pages)"]
            WF1["devlore.yml"]
            WF2["devlore-analyze.yml"]
            WF3["devlore-release.yml"]
        end

        subgraph Site["src/ + public/ (built)"]
            Layout["src/layouts/Layout.astro<br/>(head, fonts, global styles)"]
            Index["src/pages/index.astro<br/>(landing page)"]
            NotFound["src/pages/404.astro"]
            Assets["public/assets/<br/>(banner, crest, favicons)"]
            CNAME["public/CNAME"]

            Index --> Layout
            NotFound --> Layout
            Index --> Header["Header banner image"]
            Index --> Crest["Circular crest logo"]
            Index --> Welcome["Welcome paragraph"]
            Index --> Join["'Join the Conversation' section"]
            Header --> Assets
            Crest --> Assets
        end

        subgraph Future["Roadmap — not yet built"]
            About["About/History page"]
            Events["Events page"]
            Recipes["Recipes/Resources page"]
            Members["Members-only section<br/>(auth-gated)"]
        end
    end

    Index -.grows into.-> About
    Index -.grows into.-> Events
    Index -.grows into.-> Recipes
    Site -.eventually adds.-> Members

    PDOC -. informs/read by .-> WF1
    PDOC -. informs/read by .-> WFDeploy
```

Caption: External services and destinations the site depends on or links out to — the build/hosting/DNS chain that gets the site live (now verified working end-to-end), and the social platforms the "Join the Conversation" section points to.

```mermaid
flowchart LR
    Repo["heartland-fermenters-guild repo<br/>(public, sole collaborator BubbaF377,<br/>branch-protected main, v* tag ruleset)"]
    Action["GitHub Actions:<br/>withastro/action"]
    Pages["GitHub Pages<br/>(static hosting, custom domain configured)"]
    Cert["Let's Encrypt cert<br/>(approved, HTTPS enforced)"]
    Domain["heartlandfermentersguild.org<br/>+ www (live, verified)"]
    Porkbun["Porkbun DNS<br/>(A records + www CNAME →<br/>Cloudflare-backed resolution, no proxying)"]

    Repo -->|on push to main| Action
    Action -->|build & deploy| Pages
    Pages -->|issues/renews| Cert
    Pages -->|served at| Domain
    Porkbun -->|A/CNAME records point at| Pages

    subgraph SocialLinks["'Join the Conversation' outbound links"]
        Email["Email"]
        FBPage["Facebook Page"]
        FBGroup["Facebook Group"]
        Instagram["Instagram"]
        Meetup["Meetup"]
    end

    Domain --> SocialLinks

    AuthTBD["Future auth provider<br/>(hosted vs. roll-your-own — undecided)"]
    Domain -.future, unresolved.-> AuthTBD
```

No separate "other linked repos" diagram is included: the docs mention Devlore as a tool/service integration (currently unable to sync docs back to this repo — see note above) and Porkbun/GitHub Pages as external infrastructure, but no other actual sibling repository or project connection is described.
