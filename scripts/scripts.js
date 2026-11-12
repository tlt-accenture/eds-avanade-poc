import { loadArea, setConfig } from './ak.js';

// Satisfies require-trusted-types-for; runs before loadPage reaches any sink.
if (window.trustedTypes?.createPolicy) {
  window.trustedTypes.createPolicy('default', {
    createHTML: (input) => input,
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

const hostnames = ['authorkit.dev'];

const locales = {
  '': { lang: 'en' },
  '/de': { lang: 'de' },
  '/es': { lang: 'es' },
  '/fr': { lang: 'fr' },
  '/hi': { lang: 'hi' },
  '/ja': { lang: 'ja' },
  '/zh': { lang: 'zh' },
};

const linkBlocks = [
  { fragment: '/fragments/' },
  { schedule: '/schedules/' },
  { youtube: 'https://www.youtube' },
];

// Blocks with self-managed styles
const components = ['fragment', 'schedule'];

// Edge Delivery turns section-metadata tables into section classes/data; local preview does not.
const applySectionMetadata = (area) => {
  area.querySelectorAll('div > .section-metadata').forEach((meta) => {
    const section = meta.parentElement;
    [...meta.children].forEach(({ children: [key, val] }) => {
      const name = key?.textContent.trim().toLowerCase();
      const value = val?.querySelector('img')?.src || val?.textContent.trim();
      if (!name || !value) return;
      if (name === 'style') {
        const styles = value.split(',').map((s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        section.classList.add(...styles.filter(Boolean));
      } else {
        section.dataset[name.replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = value;
      }
    });
    meta.remove();
  });
};

// How to decorate an area before loading it
const decorateArea = ({ area = document }) => {
  applySectionMetadata(area);
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    if (!img) return;
    img.removeAttribute('loading');
    img.fetchPriority = 'high';
  };

  eagerLoad(area, 'img');
};

export async function loadPage() {
  setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  await loadArea();
}
await loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);
  const hasPreview = searchParams.has('dapreview');
  if (hasPreview) import('../tools/da/da.js').then((mod) => mod.default(loadPage));
  const hasQE = searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
}());
