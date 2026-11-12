/* eslint-disable */
/* global WebImporter */

/**
 * cards-stats: one row per stat, single cell: value paragraph, caption paragraph(s).
 * Values stay plain paragraphs (never headings). Animated counters: prefer the
 * final value from data attributes, falling back to the rendered text.
 */
export default function parse(element, { document }) {
  const cells = [];

  element.querySelectorAll('.key-insight-metric-blocks__metric').forEach((metric) => {
    const numEl = metric.querySelector('.key-insight-metric__small-number, .key-insight-metric__number-container');
    const counter = metric.querySelector('[data-value], [data-count], [data-end], [data-target]');
    const value = (counter && (counter.getAttribute('data-value') || counter.getAttribute('data-count')
      || counter.getAttribute('data-end') || counter.getAttribute('data-target')))
      || numEl?.textContent.trim();
    if (!value) return;

    const content = [];
    const vp = document.createElement('p');
    vp.textContent = value.trim();
    content.push(vp);

    const text = metric.querySelector('.key-insight-metric__text');
    if (text) {
      const paras = [...text.querySelectorAll('p')].filter((p) => p.textContent.trim());
      if (paras.length) {
        paras.forEach((p) => {
          const np = document.createElement('p');
          np.innerHTML = p.innerHTML;
          content.push(np);
        });
      } else if (text.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = text.textContent.trim();
        content.push(p);
      }
    }

    cells.push([content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block);
}
