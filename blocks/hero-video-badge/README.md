# hero-video-badge

Custom **hero** block. Purpose: Homepage hero with background photo, headline, intro, prompt link and a badge image that opens a video in a modal.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: Row 1 (optional): background picture. Last row: cell 1 heading/text/CTA; cell 2 badge picture plus a video link (Brightcove/YouTube embed URL) opened in a dialog. Card option: background picture row, then one text cell (H1, paragraph, link); no badge cell. The text sits in a white rounded card at the bottom left.

## Supported variations

| Variation | Option class |
| --- | --- |
| Card | `card` |

## Campaigns

On the localized homepage (not the `card` option), a link such as `/en-us?utm_campaign=ai` replaces
the heading, the intro paragraph and the button's label and link with the `ai` row of the DA sheet
`/fragments/campaigns/homepage` (columns `campaign`, `heading`, `text`, `link-label`, `link`). The
campaign is kept for the visit; `?utm_campaign=none` forgets it. Add a campaign by adding a row and
publishing the sheet. See `docs/specs/006-campaign-homepage`.

## Universal Editor fields

N/A (Document Authoring project)
