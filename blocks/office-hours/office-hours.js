import { DISMISSED } from '../../scripts/utils/office-hours.js';

// the edge worker: answers with the visitor's city, region and time zone (request.cf)
const GEO_URL = 'https://eds-avanade-poc.tracytuckeremail.workers.dev/geo.json';
const local = window.location.pathname.startsWith('/content/');
const SHEET_URL = `${local ? '/content' : ''}/fragments/banners/office-hours.json`;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getJson = (url, ms) => fetch(url, { signal: AbortSignal.timeout(ms) })
  .then((resp) => (resp.ok ? resp.json() : null))
  .catch(() => null);

const minutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const range = (text) => text.split('-').map((part) => part.trim());

// "Mon-Fri" or "Mon,Wed,Fri" -> day numbers
function workdays(text) {
  if (!text.includes('-')) return text.split(',').map((d) => DAYS.indexOf(d.trim()));
  const [from, to] = range(text).map((d) => DAYS.indexOf(d));
  const inRange = (i) => (from <= to ? i >= from && i <= to : i >= from || i <= to);
  return DAYS.map((_, i) => i).filter(inRange);
}

// the place for the greeting: a U.S. state, otherwise "City, Country"
function placeOf(geo) {
  if (geo.country === 'US' && geo.region) return geo.region;
  const country = geo.country && new Intl.DisplayNames(['en'], { type: 'region' }).of(geo.country);
  return [geo.city, country].filter(Boolean).join(', ');
}

// worker first (where the visitor is), the browser's own time zone if it doesn't answer
async function locate() {
  const browser = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const geo = await getJson(GEO_URL, 1200);
  if (!geo?.timezone) return { timezone: browser, place: '' };
  try {
    Intl.DateTimeFormat('en-US', { timeZone: geo.timezone });
    return { timezone: geo.timezone, place: placeOf(geo) };
  } catch {
    return { timezone: browser, place: '' };
  }
}

function now(timezone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return { day: DAYS.indexOf(parts.weekday), time: Number(parts.hour) * 60 + Number(parts.minute) };
}

// which message, and when the team is next in
export function status(settings, { day, time }) {
  const days = workdays(settings.days);
  const [open, close] = range(settings.hours).map(minutes);
  const [lunchFrom, lunchTo] = settings.lunch ? range(settings.lunch).map(minutes) : [];
  const workday = days.includes(day);
  if (workday && time >= lunchFrom && time < lunchTo) return { key: 'lunchtime', next: 'this afternoon' };
  if (workday && time >= open && time < close) return { key: 'open' };
  if (workday && time < open) return { key: 'closed', next: 'this morning' };
  const nextDay = [1, 2, 3, 4, 5, 6, 7].map((n) => (day + n) % 7).find((d) => days.includes(d));
  return { key: 'closed', next: nextDay === (day + 1) % 7 ? 'tomorrow morning' : `on ${DAY_NAMES[nextDay]}` };
}

const greeting = (time) => {
  if (time < 12 * 60) return 'morning';
  return time < 17 * 60 ? 'afternoon' : 'evening';
};

export default async function init(el) {
  const [sheet, where] = await Promise.all([getJson(SHEET_URL, 3000), locate()]);
  const settings = Object.fromEntries((sheet?.data || []).map(({ key, value }) => [key, value]));
  if (settings.enabled !== 'yes' || !settings.days || !settings.hours) {
    el.remove();
    return;
  }
  const clock = now(where.timezone);
  const { key, next } = status(settings, clock);
  const template = (where.place && settings[key]) || settings[`${key}-anywhere`] || settings[key] || '';
  const message = template
    .replaceAll('{greeting}', greeting(clock.time))
    .replaceAll('{place}', where.place)
    .replaceAll('{next}', next || '');

  el.setAttribute('aria-label', settings.label || 'Office hours');
  const text = document.createElement('p');
  text.textContent = `${message} `;
  if (settings.link) {
    const link = Object.assign(document.createElement('a'), { href: settings.link, textContent: settings['link-label'] || settings.link });
    text.append(link);
  }
  // the space the bar covers at the bottom of the view (its height, its inset and a small gap),
  // published for the footer, which makes that much room so the page's last lines stay visible
  const root = document.documentElement.style;
  const room = new ResizeObserver(() => {
    const bottom = parseFloat(getComputedStyle(el).bottom) || 0;
    root.setProperty('--bottom-bar-height', `${Math.ceil(el.offsetHeight + bottom + 12)}px`);
  });
  const close = Object.assign(document.createElement('button'), { type: 'button', className: 'office-hours-close' });
  close.setAttribute('aria-label', settings['close-label'] || 'Close');
  close.addEventListener('click', () => {
    sessionStorage.setItem(DISMISSED, 'true');
    room.disconnect();
    root.removeProperty('--bottom-bar-height');
    el.remove();
  });
  el.append(text, close);
  el.hidden = false;
  room.observe(el);
}
