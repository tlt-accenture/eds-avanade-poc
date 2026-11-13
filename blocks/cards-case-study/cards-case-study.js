// "Read more" alone is ambiguous to screen readers; add the card title invisibly
const hiddenText = (text) => Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: text });

// text option: prev/next buttons, shown only while the row overflows
function addNav(el, list) {
  const [prev, next] = [['prev', 'Previous', -1], ['next', 'Next', 1]].map(([name, label, dir]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `cards-case-study-nav cards-case-study-${name}`;
    btn.ariaLabel = `${label} cards`;
    btn.addEventListener('click', () => list.scrollBy({ left: dir * list.clientWidth }));
    return btn;
  });
  const update = () => {
    const max = list.scrollWidth - list.clientWidth;
    prev.hidden = max < 1;
    next.hidden = max < 1;
    // aria-disabled, not disabled, so keyboard focus stays on the button at either end
    prev.ariaDisabled = list.scrollLeft < 1;
    next.ariaDisabled = list.scrollLeft > max - 1;
  };
  list.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(list);
  el.append(prev, next);
}

export default function init(el) {
  const list = document.createElement('ul');
  for (const row of [...el.querySelectorAll(':scope > div')]) {
    const li = document.createElement('li');
    li.className = 'cards-case-study-card';
    for (const cell of [...row.children]) {
      const onlyPic = cell.children.length === 1 && cell.querySelector(':scope > picture, :scope > p > picture');
      cell.className = onlyPic && !li.querySelector('.cards-case-study-image')
        ? 'cards-case-study-image' : 'cards-case-study-body';
      li.append(cell);
    }
    li.querySelector('.cards-case-study-body picture')?.closest('p')?.classList.add('cards-case-study-logo');
    const cta = li.querySelector('.cards-case-study-body > p:last-child > a');
    cta?.parentElement.classList.add('cards-case-study-cta');
    const title = li.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim();
    if (cta && title) cta.append(hiddenText(` about ${title}`));
    list.append(li);
    row.remove();
  }
  el.append(list);
  if (el.classList.contains('text')) addNav(el, list);
}
