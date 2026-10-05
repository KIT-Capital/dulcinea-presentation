# Replit continuation workspace

The goal is an editable copy of the canonical Dulcinea project with identical
site, presentation and supporting-page content. Import the complete repository
from https://github.com/KIT-Capital/dulcinea-presentation. The published design
baseline is application commit `c44a8aa`, with release record `673459d`.

## Included

The repository includes the English and Spanish website, all 18 main slides and
booking appendix, criteria, specialists, disclosures and protected financial
statement templates/data. It also includes the current films, photographs,
logos, fonts, nine floorplan sheets and approved floorplan PDF, original property
photos, editable source, design references, provenance, tests and release notes.
All 59 media aliases required by the current build refer to tracked files. The
initial audit found 420 tracked files totaling approximately 262 MB, before the
Replit setup additions; no Git LFS is used.

## Setup

1. Import into the intended team workspace from GitHub, preserving the source
   tree and Git history. Retain the same GitHub repository as the upstream.
2. Use Node 22 or newer. Replit's Run button runs `npm start`, which builds and
   verifies the current source before starting the Node server on port 5000.
3. Open the preview in an external tab. The existing anti-framing policy is kept.
4. The server uses HTTPS `REPLIT_DEV_DOMAIN` / `REPLIT_DOMAINS` when available.
   `PUBLIC_ORIGIN` can explicitly set the external HTTPS origin. `PORT` can
   override 5000; update Replit's port mapping at the same time if changed.
5. An owner can enable protected financial sign-in by configuring
   `INVESTOR_PASSWORD` and `SESSION_SECRET` through Replit Secrets. No production
   credentials are included in Git or automatically transferred. The public
   website works without them; private content fails closed.

The Node server imports the existing Worker directly and supplies filesystem
assets and a per-process login limiter. It preserves route authorization,
same-origin checks, session cookies, media byte ranges and response headers.
Its limiter is intended for one development process, not distributed autoscale
hosting; users behind the same Replit proxy may share its eight-attempt/minute
bucket, and the counter resets when the process restarts. The existing canonical
Cloudflare deployment remains independent.

## Editing and parity

Read `replit.md` and `docs/HANDOFF.md` before editing. Edit source files, restart
Run to rebuild, then verify the website and presentation in English/Spanish.
Keep the current main-slide order and supported deep links. The source map is
in the main README; all build outputs are generated.

For a fresh import, compare public page and media bytes against the canonical
build. Run `npm test` and `npm run verify`, then inspect slides, language
switching, pause/resume, videos, floorplans and contact destinations. Check that
anonymous financial routes go to login and source paths return 404. Test
successful sign-in/logout only with workspace credentials, never with secrets
in a committed test fixture. Replit hosting configuration is allowed to differ;
the site content and assets should not.

Use GitHub for deliberate synchronization. A Replit import does not establish
automatic two-way synchronization. Pull before editing, preserve colleagues'
changes, and push reviewed commits. Publishing to the canonical domain remains
a separate release step, using the existing guarded production workflow.

## Source material outside this import

The current Model 10 workbook, latest supplied PPTX 032, some original raw stock
footage and local preservation screenshots/evidence are outside Git. They are
not required to edit and rebuild the current website. They are required for
changing financial source data or regenerating certain films, and must be
obtained from the existing controlled source library when needed. Historical
Model 07 and older decks under `source-packages/` are not current financial
authority. Approved financial JSON, templates and all active rendered media
are present. See the current handoff's Model 10 hash/reconciliation limitation.

## Setup references

- [Replit import from GitHub](https://docs.replit.com/build/import-from-providers)
- [Replit project configuration](https://docs.replit.com/features/project-setup/configuration)

## Status

Local preparation passed the production build/verifier and all 55 server tests
(47 existing tests plus eight Node adapter tests). `npm start` successfully
rebuilt, verified and started the server on port 5000. All eight public EN/ES page
hashes still match the published `c44a8aa` release. An independent code review
found no release blockers.

The export destination is a new project in the signed-in Dulcinea workspace.
The older `Dulcinea Investment Website` project is being preserved. Do not treat
local checks as evidence of a completed remote import: add the new project link
and remote verification here once Replit setup completes.
