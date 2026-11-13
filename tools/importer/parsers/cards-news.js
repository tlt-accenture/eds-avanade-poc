/* eslint-disable */
/* global WebImporter */

/**
 * cards-news: one row per news card, single cell:
 * tag paragraph (icon + text), title heading, "Read more" link as last paragraph.
 * The section title ("In the news") is default content and is moved out
 * in front of the block.
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

  element.querySelectorAll('.insight-card').forEach((card) => {
    const titleText = card.querySelector('.insight-card__title')?.textContent.trim();
    if (!titleText) return;
    const content = [];

    const tag = card.querySelector('.insight-card__tag');
    if (tag) {
      const tagText = tag.textContent.trim();
      const icon = cloneImg(document, tag.querySelector('img'));
      if (tagText || icon) {
        const p = document.createElement('p');
        if (icon) p.append(icon, ' ');
        if (tagText) p.append(tagText);
        content.push(p);
      }
    }

    const h3 = document.createElement('h3');
    h3.textContent = titleText;
    content.push(h3);

    // "Related links" cards on service pages carry a description; homepage news cards don't
    card.querySelectorAll('.insight-card__body p').forEach((para) => {
      if (!para.textContent.trim()) return;
      const p = document.createElement('p');
      p.innerHTML = para.innerHTML;
      content.push(p);
    });

    const link = card.querySelector('a[href]');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim() || 'Read more';
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    }

    cells.push([content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });

  // Keep the section heading as default content, outside the block.
  const heading = element.querySelector('.cards--default__title h1, .cards--default__title h2, .cards--default__title h3, .cards--default__title h4');
  if (heading) element.before(heading);

  element.replaceWith(block);
}
