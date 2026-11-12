// "Read more" alone is ambiguous to screen readers; add the card title invisibly
const hiddenText = (text) => Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: text });

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
}
