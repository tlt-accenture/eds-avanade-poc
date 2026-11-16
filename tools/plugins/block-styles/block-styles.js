import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import {
  BLOCKS, loadSamples, loadOptions, buildBlock, headerText, toTable,
} from './samples.js';

const root = document.querySelector('.block-styles');
const form = root.querySelector('form');
const search = root.querySelector('#style-search');
const clearBtn = root.querySelector('[data-action="clear"]');
const searchCount = root.querySelector('#search-count');
const frame = root.querySelector('iframe');
const preview = root.querySelector('.block-styles-preview');
const header = root.querySelector('code');
const status = root.querySelector('[role="status"]');
const insertBtn = root.querySelector('[data-action="insert"]');

// outside the DA editor the SDK never answers; the panel still previews, but cannot insert
const sdk = Promise.race([DA_SDK, new Promise((resolve) => { setTimeout(resolve, 3000); })])
  .catch(() => undefined);

// one row per choice in a scrolling list; the first item starts checked
function fillGroup(group, items) {
  const list = form.querySelector(`[data-group="${group}"] .block-styles-list`);
  list.replaceChildren(...items.map((item, i) => {
    const label = document.createElement('label');
    const input = Object.assign(document.createElement('input'), {
      type: 'radio', name: group, value: item.class, checked: i === 0,
    });
    const name = Object.assign(document.createElement('span'), { className: 'block-styles-name', textContent: item.label });
    label.append(input, name);
    if (item.description) {
      label.append(Object.assign(document.createElement('span'), { className: 'block-styles-desc', textContent: item.description }));
    }
    // what search matches: the name, the option word and the sheet's keywords
    label.dataset.search = [item.label, item.class, item.keywords].join(' ').toLowerCase();
    return label;
  }));
}

// one search for both groups: each word narrows the group it means something in, so
// "dark 2 per row" picks Dark among themes and "2 per row" among layouts
function filter() {
  const words = search.value.toLowerCase().split(/[\s,]+/).filter(Boolean);
  clearBtn.hidden = !words.length;
  let matches = 0;
  for (const group of ['layout', 'theme']) {
    const fieldset = form.querySelector(`[data-group="${group}"]`);
    const rows = [...fieldset.querySelectorAll('.block-styles-list label')];
    const relevant = words.filter((w) => rows.some((row) => row.dataset.search.includes(w)));
    let shown = 0;
    rows.forEach((row) => {
      const hasAll = relevant.length > 0 && relevant.every((w) => row.dataset.search.includes(w));
      const match = !words.length || hasAll;
      if (match) shown += 1;
      // the current pick never disappears, so a search can't lose the author's choice
      row.hidden = !match && !row.querySelector('input').checked;
      row.classList.toggle('is-unmatched', !match);
    });
    matches += shown;
    const groupCount = fieldset.querySelector('.block-styles-group-count');
    groupCount.textContent = words.length ? `${shown} of ${rows.length}` : '';
    fieldset.querySelector('.block-styles-empty').hidden = !words.length || shown > 0;
  }
  searchCount.textContent = words.length ? `${matches} ${matches === 1 ? 'style matches' : 'styles match'}` : '';
}

const picks = () => {
  const data = new FormData(form);
  return { block: data.get('block'), layout: data.get('layout') || '', theme: data.get('theme') || '' };
};

// the frame renders at a real desktop or phone width and is scaled down to the panel
function fit() {
  const width = Number(new FormData(form).get('width'));
  const scale = Math.min(1, preview.clientWidth / width);
  // the body, not the root: the root reports at least the frame's own height, so it never shrinks
  const height = frame.contentDocument?.body?.offsetHeight || 400;
  frame.style.width = `${width}px`;
  frame.style.height = `${height}px`;
  frame.style.scale = scale;
  preview.style.height = `${Math.ceil(height * scale)}px`;
}

function update() {
  const { block, layout, theme } = picks();
  header.textContent = headerText(block, { layout, theme });
  const query = new URLSearchParams({ block, layout, theme });
  frame.src = `./preview.html?${query}`;
}

async function selectBlock(name) {
  const { layout, theme } = await loadOptions(name);
  fillGroup('layout', [{ class: '', label: 'Default' }, ...layout]);
  fillGroup('theme', [{ class: '', label: 'Light' }, ...theme]);
  filter();
  update();
}

async function insert() {
  const { block, layout, theme } = picks();
  const { actions } = (await sdk) || {};
  if (!actions) {
    status.textContent = 'Open this panel from the Document Authoring editor to insert blocks.';
    return;
  }
  const el = buildBlock(block, await loadSamples(), { layout });
  actions.sendHTML(toTable(el, headerText(block, { layout, theme })));
  actions.closeLibrary();
}

async function copy() {
  try {
    await navigator.clipboard.writeText(header.textContent);
    status.textContent = 'Header copied.';
  } catch {
    window.getSelection().selectAllChildren(header);
    status.textContent = 'Header selected: press Ctrl+C or Command+C to copy it.';
  }
}

function clearSearch() {
  search.value = '';
  filter();
  search.focus();
}

fillGroup('block', BLOCKS.map(({ name, label }) => ({ class: name, label })));
form.addEventListener('submit', (e) => e.preventDefault());
form.addEventListener('change', (e) => {
  if (e.target.name === 'block') selectBlock(e.target.value);
  else if (e.target.name === 'width') fit();
  else if (e.target !== search) {
    // a new pick replaces the old one that a search was keeping in view
    filter();
    update();
  }
});
search.addEventListener('input', filter);
search.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && search.value) {
    e.preventDefault();
    clearSearch();
  }
});
clearBtn.addEventListener('click', clearSearch);
frame.addEventListener('load', () => {
  fit();
  // block code can change the height after load (images, decoration)
  if (frame.contentDocument?.body) new ResizeObserver(fit).observe(frame.contentDocument.body);
});
new ResizeObserver(fit).observe(preview);
root.querySelector('[data-action="copy"]').addEventListener('click', copy);
insertBtn.addEventListener('click', insert);
loadSamples().catch((e) => {
  status.textContent = e.message;
  insertBtn.disabled = true;
});
selectBlock(BLOCKS[0].name);
