// Shared by the Block styles plugin and its preview: which blocks it offers, where their samples
// live, and how a sample becomes a styled block or a DA block table.
export const BLOCKS = [
  { name: 'columns-image-text', label: 'Columns: image and text' },
  { name: 'hero-title-banner', label: 'Title banner', shapes: [{ class: 'background', label: 'With background image' }] },
  { name: 'cards-case-study', label: 'Cards: case studies' },
];

// the local preview serves pages under /content
const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const LIBRARY = new URL(`${local ? '/content' : ''}/library/`, window.location.origin);
export const SAMPLES_URL = new URL('block-styles.plain.html', LIBRARY).href;
// the DA sheet authors edit, one row per variation:
// block, group (layout or theme), class, label, keywords, description
export const OPTIONS_URL = new URL('block-style-options.json', LIBRARY).href;

const absolute = (url) => new URL(url, SAMPLES_URL).href;
const absoluteSrcset = (set) => set.split(',').map((entry) => {
  const [url, ...rest] = entry.trim().split(/\s+/);
  return [absolute(url), ...rest].join(' ');
}).join(', ');

let samples;
export function loadSamples() {
  samples ??= fetch(SAMPLES_URL).then(async (resp) => {
    if (!resp.ok) throw new Error(`The samples page (${SAMPLES_URL}) answered ${resp.status}`);
    const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
    doc.querySelectorAll('img[src]').forEach((img) => img.setAttribute('src', absolute(img.getAttribute('src'))));
    doc.querySelectorAll('source[srcset]').forEach((src) => src.setAttribute('srcset', absoluteSrcset(src.getAttribute('srcset'))));
    return Object.fromEntries(BLOCKS.map(({ name }) => [name, doc.querySelector(`div.${name}`)]));
  });
  return samples;
}

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const GROUPS = ['layout', 'theme'];
const text = (value) => String(value ?? '').trim();

// a published DA sheet is { data: [...] }; a workbook keeps each sheet under its name
const sheetRows = (json) => json.data ?? json[json[':names']?.[0]]?.data ?? [];

let sheet;
const loadSheet = () => {
  sheet ??= fetch(OPTIONS_URL)
    .then((resp) => (resp.ok ? resp.json() : null))
    .then((json) => json && sheetRows(json))
    .catch(() => null);
  return sheet;
};

// the sheet authors maintain; until it exists, each block's own metadata.json list
const options = {};
export function loadOptions(name) {
  options[name] ??= loadSheet().then(async (rows) => {
    if (rows) {
      const list = rows
        .map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, text(v)])))
        .filter((row) => row.block === name && KEBAB.test(row.class) && GROUPS.includes(row.group));
      return { source: 'sheet', ...Object.fromEntries(GROUPS.map((g) => [g, list.filter((o) => o.group === g)])) };
    }
    const meta = await fetch(`/blocks/${name}/metadata.json`).then((resp) => (resp.ok ? resp.json() : {}));
    const list = meta.options || [];
    return {
      source: 'built-in',
      layout: [...list.filter((o) => o.group === 'layout'), ...(BLOCKS.find((b) => b.name === name)?.shapes || [])],
      theme: list.filter((o) => o.group === 'theme'),
    };
  });
  return options[name];
}

const SHAPES = new Set(BLOCKS.flatMap((b) => (b.shapes || []).map((s) => s.class)));

// option classes for the header; a content shape (a background picture) is not a class
export const optionClasses = ({ layout, theme }) => [layout, theme]
  .filter((c) => c && !SHAPES.has(c));

export const headerText = (name, picks) => {
  const classes = optionClasses(picks);
  return classes.length ? `${name} (${classes.join(', ')})` : name;
};

// a copy of the sample with the picked shape applied; option classes are added by the caller
export function buildBlock(name, all, { layout }) {
  const block = all[name].cloneNode(true);
  if (layout === 'background') {
    const picture = Object.values(all).map((s) => s?.querySelector('picture')).find(Boolean);
    const row = document.createElement('div');
    row.append(document.createElement('div'));
    row.firstElementChild.append(picture.cloneNode(true));
    block.prepend(row);
  }
  return block;
}

// DA block table: the header row names the block and its options, then one row per sample row
export function toTable(block, header) {
  const rows = [...block.children];
  const cols = Math.max(1, ...rows.map((row) => row.children.length));
  const cell = (div) => {
    const copy = div.cloneNode(true);
    copy.querySelectorAll('picture').forEach((pic) => pic.replaceWith(pic.querySelector('img')));
    return `<td>${copy.innerHTML}</td>`;
  };
  const body = rows.map((row) => `<tr>${[...row.children].map(cell).join('')}</tr>`).join('');
  return `<table><tbody><tr><td colspan="${cols}">${header}</td></tr>${body}</tbody></table>`;
}
