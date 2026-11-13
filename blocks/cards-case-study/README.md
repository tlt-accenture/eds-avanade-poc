# cards-case-study

Custom **cards** block. Purpose: Grid of client story cards: photo, client logo, name, description and Read more link.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per card: cell 1 photo; cell 2 logo picture (optional, first paragraph), client name heading, description, link as last paragraph. Text option: one cell per row (heading, paragraph, optional link as last paragraph). White rounded cards in a scroll-snap row with prev/next buttons while the row overflows. `cols-2` / `cols-4`: 2 or 4 cards per row from 900px.

## Supported variations

Combine at most one layout and one theme, e.g. `cards-case-study (text, dark)`. Themes paint the block's own surface (each card); the section style still sets the band behind it.

| Variation | Group | Option class |
| --- | --- | --- |
| Text | layout | `text` |
| 2 per row | layout | `cols-2` |
| 4 per row | layout | `cols-4` |
| Dark | theme | `dark` |
| Light grey | theme | `light-grey` |
| Gradient | theme | `gradient` |

## Universal Editor fields

N/A (Document Authoring project)
