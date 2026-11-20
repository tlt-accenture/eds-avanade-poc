# Block styles plugin

A DA Library plugin: authors pick a block from a dropdown, then a layout and a color theme, see a
live preview, and insert the block. Design: `docs/specs/004-block-style-plugin/spec.md`, with the
version 2 goals in `docs/specs/007-block-styles-v2/spec.md`.

## Search

Search covers the selected block only. When a term isn't one of its styles, a message says so, and
offers a **Switch to …** button for each other block that has it (up to 3). When part of a search
isn't for the block, the rest still filters and a note names the word left out. The blocks offered
are `BLOCKS` in `samples.js`; the dropdown, search and the lookup all read that list.

## Where the choices come from

The DA sheet `/library/block-style-options`, one row per variation. Authors add, rename, reorder and
describe entries there; the panel lists the rows in sheet order.

| Column | Meaning |
|---|---|
| `block` | The block the row belongs to, e.g. `cards-case-study` |
| `group` | `layout` or `theme` |
| `class` | The option word in the block header, e.g. `cols-2` (lowercase, words joined by `-`) |
| `label` | The name authors see in the list |
| `keywords` | Extra words the search matches, comma separated |
| `description` | A one-line hint shown under the name |

Rows with a different `group`, or a `class` that isn't lowercase-with-dashes, are ignored. Search
matches `label`, `class` and `keywords`, not `description`.

A row only changes the list. A **new** `class` also needs CSS in the block before it looks any
different; renaming a `label` or adding `keywords` needs no code. `background` on
`hero-title-banner` is a content shape (it adds a picture row), not a class.

If the sheet is missing, the panel falls back to the `options` in each block's `metadata.json`.

## Samples

Previews and inserted rows come from `/library/block-styles`, built by the `library` import template.
