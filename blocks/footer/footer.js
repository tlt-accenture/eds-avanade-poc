import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_PATH = '/fragments/nav/footer';
const SECTION_NAMES = ['brand', 'links', 'legal', 'copyright'];

// an icon link keeps its authored text, for screen readers only
function decorateIconLinks(root) {
  for (const a of root.querySelectorAll('a:has(.icon)')) {
    const text = [...a.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (text.length) {
      const span = document.createElement('span');
      span.className = 'footer-icon-text';
      span.append(...text);
      a.append(span);
    }
  }
  for (const ul of root.querySelectorAll('ul:has(.icon)')) ul.classList.add('footer-social');
}

/**
 * loads and decorates the footer
 * @param {Element} el The footer element
 */
export default async function init(el) {
  const { locale } = getConfig();
  const path = getMetadata('footer-source') || FOOTER_PATH;
  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    fragment.classList.add('footer-content');
    const sections = [...fragment.querySelectorAll(':scope > .section')];
    // the copyright and legal rows are always last, so a footer without brand or links still works
    const names = SECTION_NAMES.slice(-sections.length);
    sections.forEach((section, i) => section.classList.add(`section-${names[i]}`));
    decorateIconLinks(fragment);
    el.append(fragment);
  } catch (e) {
    throw Error(e);
  }
}
