function decorateSlide(row) {
  const parts = [...row.querySelectorAll(':scope > div > *')];
  const figure = document.createElement('figure');
  figure.className = 'quote-carousel-slide';
  const cite = parts.length > 1 && parts.pop();
  const quote = document.createElement('blockquote');
  quote.append(...parts);
  figure.append(quote);
  if (cite) {
    const caption = document.createElement('figcaption');
    caption.append(...cite.childNodes);
    figure.append(caption);
  }
  return figure;
}

function button(name, label, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `quote-carousel-${name}`;
  btn.ariaLabel = label;
  btn.addEventListener('click', onClick);
  return btn;
}

export default function init(el) {
  const track = document.createElement('div');
  track.className = 'quote-carousel-track';
  const slides = [...el.querySelectorAll(':scope > div')].map(decorateSlide);
  track.append(...slides);
  el.replaceChildren(track);
  if (slides.length < 2) return;

  el.role = 'region';
  el.ariaRoleDescription = 'carousel';
  el.ariaLabel = 'Quotes';
  slides.forEach((slide, i) => {
    slide.role = 'group';
    slide.ariaRoleDescription = 'slide';
    slide.ariaLabel = `${i + 1} of ${slides.length}`;
  });

  let index = 0;
  const go = (i) => track.scrollTo({ left: i * track.clientWidth });
  const prev = button('prev', 'Previous quote', () => go(index - 1));
  const next = button('next', 'Next quote', () => go(index + 1));
  const dots = slides.map((_, i) => button('dot', `Show quote ${i + 1}`, () => go(i)));
  const update = () => {
    index = Math.round(track.scrollLeft / track.clientWidth);
    dots.forEach((dot, i) => { dot.ariaCurrent = i === index ? 'true' : null; });
    prev.ariaDisabled = index === 0;
    next.ariaDisabled = index === slides.length - 1;
  };
  const controls = document.createElement('div');
  controls.className = 'quote-carousel-controls';
  controls.append(prev, ...dots, next);
  el.append(controls);
  track.addEventListener('scroll', update, { passive: true });
  update();
}
