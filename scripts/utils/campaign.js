import sampleRUM from '../../deps/rum.js';

// Campaign-aware homepage hero (docs/specs/006-campaign-homepage): ?utm_campaign=ai swaps the
// hero's heading, text and button for the sheet's "ai" row; a session cookie keeps it for the
// visit.
const local = window.location.pathname.startsWith('/content/');
const SHEET_URL = `${local ? '/content' : ''}/fragments/campaigns/homepage.json`;
const NAME = /^[a-z0-9-]{1,40}$/;
const secure = window.location.protocol === 'https:' ? '; Secure' : '';

const remember = (name) => { document.cookie = `campaign=${name}; Path=/; SameSite=Lax${secure}`; };
const forget = () => { document.cookie = `campaign=; Path=/; Max-Age=0; SameSite=Lax${secure}`; };

// the link wins over the remembered campaign
function chosen() {
  const link = new URLSearchParams(window.location.search).get('utm_campaign');
  if (link !== null) return link.trim().toLowerCase();
  return document.cookie.match(/(?:^|;\s*)campaign=([^;]*)/)?.[1] ?? '';
}

const safeLink = (href = '') => (/^\/(?!\/)/.test(href) || href.startsWith('https://') ? href : null);

// Operational Telemetry, the way Adobe's experimentation plugin reports a campaign: the hero shown
// (a campaign name, or "default" for the standard hero) and the campaigns on offer
const report = (source, sheet) => sampleRUM('audience', {
  source,
  target: (sheet?.data || []).map((r) => r.campaign).join(':'),
});

export default async function applyCampaign(text) {
  const name = chosen();
  if (!NAME.test(name) || name === 'none') {
    forget();
    report('default');
    return;
  }
  remember(name);
  const sheet = await fetch(SHEET_URL, { signal: AbortSignal.timeout(1000) })
    .then((resp) => (resp.ok ? resp.json() : null))
    .catch(() => null);
  const row = sheet?.data?.find((r) => r.campaign === name);
  if (!row) {
    if (sheet) forget();
    report('default', sheet);
    return;
  }
  report(name, sheet);
  const h1 = text.querySelector('h1');
  const intro = text.querySelector('h1 ~ p:not(:has(a))');
  const link = text.querySelector('a');
  if (h1 && row.heading) h1.textContent = row.heading;
  if (intro && row.text) intro.textContent = row.text;
  if (link && row['link-label']) link.textContent = row['link-label'];
  const href = safeLink(row.link);
  if (link && href) link.href = href;
}
