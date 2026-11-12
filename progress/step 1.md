# Step 1: Migrate the Avanade homepage, header and footer

**Status:** complete (2026-11-12)
**Source:** https://www.avanade.com/en-us
**Live:** https://main--eds-avanade-poc--tlt-accenture.aem.live/en-us

## 1. The homepage content

- avanade.com/en-us was imported as **/en-us**, uploaded to Document Authoring (DA) and published.
- Each part of the page became either default content (text, headings) or a **block** (a reusable
  component an author fills in like a table).
- Three **section styles** authors can pick per section: **light-grey** (grey background),
  **centered** (centered text) and **pink-gradient** (Avanade's pink-to-orange band).

**Why:** authors edit words and pictures in DA without touching code. Like a fill-in-the-blank
form: the code decides the layout, the author only fills the boxes.

## 2. Seven custom blocks

| Block | What it is |
|---|---|
| hero-video-badge | Top banner: headline, "Partner of the Year" badge, Play Video button that opens the video in a dialog |
| carousel-promo | Rotating promo cards with dots and a pause button, so motion can be stopped |
| cards-case-study | Client stories (Mammut, EQ Bank, Fater) with image, logo and "Read more" |
| columns-image-text | Image beside text, image on either side (Industry, Services, Insights, Careers) |
| hero-title-banner | "The Avanade Story" centered banner |
| cards-stats | 21X / 7K+ / 60K / 165K numbers that count up when scrolled into view |
| cards-news | "In the news" cards |

## 3. The design system (CSS variables)

`styles/brand.css` holds every brand decision in one place:

- **Palette:** magenta `#ce0569`, orange `#ff5800`, charcoal `#333`, light grey, the brand gradient.
- **Meaning-based names** blocks use: `--color-text`, `--color-link`, `--color-brand`,
  `--gradient-brand`, and so on.
- **Type and buttons:** Segoe UI, heading sizes that grow at desktop width, the rounded button
  shape.

**Why:** change one value and every block follows. Like a paint swatch card: repaint the swatch
"brand pink" and every wall painted with it changes, without hunting through the house.

## 4. The header

- **Desktop:**
  - Logo and five menu items, each with a large drop-down panel.
  - Contact Us, the location picker (21 countries), and the Try Avanade AI and search panels.
  - A blurred backdrop; clicking it closes the open panel.
- **Mobile:**
  - The ☰ icon opens a full-height menu; each item opens its own list with a "‹ Main Menu" back row.
  - The location list and Contact Us sit inside the menu.
  - Search and AI open as sheets under the bar.
- **Accessibility:** works by keyboard, Escape closes panels, the page behind an open menu is
  locked, and screen readers announce every control.
- **Content:** 4 fragments in DA: `/fragments/nav/header`, `header/languages`, `header/search`,
  `header/ai`.

## 5. The footer

- Logo and "Do what matters", two link columns, LinkedIn / YouTube / Instagram (opening in a new
  tab), legal links and the copyright line.
- Stacks on phones, 3 columns from 900px, 4 from 1200px.
- Matched avanade.com in every measurement taken.
- **Content:** `/fragments/nav/footer` in DA.

## 6. Icons

12 icons in `img/icons/`: logo, globe, sparkle, search, menu, close, chevron, arrow and the three
social icons. They are cleaned up to take on the text color, and authors place them by typing a
code like `:linkedin:`.

## 7. The import tool

- `tools/importer/` holds a reusable importer (`import-home.js`): one parser per block, plus
  cleanup and section rules.
- **Why:** it can re-import this page, or similar pages, without rebuilding by hand. Useful for
  step 2.

## 8. Quality checks

- Accessibility and SEO scored 100 in Lighthouse. Fixes included alt text, heading order, a pause
  control for motion, and labels for icon buttons.
- The header and footer were compared against avanade.com link by link and pixel by pixel, at
  desktop, tablet and phone widths.

## 9. Preview helpers (local workspace only)

Two small pieces of code run only in the local preview (pages under `/content/`). They copy what
Edge Delivery does on the real site: turning `:icon:` codes into icons, and applying section
styles. They never run on the live site.

## 10. On GitHub and online

| Where | What |
|---|---|
| PR #2 (merged) | Homepage blocks, design system, importer |
| PR #3 (merged) | Header, footer, icons |
| Document Authoring | /en-us page and 5 header/footer fragments |
| Live | /en-us with the Avanade header and footer, 0 errors |
| btf-eds | Nothing from this work went there |

## Not done in step 1

- Decorative curves and swooshes were skipped.
- The old Author Kit "features" header fragment is still in DA, unused.
- The header and footer link to Avanade pages (Industries, Services and so on) that haven't been
  migrated yet, so those links lead to "not found" pages for now.

## Next: step 2

A page template: a reusable layout for pages that share the homepage's blocks.
