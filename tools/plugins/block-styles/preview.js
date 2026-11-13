import {
  BLOCKS, loadSamples, buildBlock, optionClasses,
} from './samples.js';

// renders one sample block with the picked options through the block's own code
const params = new URLSearchParams(window.location.search);
const name = params.get('block');
const picks = { layout: params.get('layout') || '', theme: params.get('theme') || '' };
const main = document.querySelector('main');

try {
  if (!BLOCKS.some((b) => b.name === name)) throw new Error(`Unknown block "${name}"`);
  const block = buildBlock(name, await loadSamples(), picks);
  block.classList.add(...optionClasses(picks).filter((c) => /^[a-z0-9-]+$/.test(c)));
  block.dataset.blockName = name;
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = '<div class="block-content"></div>';
  section.firstElementChild.append(block);
  main.append(section);
  document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `/blocks/${name}/${name}.css` }));
  const { default: init } = await import(`/blocks/${name}/${name}.js`);
  await init(block);
} catch (e) {
  main.textContent = e.message;
}
document.documentElement.dataset.ready = 'true';
