# Dulcinea logo package - copper edition

Open **index.html** after extracting this ZIP for a visual catalog and direct asset links.

## Brand structure

- **Dulcinea** is the residential investment platform.
- **Dulcinea One** is the first fund investors invest in.
- The doorway symbol is shared across the family; the fund identifier sits under the Dulcinea wordmark.
- This package uses deep teal and burnished copper. Copper replaces the earlier coral accent.

## Start here

| Need | File or folder |
| --- | --- |
| Website logo on a light background | dulcinea/svg/dulcinea-color-on-light.svg |
| Fund logo on a dark background | dulcinea-one/svg/dulcinea-one-color-on-dark.svg |
| PowerPoint or Google Slides | Each brand's png/ folder; use 2048 px for best resolution |
| Print or large-format output | Each brand's pdf/ or eps/ folder |
| Browser tab and app icons | favicon/ |
| Link sharing image | opengraph/; use a 1200 x 630 PNG or JPG |
| Color values | palette/ or Dulcinea_Logo_Usage_Guide.pdf |

## Logo variants and formats

Each brand includes four matching variants:

- `color-on-light`: deep teal lettering and symbol, copper accent. Transparent.
- `color-on-dark`: ivory lettering and symbol, copper accent. Transparent.
- `mono-black`: every element black. Transparent.
- `mono-white`: every element white. Transparent.

SVG, PDF and EPS contain actual vector paths, including outlined lettering. These are not raster images embedded inside vector wrappers. No font installation is required to display the logos. Geometry was traced and normalized from the approved image concept; the parent and fund logos share the same symbol and main wordmark master.

Transparent PNG exports are provided at 512, 1024 and 2048 pixels wide, with proportional heights and built-in clear space. Lossless WebP versions are 1024 pixels wide. JPG versions are 2048 pixels wide, flattened onto ivory or deep teal backgrounds. SVG/PDF/EPS masters can be enlarged freely.

White and ivory vector or transparent assets can look blank in a white preview window. Place them on a dark background. Use the JPG files when an opaque background is required.

Print assets use the sRGB brand colors. For commercial print, convert using the printer's requested profile; this package does not assign a generic CMYK or metallic spot ink. Copper is a flat brand color.

## Icons

The shared doorway mark identifies the whole Dulcinea family. Page titles and fund-specific Open Graph cards distinguish Dulcinea One.

- `favicon.svg`: adaptive colors for light and dark browser appearance.
- `favicon.ico`: 16, 32, 48 and 64 px fallback images in one file.
- `favicon-16x16.png` through `favicon-64x64.png`: fixed teal tiles with an ivory/copper mark.
- `apple-touch-icon.png`: 180 x 180.
- `icon-192.png`, `icon-512.png`: standard app icons.
- `maskable-icon-512.png`: artwork kept inside the maskable safe area.
- `social-avatar.png`: 1024 x 1024 shared brand avatar.
- `safari-pinned-tab.svg`: monochrome mask.
- `dulcinea.webmanifest` and `dulcinea-one.webmanifest`: select the correct name for the site. Manifests default to `/` as the start URL; adjust it if the application lives under another route.

## Open Graph

Both brands have light and dark cards, each 1200 x 630. Use PNG or JPG for published social previews. SVG files are editable source artwork and are not the recommended og:image format. Every card keeps the brand name and core message inside the central content area.

The `web-integration/` examples assume the package folders are deployed under `/brand/`. Replace `https://example.com` and each page title, description and canonical page URL before publishing. OG image URLs must be public, absolute HTTPS URLs. The same PNG/JPG can be used for a summary_large_image card. No website has been deployed by this package.

Open Graph reference: https://ogp.me/

## Palette

| Color | Hex | RGB |
| --- | --- | --- |
| Deep teal | #103D40 | 16, 61, 64 |
| Burnished copper | #B9684F | 185, 104, 79 |
| Lagoon | #2D8C88 | 45, 140, 136 |
| Mist | #CFE8E3 | 207, 232, 227 |
| Ivory | #F6F4EE | 246, 244, 238 |
| Graphite | #273238 | 39, 50, 56 |

Use light backgrounds for most presentation slides, deep teal for covers and dividers, graphite for body text and copper as an accent. Avoid small copper body text on light backgrounds.

## File integrity

`asset-manifest.csv` lists filenames, dimensions where relevant, sizes and SHA-256 hashes. All assets use relative paths in the catalog and contain no external font or image dependencies.
