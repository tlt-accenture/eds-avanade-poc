# Block styles plugin, version 2

Date: 2026-11-20
Status: goal 1 shipped (PR #25); goal 2 in progress; later goals to come from the owner

Builds on `docs/specs/004-block-style-plugin` (the panel, its samples and the DA options sheet). The
owner is bringing a set of goals, taken one at a time. The direction is known: later goals bring in
**every block built for this project**, not just the three the panel offers today. So each goal is
built to scale with the block list: nothing may assume three blocks.

## Goal 1: a block dropdown and a search scoped to it

### Problem

- The panel picks a block with one radio button per block. That's fine for three blocks; with every
  project block it becomes a long list above the search.
- Search already looks only at the selected block's layouts and themes, but a term that belongs to
  another block just shows "No layouts match" and "No color themes match". The author can't tell
  whether the style doesn't exist or is on another block.

### Decisions (owner, 2026-11-20)

1. **A dropdown for the block.** A standard `<select>` labelled "Block", built from the block list.
   The first block is selected when the panel opens, so the preview always has something to show.
   Why not the fully customizable select (`appearance: base-select`): it is Chrome and Edge only, and
   this project uses only features that work in every major browser (AGENTS.md, Baseline Newly
   available); a standard select also keeps keyboard, screen-reader and phone behavior for free.
2. **Search only covers the selected block.** Its layouts and themes, as today. Switching blocks keeps
   what was typed and runs it again, so the author doesn't retype.
3. **A message when the term isn't for this block**, replacing the per-group "No … match" lines and
   announced to screen readers:
   - **Found on other blocks:** `"image left" isn't a Title banner style. It's in:` and a **Switch to
     …** button per block (up to 3, then "and N more"). Switching selects that block, keeps the search
     and puts the focus back in the search field.
   - **Found nowhere:** `No styles match "sparkly".`, with a hint built from the block's own styles
     (e.g. `Try a layout or a color theme, such as "Split" or "Dark".`).
   - **Part of a search isn't for this block** (e.g. "dark sparkly"): the other words still filter as
     today, and a note says `"sparkly" isn't a Title banner style, so it's left out.`, with the same
     Switch buttons if another block has it.
4. **One block list.** The dropdown, the search and the cross-block lookup all read the same list, and
   the panel loads every listed block's styles up front (one sheet request; the per-block
   `metadata.json` fallback only when the sheet is missing). Adding blocks later is a change to that
   list and the sheet, not to this logic.

### How matching works (unchanged rule, now shared)

A style's search text is its label, its option word and its sheet keywords. Each typed word narrows the
group (layouts or themes) it means something in; a style matches when it has all of its group's
meaningful words. A word that means nothing in either group of the selected block is "not for this
block". A term belongs to another block when every one of its words means something there and at
least one of that block's styles matches.

### Plan

1. Spec (this section).
2. Code: `block-styles.html` (the select and the message), `block-styles.js` (block list, shared
   matching, message, Switch), `block-styles.css` (select and message styles). `samples.js` unchanged.
3. Tests in the local preview with the editor stand-in: every block; a term for the selected block; a
   term for another block and Switch; a term for nothing; "dark 2 per row"; a partly unknown search;
   switching blocks with a search typed; keyboard only; the narrow panel width; insert still sends the
   right table.
4. One PR. The editor's "Block styles" entry already points at `main`, so no EW settings change.

## Goal 2: every project block, layouts first

### Problem

The panel offers 3 of the 11 blocks authors place on pages. Of the 11, 5 have layout variations
(Image and text columns, Title banner, Case study cards, Accordion: FAQ, Homepage hero: card) and 6
have none (Contact, Jump links, News cards, Promo carousel, Quote carousel, Stats cards). Only the
first 3 have color themes. Not counted: site parts (header, footer, the office-hours banner), helper
blocks (fragments, library labels) and Author Kit's own blocks.

### Decisions (owner, 2026-11-20)

1. **All 11 blocks in the dropdown**, named as in the DA block library and in alphabetical order, so
   authors see one name per block in both Library panels.
2. **A sentence instead of a blank group.** A block with no layouts shows "This block has no layout
   variations." in the Layout box; with no color themes, "This block has no color themes yet." Color
   themes for the other 8 blocks are the next goal.
3. **Samples from the DA block library** (`/docs/library/blocks/<block>`), the pages the Library's
   Blocks list already uses, instead of `/library/block-styles` (3 blocks only). A picked layout uses
   the entry made for it, so the card hero and the FAQ accordion preview and insert their own content;
   otherwise the plain entry, with option classes added. Each block's page is fetched when it is first
   picked.
4. **Two new rows in the options sheet** (`/library/block-style-options`): `accordion` / layout /
   `faq` and `hero-video-badge` / layout / `card`, with labels, keywords and descriptions. The blocks'
   `metadata.json` fallback lists tag those two options as layouts too.

### Ships in two parts

- **Code** (PR): the block list, the sentences, the samples source.
- **Content** (EW, on request): the options sheet with the two new rows, uploaded and previewed.
  Until it is, Accordion and Homepage hero show "no layout variations".

## Goal 3: more layouts, one block at a time

Before color themes, the owner is adding layout variations to Accordion, Contact, Homepage hero,
News cards and Stats cards, one block at a time. Each ships the same way: the style's CSS, the
block's README and `metadata.json` fallback (code, one PR), then a row in the options sheet and an
entry on the block's library page (content, uploaded and previewed on request, built on the EW version
read just before).

