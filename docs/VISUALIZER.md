<!-- devlore:visualizer source-hash:926d22579dfb7a99c819f13b5bf0df1576d380720acb271f7695e7092a5fb207 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this diagram automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's diagrammed, update `docs/PRODUCT.md` itself.

The codebase snapshot contains no actual application source code — only three Devlore-related GitHub Actions workflow files and the placeholder `docs/PRODUCT.md`. The diagrams below are therefore my best-effort reconstruction based on the product doc's stated requirements and roadmap, not on observed code, and I've marked not-yet-built pieces as planned/future.

Caption: Internal structure of the repo as described — current scaffold (Devlore workflows, product doc) plus the Astro site content the requirements specify, distinguishing what's built (v1 landing page) from what's only planned (info pages, members-only section).

```mermaid
flowchart TB
    subgraph Repo["heartland-fermenters-guild (repo root)"]
        PDOC["docs/PRODUCT.md<br/>(living product doc)"]
        WF1[".github/workflows/devlore.yml"]
        WF2[".github/workflows/devlore-analyze.yml"]
        WF3[".github/workflows/devlore-release.yml"]

        subgraph Site["Astro site (planned/being built)"]
            Landing["Landing page (v1 — required)"]
            Header["Header banner image"]
            Crest["Circular crest logo"]
            Welcome["Welcome paragraph"]
            Join["'Join the Conversation' section"]

            Landing --> Header
            Landing --> Crest
            Landing --> Welcome
            Landing --> Join
        end

        subgraph Future["Roadmap — not yet built"]
            About["About/History page"]
            Events["Events page"]
            Recipes["Recipes/Resources page"]
            Members["Members-only section<br/>(auth-gated)"]
        end
    end

    Landing -.grows into.-> About
    Landing -.grows into.-> Events
    Landing -.grows into.-> Recipes
    Site -.eventually adds.-> Members

    PDOC -. informs/read by .-> WF1
```

Caption: External services and destinations the site depends on or links out to — the build/hosting/DNS chain that gets the site live, and the social platforms the "Join the Conversation" section points to.

```mermaid
flowchart LR
    Repo["heartland-fermenters-guild repo<br/>(push to main)"]
    Action["GitHub Actions:<br/>withastro/action"]
    Pages["GitHub Pages<br/>(static hosting)"]
    Domain["heartlandfermentersguild.org<br/>(custom domain)"]
    Porkbun["Porkbun DNS<br/>(A records + www CNAME)"]

    Repo -->|on push to main| Action
    Action -->|build & deploy| Pages
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

No separate "other linked repos" diagram is included: the docs mention Devlore as a tool/service integration and Porkbun/GitHub Pages as external infrastructure, but no other actual sibling repository or project connection is described.
