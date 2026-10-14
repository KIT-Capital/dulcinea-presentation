# Dulcinea Codex publishing

When the user says **publish** in this Codex chat, the destination is
**https://c.invest.dulcineainvestments.org/**, as directed on 14 October 2026.
Verify the release at that address before reporting publication complete.

- This checkout belongs to `KIT-Capital/dulcinea-presentation`.
- Publish only to the Cloudflare Worker `dulcinea-investor-presentation` using the
  approved production configuration and its existing secrets/access controls.
- The additional Codex hostname and the retained legacy hostname
  `invest.dulcineainvestments.org` are attached to this same Worker. Preserve both
  routes when deploying; the legacy hostname redirects to the new Codex hostname
  with its path and query intact. Share metadata uses the new Codex origin.
- Replit is a completely separate publishing destination:
  `r.invest.dulcineainvestments.org`, project **Dulcinea Investment Website**,
  repository `KIT-Capital/dulcinea-investments-replit`.
- A Codex publication must not modify, push to, synchronize with or publish the
  Replit project or repository. Do not pull Replit code or assets into this site.
  Transfers between the versions require an explicit user request.
- Preserve the financial password gate, existing secret values, public asset
  allowlist and private source-file exclusions. Never publish repository roots
  or financial source workbooks as static assets.
