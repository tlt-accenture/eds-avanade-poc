# library-metadata

Labels a sample in the DA editor's block library. It is not for pages.

## Where the library lives (Document Authoring)

- `docs/library/blocks.json`: the list the editor's **Library → Blocks** panel shows (sheet `data`:
  `name`, `path`; sheet `options`: the section-metadata style values). The DA site configuration's
  "Blocks" library entry points at it.
- `docs/library/blocks/<block>`: one sample page per block, one section per entry. Each section holds
  the block and a `library-metadata` table with `name` (the entry's title in the panel) and
  `description`.

## On a rendered page

The block removes itself, so a previewed sample page shows only the sample blocks. It is listed in
`components` in `scripts/scripts.js`, so no stylesheet is requested.
