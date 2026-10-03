# Team biography release

## Latest biography and spacing update

Published 3 October 2026. Application commit: `bc2c0d5`; Cloudflare version: `2761df60-ce13-42ea-9cef-048ef22c3a1c`. Natalia's biography no longer repeats her marketing title. All four biographies now contain exactly 24 words in English and 27 in Spanish, keeping titles and company affiliations separate.

Notebook presentation layout retains 24px biography type and now uses 48px section padding, 24px space above each portrait row, 28px between portrait and copy, and 32px between rows. The biography areas reserve five lines for equal profile heights. Website profiles have 24px bottom padding and aligned text rows; responsive presentation profiles also have 24px bottom padding.

Portable/web builds, investor-build verification and final KIT copy lint passed. Desktop browser checks in both languages confirmed equal biography-area heights of 131.2px at 1280×720, with bottom-row content ending at 628.7px above the 656px slide boundary. Website biography tops and heights align across all four profiles. Tablet 768×1024 and phone 390×844 layouts have no horizontal overflow. Published EN/ES counts and identical text-area heights were verified directly in the browser. Proof screenshot: `work/storyline-review/core-team-padding-published.png`, retained privately outside the repository.

## Subsequent title correction

Published the user's corrected KIT Capital titles and affiliations on 3 October 2026. Application commit: `bffc6c6`; Cloudflare version: `367cc7ac-8491-4a71-8309-c80dbca8f562`. Dov is Founder and Managing Partner at KIT Capital; Ricardo is Director of Corporate Development at KIT Capital; Adriana is Director of Business Development at KIT Capital and Dulcinea. Natalia's approved role remains unchanged. Role labels and affiliation lines are localized and shared by website and presentation; the contact label and issuer disclosure also use Dov's corrected title.

Portable/web builds and investor-build verification passed, including all four localized roles, affiliations and unchanged uniform biography counts. Browser checks passed EN/ES 1280×720 presentation fit, desktop website row alignment and 390×844 responsive presentation without horizontal overflow. Maximum desktop biography bottom: 642.4px, before slide bottom 656px. Live EN/ES roles, contact label and Spanish disclosure were verified. Proof screenshot remains privately at `work/storyline-review/core-team-titles-published.png`.

## Initial biography release

Published 3 October 2026 to `https://invest.dulcineainvestments.org/`.

- Application commit: `8c40e3a`.
- Cloudflare version: `4b875fca-57f1-4ac2-9356-68580157344c`.
- Source: user-supplied Obra Pia Colliers OM 4Q26, team pages 28–29; Natalia's previously confirmed profile and user-directed role.
- Four core biographies: exactly 30 words each in English, 33 each in Spanish. Existing approved role labels and Dov-first ordering remain.
- Website profiles share grid rows for aligned role labels, names and biographies. Presentation profiles share a two-by-two layout with 24px biography type.
- Jorge Valiente's biography is shared between website, presentation and specialist resource page. Other source specialists were not substituted for differently named Dulcinea specialists. The lawyer's surname remains pending user confirmation.
- Portable and web builds passed. The investor-build verifier passed all ten EN/ES pages, team consistency, links and media coverage. KIT copy lint: zero failures or warnings.
- Browser review: 1280×720 notebook in EN/ES; 768×1024 tablet and 390×844 phone presentation layouts; no horizontal overflow. English and Spanish biographies align within each desktop row and all content fits above presentation controls.
- Live browser verified English and Spanish core profiles and Jorge's specialist biography. Spanish desktop biography bottoms: 340.6px and 598.1px; slide bottom: 656px.
- Direct scripted fetching returned 403; live verification used the rendered browser pages rather than claiming a byte-for-byte fetch comparison.
- Proof screenshot retained privately at `work/storyline-review/core-team-bios-published.png` outside the repository. The supplied OM, extracts and page renders were not copied into the repository or deployment.
