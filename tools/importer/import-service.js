/* eslint-disable */
/* global WebImporter */

import heroVideoBadgeCardParser from './parsers/hero-video-badge-card.js';
import jumpLinksParser from './parsers/jump-links.js';
import heroTitleBannerSplitParser from './parsers/hero-title-banner-split.js';
import columnsImageTextHighlightsParser from './parsers/columns-image-text-highlights.js';
import cardsCaseStudyTextParser from './parsers/cards-case-study-text.js';
import accordionParser from './parsers/accordion.js';
import quoteCarouselParser from './parsers/quote-carousel.js';
import contactParser from './parsers/contact.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import cardsNewsParser from './parsers/cards-news.js';
import cleanupTransformer from './transformers/avanade-cleanup.js';
import sectionsTransformer from './transformers/avanade-sections.js';

const PAGE_TEMPLATE = {
  "name": "service",
  "urls": [
    "https://www.avanade.com/en-us/services/cloud"
  ],
  "representativeUrl": "https://www.avanade.com/en-us/services/cloud",
  "description": "Avanade service pages (Services menu): hero card, jump links, intro, highlights, capabilities accordion, client stories, contact, FAQs",
  "blocks": [
    {
      "name": "hero-video-badge-card",
      "instances": [
        ".full-bleed-hero"
      ]
    },
    {
      "name": "jump-links",
      "instances": [
        ".jump-links"
      ]
    },
    {
      "name": "hero-title-banner-split",
      "instances": [
        ".title-banner"
      ]
    },
    {
      "name": "columns-image-text-highlights",
      "instances": [
        ".timage-left-aligned-image-with-logoline"
      ]
    },
    {
      "name": "cards-case-study-text",
      "instances": [
        ".featured-content-carousel-with-logoline"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        ".gradient-simple-accordion"
      ]
    },
    {
      "name": "quote-carousel",
      "instances": [
        ".evidence"
      ]
    },
    {
      "name": "contact",
      "instances": [
        "#content > section.contact-expert"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        ".accordion:not(.gradient-simple-accordion .accordion)"
      ]
    },
    {
      "name": "cards-news",
      "instances": [
        ".cards--default"
      ]
    }
  ],
  "urlPattern": "/en-us/services/*",
  "sections": [
    {
      "id": "rc2",
      "name": "Hero",
      "selector": [
        "#content > section:has(.full-bleed-hero)"
      ],
      "style": null,
      "blocks": [
        "hero-video-badge-card"
      ],
      "defaultContent": []
    },
    {
      "id": "rc3",
      "name": "Jump links",
      "selector": [
        "#content > section:has(.jump-links)"
      ],
      "style": null,
      "blocks": [
        "jump-links"
      ],
      "defaultContent": []
    },
    {
      "id": "rc4",
      "name": "Our approach",
      "selector": [
        "#content > section:has(.title-banner)"
      ],
      "style": null,
      "blocks": [
        "hero-title-banner-split"
      ],
      "defaultContent": []
    },
    {
      "id": "rc6",
      "name": "Image + highlights",
      "selector": [
        "#content > section:has(.timage-left-aligned-image-with-logoline)"
      ],
      "style": "grey-fade",
      "blocks": [
        "columns-image-text-highlights"
      ],
      "defaultContent": []
    },
    {
      "id": "rc7",
      "name": "What you can achieve",
      "selector": [
        "#content > section:has(.featured-content-carousel-with-logoline):has(~ section .gradient-simple-accordion)"
      ],
      "style": "pink-gradient, centered",
      "blocks": [
        "cards-case-study-text"
      ],
      "defaultContent": [
        ".featured-content-carousel-with-logoline__heading"
      ]
    },
    {
      "id": "rc8",
      "name": "Capabilities",
      "selector": [
        "#content > section:has(.title-reusable):has(+ section .gradient-simple-accordion)",
        "#content > section:has(.title-reusable):has(.gradient-simple-accordion)"
      ],
      "style": "centered",
      "blocks": [
        "accordion"
      ],
      "defaultContent": [
        ".title-reusable"
      ]
    },
    {
      "id": "rc11",
      "name": "Quote",
      "selector": [
        "#content > section:has(.evidence)"
      ],
      "style": "grey-fade",
      "blocks": [
        "quote-carousel"
      ],
      "defaultContent": []
    },
    {
      "id": "rc13",
      "name": "Client stories",
      "selector": [
        "#content > section:has(.featured-content-carousel-with-logoline):not(:has(~ section .gradient-simple-accordion))"
      ],
      "style": "pink-gradient, centered",
      "blocks": [
        "cards-case-study-text"
      ],
      "defaultContent": [
        ".featured-content-carousel-with-logoline__heading"
      ]
    },
    {
      "id": "rc15",
      "name": "Related links",
      "selector": [
        "#content > section:has(.cards--default)"
      ],
      "style": "centered",
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        ".cards--default__title"
      ]
    },
    {
      "id": "rc16",
      "name": "Contact",
      "selector": [
        "#content > section.contact-expert"
      ],
      "style": "grey-fade",
      "blocks": [
        "contact"
      ],
      "defaultContent": []
    },
    {
      "id": "rc18",
      "name": "FAQs",
      "selector": [
        "#content > section:has(.title-reusable):has(+ section .accordion:not(.gradient-simple-accordion .accordion))"
      ],
      "style": "centered",
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": [
        ".title-reusable"
      ]
    }
  ]
};

const parsers = {
  'hero-video-badge-card': heroVideoBadgeCardParser,
  'jump-links': jumpLinksParser,
  'hero-title-banner-split': heroTitleBannerSplitParser,
  'columns-image-text-highlights': columnsImageTextHighlightsParser,
  'cards-case-study-text': cardsCaseStudyTextParser,
  'accordion': accordionParser,
  'quote-carousel': quoteCarouselParser,
  'contact': contactParser,
  'accordion-faq': accordionFaqParser,
  'cards-news': cardsNewsParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
const transformers = [cleanupTransformer, ...lateTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    // Page data in <script> is gone by transform; the cleanup transformer copies what parsers need.
    executeTransformers('preprocess', payload.document.body, payload, earlyTransformers);
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
