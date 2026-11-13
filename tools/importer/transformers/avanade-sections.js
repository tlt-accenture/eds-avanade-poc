/* eslint-disable */
/* global WebImporter */

const MARKER = 'data-excat-section-id';

// Section anchors the jump-links block targets, per template and section id.
const ANCHORS = {
  service: {
    rc4: 'our-approach',
    rc7: 'what-you-can-achieve',
    rc8: 'our-capabilities',
    rc13: 'client-stories',
    rc16: 'contact-us',
    rc18: 'faqs',
  },
};

// Jump-link label → the sections it can target, in order of preference. Source anchors vary
// per page ("whatwecanachieve", "Our%20approach", "client-impact"), labels don't; a page
// without the first choice links to the nearest equivalent (managed-services has its only
// carousel after the capabilities).
const LINK_TARGETS = {
  service: [
    [/approach/, ['rc4']],
    [/achieve/, ['rc7', 'rc13']],
    [/capabilit/, ['rc8']],
    [/related/, ['rc13', 'rc15']],
    [/client|stor|impact/, ['rc13']],
    [/contact/, ['rc16']],
    [/faq/, ['rc18']],
  ],
};

// Point each jump link at an anchor that exists on this page.
function retargetJumpLinks(element, sections, templateName) {
  const anchors = ANCHORS[templateName] || {};
  const rules = LINK_TARGETS[templateName];
  if (!rules) return;
  const present = new Set(sections
    .filter((s) => element.querySelector(`hr[${MARKER}="${s.id}"]`))
    .map((s) => s.id));
  element.querySelectorAll('table').forEach((table) => {
    const head = table.querySelector('tr');
    if (!head || !/^jump[\s-]links$/i.test(head.textContent.trim())) return;
    table.querySelectorAll('a[href^="#"]').forEach((a) => {
      const label = a.textContent.trim().toLowerCase();
      const rule = rules.find(([re]) => re.test(label));
      const id = rule && rule[1].find((sid) => present.has(sid));
      if (id && anchors[id]) a.setAttribute('href', `#${anchors[id]}`);
    });
  });
}

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
  const anchors = ANCHORS[payload.template.name] || {};
  const hasMetadata = (section) => section.style || anchors[section.id];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSection(element, section);
      if (!el) continue;
      if (i === 0 && !hasMetadata(section)) continue;
      const hr = document.createElement('hr');
      if (hasMetadata(section)) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-first', '');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // before the markers are consumed below: they tell which sections this page has
    retargetJumpLinks(element, sections, payload.template.name);
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!hasMetadata(section)) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (!marker) continue;
      const cells = {};
      if (section.style) cells.style = section.style;
      if (anchors[section.id]) cells.id = anchors[section.id];
      const metadata = WebImporter.Blocks.createBlock(document, { name: 'Section Metadata', cells });
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
