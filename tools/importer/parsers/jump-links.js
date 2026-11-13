/* eslint-disable */
/* global WebImporter */

/**
 * jump-links
 * One row, one cell: a list of in-page anchor links.
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const ul = document.createElement('ul');
  element.querySelectorAll('li > a').forEach((src) => {
    const label = clean(src.textContent);
    if (!label) return;
    const a = document.createElement('a');
    a.href = (src.getAttribute('href') || '').trim();
    a.textContent = label;
    const li = document.createElement('li');
    li.append(a);
    ul.append(li);
  });
  const cells = [[ul]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'jump-links', cells });
  element.replaceWith(block);
}
