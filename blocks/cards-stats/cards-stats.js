function countUp(el) {
  const final = el.textContent;
  const [, num, rest] = final.match(/^(\d+)(.*)$/s) ?? [];
  if (!num) return;
  // screen readers get the final value; the animated digits are hidden from them
  const shown = Object.assign(document.createElement('span'), { ariaHidden: 'true' });
  el.replaceChildren(Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: final }), shown);
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / 1500, 1);
    shown.textContent = `${Math.round(num * (1 - (1 - t) ** 3))}${rest}`;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export default function init(el) {
  const list = document.createElement('ul');
  for (const row of [...el.querySelectorAll(':scope > div')]) {
    const li = document.createElement('li');
    li.className = 'cards-stats-item';
    const cells = [...row.children];
    const items = cells.length > 1 ? cells : [...cells[0].children];
    const [value, ...caption] = items;
    value?.classList.add('cards-stats-value');
    caption.forEach((c) => c.classList.add('cards-stats-caption'));
    li.append(...items);
    list.append(li);
    row.remove();
  }
  el.append(list);

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver((entries) => {
    for (const { isIntersecting, target } of entries) {
      if (isIntersecting) {
        observer.unobserve(target);
        countUp(target);
      }
    }
  }, { threshold: 0.5 });
  el.querySelectorAll('.cards-stats-value').forEach((v) => observer.observe(v));
}
