# contact

Custom **custom** block. Purpose: Contact prompt: heading and button link beside a rounded portrait photo (stands in for the Marketo form).

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row, two cells: cell 1 H2 and a bold link to /en-us/contact (renders as the primary button); cell 2 image only. Banner option: cell 1 only; a picture cell, if authored, isn't shown.

## Supported variations

Combine at most one layout and one theme, e.g. `contact (banner, dark)`. Light is the default theme. Themes paint the block's own surface: a rounded panel behind the heading, button and photo for the default layout, Banner's own panel for Banner; the section style still sets the band behind it.

| Variation | Group | Option class |
| --- | --- | --- |
| Banner: a slim strip in a white rounded panel, the heading beside the button from 900px, no picture | layout | `banner` |
| Dark | theme | `dark` |
| Light grey | theme | `light-grey` |

## Universal Editor fields

N/A (Document Authoring project)
