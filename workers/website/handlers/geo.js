// The visitor's coarse location from Cloudflare (request.cf), for the office-hours banner. Pages on
// the site's own Edge Delivery addresses may read it cross-origin; nothing is logged or cached.
const allowedOrigin = (origin, env) => {
  if (!origin) return null;
  if (origin === 'http://localhost:3000') return origin;
  const site = new RegExp(`^https://[a-z0-9-]+--${env.AEM_SITE}--${env.AEM_ORG}\\.aem\\.(page|live)$`);
  return site.test(origin) ? origin : null;
};

export default function fetchGeo({ request, env, cf = {} }) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'private, no-store',
    'x-robots-tag': 'noindex, nofollow',
    vary: 'origin',
  };
  const origin = allowedOrigin(request.headers.get('origin'), env);
  if (origin) headers['access-control-allow-origin'] = origin;
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return new Response('Method Not Allowed', { status: 405, headers });
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  const {
    country, region, regionCode, city, timezone,
  } = cf;
  return new Response(JSON.stringify({
    country, region, regionCode, city, timezone,
  }), { headers });
}
