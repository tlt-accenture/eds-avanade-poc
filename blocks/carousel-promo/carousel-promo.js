// generic "Learn more" links get the slide title invisibly, for screen readers
const hiddenText = (text) => Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: text });

export default function init(el) {
  const slides = [...el.querySelectorAll(':scope > div')];
  const track = document.createElement('ul');
  track.className = 'carousel-promo-track';
  const dots = document.createElement('div');
  dots.className = 'carousel-promo-dots';

  slides.forEach((row, i) => {
    const li = document.createElement('li');
    li.className = 'carousel-promo-slide';
    li.ariaLabel = `${i + 1} of ${slides.length}`;
    const [media, body] = row.children;
    media?.classList.add('carousel-promo-image');
    body?.classList.add('carousel-promo-body');
    const title = body?.querySelector('h2, h3')?.textContent.trim();
    body?.querySelectorAll('a').forEach((a) => {
      if (title && /^(learn|read) more$/i.test(a.textContent.trim())) a.append(hiddenText(` about ${title}`));
    });
    li.append(...row.children);
    track.append(li);
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.ariaLabel = `Show slide ${i + 1}`;
    dot.addEventListener('click', () => track.scrollTo({
      left: li.offsetLeft - (track.clientWidth - li.clientWidth) / 2,
      behavior: 'smooth',
    }));
    dots.append(dot);
    row.remove();
  });

  dots.firstChild.ariaCurrent = 'true';
  const setActive = (idx) => [...dots.children].forEach((d, i) => {
    d.ariaCurrent = i === idx ? 'true' : null;
  });
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) setActive([...track.children].indexOf(e.target));
  }), { root: track, threshold: 0.6 });
  [...track.children].forEach((li) => io.observe(li));

  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'carousel-promo-pause';
  pause.ariaLabel = 'Pause';
  pause.ariaPressed = 'false';

  // the active dot's CSS progress animation is the autoplay clock
  dots.addEventListener('animationend', (e) => {
    if (!e.target.ariaCurrent) return;
    const idx = [...dots.children].indexOf(e.target);
    dots.children[(idx + 1) % slides.length].click();
  });
  pause.addEventListener('click', () => {
    const paused = pause.ariaPressed === 'true';
    pause.ariaPressed = String(!paused);
    pause.ariaLabel = paused ? 'Pause' : 'Play';
  });

  const controls = document.createElement('div');
  controls.className = 'carousel-promo-controls';
  controls.append(dots, pause);
  el.append(track, controls);
  if (slides.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Object.assign(pause, { ariaPressed: 'true', ariaLabel: 'Play' });
  }
}
