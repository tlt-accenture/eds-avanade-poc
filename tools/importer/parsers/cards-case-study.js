/* eslint-disable */
/* global WebImporter */

/**
 * cards-case-study: one row per client story card.
 * Cell 1: photo. Cell 2: logo picture (first paragraph), client name heading,
 * description, "Read more" link as last paragraph.
 */
function cloneImg(document, img) {
  if (!img) return null;
  let src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) {
    src = img.getAttribute('data-src') || (img.getAttribute('srcset') || '').split(/\s+/)[0] || src;
  }
  if (!src) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

export default function parse(element, { document }) {
  const cells = [];
  const cards = element.querySelectorAll('.carousel-content__slide .carousel-card');

  cards.forEach((card) => {
    const photo = cloneImg(document, card.querySelector('.carousel-card__image img'));

    const body = [];
    const logo = cloneImg(document, card.querySelector('.carousel-card__logo-container img'));
    if (logo) {
      const p = document.createElement('p');
      p.append(logo);
      body.push(p);
    }

    const titleText = card.querySelector('.carousel-card__title')?.textContent.trim();
    if (titleText) {
      const h3 = document.createElement('h3');
      h3.textContent = titleText;
      body.push(h3);
    }

    const desc = card.querySelector('.carousel-card__body');
    if (desc) {
      const paras = [...desc.querySelectorAll('p')].filter((p) => p.textContent.trim());
      if (paras.length) {
        paras.forEach((p) => {
          const np = document.createElement('p');
          np.innerHTML = p.innerHTML;
          body.push(np);
        });
      } else if (desc.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        body.push(p);
      }
    }

    const link = card.querySelector('a.link__button-tertiary[href]');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim() || 'Read more';
      const p = document.createElement('p');
      p.append(a);
      body.push(p);
    }

    cells.push([photo || '', body]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-case-study', cells });
  element.replaceWith(block);
}
