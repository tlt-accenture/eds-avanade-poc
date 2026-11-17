# Office-hours banner

Date: 2026-11-17
Status: in progress (owner answered the open questions on 2026-11-17)

## Problem

The POC has an edge worker (`workers/website`) and wants a geo-targeted feature to go with it. A clock
was considered and rejected: a ticking time adds little, since every visitor already has one. The time
is useful when it changes what the site says and what the visitor can do next.

The banner: a small bar at the bottom of the page that greets the visitor with their place and time
of day, and says whether Avanade's team is in right now, with a link to get in touch.

| When (visitor's local time) | Example message |
|---|---|
| Office hours (Mon–Fri, 9:00–12:00 and 13:00–17:00) | "Good afternoon, Texas. Our team is in, so talk to an expert today." → Contact us |
| Lunch (Mon–Fri, 12:00–13:00) | "It's lunchtime in Texas. Leave a message and we'll reply this afternoon." → Contact us |
| After hours, or a weekend | "It's after hours in Texas. Leave a message and we'll reply tomorrow morning." → Contact us |
| Place unknown | Same messages without the place: "Good afternoon. Our team is in…" |

The message is chosen **once, when the page loads**. Nothing ticks or updates while the visitor reads.

## Constraints

- **Edge Delivery's own addresses can't run edge code.** Only the Cloudflare worker knows a visitor's
  location, so the page asks the worker. The request comes from the visitor's browser, so this works
  on `aem.page`, `aem.live` and the worker's own address alike.
- **Cross-origin.** A page on `…aem.page` / `…aem.live` reading the worker's answer needs the worker to
  allow those origins (`Access-Control-Allow-Origin`). The site's CSP (`head.html`) restricts scripts,
  frames and objects, not `fetch`, so no CSP change is needed.
- **Pages stay identical for everyone.** Location never changes the HTML, so Edge Delivery and the
  worker keep caching pages; only the tiny location answer is per-visitor and never cached.
- **Off the critical path.** Loaded from `scripts/lazy.js` after the page has painted (AGENTS.md:
  anything statically reachable from `scripts.js` is on the LCP path). A fixed bottom bar, so it
  doesn't push content around (no layout shift).
- **Author-controlled.** Wording, hours and link live in a DA sheet. It must sit **outside `/library/`**
  (the worker hides that folder) and be **published live**, because the public site reads from
  `aem.live`.
- **Location is coarse and not stored.** City/state come from the visitor's IP address at the edge;
  nothing is logged or kept. VPNs, company networks and some mobile networks can report a different
  place, which only changes a greeting.

## Decisions

1. **Worker endpoint `GET /geo.json`** returns `{ country, region, regionCode, city, timezone }` from
   Cloudflare's `request.cf`, with `cache-control: private, no-store` and `vary: origin`. CORS allows the
   site's own origins only: `main--` and branch previews on `aem.page`, `aem.live`, the worker's address,
   and `localhost:3000`.
2. **Place and time zone: worker first, browser second.** The worker's time zone comes from where the
   visitor is (right for a traveller whose laptop is still on home time). If the worker doesn't answer
   within about a second, the browser's own time zone is used and the place is dropped.
3. **"Office hours" are the visitor's local hours.** The sheet sets days, hours and lunch (Mon–Fri,
   9:00–17:00, lunch 12:00–13:00), evaluated in the visitor's time zone. Public holidays are out of
   scope for the POC.
4. **A block, inserted by `lazy.js`, on the homepage only.** A small loader
   (`scripts/utils/office-hours.js`) adds the block on the localized homepage (`/en-us`) and does
   nothing on any other page, so no other page loads its code or asks the worker. One banner on one
   page is a greeting; the same bar on every page would be a nag. `blocks/office-hours/` (JS + CSS,
   per the block contract) does the rest.
5. **The sheet.** `/fragments/banners/office-hours`, rows of `key | value`:

   | key | example value |
   |---|---|
   | `enabled` | `yes` |
   | `days` | `Mon-Fri` |
   | `hours` | `09:00-17:00` |
   | `lunch` | `12:00-13:00` |
   | `open` | `Good {greeting}, {place}. Our team is in, so talk to an expert today.` |
   | `lunchtime` | `It's lunchtime in {place}. Leave a message and we'll reply {next}.` |
   | `closed` | `It's after hours in {place}. Leave a message and we'll reply {next}.` |
   | `open-anywhere` / `lunchtime-anywhere` / `closed-anywhere` | The same sentences without `{place}`, used when the place is unknown |
   | `link-label` | `Contact us` |
   | `link` | `https://www.avanade.com/en-us/contact` |

   Placeholders: `{greeting}` (morning / afternoon / evening), `{place}` (state for U.S. visitors,
   otherwise city and country), `{next}` ("this afternoon" at lunch, "this morning" before opening, "tomorrow morning", "on Monday"). The link is absolute
   because `/en-us/contact` isn't migrated: on the worker address it would fall back to avanade.com,
   but on `aem.page` / `aem.live` it would be a 404.
6. **Dismissable for the visit.** A close button; dismissal is kept in `sessionStorage`, so the banner
   stays closed for the rest of the visit and can return next time.
7. **Accessible.** An `aside` with a label, a real link and a labelled close button, keyboard reachable,
   AA contrast, and no `aria-live` (it is not news, and it doesn't change). Any entrance animation only
   under `prefers-reduced-motion: no-preference`.

## Plan

1. **Verify the data.** Add `/geo.json` to the worker and confirm on the live worker that Cloudflare
   reports `region`, `city` and `timezone` for real visitors (the owner checks from their own location).
2. **Worker.** The `/geo.json` route with CORS for the site's origins; README updated.
3. **Block.** `blocks/office-hours/office-hours.js` and `.css`: read the sheet, ask the worker (short
   timeout), fall back to the browser time zone, choose the message once, render, dismiss.
4. **Hook.** One dynamic `import()` in `scripts/lazy.js`; nothing added to the LCP path.
5. **Sheet.** Generated locally, then uploaded to DA, previewed and **published live**, on request.
6. **Tests.** Browser tests with a fixed clock and time zone and a stubbed `/geo.json`:
   - a weekday in hours, after hours, and a weekend
   - an unknown place, and the worker down (fallback)
   - the sheet disabled
   - dismissed, then stays closed on the next page

   Plus the homepage unchanged apart from the bar, no layout shift, and phone width.
7. **Ship.** One PR (worker + block + hook) with test URLs. After merge the worker redeploys itself;
   then `progress/step 4.md`.

## Answered (2026-11-17)

- Office hours: Mon–Fri 9:00–17:00 local, with lunch 12:00–13:00 ("It's lunchtime in …", then the
  after-hours sentence).
- Wording: the example messages above.
- Pages: the homepage only.
