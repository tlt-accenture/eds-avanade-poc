/* eslint-disable */
/* global WebImporter */

/**
 * hero-title-banner: optional background picture row (none on source), then one
 * content row with heading, paragraph(s) and CTA link.
 */
export default function parse(element, { document }) {
  const cells = [];

  const bg = element.querySelector(':scope > img, :scope > .next-image__container img');
  if (bg && bg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = bg.getAttribute('src');
    img.alt = bg.getAttribute('alt') || '';
    cells.push([img]);
  }

  const content = [];
  const title = element.querySelector('.title-banner__title') || element.querySelector('h1, h2, h3');
  if (title && title.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = title.textContent.trim();
    content.push(h2);
  }

  const desc = element.querySelector('.title-banner__description');
  if (desc) {
    const paras = [...desc.querySelectorAll('p')].filter((p) => p.textContent.trim());
    if (paras.length) {
      paras.forEach((p) => {
        const np = document.createElement('p');
        np.innerHTML = p.innerHTML;
        content.push(np);
      });
    } else if (desc.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      content.push(p);
    }
  }

  const cta = element.querySelector('.title-banner__button a[href]');
  if (cta && cta.textContent.trim()) {
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.trim();
    const p = document.createElement('p');
    p.append(a);
    content.push(p);
  }

  cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-title-banner', cells });
  element.replaceWith(block);
}
