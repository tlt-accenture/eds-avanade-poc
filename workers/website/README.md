# Website worker

A Cloudflare Worker in front of the Edge Delivery site `tlt-accenture/eds-avanade-poc`. Every request
passes through it on the way to `main--eds-avanade-poc--tlt-accenture.aem.live`.

## What it does

| Request | Response |
|---|---|
| A page the site has | Served from Edge Delivery |
| A page the site doesn't have yet (404) | `302` to the same path and query on `FALLBACK_ORIGIN` (www.avanade.com), so unmigrated links keep working; it stops by itself once the page is migrated |
| `/` | `302` to `HOME_PATH` (`/en-us`) |
| `/library/...`, `/drafts/...` | `404`: author-only content |
| Code, fragments, data files, media | Passed through; a missing file stays a `404` (only pages fall back) |

Search engines are asked not to index anything (`x-robots-tag: noindex, nofollow`) unless
`ALLOW_INDEXING` is `"true"`, so this copy of the site stays out of search results until it is meant to
be found.

## Settings (`wrangler.toml` vars)

| Var | Value | Meaning |
|---|---|---|
| `AEM_ORG` / `AEM_SITE` | `tlt-accenture` / `eds-avanade-poc` | The Edge Delivery site behind the worker |
| `FALLBACK_ORIGIN` | `https://www.avanade.com` | Where unmigrated pages are sent; remove to turn the fallback off |
| `HOME_PATH` | `/en-us` | Where the bare domain goes |
| `PUSH_INVALIDATION` | `disabled` | Turn on once the site's production CDN is configured in Edge Delivery |
| `ALLOW_INDEXING` | `false` | `true` only when this domain should appear in search results |

## Deploying (Cloudflare dashboard, no terminal)

1. In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository**, and connect GitHub
   to `tlt-accenture/eds-avanade-poc`.
2. **Project name:** `eds-avanade-poc` (it must match `name` in `wrangler.toml`).
3. **Root directory:** `workers/website`. **Deploy command:** `npx wrangler deploy`. Production branch:
   `main`.
4. Deploy. Cloudflare gives the worker an address like `https://eds-avanade-poc.<account>.workers.dev`;
   later deploys run on every push to `main`.

## Trying it locally

`npm ci`, then `npx wrangler dev` in this folder, and open `http://localhost:8787/en-us`.
