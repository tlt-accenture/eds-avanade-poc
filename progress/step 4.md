# Step 4: An edge worker and personalization

**Status:** complete (2026-11-17)
**Worker:** https://eds-avanade-poc.tracytuckeremail.workers.dev (Cloudflare, `workers/website`)
**Designs:** `docs/specs/005-office-hours-banner/spec.md`, `docs/specs/006-campaign-homepage/spec.md`

## 1. The goal

Step 4 puts an edge worker in front of the site and uses it, and the page code, for personalization.
An edge worker is a small program that runs on the CDN, between the visitor and Edge Delivery: it
sees every request before the site does and can answer, redirect or change it.

**Why an edge worker:** like a receptionist in a lobby. Every visitor passes them, so they can send
people to the right floor, keep private rooms closed and greet them by where they're from, without
changing the building.

## 2. Decisions

| Decision | Choice |
|---|---|
| Worker jobs | (A) unmigrated pages go to the same page on avanade.com; (B) author-only folders are hidden |
| Where it runs | Cloudflare, deployed from the dashboard (no terminal), rebuilt from `main` on every merge |
| Personalization 1 | An office-hours banner using the visitor's location (option B of several geo ideas) |
| Personalization 2 | A campaign-aware homepage hero (chosen over an A/B test, which needs real traffic to mean anything) |
| Where personalization works | On `aem.page`, `aem.live` and the worker address alike |
| Pages for both features | The homepage only, so nobody is nagged on every page |

## 3. The worker

Author Kit's reference worker for "bring your own CDN", pointed at this site, plus:

| Request | Answer |
|---|---|
| A page the site has | Served from Edge Delivery |
| A page not migrated yet | Sent to the same page on www.avanade.com, so old links keep working; this stops by itself once the page is migrated |
| `/` | Sent to `/en-us` |
| `/library/…`, `/drafts/…` | Not found: author-only content |
| `/geo.json` | The visitor's country, state, city and time zone (see section 4) |

- **Hidden from search engines** (`noindex`) until a real domain is meant to be found.
- **Deployed from the Cloudflare dashboard:** Workers & Pages → Import a repository, project name
  `eds-avanade-poc`, root directory `workers/website`. Every merge to `main` redeploys it.
- **Caveat:** "push invalidation" is off until a real domain is configured, so a published change can
  take up to 2 hours to show on the worker address.

## 4. Office-hours banner

A small bar at the bottom of the homepage that greets the visitor by place and time of day and says
whether Avanade's team is in:

| Visitor's local time | Message |
|---|---|
| Mon–Fri 9:00–12:00, 13:00–17:00 | "Good afternoon, Texas. Our team is in, so talk to an expert today." → Contact us |
| Mon–Fri 12:00–13:00 | "It's lunchtime in Texas. Leave a message and we'll reply this afternoon." |
| Before 9:00, after 17:00, weekends | "It's after hours in Texas. Leave a message and we'll reply tomorrow morning / on Monday." |
| Place unknown | The same sentences without the place |

- **Worker first, browser second:** the page asks the worker's `/geo.json` where the visitor is. If
  the worker doesn't answer within about a second, it uses the browser's own time zone without a
  place. Only the worker can know the place, so this is the part that needs it.
- **Works on every address:** the visitor's browser asks the worker, and the worker only answers
  the site's own addresses.
- **Chosen once, when the page loads.** Nothing ticks (a live clock was considered and rejected).
- **Closed stays closed for the visit**, then returns in a new tab or the next visit.
- **Authors control it** in the DA sheet `/fragments/banners/office-hours`: on/off, days, hours,
  lunch, every sentence and the link.
- **No layout shift:** the bar floats over the page; it slides in only for visitors who allow motion.

## 5. Campaign-aware homepage

A link from an ad changes the homepage hero to match the ad:

