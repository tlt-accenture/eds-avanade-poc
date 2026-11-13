/* eslint-disable */
/* global WebImporter */

/**
 * Library template only: turns a source page into the block-styles samples page.
 * Keeps the first instance of each template block, in template order, each in its own section
 * under a label heading, and drops everything else on the page. The page's title and
 * description are replaced so the samples page doesn't carry the source page's metadata.
 */
const LABELS = {
  'columns-image-text': 'Columns: image and text',
  'hero-title-banner': 'Title banner',
  'cards-case-study': 'Cards: case studies',
};

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  if (!template || template.name !== 'library' || hookName !== 'beforeTransform' || !payload.pageBlocks) return;
  const document = element.ownerDocument || payload.document;

  const samples = template.blocks
    .map((def) => [def, payload.pageBlocks.find((b) => b.name === def.name)])
    .filter(([, block]) => block && block.element);

  element.replaceChildren();
  samples.forEach(([def, block], i) => {
    if (i) element.append(document.createElement('hr'));
    const label = document.createElement('h2');
    label.textContent = LABELS[def.name] || def.name;
    element.append(label, block.element);
  });

  document.title = 'Block styles';
  const desc = document.head.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', 'Sample blocks used by the Block styles plugin.');
  // social metadata would otherwise describe the source page
  document.head.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach((m) => m.remove());
}
