# columns-image-text

Custom **columns** block. Purpose: Two-column image beside text; image side follows cell order.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per split: an image-only cell and a text cell (heading, paragraph, optional list, CTA). Put the image first for image-left, last for image-right, or force a side with the `image-left` / `image-right` option. `stacked` puts the image above the text at every width. Highlights option: in the text cell, each paragraph that starts with bold text (bold title, then description) gets the magenta-to-orange left rule; bullet lists keep the same rule.

## Supported variations

Combine at most one layout and one theme, e.g. `columns-image-text (image-left, dark)`. Themes paint the block's own surface (a rounded panel behind the content); the section style still sets the band behind it.

| Variation | Group | Option class |
| --- | --- | --- |
| Image left | layout | `image-left` |
| Image right | layout | `image-right` |
| Stacked | layout | `stacked` |
| Highlights | layout | `highlights` |
| Dark | theme | `dark` |
| Light grey | theme | `light-grey` |
| Gradient | theme | `gradient` |

## Universal Editor fields

N/A (Document Authoring project)
