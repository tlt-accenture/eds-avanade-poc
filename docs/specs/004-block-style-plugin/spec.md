# Block style plugin

Date: 2026-11-13
Status: in progress (step 1 of the plan built locally)

## Problem

Authors pick a block's look by typing an option into the block table header:
`columns-image-text (highlights)`. Nothing checks the word. A typo, or an option that belongs to a
different block, silently falls back to the default look, and nothing in the editor shows what an
option will look like before the page is previewed.

Step 3 of the POC adds color and layout variations to three blocks, and a Document Authoring (DA)
plugin that lets an author see each variation and insert it without typing option names.

## Scope

Three blocks, chosen because they appear on both templates (homepage and service pages):

| Block | Layout options | Default |
|---|---|---|
| `columns-image-text` | `image-left`, `image-right`, `stacked`, `highlights` (exists) | image side follows cell order |
| `hero-title-banner` | `split` (exists), `left`; background image is a content shape, not an option (the block already reads an optional picture row) | centered |
| `cards-case-study` | `text` (exists), `cols-2`, `cols-4` | image cards, 3 per row |

One shared set of color themes on all three blocks:

| Option | Look |
|---|---|
| none (light) | today's look |
| `dark` | charcoal surface, white text, white buttons |
| `light-grey` | light grey surface (`--color-shaded`), charcoal text |
| `gradient` | brand gradient surface (`--gradient-brand`), white text |

An author combines at most one layout option and one theme: `cards-case-study (cols-2, dark)`.

Out of scope: other blocks, restyling a block already on a page (see Constraints), and Sidekick
integration.

## Constraints

- **The DA plugin SDK inserts; it cannot read or change the author's selection.** The SDK gives a
  plugin `context`, `token` and `actions`; the actions are `sendText`, `sendHTML` and
  `closeLibrary` (aem.live, "Developing apps and plugins"). So the plugin inserts new blocks. To
  restyle an existing block, the author edits the header words; the plugin shows the exact header
  to copy. Rewriting the document through the source API while it is open in the editor would race
  the editor's own saves, and is not attempted.
- **Existing pages must not change.** The homepage and the 10 live service pages use these blocks
  with no options or with `highlights`, `split` and `text`. Every new rule sits under its option
  class, and both templates are re-measured against live after each block, as in step 2.
- **Buildless, Baseline Newly available, mobile-first** (min-width 600/900/1200), per `AGENTS.md`.
  The plugin is a plain HTML page plus an ES module under `tools/`; no bundler, no framework.
- **Themes reuse the design system.** `dark` and `gradient` set `color-scheme: dark` on the block,
  the way the `pink-gradient` section style already flips `light-dark()` tokens to white, so text,
  links and buttons follow without per-block color rules.
- **Registering the plugin changes the DA site configuration**, which is outward-facing: it needs
  the owner's go-ahead in its own step.

## Decisions

1. **Options, not new blocks.** A variation is a class on the existing block, as in step 2. Authors
   keep one block per purpose; the code keeps one decorator.
2. **Themes are shared, layouts are per block.** One vocabulary for color across blocks; layout
   words only where they mean something for that block.
3. **Theme paints the block's own surface.** `columns-image-text` and `hero-title-banner` get a
   rounded panel behind their content; `cards-case-study` themes each card. The section style still
   controls the band behind the block, so `dark` cards on a `pink-gradient` section is a valid
   choice. Confirmed by the owner on 2026-11-13 over the text-color-only alternative.
   Client logos on `dark` and `gradient` cards sit on a small white tile, because the artwork is
   drawn for light backgrounds and dark logos vanished on charcoal.
4. **Samples are content, not code.** The plugin's previews and inserted tables come from one DA
   page, `/library/block-styles`, holding one sample of each block. The plugin composes the header
   from the author's picks and reuses the sample's rows, so sample text and images can be changed
   without a code change. The page doubles as a reference for authors.
5. **The plugin lists picks, not every combination.** 3 blocks × up to 5 layouts × 4 themes is
   about 50 combinations; DA's built-in block library would need a sample for each. The plugin
   instead shows a layout picker and a theme picker, and a live preview of the combination.
6. **Live preview renders the real block.** The plugin page loads the site's `styles.css` and the
   block's own JS and CSS, and decorates the sample with the chosen classes, so what the author
   sees is the shipped code, not a screenshot.

## Plan

1. **Variations in code.** Add the layout and theme options to the three blocks (CSS, and JS only
   where a layout needs it, e.g. forcing image side). Update each block's `metadata.json` options
   and README. Re-measure homepage and Cloud against live.
2. **Samples page.** Generated, not hand-written: a `library` import template takes the first real
   instance of each block from the homepage (Industry row, The Avanade Story banner, client-story
   cards) through the existing homepage parsers, and `library-samples.js` keeps only those, each in
   its own section under a label heading, at `/library/block-styles`. Upload to DA and preview on
   request.
3. **Plugin.** `tools/plugins/block-styles/`: `block-styles.html`/`.js`/`.css` (the panel),
   `preview.html`/`.js` (renders one sample through the block's own JS and CSS) and `samples.js`
   (shared: block list, samples URL, options from each block's `metadata.json`, DA table builder).
   The panel loads the DA SDK; outside the editor it still previews, and Insert explains it needs
   the editor. The preview frame renders at 1280px or 375px and is scaled to the panel, because
   media queries follow the frame's width, not the panel's. Built locally 2026-11-13; tested with a
   stand-in SDK (sendHTML receives the composed table, then closeLibrary).
4. **Register.** Add the plugin to the DA site configuration's library, on request.
5. **Test.** In a DA draft page: insert every block × option, preview it, check desktop and phone,
   and check that an existing page is untouched.
6. **Ship.** PR with test URLs; after merge, mark this spec implemented and write
   `progress/step 3.md`.

## Accessibility note

White text on the plain brand gradient measures 3.2:1 at the orange end, which fails WCAG AA for
body text (4.5:1). The `gradient` theme therefore darkens the gradient with a 20% black layer
(owner's decision, 2026-11-13): measured on the rendered blocks, white text is 7.65:1 at the magenta
end and 4.7:1 at the orange end. `dark` (12.6:1) and `light-grey` (11.8:1) pass everywhere.

The `pink-gradient` section style keeps the undarkened brand gradient; changing it would alter the
live homepage and service pages, and is a separate decision.

## Open questions

- Plugin registration details (sheet columns, dialog size) are checked against DA's configuration
  when step 4 is reached.
