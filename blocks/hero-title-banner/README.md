# hero-title-banner

Custom **hero** block. Purpose: Image-less centered title banner: heading, paragraph and link.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: Optional background picture row (text then sits on the photo, white on a dark overlay), then one row with heading, paragraph and CTA link. Left option: stacked and left-aligned. Split option: one content cell with a heading and paragraphs; the heading renders left and everything after it right from 1200px, stacked and left-aligned from 900px, stacked and centered below that.

## Supported variations

Combine at most one layout and one theme, e.g. `hero-title-banner (split, dark)`. Themes paint the block's own surface (a rounded panel behind the content); the section style still sets the band behind it.

| Variation | Group | Option class |
| --- | --- | --- |
| Split | layout | `split` |
| Left-aligned | layout | `left` |
| Dark | theme | `dark` |
| Light grey | theme | `light-grey` |
| Gradient | theme | `gradient` |

## Universal Editor fields

N/A (Document Authoring project)
