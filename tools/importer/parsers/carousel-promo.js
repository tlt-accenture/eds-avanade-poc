/* eslint-disable */
/* global WebImporter */

/**
 * carousel-promo: one row per slide.
 * Cell 1: picture. Cell 2: heading, description, optional CTA link.
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

function textParagraphs(document, container) {
  if (!container) return [];
  const paras = [...container.querySelectorAll('p')].filter((p) => p.textContent.trim());
  if (paras.length) {
    return paras.map((p) => {
      const np = document.createElement('p');
      np.innerHTML = p.innerHTML;
      return np;
    });
  }
  const text = container.textContent.trim();
  if (!text) return [];
  const p = document.createElement('p');
  p.textContent = text;
  return [p];
}

export default function parse(element, { document }) {
  const cells = [];

  element.querySelectorAll('.promotional-card-carousel__slide').forEach((slide) => {
    const titleText = slide.querySelector('.promotional-card-carousel__title')?.textContent.trim();
    const img = cloneImg(document, slide.querySelector('.promotional-card-carousel__image img'));
    if (!titleText && !img) return;

    const content = [];
    if (titleText) {
      // h2, not the source's h3: the page has no h2 before the carousel, so h3 would skip a level
      const h2 = document.createElement('h2');
      h2.textContent = titleText;
      content.push(h2);
    }
    content.push(...textParagraphs(document, slide.querySelector('.promotional-card-carousel__description')));

    const link = slide.querySelector('a.promotional-card-carousel__link[href]');
    if (link && link.textContent.trim()) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    }

    cells.push([img || '', content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-promo', cells });
  element.replaceWith(block);
}
