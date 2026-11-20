import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import {
  BLOCKS, loadSamples, loadOptions, buildBlock, headerText, toTable,
} from './samples.js';

const root = document.querySelector('.block-styles');
const form = root.querySelector('form');
const blockSelect = root.querySelector('#block-select');
const search = root.querySelector('#style-search');
const clearBtn = root.querySelector('[data-action="clear"]');
const searchCount = root.querySelector('#search-count');
const message = root.querySelector('#search-message');
const frame = root.querySelector('iframe');
const preview = root.querySelector('.block-styles-preview');
const header = root.querySelector('code');
const status = root.querySelector('[role="status"]');
const insertBtn = root.querySelector('[data-action="insert"]');

const GROUPS = ['layout', 'theme'];
const MAX_SUGGESTIONS = 3;

// outside the DA editor the SDK never answers; the panel still previews, but cannot insert
const sdk = Promise.race([DA_SDK, new Promise((resolve) => { setTimeout(resolve, 3000); })])
  .catch(() => undefined);

// every listed block's layouts and themes, each with a Default first; search and the
// "it's in another block" lookup both read from here, so it grows with the block list
const catalog = Object.fromEntries(BLOCKS.map(({ name }) => [name, loadOptions(name).then(
  ({ layout, theme }) => ({ layout: [{ class: '', label: 'Default' }, ...layout], theme: [{ class: '', label: 'Light' }, ...theme] }),
)]));
const blockLabel = (name) => BLOCKS.find((b) => b.name === name)?.label || name;

// what search matches: the name, the option word and the sheet's keywords
const haystack = (item) => [item.label, item.class, item.keywords].join(' ').toLowerCase();
const searchWords = () => search.value.toLowerCase().split(/[\s,]+/).filter(Boolean);

// each word narrows the group it means something in, so "dark 2 per row" picks Dark among themes
// and "2 per row" among layouts; a style matches when it has all of its group's meaningful words
function match(words, styles) {
  return Object.fromEntries(GROUPS.map((group) => {
    const items = styles[group];
    const relevant = words.filter((w) => items.some((item) => haystack(item).includes(w)));
    const hits = relevant.length
      ? items.filter((item) => relevant.every((w) => haystack(item).includes(w))) : [];
    return [group, { relevant, hits }];
  }));
}

// a word that means nothing in either group of this block
const strangers = (words, result) => words
  .filter((w) => !GROUPS.some((g) => result[g].relevant.includes(w)));

// other blocks the whole term belongs to: every word means something there, and a style matches
async function blocksWith(words, current) {
  const others = BLOCKS.filter(({ name }) => name !== current);
  const found = await Promise.all(others.map(async ({ name }) => {
    const result = match(words, await catalog[name]);
    const fits = !strangers(words, result).length && GROUPS.some((g) => result[g].hits.length);
    return fits ? name : null;
  }));
  return found.filter(Boolean);
}

const NONE = {
  layout: 'This block has no layout variations.',
  theme: 'This block has no color themes yet.',
};

// one row per choice in a scrolling list; the first item starts checked. A block with nothing
// but the default gets a sentence instead of a lone radio button
function fillGroup(group, items) {
  const fieldset = form.querySelector(`[data-group="${group}"]`);
  const list = fieldset.querySelector('.block-styles-list');
  const none = items.length < 2;
  fieldset.classList.toggle('is-none', none);
  if (none) {
    list.replaceChildren(Object.assign(document.createElement('p'), { className: 'block-styles-none', textContent: NONE[group] }));
    return;
  }
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
    label.dataset.search = haystack(item);
    return label;
  }));
}

// the "not for this block" message: what was typed, and a Switch button per block that has it
function showMessage(text, others = []) {
  const p = Object.assign(document.createElement('p'), { textContent: text });
  const parts = [p];
  if (others.length) {
    p.textContent += ' It\'s in:';
    const buttons = others.slice(0, MAX_SUGGESTIONS).map((name) => {
      const btn = Object.assign(document.createElement('button'), { type: 'button', textContent: `Switch to ${blockLabel(name)}` });
      btn.dataset.block = name;
      return btn;
    });
    const more = others.length - MAX_SUGGESTIONS;
    if (more > 0) buttons.push(Object.assign(document.createElement('span'), { textContent: `and ${more} more` }));
    const row = Object.assign(document.createElement('div'), { className: 'block-styles-switch' });
    row.append(...buttons);
    parts.push(row);
  }
  message.replaceChildren(...parts);
}

