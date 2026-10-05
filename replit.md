# Dulcinea One: editable canonical project

Codex is the source of truth. This is an exported working copy of
https://github.com/KIT-Capital/dulcinea-presentation, not a new design.
Preserve the existing website, presentation, supporting pages,
English/Spanish copy, financial values, media and brand treatment when setting up
the workspace. The live canonical site remains https://invest.dulcineainvestments.org/.

## Run and verify

- Use Node 22 or newer. No npm packages are required for the current app.
- Replit **Run** invokes `npm start`: rebuild the production website, verify it,
  and serve it on port 5000. Restart after editing so the preview is rebuilt.
- Open the preview in a separate browser tab. Existing anti-framing headers are
  intentionally preserved, so an embedded preview may be blocked.
- `npm test` covers both the canonical access policy and the Node/Replit adapter.
- `npm run verify` checks the built bilingual pages, links and packaged media.
- Set `PUBLIC_ORIGIN` to the HTTPS preview origin if the Replit-provided domain
  variables are unavailable. Do not trust arbitrary forwarded host headers.

## Where to continue work

- Read `docs/HANDOFF.md` for the current approved story, wording and constraints.
- Read `docs/replit-handoff.md` for setup, parity checks and source limitations.
- Edit the shared source under `src/investor/`, `src/`, `shared/` and `content/`.
  Do not hand-edit generated `dist/private-site/` pages.
- The homepage and 18 main slides share source. Booking is an optional appendix.
  Verify changes in both formats, both languages and phone/desktop layouts.
- Keep property imagery, original photos, floorplans, films and provenance. Do
  not replace missing-looking video frames with newly generated media.
- Preserve Dov's approved email and WhatsApp links, gold “One”, lower-right hero
  logos, the non-interactive scroll cue and “Accredited investors only” wording.
- Refresh from the Codex-maintained GitHub source before editing, preserving any
  colleague work. Keep Replit changes on a separate working branch and return
  them to Codex for review and integration. Do not push Replit changes directly
  to canonical `main`, automatically sync them back, or overwrite canonical files.

## Financial access and publication

The Node adapter reuses the canonical Worker and serves only its built allowlist.
Never replace it with a static server rooted at this repository or its build
directory: formal financial statements must still require sign-in.

Public pages work without credentials. To enable financial sign-in, a workspace
owner must supply `INVESTOR_PASSWORD` and `SESSION_SECRET` through Replit Secrets.
Do not copy, print, commit or request production credentials in Agent chat.
The first must be at least 11 characters and the second at least 32 characters.
Missing credentials leave private financial content inaccessible.

The Node adapter's login limiter is per process, for a development workspace or
single-instance preview. Distributed publication needs a shared limiter. Source
workbooks, company documents, internal records and unknown paths must never be
served by either host. Existing Cloudflare deployment configuration is retained;
creating this Replit workspace does not change the public domain or publish a
second public deployment.
