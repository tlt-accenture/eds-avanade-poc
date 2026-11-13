/* eslint-disable */
/* global WebImporter */
// Service template (source: .full-bleed-hero).

/**
 * hero-video-badge (card)
 * Row 1: background picture. Row 2: one cell with H1, paragraph(s), "Talk to us" link.
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const cells = [];

  const src = element.querySelector('.full-bleed-hero__img-container img');
  if (src && src.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = src.getAttribute('src');
    img.alt = src.getAttribute('alt') || '';
    cells.push([img]);
  }

  const text = [];
  const title = element.querySelector('.full-bleed-hero__title, h1');
  if (title && clean(title.textContent)) {
    const h1 = document.createElement('h1');
    h1.textContent = clean(title.textContent);
    text.push(h1);
  }
  element.querySelectorAll('.full-bleed-hero__text p').forEach((p) => {
    const t = clean(p.textContent);
    if (!t) return;
    const np = document.createElement('p');
    np.textContent = t;
    text.push(np);
  });
  const link = element.querySelector('a.full-bleed-hero__link');
  if (link) {
    const a = document.createElement('a');
    a.href = (link.getAttribute('href') || '#contact-us').trim();
    a.textContent = clean((link.querySelector('span') || link).textContent) || 'Talk to us';
    const p = document.createElement('p');
    p.append(a);
    text.push(p);
  }
  cells.push([text]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video-badge (card)', cells });
  element.replaceWith(block);
}
