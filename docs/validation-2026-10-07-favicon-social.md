# Favicon and Open Graph audit

7 October 2026. Before changes, live English/Spanish homepages had correct
localized social metadata and public 1200x630 JPEG cards matching local hashes.
Facebook, Twitter and WhatsApp user-agent requests returned 200 without a login
redirect or challenge. This verifies HTTP delivery, not a platform-rendered card.

Issues found:

- The homepage used a white transparent symbol; the conventional `/favicon.ico`
  returned 404. Supporting pages and the login had no favicon declarations.
- Six public EN/ES resource pages lacked Open Graph and canonical metadata.
- `robots.txt` disallowed all crawlers, including preview agents that honor it.

Changes:

- Reuse the existing approved brand artwork: adaptive SVG, ICO, 32px PNG and
  180px Apple touch icon. All built pages and the login reference these assets.
  Portable EN/ES outputs use working relative icon paths. Node/Replit serves
  ICO with the correct MIME type.
- Add localized, page-specific metadata and canonical URLs to resources.
  Keep the verified branded share images and homepage video metadata.
- Permit named preview crawlers only on the existing public page aliases and
  approved asset paths. Keep the default crawl block, noindex response headers,
  private financial routes and denied source-document routes.

The production build/verifier passed all ten EN/ES pages, 77 files, 59 media
aliases and 16 MP4s. All 57 server tests passed, including public icon delivery,
preview-only robots routes and financial/source protection for crawler agents.
The build verifier now checks icons, exact brand bytes, unique social tags and
canonical URLs on every page.

Primary implementation references:

- https://ogp.me/
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel#icon
- https://api.slack.com/robots

Publication and live verification are recorded after deployment.