| Block | New layout | What it is | Why this one |
|---|---|---|---|
| Accordion | **Cards** (`cards`), between Default and FAQ | Each item a white rounded card with a thin border, a soft shadow and a vertical brand accent; title above any subheading in size; focus ring inside the card | Default (gradient bars) is loud and FAQ is flat; Cards is calm enough to repeat and sits well on grey bands. Default stays the gradient bars, so the 10 Services pages don't change |
| Contact | **Banner** (`banner`) | A slim strip in a white rounded panel: heading beside the button from 900px, stacked and centered below; no picture (only cell 1 is used) | Default is a 540px closing section with a tall photo; Banner is a mid-page or photo-free call to action, about 107px tall |
| Homepage hero | **Split** (`split`), after Card | No photo behind the text: dark headline, intro and button on the page, the photo row in a 30px-rounded frame beside it from 900px (below it on phones); badge cell not shown; 440px tall on desktop | The only hero with text beside the photo instead of on it: for photos whose detail text shouldn't cover |
| Homepage hero | **Compact** (`compact`) | A short strip (about 280px): headline and intro in white on the photo, no badge, no button; a 55% dark layer under the text (flat on phones, fading past the text column from 900px) | The only short hero, for inner pages. The dark layer was measured: the worst pixel under the intro is 5.07:1 (desktop) and 5.35:1 (phone) against white, where 20% left it at 2.4:1 |
| News cards | **List** (`list`) | The same cards as rows top to bottom with dividers, each as tall as its text (81px on desktop against 464px tiles); the tag in its own 160px column from 900px, so titles line up; "Read more" as the arrow at the end of the row (its accessible name unchanged); the whole row is the link and shows the focus ring; an image cell becomes a 96px thumbnail | The only version for many items or narrow spaces: the tiles scroll sideways after 4 or 5 and leave short headlines in mostly empty tiles |
| Stats cards | **Row** (`row`) | A compact band: from 900px all figures in one row (up to 4; from 5, rows of 4 with a rule between rows), 56px numbers, a thin divider between neighbours; two per row on phones (40px numbers); each figure starts at the top of its row; count-up unchanged | The default is a feature moment (96px numbers, two by two, 529px) and stacks to 1,123px on phones; Row is 142px on desktop and 417px on phones, for a band of figures on any page |

Also fixed: the panel's message now uses "an" before a vowel ("isn't an Accordion style").

## Goal 4: color themes, one block at a time

Accordion, Contact, News cards, Quote carousel and Stats cards get at least Light (the default, no
class), Dark and Light grey, using the shared theme layer in `styles/styles.css` (`--block-surface`,
`--block-scheme`): each block decides which element is its surface, and its text, links and icons
follow the theme's color scheme. A block's layouts and themes combine, e.g. `accordion (cards, dark)`.
Each ships as before: CSS, README and `metadata.json` (one PR), then the theme rows in the options
sheet (worded as the existing theme rows). Themes have no block library entries; the Block styles
panel previews them.

| Block | Surface | Dark-specific | Checked |
|---|---|---|---|
| Accordion | Default and FAQ: a 30px-rounded panel behind the accordion (24px padding, 40px from 900px). Cards: each card | The magenta focus ring (2.3:1 on charcoal) becomes white (12.6:1); title and link hovers underline instead of turning gradient | Every layout × theme at 1440 and 375: body text and links 12.6:1 (dark) and 11.8:1 (light grey); titles the same, or white on the gradient bars |
| Contact | Default: a 30px-rounded panel behind the heading, button and photo (24px padding; 40/64px and an 80px column gap from 900px). Banner: its own panel, border `light-dark(#ccc, #5c5c5c)` | The focus ring becomes white. The shared primary button already turns white with dark text in a dark scheme | Both layouts × 3 themes at 1440, 900 and 375: heading 12.6:1 (dark) and 11.8:1 (light grey); button text 18.9:1 on dark; the button stands out from the panel at 11.8–12.6:1 |
| News cards | The default tiles are already light grey (`--color-shaded`), so (owner's choice, option A) Light keeps them. Dark: each tile charcoal. Light grey: a 30px-rounded grey panel behind the tiles (max 1128px), tiles white. List: Dark and Light grey both a panel behind the rows | The tag icon is a dark PNG from the source site, so it is inverted to white; the focus ring becomes white; title and link hovers underline | Both layouts × 3 themes at 1440 and 375: text 12.6:1 on charcoal and on the white tiles, 11.8:1 on light grey; the icon visible on charcoal |
| Quote carousel | No layouts and no background of its own: a 30px-rounded panel behind the quotes and their controls (24px padding, 40px from 900px). The quotation mark keeps the brand gradient (decorative, hidden from screen readers) | The focus ring becomes white | Text, author rule and arrows 12.6:1 (dark) and 11.8:1 (light grey) at 1440 and 375. Also fixed: the other quotes' dots were 1.5–1.6:1, below the 3:1 a control needs, now `light-dark(#8c8c8c, #ccc)` (3.1–7.9:1); and Next/Previous did nothing until a manual swipe, because the block measured its width while the section was still hidden (0, so the position was NaN) |
| Stats cards | Both layouts: a 30px-rounded panel behind the figures (24px padding, 40px from 900px); dividers `light-dark(#ccc, #5c5c5c)` | The numbers are white: the brand gradient's magenta end is 2.3:1 on charcoal, below the 3:1 large text needs | Both layouts × 3 themes at 1440 and 375: Dark numbers and captions 12.6:1; Light grey captions 11.8:1, gradient numbers 5.09 → 2.95:1 (see below) |

**Open: the gradient numbers on light grey.** The gradient's orange end is 2.95:1 on light grey (#f6f7fb),
a hair under the 3:1 large text needs (3.16:1 on white). The live homepage stats sit on a light-grey
section, so it is already the case there; the Light grey theme matches it. A fix would darken the orange
end of gradient text site-wide, a separate decision.

## Later goals

- Color themes for the 8 blocks that don't have them yet.
- More to come from the owner, one at a time.
