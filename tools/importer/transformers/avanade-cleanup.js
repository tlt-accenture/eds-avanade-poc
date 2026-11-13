/* eslint-disable */
/* global WebImporter */

/**
 * Avanade cleanup transformer.
 *
 * Removable sections inside #content (contact-us popover, decorative curve-only
 * and empty spacer sections, on any template) are emptied in beforeTransform but their <section>
 * shells are kept so the template's `#content > section:nth-of-type(n)` selectors
 * still resolve to the right elements. The shells are removed in afterTransform.
 */

const SHELL_ATTR = 'data-excat-remove';


function isDecorativeOnly(section) {
  // Safety check: only a single decorative image, no headings or text content.
  if (section.querySelector('h1, h2, h3, h4, h5, h6, p, a, li')) return false;
  const imgs = section.querySelectorAll('img');
  return imgs.length <= 1 && section.textContent.trim() === '';
}

function emptyAsShell(el) {
  el.innerHTML = '';
  el.setAttribute(SHELL_ATTR, '');
}

export default function transform(hookName, element, payload) {
  // The importer drops <script> before transform; keep Next.js page data (full FAQ answers,
  // lazy image URLs) readable by parsers in a plain element, removed in afterTransform.
  if (hookName === 'preprocess') {
    const data = element.querySelector('script#__NEXT_DATA__');
    if (data && !element.querySelector('[data-excat-next-data]')) {
      const keep = element.ownerDocument.createElement('div');
      keep.setAttribute('data-excat-next-data', '');
      keep.textContent = data.textContent;
      element.append(keep);
    }
    return;
  }

  if (hookName === 'beforeTransform') {
    // Hidden contact-us popover (Marketo form), keep shell for nth-of-type stability.
    element.querySelectorAll('section.contact-us.is-popover, #contact-us-popover')
      .forEach(emptyAsShell);

    // Decorative curve/logoline-only sections and empty spacers (homepage rc4/rc7/rc15,
    // service pages between most bands).
    element.querySelectorAll('#content > section').forEach((section) => {
      if (isDecorativeOnly(section)) emptyAsShell(section);
    });

    // Site chrome and third-party widgets.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '#header',
      '#footer',
      '.skip-navigation',
      'byoc-registration',
      'next-route-announcer',
      '#onetrust-consent-sdk',
      '[id^="onetrust"]',
      '[class*="optanon"]',
      '[id^="mktoStyleLoaded"]',
      'body > form.mktoForm',
      '#MktoForms2XDIframe',
      'iframe[id^="destination_publishing_iframe"]',
      'iframe[src*="demdex"]',
      'img[src*="omtrdc"]',
      'img[src*="demdex"]',
      'img.mapbrightcovecom',
      'img[src*="brightcove.com%2Flead"]',
      'img[src*="bizible.com"]',
      'img[src*="bizibly.com"]',
      // Screen-reader-only carousel helper text ("Card 1 of 3: ...")
      '#content .visually-hidden-element',
      'nav.visually-hidden-navigation',
      'nav.visually-hidden-element',
    ]);
  }

  if (hookName === 'afterTransform') {
    element.querySelectorAll(`[${SHELL_ATTR}], [data-excat-next-data]`).forEach((el) => el.remove());

    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
      'form',
      'button',
      'textarea',
      'input',
      'select',
      'svg',
    ]);

    // Strip tracking / framework attributes.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach(({ name }) => {
        if (/^(data-(analytics|track|tracking|cmp|gtm|omni|nimg|testid)|onclick|onload)/i.test(name)) {
          el.removeAttribute(name);
        }
      });
    });
  }
}
