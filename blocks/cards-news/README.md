# cards-news

Custom **cards** block. Purpose: Bordered news cards with a tag label, title and Read more link.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per card: one cell with tag paragraph (optional icon + text, e.g. :news: News), title heading, and link as last paragraph. An optional leading image cell is supported. List option: the same table; the cards become rows top to bottom with dividers (the tag in its own column from 900px), "Read more" shows as an arrow at the end of the row, and an image cell becomes a small thumbnail.

## Supported variations

Combine at most one layout and one theme, e.g. `cards-news (list, dark)`. Light is the default theme: light grey tiles on the page. Dark: charcoal tiles (List: a charcoal panel behind the rows). Light grey: a light grey panel behind the block, and the tiles turn white (List: a light grey panel behind the rows). The section style still sets the band behind it.

| Variation | Group | Option class |
| --- | --- | --- |
| List | layout | `list` |
| Dark | theme | `dark` |
| Light grey | theme | `light-grey` |

## Universal Editor fields

N/A (Document Authoring project)
