/* eslint-disable */
/* global WebImporter */
// Service template (source: .evidence).

/**
 * quote-carousel
 * One row per slide, one cell: quote paragraph(s), then the attribution
 * (name + role) as the last paragraph.
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const cells = [];
  element.querySelectorAll('.embla-carousel__slide').forEach((slide) => {
    const content = [];
    const quote = slide.querySelector('.evidence-card__text .ck-content') || slide.querySelector('.evidence-card__text');
    if (quote) {
      [...quote.children].forEach((child) => {
        if (clean(child.textContent)) content.push(child.cloneNode(true));
      });
      if (!content.length && clean(quote.textContent)) {
        const p = document.createElement('p');
        p.textContent = clean(quote.textContent);
        content.push(p);
      }
    }
    if (!content.length) return;
    const author = slide.querySelector('.evidence-card__author');
    const name = clean(author && author.textContent);
    if (name) {
      const p = document.createElement('p');
      const link = author.querySelector('a[href]');
      if (link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href').trim();
        a.textContent = name;
        p.append(a);
      } else {
        p.textContent = name;
      }
      content.push(p);
    }
    cells.push([content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-carousel', cells });
  element.replaceWith(block);
}
