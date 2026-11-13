/* eslint-disable */
/* global WebImporter */
// Service template (source: #content > section.contact-expert).

/**
 * contact
 * One row: cell 1 H2 + bold "Contact us" link to /en-us/contact (stands in for the
 * Marketo form, whose fields are not migrated); cell 2 the section photo.
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const text = [];
  const title = [...element.querySelectorAll('h1, h2, h3')].find((h) => !h.closest('form') && clean(h.textContent));
  const h2 = document.createElement('h2');
  h2.textContent = title ? clean(title.textContent) : 'Want to talk to an expert?';
  text.push(h2);
  const a = document.createElement('a');
  a.href = '/en-us/contact';
  a.textContent = 'Contact us';
  const strong = document.createElement('strong');
  strong.append(a);
  const p = document.createElement('p');
  p.append(strong);
  text.push(p);

  const media = [];
  const src = [...element.querySelectorAll('.next-image__container img, img')]
    .find((img) => !img.closest('form') && img.getAttribute('src'));
  if (src) {
    const img = document.createElement('img');
    img.src = src.getAttribute('src');
    img.alt = src.getAttribute('alt') || '';
    media.push(img);
  }

  const cells = [[text, media]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'contact', cells });
  element.replaceWith(block);
}