| Link | Hero |
|---|---|
| `/en-us?utm_campaign=ai` | "Turn AI into measurable outcomes." → Explore AI services |
| `/en-us?utm_campaign=cloud` | "Build on a cloud that's ready for AI." → Explore cloud services |
| `/en-us?utm_campaign=security` | "Grow with security you can trust." → Explore security services |
| `/en-us?utm_campaign=none` | Forgets the campaign |

- **In the browser, not the worker.** It first was planned in the worker (no flash at all), but it had
  to work on `aem.page` and `aem.live`, which the worker never sees. The campaign is in the link, so
  the page doesn't need to ask anyone.
- **No flash:** the hero swaps its words before its section is shown.
- **Free for everyone else:** without a campaign, nothing extra loads.
- **Remembered for the visit** (until the browser closes), in every tab.
- **Authors control it** in the DA sheet `/fragments/campaigns/homepage`: a new row is a new campaign,
  with no code change.
- **Fails safe:** an unknown campaign, a missing or slow sheet, or unsafe text in the sheet all give the
  standard hero.

Like a hotel greeting: the banner is the front desk asking where you're from; the campaign hero is the
note in your room, which reaches every guest whichever entrance they used.

## 6. A fix along the way: the "page not found" message

Missing pages on `aem.live` showed an error box with an Author Kit address. The site's "page not found"
template pulls in `/fragments/404`, which had been previewed on 11 Nov but never published live. It is
now published; missing pages show "404 - Not found" with the Avanade header and footer. (Through the
worker, missing pages go to avanade.com instead.)

## 7. Quality checks

- **Worker, on Cloudflare's local runtime and then live:** every route, redirect, hidden folder and
  `noindex`; pages render through it on desktop and phone; `/geo.json` answers the site's own addresses
  and refuses other websites and anything but reading.
- **Banner, with a fixed clock and a stand-in location:** open, lunch, after hours, Friday evening, the
  weekend, before opening, Berlin, worker down, banner switched off, a non-home page (no location
  request at all), closed then reloaded, phone width; no layout shift.
- **Campaign hero:** each campaign, capital letters, remembered, a new tab, a new browser, `none`, an
  unknown campaign, hostile link values and sheet text, the sheet missing or slow, the Cloud page
  untouched, no flash, phone width; then all three campaigns live on all three addresses.
- **Unchanged pages:** the homepage and Cloud page were measured against the live site after each
  change.
- **Page-speed check:** 100 on every PR.

**Lesson learned:** after a code change, a browser that visited the site recently keeps its copy of the
code for up to 2 hours (1 minute on `aem.page`). A hard refresh (Ctrl/Cmd + Shift + R) or a private
window shows the new version at once; real visitors switch within 2 hours, and new visitors at once.

## 8. On GitHub and online

| Where | What |
|---|---|
| PR #12 (merged) | The worker: Avanade fallback, hidden folders, `/` → `/en-us`, `noindex`, README with deploy steps |
| PR #13 (merged) | Office-hours banner and the worker's `/geo.json` |
| PR #14 (merged) | Campaign-aware homepage hero |
| Cloudflare | The worker, rebuilt from `main` on every merge |
| Document Authoring + live | `/fragments/banners/office-hours` and `/fragments/campaigns/homepage` sheets (previewed and published live) |
| Live | `/fragments/404` published; the homepage shows the banner and the campaign heroes |
| btf-eds | Nothing from this work went there |

## Not done in step 4

- **A real domain.** The worker runs on its `workers.dev` address; a real domain would also need push
  invalidation turned on and `noindex` lifted.
- **Cookie consent.** On a real client site, the campaign cookie may need the visitor's consent first,
  especially in Europe.
- **Cloudflare's branch preview builds** fail instantly on PRs (the main build passes). The reason is
  in the Cloudflare dashboard's build log; it doesn't affect the site.
- **Public holidays** aren't part of the office hours.
- **The "page not found" wording** is still Author Kit's generic text.
