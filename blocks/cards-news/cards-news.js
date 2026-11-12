// "Read more" alone is ambiguous to screen readers; add the card title invisibly
const hiddenText = (text) => Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: text });

export default function init(el) {
  const list = document.createElement('ul');
  for (const row of [...el.querySelectorAll(':scope > div')]) {
    const li = document.createElement('li');
    li.className = 'cards-news-card';
    const body = row.lastElementChild;
    body.className = 'cards-news-body';
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const tag = heading ? heading.previousElementSibling : body.firstElementChild;
    if (tag && tag.tagName === 'P' && !tag.querySelector('a')) tag.classList.add('cards-news-tag');
    const cta = body.querySelector(':scope > p:last-child > a');
    cta?.parentElement.classList.add('cards-news-cta');
    if (cta && heading) cta.append(hiddenText(` about ${heading.textContent.trim()}`));
    li.append(...row.children);
    list.append(li);
    row.remove();
  }
  el.append(list);
}
