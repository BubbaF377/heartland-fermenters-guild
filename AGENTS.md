<!-- devkeep:agents-md -->
# Working with heartland-fermenters-guild's docs/PRODUCT.md

This repo is linked to Devkeep, which reads `docs/PRODUCT.md` to draft log entries on every push, keep a User Manual/Test plan/Visualizer in sync, and answer chat questions about this project's own history and reasoning. The most useful thing an AI coding agent working in this repo can do is keep that file current — not as a separate chore, but as part of the same session where a decision actually gets made.

## Every session, before anything else

Read `docs/PRODUCT.md` fresh. Don't assume it's already current in this session's own context — the file can change between sessions (a different terminal, a teammate, a hand-edit), and none of those show up in this session's own history. Working from a stale memory of the doc is worse than working from nothing, since stale context still looks authoritative right up until it's confidently wrong.

## As decisions land, write them down

Work the way you normally would — talk through a bug, a feature, a design choice. As a decision actually lands, open `docs/PRODUCT.md` directly and write it down right there: a new requirement, a decision note, an open question, a "found this the hard way" note — before or alongside writing the code, not reconstructed later from a diff. Commit the doc edit in the same commit (or PR) as the change it explains; `docs/PRODUCT.md` isn't a separate deliverable, it's part of the change. From there Devkeep's own automation takes over on push — drafting what changed, keeping generated docs in sync — so this file only needs to carry the *why*, not a changelog.

**Before every commit, check this specifically — don't defer it or assume an earlier pass already covered it.** If the commit changes behavior, adds or supersedes a requirement, resolves an open question, or fixes a real bug, and `docs/PRODUCT.md` doesn't already reflect it, update that file and include the update in the same commit. A commit that changes what this project does without the doc reflecting it is exactly how this file quietly goes stale.

## What a requirement looks like, specifically

This one is worth being literal about, because getting it wrong is silent. A requirement is a **numbered item under the `## Requirements` heading**:

```
## Requirements

1. Users can filter the list by status.
2. A filtered view survives a page reload.
```

Numbered, one per distinct capability, describing what the product does for the person using it — not how the code is arranged.

**Why the shape matters, and is not a style preference.** Devkeep tracks each requirement individually to work out what actually changed since it last generated anything. Requirements written as prose paragraphs or bullet points are still read by a person, but Devkeep cannot tell them apart, so it cannot tell which one you edited — and the generated test plan and user manual quietly stop updating rather than failing loudly. Requirements captured as prose during a design conversation are the single most common way that happens: the thinking gets recorded faithfully, just not in a shape anything downstream can follow.

So when a decision lands, write the requirement as a numbered item. If the discussion produced something real but you are not sure it is locked in, put it under `## Open questions` rather than leaving it as a paragraph inside `## Requirements` — an honest open question is useful; an invisible requirement is not.

## A requirement's rule, and its history

A requirement says two things, and only one of them is a rule. **The rule is what must be true.** The history is what happened while building it — the date it changed, the approach that failed, the bug that forced the current shape. Keep both, in the same item, with the history under a `**History.**` marker after the rule:

```
3. A filtered view survives a page reload.

   **History.** 2026-03-04: first stored in the URL, which broke sharing —
   two people sending each other links pushed their own filters onto one
   another. Moved to per-user storage.
```

The marker goes at the start of a line. Everything before it is the rule; an item with no marker is entirely rule, so nothing has to change until you have history to record.

**Ask what changed: what must be true, or only your understanding of why?**

- **What must be true changed.** Edit the rule, *and* add a dated history line saying what it was and what moved it. Both, always — editing a rule without recording it silently overwrites the old one, which is the record this convention exists to keep. Devkeep will notice and regenerate that requirement's test cases and user-manual section, which is correct: a regeneration should mean the requirement actually changed. Never leave a genuine rule change in History to avoid that.
- **Only the understanding changed** — you learned why it works this way, found the bug that forced it, or established what it must not become. History only. The rule already says what must be true, and rewording it to absorb a new fact destroys the record of what changed while triggering a regeneration nothing needed.

**History is past tense and dated; the rule is present tense.** That is what stops them becoming two claims that disagree. `**History.** 2026-09-01: was capped at 2MB, raised after the import complaints` is a record. "Uploads are capped at 2MB" sitting in History under a rule that says 10MB is a second, competing rule, and a reader has no way to tell which one is live.

**Narrative that explains no single requirement is the document's own history, and takes the same marker.** A dated decision about a feature area, a design exploration, a "found this the hard way" note — put `**History.**` as the first line of the body, under the dated heading it belongs to. It runs to the next heading, so the heading survives and the body does not.

That is deliberate: the heading is the index. A reader sees that a decision exists and roughly what it was, and asks for the body only if it matters — the same two tiers the findings ledger carries, where an index travels between stages and the evidence is fetched once. Marking it under its topical parent rather than collecting it into one section keeps it beside the feature it explains, which is the same reason a requirement's history stays in the requirement.

**Do not infer history from a date in a heading.** A dated heading is a strong hint and not a declaration; a section can be dated and still be live direction. Guessing would be the unanchored-heading mistake again — a heading match that a mention of the heading can satisfy is not a heading match, and a date that a live requirement can carry is not a history marker.

**A dated note that explains a requirement belongs in that requirement's History**, not in a new dated section at the end of the file. Appending to the end is the obvious move and is usually wrong — it separates the reasoning from the thing it explains, and whatever `##` heading happens to be last silently becomes its parent.

The split is named rather than physical, deliberately: the reasoning stays where the reader of the rule will find it, while still being separable by anything that only wants the rule. Generated documents read the rule; project chat reads the whole item, history included, because "why is it like this" is exactly what history answers.

## If this repo is a monorepo

Check for `docs/MODULES.md` at the repo root first. If it exists, this repo tracks more than one documented sub-project, and *where* a decision belongs depends on its scope:

- A decision specific to one module's own behavior, UI, or requirements belongs in that module's own `docs/PRODUCT.md` (the path is listed in `docs/MODULES.md`, one per module).
- A decision about how the modules fit together, or the shell/root project itself, belongs in the root `docs/PRODUCT.md`.

Getting this wrong is an easy, recurring mistake even for an agent that already knows this file matters: a shell-level doc quietly absorbing a module's own implementation details (or vice versa) goes stale in a way that's hard to notice until someone reads it looking for something specific and it isn't where it should be. When genuinely unsure which one a decision belongs in, ask rather than guess.

If `docs/MODULES.md` doesn't exist, this is an ordinary single-project repo — everything above applies to the one root `docs/PRODUCT.md`.

<!-- /devkeep:agents-md -->
