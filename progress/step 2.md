# Step 2: A page template for the Avanade Services pages

**Status:** complete (2026-11-13)
**Source:** the pages in avanade.com's Services menu
**Live:** https://main--eds-avanade-poc--tlt-accenture.aem.live/en-us/services/cloud (and 9 more, listed below)

## 1. The investigation

The 11 pages in the Services menu were scanned section by section and compared with the homepage
blocks from step 1.

- **10 of 11 share one layout**, so one "service" template covers them. Some sections are optional:
  the quote appears on 5 pages, FAQs on 7, related insight cards on 1.
- **Microsoft technology services is the outlier.** It uses components no other page has (an
  accordion with images, an awards row, a full-width client-story slider), so it was left out for now.

**Why one template:** the pages differ only in which optional sections they include. Like a
restaurant menu card: every location prints the same layout, some just leave out the dessert section.

## 2. Decisions

| Decision | Choice |
|---|---|
| The "Want to talk to an expert?" Marketo form | A look-alike section with heading, photo and a Contact us button to /en-us/contact. No Marketo form, no data sent anywhere |
| Microsoft technology services | Left out for now |
| How to build | On the Cloud page first, review, then the other 9 |
| Band backgrounds | A new `grey-fade` style (light grey fading to white), as on Avanade |
| Jump links on phones | One sideways-scrolling row (124px when stuck) instead of Avanade's 5 rows (288px) |

## 3. The page layout

| # | Section | Block |
|---|---|---|
| 1 | Hero: photo with a white card | hero-video-badge **(card)** |
| 2 | Jump links: sticky in-page link bar | **jump-links** (new) |
| 3 | Our approach: heading left, text right | hero-title-banner **(split)** |
| 4 | Photo and heading with highlights | columns-image-text **(highlights)** |
| 5 | What you can achieve: white cards on the pink gradient | cards-case-study **(text)** |
| 6 | Capabilities: centered heading and accordion | **accordion** (new) |
| 7 | Customer quote (optional) | **quote-carousel** (new) |
| 8 | Client stories / related links carousel | cards-case-study **(text)** |
| 9 | Related insight cards (optional) | cards-news (reused as-is) |
| 10 | Want to talk to an expert? | **contact** (new) |
| 11 | FAQs (optional) | accordion **(faq)** |

The decorative curves between sections are skipped, as on the homepage.

## 4. Blocks

**Reuse from step 1:** 1 block as-is (cards-news) and 4 with a new style variant. Each variant only
applies when its option is set, so the homepage renders exactly as before (checked at desktop and
phone widths after every change).

- **hero-video-badge (card):** photo with a white rounded card holding the title, text and "Talk to us".
- **hero-title-banner (split):** gradient heading left, text right; centered on phones.
- **columns-image-text (highlights):** each highlight with a magenta-to-orange bar.
- **cards-case-study (text):** white text cards on the pink gradient, with arrows when they overflow.

**New blocks:**

- **accordion:** gradient pill headers, first item open, native open/close (keyboard and screen-reader
  friendly). The **faq** option gives plain rows with chevrons.
- **jump-links:** in-page link bar that sticks under the header, marks the section you are reading,
  and becomes one scrolling row on phones.
- **quote-carousel:** testimonial slides. Arrows and dots only appear with more than one quote, and it
  never autoplays.
- **contact:** "Want to talk to an expert?" heading, photo and a dark Contact us button.

**Supporting changes:**

- **Section anchors:** section metadata can now set an `id`, so the jump links land on their sections.
- **grey-fade** section style and the `--avanade-grey-25` color token in the design system.

## 5. Design

Each of the 8 blocks was measured on avanade.com and matched at desktop and phone widths: 92–97%
per block, about 93% for the whole page (not counting the skipped curves and form).

Known differences:

- Avanade switches layouts at 768px and 1025px; this project uses 600, 900 and 1200, so a few blocks
  change layout slightly earlier or later on tablets.
- Segoe UI isn't available everywhere, so a few lines wrap differently.

## 6. The import tool

- **Template:** a "service" template in `tools/importer/page-templates.json`, an import script
  (`import-service.js`) and 9 parsers.
- **Sections are found by what they contain, not their position** ("the carousel band before the
  capabilities accordion", not "the 7th section"). Like telling a mail carrier "the blue house next to
  the park" instead of "the 7th house": it works on every street.
- **Jump links are matched by label.** Avanade's anchor names vary per page ("whatwecanachieve",
  "Our%20approach", "client-impact"); the labels don't. A page without a section links to the nearest
  equivalent.
- **Full content:** the full FAQ answers (behind "Show more" on Avanade) and lazy-loaded images are
  read from the page's embedded data.
- **Cleanup:** decorative curve sections are now dropped on any template.

## 7. Quality checks

- **Content:** no visible text missing on any of the 10 pages. The import scores (78–90%) are below
  the 90% target only because they count the Marketo form fields and screen-reader text we leave out.
- **Live check:** all 10 pages render with no errors, no broken images and no sideways scrolling on
  phones, and every jump link has a section to land on.
- **Bug fixed:** the hidden "about…" text in the case-study links made phone pages scroll sideways.

## 8. Fix along the way: the blank band

Edge Delivery left an empty section at the end of every page (where the metadata was), showing as an
80px blank band above the footer since step 1. One style rule now hides empty sections (PR #6).

## 9. On GitHub and online

| Where | What |
|---|---|
| PR #5 (merged) | Service template: 4 new blocks, 4 variants, grey-fade style, importer |
| PR #6 (merged) | Hide empty sections (blank band above the footer) |
| Document Authoring | The 10 service pages under /en-us/services/ |
| Live | All 10 service pages, 0 errors |
| btf-eds | Nothing from this work went there |

The 10 live pages: cloud, data-ai-transformation, artificial-intelligence, security, experiences,
agentic-ai-platform, business-applications, pre-packaged-solutions, ai-workforce, managed-services
(each at `/en-us/services/<name>`).

## Not done in step 2

- **Microsoft technology services** needs its own template or extra blocks; its Services menu link
  still leads to "not found".
- **The Marketo form** is replaced by a Contact us button.
- **Pages linked from the service pages** (capability pages, case studies, FAQ links) aren't migrated,
  so those links lead to "not found" for now.
- **Artificial intelligence's capability groups:** its 4 groups share one section, so the alternating
  grey backgrounds are not reproduced.

## Next: step 3

An author plugin that gives style variations for 3 blocks (details to come).
