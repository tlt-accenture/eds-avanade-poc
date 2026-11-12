/* eslint-disable */
/* global WebImporter */

/**
 * hero-video-badge
 * Row 1: background picture.
 * Row 2: cell 1 H1, intro paragraph(s), "Ask Avanade anything" prompt as a CTA link;
 *        cell 2 Partner of the Year badge picture + Brightcove video embed link.
 */
// Fallbacks for this site's Brightcove player when hidden inputs are empty.
const BC_ACCOUNT = '2103045685001';
const BC_PLAYER = 'SJXTqvOM';
const ASSISTANT_PATH = '/en-us/ai-assistance';

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

function inputValue(root, sel) {
  const el = root.querySelector(sel);
  return el ? (el.value || el.getAttribute('value') || '').trim() : '';
}

export default function parse(element, { document }) {
  const cells = [];

  // Background image
  const bg = cloneImg(document, element.querySelector('.full-bleed-hero__img-container img'));
  if (bg) cells.push([bg]);

  // Text cell
  const text = [];
  const textCol = element.querySelector('.homepage-hero-video__text-container');
  const title = textCol?.querySelector('h1, .homepage-hero-video__title');
  if (title && title.textContent.trim()) {
    const h1 = document.createElement('h1');
    h1.textContent = title.textContent.trim();
    text.push(h1);
  }
  if (textCol) {
    [...textCol.querySelectorAll('p')]
      .filter((p) => !p.closest('.agentic-homepage-hero-video-input-wrapper') && p.textContent.trim())
      .filter((p) => !p.querySelector('p')) // skip wrappers around nested paragraphs
      .forEach((p) => {
        const np = document.createElement('p');
        np.innerHTML = p.innerHTML.trim();
        text.push(np);
      });
  }
  const prompt = element.querySelector('.agentic-homepage-hero-video-input-wrapper textarea');
  if (prompt || element.querySelector('.agentic-homepage-hero-video-input-wrapper')) {
    const label = ((prompt && (prompt.getAttribute('placeholder') || prompt.placeholder)) || 'Ask Avanade anything...')
      .replace(/\.+$/, '').trim();
    const a = document.createElement('a');
    a.href = ASSISTANT_PATH;
    a.textContent = label;
    const p = document.createElement('p');
    p.append(a);
    text.push(p);
  }

  // Media cell: badge + video link
  const media = [];
  const videoCol = element.querySelector('.homepage-hero-video__video-container') || element;
  const badge = cloneImg(document, videoCol.querySelector('.before-video-js__thumbnail img'));
  if (badge) {
    const p = document.createElement('p');
    p.append(badge);
    media.push(p);
  }
  const videoEl = videoCol.querySelector('[id^="videoId_"]');
  const videoId = inputValue(videoCol, '[id^="hddnVideoId"]')
    || (videoEl ? videoEl.id.replace('videoId_', '') : '')
    || ((videoCol.querySelector('[id^="hddnVideoId"]')?.id || '').replace('hddnVideoId', ''))
    || inputValue(videoCol, '#hddn_m_DataplaylistId');
  if (videoId) {
    const account = inputValue(videoCol, '#hddn_m_AccountId') || BC_ACCOUNT;
    const player = inputValue(videoCol, '#hddn_m_PlayerKey') || BC_PLAYER;
    const a = document.createElement('a');
    a.href = `https://players.brightcove.net/${account}/${player}_default/index.html?videoId=${videoId}`;
    a.textContent = videoCol.querySelector('.before-video-js__play-button')?.getAttribute('title') || 'Play Video';
    const p = document.createElement('p');
    p.append(a);
    media.push(p);
  }

  cells.push(media.length ? [text, media] : [text, '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video-badge', cells });
  element.replaceWith(block);
}
