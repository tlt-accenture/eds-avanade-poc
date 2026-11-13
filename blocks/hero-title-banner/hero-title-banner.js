export default function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const content = rows.pop();
  content?.classList.add('hero-title-banner-content');
  if (rows.length) rows.pop().classList.add('hero-title-banner-background');
  const cell = el.classList.contains('split') && content?.firstElementChild;
  if (!cell) return;
  const heading = cell.querySelector(':scope > :is(h1, h2, h3, h4, h5, h6)');
  const body = document.createElement('div');
  body.className = 'hero-title-banner-body';
  body.append(...[...cell.children].filter((child) => child !== heading));
  cell.append(body);
}
