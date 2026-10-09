# Project review and source synchronization — 9 October 2026

The user requested a project review including recent related chats and a current
remote repository. Before this documentation update, local `main` and live GitHub
`main` both pointed to `424c459c2d5b221beb488264660c96e0c841e493`. The application
release remains `32b1729`, published on 7 October. No new deployment was needed.

## Current source and decisions

- Canonical repository: `KIT-Capital/dulcinea-presentation`, default branch `main`.
- Active checkout: `worktrees/radisson-independent` inside the local Dulcinea
  Presentation workspace. The parent workspace is an archive/output location,
  not the website's configured remote repository.
- The other linked checkout on `codex/lifestyle-oriente` is clean. Every local
  historical branch commit is already an ancestor of `main`; an old branch's
  ahead count against its own upstream does not represent missing canonical work.
- Codex/GitHub is authoritative. Replit is a downstream collaboration copy. The
  5 October export is recorded in `docs/replit-handoff.md`; later parity remains
  unverified and was not silently assumed or overwritten.
- The current story leads with member stays, family and friends; the five homes
  and both team slides precede projected returns. Retain all 18 main slides and
  the optional booking appendix, bilingual content and conditional benefit terms.
- The 7 October mobile controls, reading cues, contrast, program labels and
  collective 3% presentation are already implemented and published.

Reviewed related chats: “Dulcinea Web App,” “Continue Dulcinea website,”
“Critique interface and prioritize,” “Polish Dulcinea presentation” and
“Create Cartagena rooftop party.” Historical plans were checked against current
source and later decisions rather than reinstated as current instructions.

## Fresh verification

Executed with Node.js 24.16.0:

```sh
node scripts/build.mjs --web
node scripts/verify-investor-build.mjs
node --test server/*.test.mjs
node scripts/verify-video-library.mjs
git diff --check
```

- Production web build and verifier pass: 10 EN/ES pages, 77 files, 59 media
  aliases, 16 active MP4s and 28 parsed inline scripts.
- All 57 server tests pass, including public access, financial authentication,
  source denials, range streaming, review isolation and the Replit Node adapter.
- Media library passes: 33 distinct repository videos, 16 active videos and
  zero duplicate media files.
- Anonymous live verification passes: 8/8 public pages match build bytes,
  62/62 content/UI delivery assertions, 8/8 financial redirects, 6/6 denied
  source/private routes and 4/4 public asset/range checks.
- The live verification script only issues anonymous GET/HEAD requests. Evidence
  is retained under the parent workspace's `preservation/2026-10-09/project-review/`.

The environment's `npm` launcher failed because its configured `npm-cli.js` is
missing. The direct Node commands above are the exact commands used by the
package scripts and completed successfully; no global runtime configuration was
changed.

This is source/build and anonymous HTTP verification. It does not newly establish
authenticated production financial access, browser interaction, physical-device
behavior, social-platform cached cards or full accessibility conformance. The
7 October release record contains the latest recorded browser review.

## Documentation reconciliation and external deliverables

The README now follows the current handoff and presentation manifest: latest
release, slide order, active media, opening footage, compact controls and the
guarded deployment workflow. The handoff and Replit status distinguish historical
exports from current canonical verification. The closed Impeccable critique
snapshot is retained alongside its already-published resolution record.

The latest edited standalone deck is PPTX 033, delivered on 7 October. It remains
in the controlled local output library with its review notes and source 032.
It is not the website's source and is not cleared for investor distribution:
source questions, hidden internal notes and package-validation limitations
remain. The separate rooftop-party image version 2 also remains in the local
creative-output library; it has not been integrated into the approved website.
Exact paths, hashes and remaining review items are recorded in the local project
review, not copied with private source material into this public repository.

GitHub visibility was verified as public. After reviewing the access implication,
the user explicitly chose to keep it public for now. Website password controls
apply only to the deployed website, not to GitHub files or history. This update
adds no private deck, workbook, transcript, credential or raw preservation bundle.

The existing Model 10 package-hash discrepancy remains documented in the handoff.
The earlier 27-sheet value/formula comparison is historical evidence; this pass
did not repeat financial-source reconciliation or relax its strict hash checks.
