// Shared by the Block styles plugin and its preview: which blocks it offers, where their samples
// live, and how a sample becomes a styled block or a DA block table.
// Every block authors place on pages, named as in the DA block library, in alphabetical order.
export const BLOCKS = [
  { name: 'accordion', label: 'Accordion' },
  { name: 'cards-case-study', label: 'Case study cards' },
  { name: 'contact', label: 'Contact' },
  { name: 'hero-video-badge', label: 'Homepage hero' },
  { name: 'columns-image-text', label: 'Image and text columns' },
  { name: 'jump-links', label: 'Jump links' },
  { name: 'cards-news', label: 'News cards' },
  { name: 'carousel-promo', label: 'Promo carousel' },
  { name: 'quote-carousel', label: 'Quote carousel' },
  { name: 'cards-stats', label: 'Stats cards' },
  { name: 'hero-title-banner', label: 'Title banner', shapes: [{ class: 'background', label: 'With background image' }] },
];

// the local preview serves pages under /content
const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const root = `${local ? '/content' : ''}`;
const LIBRARY = new URL(`${root}/library/`, window.location.origin);
// the DA sheet authors edit, one row per variation:
// block, group (layout or theme), class, label, keywords, description
export const OPTIONS_URL = new URL('block-style-options.json', LIBRARY).href;
// the DA block library: one page per block, one section per entry (the block with its option
// classes, then its library-metadata); the Library's Blocks list and this panel share them
const BLOCK_LIBRARY = new URL(`${root}/docs/library/blocks/`, window.location.origin);
export const sampleUrl = (name) => new URL(`${name}.plain.html`, BLOCK_LIBRARY).href;

const absolute = (url, base) => new URL(url, base).href;
const absoluteSrcset = (set, base) => set.split(',').map((entry) => {
  const [url, ...rest] = entry.trim().split(/\s+/);
  return [absolute(url, base), ...rest].join(' ');
}).join(', ');

// a block's library entries, fetched once, when the block is first picked
const samples = {};
export function loadSamples(name) {
  const url = sampleUrl(name);
  samples[name] ??= fetch(url).then(async (resp) => {
    if (!resp.ok) throw new Error(`The ${name} samples (${url}) answered ${resp.status}`);
    const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
    doc.querySelectorAll('img[src]').forEach((img) => img.setAttribute('src', absolute(img.getAttribute('src'), url)));
    doc.querySelectorAll('source[srcset]').forEach((src) => src.setAttribute('srcset', absoluteSrcset(src.getAttribute('srcset'), url)));
    const entries = [...doc.querySelectorAll(`div.${name}`)];
    if (!entries.length) throw new Error(`The ${name} samples (${url}) have no ${name} block`);
    return entries;
  });
  return samples[name];
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

// a copy of the right sample: the library entry made for the picked layout when there is one
// (its content can differ, like the card hero's), else the block's plain entry; the picked
// shape is applied, and option classes are added by the caller
export function buildBlock(name, entries, { layout }) {
  const extras = (el) => [...el.classList].filter((c) => c !== name).join(' ');
  const made = layout && !SHAPES.has(layout) && entries.find((el) => extras(el) === layout);
  const plain = entries.find((el) => !extras(el));
  const block = (made || plain || entries[0]).cloneNode(true);
  block.className = name;
  if (layout === 'background') {
    // the picture from the block's own "with background image" entry, or any of its pictures
    const picture = entries.map((el) => el.querySelector('picture')).find(Boolean);
    if (picture) {
      const row = document.createElement('div');
      row.append(document.createElement('div'));
      row.firstElementChild.append(picture.cloneNode(true));
      block.prepend(row);
    }
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
