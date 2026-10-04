# Video library and remote preservation

The independent review branch retains one canonical web MP4 for each of the sixteen Adobe stock identities. MOV/MP4 source variants and repeated uploads are cataloged as the same stock identity, not extra clips. Finished films are distinct edits with recorded source provenance.

`content/video-library.json` records all 33 distinct repository MP4s, their sizes, SHA-256 hashes, Git blob identifiers and active/reserve status. Seventeen films are active in the review website. The other sixteen remain available for future edits. Active chapters follow `design/video-story.md`; the same property film may appear in its matching preview and detailed view, and English, Spanish and presentation mode reuse the same file.

All 32 MP4s were verified against the remote review branch on 4 October 2026. Run `npm run verify:videos` to check local integrity, duplicate files, canonical stock identities and active aliases. Run `npm run verify:videos -- --remote` to compare every video against GitHub's complete remote tree. Update the catalog whenever a film is added, replaced or reassigned. Keep stock originals and full-length third-party source clips in private storage rather than exposing them as public app assets.

The full-quality Adobe originals remain in Dulcinea's private Dropbox `Media/Stock Video` folder. Remote file IDs, server modification times and byte sizes were checked for all 29 original upload files (14 stock identities). Their remote Dropbox content hashes also match the local files byte for byte. SHA-256 and elementary video stream hashes identify three groups of identical repeated MOV uploads and the MOV/MP4 variants. The source uploads remain intact; the library contains one canonical stock entry per identity.

The additional private Dropbox archive is `Media/Video Archive/Dulcinea-Video-Library-2026-10-04.zip`. It contains 35 unique video entries: all 31 repository MP4s plus the two full-length approved Coverr source clips and the two rejected Pexels clips. The rejected clips remain labeled `rejected-do-not-publish`; this archive does not reactivate them. The running-couple candidate was never downloaded and is not counted as a stored clip.

Archive SHA-256: `07cc99100f96090efc942041751907db0413f0b745775c10de706cccb592ee93` (177,586,924 bytes). Its remote Dropbox content hash matches the local archive. It includes its own private hash inventory and restore instructions. Original Adobe files are referenced at their verified Dropbox locations instead of being duplicated inside the archive. A separate local preservation copy, audit and remote hash verification live under `preservation/2026-10-04/` outside Git.

Restore the archive to a temporary directory, check each extracted file against its SHA-256 inventory, then select the needed film or source. For a fresh high-quality Adobe edit, retrieve the original from its recorded Dropbox file ID. Do not publish the private audit or reserve-source folder. Git history preserves prior edited versions; no production website, media binding or hosting setting is changed by this preservation work.

## Medellin driving addition

Adobe 2118104932 has one canonical web MP4, keeping the original 12:5 horizontal frame. The two identical local MOV uploads remain untouched. The supplied original is already present in private Dropbox (file ID `id:FE3KTj4bqBMAAAAAAAnQ2g`, revision `65d0a999631da0017e12f`, 56,293,914 bytes); remote metadata was verified. The existing 35-entry archive predates this addition. The optimized MP4, poster, import script and source provenance are retained on the independent review branch.

After this addition, all 32 retained MP4s were verified against the complete GitHub review-branch tree by blob identifier and byte size. No duplicate retained MP4 was found.

Adobe 1164208469 adds a full-frame Guatapé couple scene to the website and presentation. The source MOV remains unchanged in private Dropbox (file ID `id:FE3KTj4bqBMAAAAAAAnQ3A`, revision `65d0b1313c4100017e12f`, 29,009,225 bytes). Remote metadata was checked. This is a regional outing, not an American expat testimonial. The historical 35-entry ZIP predates this addition.
