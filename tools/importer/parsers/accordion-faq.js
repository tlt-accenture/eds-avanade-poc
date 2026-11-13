/* eslint-disable */
/* global WebImporter */
// Service template (source: .accordion outside .gradient-simple-accordion).

/**
 * accordion (faq)
 * One row per item: cell 1 question; cell 2 answer paragraphs (and optional link).
 * Answers clamped behind "Show more" are truncated in the DOM ("..."); the full
 * rich text is read from the page's __NEXT_DATA__ (Sitecore layout JSON).
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
const ELLIPSIS = /\s*(\.\.\.|…)\s*$/;

let richCache = null;
function richTexts(document) {
  if (richCache && richCache.doc === document) return richCache.list;
  const list = [];
  const script = document.querySelector('script#__NEXT_DATA__, [data-excat-next-data]');
  if (script) {
    try {
      const walk = (o) => {
        if (typeof o === 'string') {
          if (o.includes('<p')) list.push(o);
        } else if (o && typeof o === 'object') {
          Object.values(o).forEach(walk);
        }
      };
      walk(JSON.parse(script.textContent));
    } catch (e) { /* no usable page data */ }
  }
  richCache = { doc: document, list };
  return list;
}

function fullAnswer(document, preview) {
  const prefix = clean(preview.replace(ELLIPSIS, ''));
  if (prefix.length < 20) return null;
  for (const html of richTexts(document)) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const t = clean(div.textContent);
    if (t.length > prefix.length && t.startsWith(prefix)) {
      return div.querySelector('.ck-content') || div;
    }
  }
  return null;
}

export default function parse(element, { document }) {
  const cells = [];
  element.querySelectorAll('.accordion__item').forEach((item) => {
    const header = item.querySelector('.accordion__item-header');
    const titleEl = header && header.querySelector('h1, h2, h3, h4, h5, h6');
    const title = clean((titleEl || header || {}).textContent);
    if (!title) return;

    const content = [];
    const sub = item.querySelector('.accordion__item-subheader');
    if (sub && clean(sub.textContent)) {
      const h4 = document.createElement('h4');
      h4.textContent = clean(sub.textContent);
      content.push(h4);
    }
    let text = item.querySelector('.accordion__item-text .ck-content') || item.querySelector('.accordion__item-text');
    if (text && (item.querySelector('.accordion__showmore-btn') || ELLIPSIS.test(clean(text.textContent)))) {
      text = fullAnswer(document, text.textContent) || text;
    }
    if (text) {
      [...text.children].forEach((child) => {
        if (!clean(child.textContent)) return;
        const node = child.cloneNode(true);
        [node, ...node.querySelectorAll('[style]')].forEach((n) => n.removeAttribute('style'));
        content.push(node);
      });
    }
    item.querySelectorAll('.accordion__item-link a[href]').forEach((link) => {
      const a = document.createElement('a');
      a.href = link.getAttribute('href').trim();
      a.textContent = clean((link.querySelector('span') || link).textContent);
      if (!a.textContent) return;
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    });
    cells.push([title, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion (faq)', cells });
  element.replaceWith(block);
}
