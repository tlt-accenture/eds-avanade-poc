const getRedirect = (resp, savedSearch) => {
  if (!(resp.status === 301 && savedSearch)) return;
  const location = resp.headers.get('location');
  if (location && !location.match(/\?.*$/)) {
    resp.headers.set('location', `${location}${savedSearch}`);
  }
};

const formatSchedule = async (response) => {
  const schedule2Response = (json) => new Response(JSON.stringify(json), response);

  const json = await response.json();
  if (!json.data?.[0]?.fragment) return schedule2Response(json);

  const data = [];
  for (const [idx, schedule] of json.data.entries()) {
    const { start, end } = schedule;

    // Presumably the default fragment
    if (!start && !end) {
      data.push(json.data[idx]);
    } else {
      const now = Date.now();
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (startDate < now && endDate > now) data.push(json.data[idx]);
    }
  }

  return schedule2Response({ ...json, data });
};

export const fetchFromAem = async ({
  request, env, cache, savedSearch,
}) => {
  let resp = await fetch(request, { method: request.method, cf: { cacheEverything: cache } });

  // Recreate a mutable response
  resp = new Response(resp.body, resp);

  // Handle redirects
  const redirectResp = getRedirect(resp, savedSearch);
  if (redirectResp) return redirectResp;

  // 304 Not Modified - remove CSP header
  if (resp.status === 304) resp.headers.delete('Content-Security-Policy');

  resp.headers.delete('age');
  // the origin asks search engines to stay away; only a domain meant to be found lifts that
  if (env.ALLOW_INDEXING === 'true') resp.headers.delete('x-robots-tag');
  else resp.headers.set('x-robots-tag', 'noindex, nofollow');

  return resp;
};

// A page the site doesn't have yet is still on the old site: send the visitor to the same path
// there (temporarily, so it stops the day the page is migrated). The path is set on a URL built
// from FALLBACK_ORIGIN, so a request path like //example.com can't change the host.
export async function fetchPage(args) {
  const resp = await fetchFromAem(args);
  const { env, url, request } = args;
  if (resp.status !== 404 || !env.FALLBACK_ORIGIN || !['GET', 'HEAD'].includes(request.method)) {
    return resp;
  }
  const target = new URL(env.FALLBACK_ORIGIN);
  target.pathname = url.pathname;
  target.search = args.savedSearch;
  return new Response(null, {
    status: 302,
    headers: { location: target.href, 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
  });
}

export async function fetchSchedule({ request, cache, savedSearch }) {
  const resp = await fetchFromAem({ request, cache, savedSearch });

  if (resp.status === 301 || resp.status === 304) return resp;

  return formatSchedule(resp);
}
