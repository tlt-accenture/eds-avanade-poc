# Block styles plugin, version 2

Date: 2026-11-20
Status: goal 1 in progress; later goals to come from the owner

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

## Later goals

To come from the owner, one at a time. Known direction: every block built for this project in the
panel.
