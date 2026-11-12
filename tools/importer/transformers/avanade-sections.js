/* eslint-disable */
/* global WebImporter */

const MARKER = 'data-excat-section-id';

function findSection(element, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    try {
      const el = element.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector in this environment, try the next one
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const document = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSection(element, section);
      if (!el) continue;
      if (i === 0 && !section.style) continue;
      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-first', '');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (!marker) continue;
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      // Section metadata goes at the end of its section: before the next <hr> or at the end.
      let next = marker.nextElementSibling;
      while (next && next.tagName !== 'HR') next = next.nextElementSibling;
      if (next) next.before(metadata);
      else marker.parentElement.append(metadata);
      marker.removeAttribute(MARKER);
    }
    element.querySelectorAll('hr[data-excat-first]').forEach((hr) => hr.remove());
  }
}
