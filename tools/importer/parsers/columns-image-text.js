/* eslint-disable */
/* global WebImporter */

/**
 * columns-image-text: one row, two cells (image-only cell + text cell).
 * Cell order encodes the image side:
 * - .timage-left-aligned-image-with-logoline -> image | text, unless it sits inside
 *   .timage-right-aligned-image-with-logoline (image rendered on the right) -> text | image
 * - .banner-image-with-logoline -> follows source column order (text | image)
 * Decorative logoline images are dropped.
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

function richParagraphs(document, container) {
  if (!container) return [];
  const root = container.querySelector('.ck-content') || container;
  const blocks = [...root.querySelectorAll(':scope > p, :scope > ul, :scope > ol, :scope > h3, :scope > h4')]
    .filter((n) => n.textContent.trim());
  // A run of link-only paragraphs (rc10 article list) becomes a plain list of links,
  // so bold-wrapped anchors are not decorated as buttons.
  const linkOnly = (n) => n.tagName === 'P' && n.querySelectorAll('a[href]').length === 1
    && n.querySelector('a').textContent.trim() === n.textContent.trim();
  if (blocks.length > 1 && blocks.every(linkOnly)) {
    const ul = document.createElement('ul');
    blocks.forEach((n) => {
      const src = n.querySelector('a');
      const a = document.createElement('a');
      a.href = src.getAttribute('href');
      a.textContent = src.textContent.trim();
      const li = document.createElement('li');
      li.append(a);
      ul.append(li);
    });
    return [ul];
  }
  if (blocks.length) {
    return blocks.map((n) => {
      const copy = document.createElement(n.tagName.toLowerCase());
      copy.innerHTML = n.innerHTML;
      return copy;
    });
  }
  const text = root.textContent.trim();
  if (!text) return [];
  const p = document.createElement('p');
  p.textContent = text;
  return [p];
}

export default function parse(element, { document }) {
  const isBanner = element.classList.contains('banner-image-with-logoline');
  const prefix = isBanner ? 'banner-image-with-logoline' : 'timage-left-aligned-image-with-logoline';

  const imageCol = element.querySelector(`.${prefix}__image-column`);
  const textCol = element.querySelector(`.${prefix}__text-column`);

  const img = cloneImg(document, imageCol?.querySelector('img'));

  const text = [];
  const title = textCol?.querySelector(`.${prefix}__title`) || textCol?.querySelector('h1, h2, h3');
  if (title && title.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = title.textContent.trim();
    text.push(h2);
  }
  // Intro (rc10 uses __main-description), then description (rc10: list of article links).
  text.push(...richParagraphs(document, textCol?.querySelector(`.${prefix}__main-description`)));
  text.push(...richParagraphs(document, textCol?.querySelector(`.${prefix}__description`)));

  const cta = textCol?.querySelector(`.${prefix}__link a[href]`);
  if (cta && cta.textContent.trim()) {
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.trim();
    const p = document.createElement('p');
    if (cta.classList.contains('link__button-primary')) {
      const strong = document.createElement('strong');
      strong.append(a);
      p.append(strong);
    } else {
      p.append(a);
    }
    text.push(p);
  }

  let imageFirst;
  if (isBanner) {
    imageFirst = !!(imageCol && textCol
      && (imageCol.compareDocumentPosition(textCol) & 4)); // textCol follows imageCol
  } else {
    imageFirst = !element.closest('.timage-right-aligned-image-with-logoline');
  }

  const imageCell = img || '';
  const cells = [imageFirst ? [imageCell, text] : [text, imageCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-image-text', cells });
  element.replaceWith(block);
}
