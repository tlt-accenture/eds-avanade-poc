# Campaign-aware homepage

Date: 2026-11-17
Status: built (2026-11-17); the sheet is published on request after merge

## Problem

The POC wants a personalization feature that one person can test alone, on a site with no real
traffic. An A/B test was considered and set aside: it assigns versions by chance and only means
something across hundreds of visitors.

A campaign-aware homepage depends on the link the visitor opened, not on chance. A visitor who clicks an
ad about AI lands on a homepage whose hero speaks about AI, with a button to the AI services page.
Everyone else gets the standard homepage. One person can see every version by changing the link.

| Link | Homepage hero |
|---|---|
| `/en-us?utm_campaign=ai` | AI headline, text and button → `/en-us/services/artificial-intelligence` |
| `/en-us?utm_campaign=cloud` | Cloud headline, text and button → `/en-us/services/cloud` |
| `/en-us?utm_campaign=security` | Security headline, text and button → `/en-us/services/security` |
| `/en-us` (no campaign yet) | The standard hero, unchanged |
| `/en-us?utm_campaign=none` | Forgets the campaign; the standard hero again |

## Constraints

- **Works on every address.** It must work on `aem.page` and `aem.live`, which Edge Delivery serves
  directly and the worker never sees. So the swap happens in the browser, in the page's own code, and
  the same code runs on the worker's address too. The worker is not involved: the campaign is in the
  link, which the browser already has. (A worker-side swap on its own address was considered and set
  aside: two copies of the same logic to keep in sync, to save a fraction of a second on one address.)
- **No flash of the standard hero.** Author Kit keeps each section hidden until its blocks have
  finished loading. The hero block swaps the words before it finishes, so the section first appears
  with the campaign version.
- **Free for everyone else.** Without a campaign, the block only reads the link and a cookie; it loads
  no extra code and fetches nothing. With a campaign, one small sheet request is added before the hero
  appears, with a short timeout. The hero image (the LCP element) and the layout don't change.
- **Pages stay identical for everyone.** The HTML from Edge Delivery is unchanged, so caching is
  unchanged everywhere.
- **Author-controlled.** Campaign wording lives in a DA sheet outside `/library/` (the worker hides that
  folder), **published live**, because the public site reads from `aem.live`.
- **Safe with any input.** The campaign name must match a row in the sheet; anything else is ignored.
  Sheet text is inserted as text, never as HTML, and a button link must be a site path or `https://`.

## Decisions

1. **Campaigns:** `ai`, `cloud` and `security`, one row each in the sheet.
2. **What changes:** the homepage hero only (`hero-video-badge`, the first one on the localized
   homepage): the `h1`, the paragraph under it, and the button's label and link. The image, the video
   badge and the rest of the page stay as authored. The Services pages, which use the same block in its
   `card` option, are never touched.
3. **Remembered for the visit.** The campaign is kept in a session cookie (`campaign`, no expiry,
   `Path=/`, `SameSite=Lax`, `Secure` on https), so going back to the homepage keeps the campaign
   version, in any tab, and closing the browser forgets it. Caveat: a browser set to "continue where you
   left off" restores session cookies; the reset link or a private window covers that.
4. **The link always wins.** A campaign in the link replaces the remembered one. An unknown campaign, or
   `none`, shows the standard hero and clears the cookie.
5. **The sheet.** `/fragments/campaigns/homepage`, one row per campaign:

   | campaign | heading | text | link-label | link |
   |---|---|---|---|---|
   | `ai` | Turn AI into measurable outcomes. | AI is moving from experimentation to enterprise impact. See how Avanade connects data, applications and ways of working so AI delivers. | Explore AI services | `/en-us/services/artificial-intelligence` |
   | `cloud` | Build on a cloud that's ready for AI. | Make cloud the foundation for AI, unified data and continuous innovation, and build a business that's ready for what's next. | Explore cloud services | `/en-us/services/cloud` |
   | `security` | Grow with security you can trust. | Protect trust and strengthen resilience with security that runs across your cloud, data and AI platforms. | Explore security services | `/en-us/services/security` |

   Wording is drawn from each Services page's own hero, so the button keeps the hero's promise. An
   author adds a campaign by adding a row and publishing the sheet; no code change.
6. **Where the code lives.** A small check in `blocks/hero-video-badge/hero-video-badge.js` (link or
   cookie present, on the homepage); only then a dynamic `import()` of `scripts/utils/campaign.js`, which
   reads the sheet and swaps the words. Nothing new is statically reachable from `scripts.js`.
7. **Fails safe.** If the sheet is slow (over about a second), missing, or has no matching row, the
   visitor gets the standard hero. Personalization is an extra, never a reason for an error.

## Plan

1. **Sheet.** Generate `content/fragments/campaigns/homepage.json` locally from the table above.
2. **Code.** The check in the hero block and `scripts/utils/campaign.js`: read the campaign, set or
   clear the cookie, read the sheet, swap the words.
3. **Test locally** in a real browser, with the sheet stubbed where needed:
   - each campaign link, and the standard homepage
   - coming back without the link (remembered), in a new tab too, and `none` (forgotten)
   - an unknown campaign, a hostile campaign value, a hostile sheet link, the sheet missing or slow
   - the Services pages untouched; no flash of the standard hero; no layout shift; the same hero
     image; no errors; desktop and phone
   - the standard homepage identical to live
4. **Ship.** One PR (code + spec), with test URLs. The sheet is not in git (content).
5. **Publish the sheet.** Upload to DA, preview and **publish live**, on request.
6. **Owner test.** The owner opens the test links on `aem.page`, `aem.live` and the worker address.

## Answered (2026-11-17)

- Feature: the campaign-aware homepage (chosen over an A/B test, which needs real traffic).
- Campaigns: AI, Cloud and Security.
- Scope: the homepage hero only.
- Memory: for the visit only.
- Where: in the browser, so it works on `aem.page`, `aem.live` and the worker address alike.
