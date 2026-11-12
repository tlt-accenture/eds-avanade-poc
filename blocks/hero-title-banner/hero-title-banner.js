export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  rows.pop()?.classList.add('hero-title-banner-content');
  if (rows.length) rows.pop().classList.add('hero-title-banner-background');
}
