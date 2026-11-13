/* eslint-disable */
/* global WebImporter */
// Service template (source: .title-banner).

/**
 * hero-title-banner (split)
 * One row, one cell: H2, then the description paragraphs.
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const content = [];
  const title = element.querySelector('.title-banner__title, h1, h2');
  if (title && clean(title.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(title.textContent);
    content.push(h2);
  }
  const desc = element.querySelector('.title-banner__description .ck-content, .title-banner__description');
  if (desc) {
    [...desc.children].forEach((child) => {
      if (!clean(child.textContent)) return;
      const node = child.cloneNode(true);
      node.removeAttribute('class');
      content.push(node);
    });
  }
  const cells = [[content]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-title-banner (split)', cells });
  element.replaceWith(block);
}