let filtering = 0;
async function filter() {
  filtering += 1;
  const run = filtering;
  const words = searchWords();
  const block = blockSelect.value;
  const styles = await catalog[block];
  // a newer keystroke or block switch already ran; let it win
  if (run !== filtering) return;
  const result = match(words, styles);
  const total = GROUPS.reduce((n, g) => n + result[g].hits.length, 0);
  const unknown = strangers(words, result);
  clearBtn.hidden = !words.length;

  for (const group of GROUPS) {
    const fieldset = form.querySelector(`[data-group="${group}"]`);
    const rows = [...fieldset.querySelectorAll('.block-styles-list label')];
    const { relevant } = result[group];
    let shown = 0;
    rows.forEach((row) => {
      const hasAll = relevant.length > 0 && relevant.every((w) => row.dataset.search.includes(w));
      const isMatch = !words.length || hasAll;
      if (isMatch) shown += 1;
      // the current pick never disappears, so a search can't lose the author's choice
      row.hidden = !isMatch && !row.querySelector('input').checked;
      row.classList.toggle('is-unmatched', !isMatch);
    });
    const none = fieldset.classList.contains('is-none');
    fieldset.querySelector('.block-styles-group-count').textContent = words.length && !none ? `${shown} of ${rows.length}` : '';
    // with nothing matching anywhere in this block, the message below says it once
    fieldset.querySelector('.block-styles-empty').hidden = !words.length || shown > 0 || total === 0 || none;
  }
  searchCount.textContent = words.length ? `${total} ${total === 1 ? 'style matches' : 'styles match'}` : '';

  // "an Accordion style", "a Contact style"
  const label = `${/^[aeiou]/i.test(blockLabel(block)) ? 'an' : 'a'} ${blockLabel(block)}`;
  if (!words.length) {
    message.replaceChildren();
  } else if (total === 0) {
    const others = await blocksWith(words, block);
    if (run !== filtering) return;
    const typed = search.value.trim();
    if (others.length) {
      showMessage(`"${typed}" isn't ${label} style.`, others);
    } else {
      const [layout, theme] = [styles.layout[1], styles.theme[1]].map((s) => s?.label);
      const hint = layout && theme ? ` Try a layout or a color theme, such as "${layout}" or "${theme}".` : '';
      showMessage(`No styles match "${typed}".${hint}`);
    }
  } else if (unknown.length) {
    const others = await blocksWith(unknown, block);
    if (run !== filtering) return;
    showMessage(`"${unknown.join(' ')}" isn't ${label} style, so it's left out.`, others);
  } else {
    message.replaceChildren();
  }
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

// a block's samples load when it is picked; insert waits for them, and says so if they fail
function checkSamples(name) {
  loadSamples(name).then(() => {
    if (blockSelect.value !== name || !insertBtn.disabled) return;
    insertBtn.disabled = false;
    status.textContent = '';
  }).catch((e) => {
    if (blockSelect.value !== name) return;
    status.textContent = e.message;
    insertBtn.disabled = true;
  });
}

// a new block keeps whatever was typed, so the search runs again on its styles
async function selectBlock(name) {
  checkSamples(name);
  const { layout, theme } = await catalog[name];
  fillGroup('layout', layout);
  fillGroup('theme', theme);
  await filter();
  update();
}

async function insert() {
  const { block, layout, theme } = picks();
  const { actions } = (await sdk) || {};
  if (!actions) {
    status.textContent = 'Open this panel from the Document Authoring editor to insert blocks.';
    return;
  }
  const el = buildBlock(block, await loadSamples(block), { layout });
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

blockSelect.replaceChildren(...BLOCKS.map(({ name, label }) => new Option(label, name)));
form.addEventListener('submit', (e) => e.preventDefault());
form.addEventListener('change', (e) => {
  if (e.target === blockSelect) selectBlock(blockSelect.value);
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
// Switch: pick that block, keep the search, and keep the focus in the search field
message.addEventListener('click', (e) => {
  const { block } = e.target.closest('button[data-block]')?.dataset || {};
  if (!block) return;
  blockSelect.value = block;
  selectBlock(block);
  search.focus();
});
frame.addEventListener('load', () => {
  fit();
  // block code can change the height after load (images, decoration)
  if (frame.contentDocument?.body) new ResizeObserver(fit).observe(frame.contentDocument.body);
});
new ResizeObserver(fit).observe(preview);
root.querySelector('[data-action="copy"]').addEventListener('click', copy);
insertBtn.addEventListener('click', insert);
selectBlock(blockSelect.value);
