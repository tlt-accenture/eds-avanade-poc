# cards-stats

Custom **cards** block. Purpose: 2x2 grid of oversized stat values with captions and divider rules.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per stat: either one cell with value paragraph then caption paragraph, or two cells (value | caption). Values are plain text, not headings. Row option: the same table; a compact band with smaller numbers, two per row on phones, and from 900px all in one row (up to 4; from 5 stats, rows of 4), with a thin divider between neighbours. The count-up is unchanged.

## Supported variations

Combine at most one layout and one theme, e.g. `cards-stats (row, dark)`. Light is the default theme. Themes paint a rounded panel behind the figures for both layouts; the section style still sets the band behind it. On Dark the numbers are white (the gradient's magenta end is 2.3:1 on charcoal).

| Variation | Group | Option class |
| --- | --- | --- |
| Row | layout | `row` |
| Dark | theme | `dark` |
| Light grey | theme | `light-grey` |

## Universal Editor fields

N/A (Document Authoring project)
