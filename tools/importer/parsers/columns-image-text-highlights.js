/* eslint-disable */
/* global WebImporter */
// Service template (source: .timage-left-aligned-image-with-logoline).

/**
 * columns-image-text (highlights)
 * One row: image cell, text cell (H2, then one paragraph per highlight:
 * <strong>title</strong><br>description; lists are kept as-is).
 * The image is lazy-rendered on scroll; when it is not in the DOM yet, its URL is
 * read from the component's fields (Title + ExternalImageUrl) in __NEXT_DATA__.
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

function imageFromPageData(document, title) {
  const script = document.querySelector('script#__NEXT_DATA__, [data-excat-next-data]');
  if (!script || !title) return '';
  let found = '';
  const walk = (o) => {
    if (found || !o || typeof o !== 'object') return;
    const f = o.fields;
    if (f && f.ExternalImageUrl && f.Title && clean(f.Title.value) === title) {
      found = f.ExternalImageUrl.value || '';
      return;
    }
    Object.values(o).forEach(walk);
  };
  try { walk(JSON.parse(script.textContent)); } catch (e) { /* no usable page data */ }
  return found;
}

export default function parse(element, { document }) {
  const col = element.querySelector('.timage-left-aligned-image-with-logoline__text-column') || element;
  const title = col.querySelector('.timage-left-aligned-image-with-logoline__title, h2, h3');
  const titleText = clean(title && title.textContent);

  const imgCell = [];
  const src = element.querySelector('.timage-left-aligned-image-with-logoline__image-column img');
  let url = src ? src.getAttribute('src') || '' : '';
  if (src && (!url || url.startsWith('data:'))) {
    url = src.getAttribute('data-src') || (src.getAttribute('srcset') || '').split(/\s+/)[0] || '';
  }
  // placeholders and relative Next.js image URLs don't survive the import; the page data has the asset URL
  if (!/^https?:\/\//.test(url) || url.includes('/_next/image')) url = imageFromPageData(document, titleText) || url;
  if (url) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = (src && src.getAttribute('alt')) || titleText.toLowerCase();
    imgCell.push(img);
  }

  const text = [];
  if (titleText) {
    const h2 = document.createElement('h2');
    h2.textContent = titleText;
    text.push(h2);
  }
  // an optional intro paragraph (main description) sits above the highlights on some pages
  const intro = col.querySelector('.timage-left-aligned-image-with-logoline__main-description .ck-content')
    || col.querySelector('.timage-left-aligned-image-with-logoline__main-description');
  const desc = col.querySelector('.timage-left-aligned-image-with-logoline__description .ck-content')
    || col.querySelector('.timage-left-aligned-image-with-logoline__description');
  [intro, desc].filter(Boolean).forEach((part) => {
    [...part.children].forEach((child) => {
      if (!clean(child.textContent)) return;
      const node = child.cloneNode(true);
      node.querySelectorAll('strong, b').forEach((s) => { s.textContent = clean(s.textContent); });
      text.push(node);
    });
  });
  // CTA link, when present on other service pages.
  col.querySelectorAll(':scope > a[href], .timage-left-aligned-image-with-logoline__link a[href]').forEach((link) => {
    const label = clean((link.querySelector('span') || link).textContent);
    if (!label) return;
    const a = document.createElement('a');
    a.href = link.getAttribute('href').trim();
    a.textContent = label;
    const p = document.createElement('p');
    p.append(a);
    text.push(p);
  });

  const cells = [[imgCell, text]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-image-text (highlights)', cells });
  element.replaceWith(block);
}
