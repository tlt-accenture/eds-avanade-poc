/* eslint-disable */
/* global WebImporter */
// Service template (source: .featured-content-carousel-with-logoline).

/**
 * cards-case-study (text)
 * One row per card, one cell: heading, paragraph(s), optional link as last paragraph.
 * The band heading is default content: it is moved out in front of the block.
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const heading = element.querySelector('.featured-content-carousel-with-logoline__heading');
  if (heading && clean(heading.textContent)) {
    const h = document.createElement(heading.tagName.toLowerCase());
    if (heading.id && heading.id !== 'undefined-heading') h.id = heading.id;
    h.textContent = clean(heading.textContent);
    element.before(h);
  }

  const cells = [];
  element.querySelectorAll('.carousel-content__slide .carousel-card').forEach((card) => {
    const content = [];
    const title = card.querySelector('.carousel-card__title');
    if (title && clean(title.textContent)) {
      const h = document.createElement(/^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : 'h5');
      h.textContent = clean(title.textContent);
      content.push(h);
    }
    const body = card.querySelector('.carousel-card__body .ck-content') || card.querySelector('.carousel-card__body');
    if (body) {
      [...body.children].forEach((child) => {
        if (clean(child.textContent)) content.push(child.cloneNode(true));
      });
    }
    const link = card.querySelector('a.link__button-tertiary[href]');
    if (link && link.getAttribute('href').trim()) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href').trim();
      a.textContent = clean((link.querySelector('span') || link).textContent) || 'Read more';
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    }
    if (content.length) cells.push([content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-case-study (text)', cells });
  element.replaceWith(block);
}
