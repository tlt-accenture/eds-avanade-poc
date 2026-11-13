export default function init(el) {
  const links = [...el.querySelectorAll('a[href*="#"]')];
  const nav = document.createElement('nav');
  nav.ariaLabel = 'On this page';
  const list = document.createElement('ul');
  list.className = 'jump-links-list';
  const items = links.map((a) => {
    const id = decodeURIComponent(a.hash.slice(1)).trim();
    a.href = `#${id}`;
    a.className = 'jump-links-link';
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
    return { a, id };
  });
  nav.append(list);
  el.replaceChildren(nav);

  const section = el.closest('.section');
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--jump-links-height', `${section.offsetHeight}px`);
  }).observe(section);

  // targets get their id from section metadata as later sections load, so look them up on each pass
  let current;
  const update = () => {
    const stuck = section.getBoundingClientRect().top <= parseFloat(getComputedStyle(section).top);
    section.classList.toggle('stuck', window.scrollY > 0 && stuck);
    // a section is current once its top passes a quarter of the view below the bar
    const line = nav.getBoundingClientRect().bottom + window.innerHeight / 4;
    // sections not yet loaded are hidden and would all read as top 0
    const top = ({ id }) => {
      const target = document.getElementById(id);
      return target?.checkVisibility() ? target.getBoundingClientRect().top : NaN;
    };
    const active = items.findLast((item) => top(item) <= line);
    if (active === current) return;
    current?.a.removeAttribute('aria-current');
    current = active;
    active?.a.setAttribute('aria-current', 'true');
    // keep the current link in view when the row scrolls sideways
    if (active && list.scrollWidth > list.clientWidth) {
      const link = active.a.getBoundingClientRect();
      const row = list.getBoundingClientRect();
      list.scrollBy({ left: link.left - row.left - (row.width - link.width) / 2 });
    }
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}
