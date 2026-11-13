/* eslint-disable */
/* global WebImporter */
// Service template (source: .gradient-simple-accordion).

/**
 * accordion
 * One row per item: cell 1 title; cell 2 H4 subheading, paragraphs, "Explore" link.
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const cells = [];
  element.querySelectorAll('.accordion__item').forEach((item) => {
    const header = item.querySelector('.accordion__item-header');
    const titleEl = header && header.querySelector('h1, h2, h3, h4, h5, h6');
    const title = clean((titleEl || header || {}).textContent);
    if (!title) return;

    const content = [];
    const sub = item.querySelector('.accordion__item-subheader');
    if (sub && clean(sub.textContent)) {
      const h4 = document.createElement('h4');
      h4.textContent = clean(sub.textContent);
      content.push(h4);
    }
    const text = item.querySelector('.accordion__item-text .ck-content') || item.querySelector('.accordion__item-text');
    if (text) {
      [...text.children].forEach((child) => {
        if (clean(child.textContent)) content.push(child.cloneNode(true));
      });
    }
    item.querySelectorAll('.accordion__item-link a[href]').forEach((link) => {
      const a = document.createElement('a');
      a.href = link.getAttribute('href').trim();
      a.textContent = clean((link.querySelector('span') || link).textContent) || 'Explore';
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    });
    cells.push([title, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
