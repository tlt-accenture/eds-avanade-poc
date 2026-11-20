# accordion

Custom **accordion** block. Purpose: Expandable items built on native details/summary; first item open.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per item: cell 1 title; cell 2 content (optional subheading, paragraphs, optional link). Default: gradient pill headers. cards option: each item a white rounded card with a vertical brand accent on its leading edge. faq option: plain rows with dividers and chevrons.

## Supported variations

Combine at most one layout and one theme, e.g. `accordion (faq, dark)`. Light is the default theme. Themes paint the block's own surface: a rounded panel behind the accordion for the default and FAQ layouts, each card for Cards; the section style still sets the band behind it.

| Variation | Group | Option class |
| --- | --- | --- |
| Cards | layout | `cards` |
| FAQ | layout | `faq` |
| Dark | theme | `dark` |
| Light grey | theme | `light-grey` |

## Universal Editor fields

N/A (Document Authoring project)
