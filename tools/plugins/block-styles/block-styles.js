import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import {
  BLOCKS, loadSamples, loadOptions, buildBlock, headerText, toTable,
} from './samples.js';

const root = document.querySelector('.block-styles');
const form = root.querySelector('form');
const frame = root.querySelector('iframe');
const preview = root.querySelector('.block-styles-preview');
const header = root.querySelector('code');
const status = root.querySelector('[role="status"]');
const insertBtn = root.querySelector('[data-action="insert"]');

// outside the DA editor the SDK never answers; the panel still previews, but cannot insert
const sdk = Promise.race([DA_SDK, new Promise((resolve) => { setTimeout(resolve, 3000); })])
  .catch(() => undefined);

// radio buttons for one group; the first item starts checked
function fillGroup(group, items) {
  const fieldset = form.querySelector(`[data-group="${group}"]`);
  fieldset.querySelectorAll('label').forEach((label) => label.remove());
  items.forEach((item, i) => {
    const label = document.createElement('label');
    const input = Object.assign(document.createElement('input'), {
      type: 'radio', name: group, value: item.class, checked: i === 0,
    });
    label.append(input, ` ${item.label}`);
    fieldset.append(label);
  });
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

fillGroup('block', BLOCKS.map(({ name, label }) => ({ class: name, label })));
form.addEventListener('change', (e) => {
  if (e.target.name === 'block') selectBlock(e.target.value);
  else if (e.target.name === 'width') fit();
  else update();
});
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
