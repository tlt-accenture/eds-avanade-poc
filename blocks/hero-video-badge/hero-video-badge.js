function decorateVideo(media) {
  const link = [...media.querySelectorAll('a')].find((a) => !a.querySelector('picture'));
  if (!link) return;
  link.classList.add('hero-video-badge-play');
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const dialog = document.createElement('dialog');
    dialog.className = 'hero-video-badge-dialog';
    const close = document.createElement('button');
    close.type = 'button';
    close.ariaLabel = 'Close';
    close.addEventListener('click', () => dialog.close());
    const frame = document.createElement('iframe');
    frame.src = link.href;
    frame.title = link.textContent.trim();
    frame.allow = 'autoplay; fullscreen; encrypted-media';
    dialog.append(close, frame);
    dialog.addEventListener('close', () => dialog.remove());
    media.append(dialog);
    dialog.showModal();
  });
}

// the localized homepage (/en-us, or /content/en-us in the local preview), with a campaign in the
// link or remembered from earlier in the visit
const HOME = /^(\/content)?\/[a-z]{2}-[a-z]{2}\/?$/;
const hasCampaign = () => HOME.test(window.location.pathname)
  && (new URLSearchParams(window.location.search).has('utm_campaign')
    || /(?:^|;\s*)campaign=/.test(document.cookie));

export default async function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const fg = rows.pop();
  fg.classList.add('hero-video-badge-foreground');
  if (rows.length) rows.pop().classList.add('hero-video-badge-background');
  const [text, media] = fg.children;
  text?.classList.add('hero-video-badge-text');
  if (media) {
    media.classList.add('hero-video-badge-media');
    decorateVideo(media);
  }
  // before init returns, so the section first appears with the campaign's words
  if (text && !el.classList.contains('card') && hasCampaign()) {
    const { default: applyCampaign } = await import('../../scripts/utils/campaign.js');
    await applyCampaign(text);
  }
}
