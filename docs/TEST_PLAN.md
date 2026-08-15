<!-- devlore:test-plan source-hash:e1b5a85745c03487306da36e42e77b5af24668f1f4d6ed481835c67db6b09d06 -->
> **Do not move, rename, or edit this file.** Devlore generates and maintains this test plan automatically from `docs/PRODUCT.md`'s requirements — manual edits will be overwritten the next time Devlore detects the requirements have changed. To change what's tested, update `docs/PRODUCT.md` itself.

# Manual QA Test Plan — heartland-fermenters-guild

## Status of source document

`docs/PRODUCT.md` currently contains only the scaffold template with no filled-in content:

- **Description**: placeholder ("Add a one-line description...")
- **Vision**: placeholder ("What is this project trying to achieve? Fill this in.")
- **Requirements**: empty ("Add hard requirements as they get locked in.")
- **Open questions**: empty ("Track open questions here as they come up.")

There are no locked requirements, no described features, no user-facing flows, and no stated behavior anywhere in the document. Per the instructions to derive test cases only from what the doc actually describes, **no test cases can be authored at this time** — writing any would mean inventing behavior the doc does not mention.

## Test cases

None. There is no feature area, flow, or requirement documented yet to group test cases under.

## Out of scope

- **All product functionality** — reason: nothing has been specified in `docs/PRODUCT.md` yet; the doc is an unfilled template (no vision, no requirements, no open questions recorded).

## Recommended next step (non-testing)

Before a QA pass is possible, the project owner should fill in at least the **Requirements** section of `docs/PRODUCT.md` with concrete, locked behavior (e.g., specific user actions and expected outcomes). Once requirements are added, this test plan should be regenerated from that content, with:

- One section per feature area / flow described
- Test cases with IDs, requirement references, preconditions, steps, and expected results
- A populated "Out of scope" section for anything explicitly marked deferred/parked
- Notes for any purely architectural/backend guarantees that have no clickable surface
