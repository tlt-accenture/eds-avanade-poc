import { getConfig, getMetadata, ifLocalStorage } from '../../scripts/ak.js';
import { getSvg } from '../../scripts/utils/svg.js';
import { loadFragment } from '../fragment/fragment.js';
import { setColorScheme } from '../section-metadata/section-metadata.js';

const { locale } = getConfig();

const HEADER_PATH = '/fragments/nav/header';

const menuTriggers = new WeakMap();

function closeAllMenus() {
  const openMenus = document.body.querySelectorAll('header .is-open');
  for (const container of openMenus) {
    container.classList.remove('is-open');
    const trigger = menuTriggers.get(container);
    if (trigger) trigger.ariaExpanded = 'false';
  }
}

function docClose(e) {
  // a click on the blurred backdrop (header::before) targets the header itself
  if (e.target.closest('header > *')) return;
  closeAllMenus();
}

function menuKeydown(e) {
  if (e.key !== 'Escape') return;
  const open = e.target.closest('.is-open');
  if (!open) return;
  e.stopPropagation();
  const trigger = menuTriggers.get(open);
  closeAllMenus();
  trigger?.focus();
}

function menuFocusout(e) {
  const open = e.target.closest('.is-open');
  if (!open) return;
  if (!e.relatedTarget) return;
  if (open.contains(e.relatedTarget)) return;
  closeAllMenus();
}

function openMenu(container) {
  if (container.classList.contains('is-open')) return;
  closeAllMenus();
  document.addEventListener('click', docClose);
  container.classList.add('is-open');
  const trigger = menuTriggers.get(container);
  if (trigger) trigger.ariaExpanded = 'true';
}

function toggleMenu(container) {
  if (container.classList.contains('is-open')) {
    closeAllMenus();
    return;
  }
  openMenu(container);
}

let menuId = 0;

const svgIcon = (name) => getSvg({ name, className: `icon icon-${name}` });

// A link whose href ends in "=" is a query: its text is the placeholder; the value is appended.
function decorateQueries(root, btn) {
  for (const link of root.querySelectorAll('a[href$="="]')) {
    const form = document.createElement('form');
    form.className = 'header-query';
    form.role = 'search';
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = link.textContent;
    input.ariaLabel = link.textContent;
    const submit = document.createElement('button');
    submit.ariaLabel = btn.textContent.trim();
    submit.append(svgIcon('arrow-right'));
    const lead = btn.querySelector('svg')?.cloneNode(true);
    form.append(...(lead ? [lead] : []), input, submit);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input.value.trim()) window.location.href = `${link.href}${encodeURIComponent(input.value.trim())}`;
    });
    (link.closest('p') || link).replaceWith(form);
  }
}

function markCurrent(root) {
  const here = `${window.location.pathname}/`;
  for (const a of root.querySelectorAll('a')) {
    if (a.origin === window.location.origin && here.includes(`${a.pathname}/`)) a.ariaCurrent = 'true';
  }
}

// Action buttons that open a panel loaded from a header sub-fragment (/fragments/nav/header/<name>)
function decoratePanel(btn, name, { current = false, closeIcon = false } = {}) {
  const wrapper = btn.parentElement;
  btn.ariaExpanded = 'false';
  if (closeIcon) btn.append(svgIcon('close'));
  menuTriggers.set(wrapper, btn);
  wrapper.addEventListener('keydown', menuKeydown);
  wrapper.addEventListener('focusout', menuFocusout);
  btn.addEventListener('click', async () => {
    if (!wrapper.querySelector('.menu')) {
      const fragment = await loadFragment(`${locale.prefix}${HEADER_PATH}/${name}`);
      decorateQueries(fragment, btn);
      if (current) markCurrent(fragment);
      const menu = document.createElement('div');
      menuId += 1;
      menu.id = `header-menu-${menuId}`;
      menu.className = `${name} menu`;
      menu.append(fragment);
      wrapper.append(menu);
      btn.setAttribute('aria-controls', menu.id);
    }
    toggleMenu(wrapper);
    if (wrapper.classList.contains('is-open')) wrapper.querySelector('.menu input')?.focus();
  });
}

const decorateLanguage = (btn) => {
  decoratePanel(btn, 'languages', { current: true });
  btn.append(svgIcon('chevron-down'));
};

function decorateScheme(btn) {
  const dark = () => {
    const { classList } = document.body;
    if (classList.contains('dark-scheme')) return true;
    if (classList.contains('light-scheme')) return false;
    return matchMedia('(prefers-color-scheme: dark)').matches;
  };
  btn.ariaPressed = String(dark());
  btn.addEventListener('click', async () => {
    const { body } = document;

    const theme = dark()
      ? { add: 'light-scheme', remove: 'dark-scheme' }
      : { add: 'dark-scheme', remove: 'light-scheme' };

    body.classList.remove(theme.remove);
    body.classList.add(theme.add);
    ifLocalStorage.setItem('color-scheme', theme.add);
    // Re-calculatie section schemes
    const sections = document.querySelectorAll('.section');
    for (const section of sections) {
      setColorScheme(section);
    }
    btn.ariaPressed = String(dark());
  });
}

const drawerEscHandlers = new WeakMap();

function teardownDrawer(header) {
  header.classList.remove('is-mobile-open');
  for (const el of document.querySelectorAll('main, footer')) el.inert = false;
  const escHandler = drawerEscHandlers.get(header);
  if (escHandler) {
    document.removeEventListener('keydown', escHandler);
    drawerEscHandlers.delete(header);
  }
}

const drawerModes = new WeakMap();

function syncDrawerState(header) {
  const toggle = header.querySelector('.action-wrapper.nav-toggle button');
  const drawerMode = !!toggle?.checkVisibility();
  // crossing the breakpoint: a hover panel or sub-panel from the other layout must not linger
  if (drawerModes.has(header) && drawerModes.get(header) !== drawerMode) closeAllMenus();
  drawerModes.set(header, drawerMode);
  if (!drawerMode && header.classList.contains('is-mobile-open')) {
    teardownDrawer(header);
  }
  const isOpen = header.classList.contains('is-mobile-open');
  const collapsed = drawerMode && !isOpen;
  for (const section of header.querySelectorAll('.main-nav-section, .actions-section')) {
    section.inert = collapsed && !section.contains(toggle);
  }
  if (toggle) toggle.ariaExpanded = String(drawerMode && isOpen);
}

function closeDrawer(header, toggle) {
  teardownDrawer(header);
  syncDrawerState(header);
  toggle.focus();
}

function decorateNavToggle(btn) {
  btn.ariaExpanded = 'false';
  btn.append(svgIcon('close'));
  btn.addEventListener('click', () => {
    const header = btn.closest('header');
    if (!header) return;
    const opening = !header.classList.contains('is-mobile-open');
    closeAllMenus();
    if (!opening) {
      closeDrawer(header, btn);
      return;
    }
    header.classList.add('is-mobile-open');
    for (const el of document.querySelectorAll('main, footer')) el.inert = true;
    syncDrawerState(header);
    header.querySelector('.main-nav-section a, .main-nav-section button')?.focus();
    const escHandler = (e) => {
      if (e.key !== 'Escape') return;
      closeAllMenus();
      closeDrawer(header, btn);
    };
    drawerEscHandlers.set(header, escHandler);
    document.addEventListener('keydown', escHandler);
  });
}

const HEADER_ACTIONS = [
  { name: 'scheme', path: '/tools/widgets/scheme', decorate: decorateScheme },
  { name: 'language', path: '/tools/widgets/language', decorate: decorateLanguage },
  { name: 'nav-toggle', path: '/tools/widgets/toggle', decorate: decorateNavToggle },
  { name: 'ai', path: '/tools/widgets/ai', decorate: (btn) => decoratePanel(btn, 'ai', { closeIcon: true }) },
  { name: 'search', path: '/tools/widgets/search', decorate: (btn) => decoratePanel(btn, 'search', { closeIcon: true }) },
];

function decorateAction(header, { name, path, decorate }) {
  const link = header.querySelector(`[href*="${path}"]`);
  if (!link) return;

  const icon = link.querySelector('.icon');
  const text = link.textContent;
  const btn = document.createElement('button');
  if (icon) btn.append(icon);
  if (text) {
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = text;
    btn.append(textSpan);
  }
  const wrapper = document.createElement('div');
  wrapper.className = `action-wrapper ${name}`;
  wrapper.append(btn);
  link.parentElement.parentElement.replaceChild(wrapper, link.parentElement);

  decorate(btn);
}

function decorateMenu(li) {
  const list = li.querySelector(':scope > ul');
  if (!list) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'menu';
  wrapper.append(list);
  li.append(wrapper);
  return wrapper;
}

function decorateMegaMenu(li) {
  const menu = li.querySelector('.fragment-content');
  if (!menu) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'mega-menu';
  wrapper.append(menu);
  li.append(wrapper);
  return wrapper;
}

const isDrawer = (el) => !!el.closest('header')?.querySelector('.action-wrapper.nav-toggle button')?.checkVisibility();

// Drawer sub-panels: a back control, then the item as a heading (its link, when it has one)
function decorateSubPanel(menu, label, link, backText, trigger) {
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'menu-back';
  back.append(svgIcon('chevron-down'), backText);
  back.addEventListener('click', () => {
    closeAllMenus();
    trigger.focus();
  });
  const heading = document.createElement('p');
  heading.className = 'menu-heading';
  const headingLink = link?.cloneNode(true);
  headingLink?.removeAttribute('class');
  heading.append(headingLink || label.textContent);
  menu.prepend(back, heading);
}

function decorateNavItem(li, backText) {
  li.classList.add('main-nav-item');
  const label = li.querySelector(':scope > p');
  const link = label?.querySelector(':scope > a');
  if (link) link.classList.add('main-nav-link');
  if (link && link.pathname === window.location.pathname) link.ariaCurrent = 'page';
  const menu = decorateMegaMenu(li) || decorateMenu(li);
  if (!menu || !label) return;

  menuId += 1;
  menu.id = `header-menu-${menuId}`;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.ariaExpanded = 'false';
  btn.setAttribute('aria-controls', menu.id);
  decorateSubPanel(menu, label, link, backText, btn);
  if (link) {
    // the label navigates; a separate disclosure button opens the menu
    btn.className = 'main-nav-toggle';
    btn.ariaLabel = link.textContent;
    btn.append(svgIcon('chevron-down'));
    label.append(btn);
    // in the drawer the whole row opens the sub-panel; its heading carries the link instead
    link.addEventListener('click', (e) => {
      if (!isDrawer(li)) return;
      e.preventDefault();
      toggleMenu(li);
    });
  } else {
    btn.className = 'main-nav-link';
    btn.append(label.textContent, svgIcon('chevron-down'));
    label.replaceChildren(btn);
  }
  menuTriggers.set(li, btn);

  btn.addEventListener('click', () => {
    toggleMenu(li);
  });
  // mouse hover also opens; the panel sits inside the item, so moving into it keeps it open
  li.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse' && !isDrawer(li)) openMenu(li);
  });
  li.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse' && !isDrawer(li) && li.classList.contains('is-open')) closeAllMenus();
  });
}

const SKIP_PATH = '/tools/widgets/skip';
const BACK_PATH = '/tools/widgets/back';
const BACK_FALLBACK = 'Main Menu';
const SKIP_FALLBACK = 'Skip to main content';

export function decorateSkipLink(header) {
  const main = document.querySelector('main');
  if (!main) return;
  if (!main.id) main.id = 'main';
  const authored = header.querySelector(`[href*="${SKIP_PATH}"]`);
  const skip = document.createElement('a');
  skip.className = 'skip-link a11y-clip';
  skip.href = `#${main.id}`;
  if (authored) {
    skip.textContent = authored.textContent;
    authored.parentElement.remove();
  } else {
    skip.textContent = SKIP_FALLBACK;
    skip.lang = 'en';
  }
  header.prepend(skip);
}

function decorateBrandSection(section) {
  section.classList.add('brand-section');
  const brandLink = section.querySelector('a');
  if (!brandLink) return;
  const [, text] = brandLink.childNodes;
  if (!text) return;
  const span = document.createElement('span');
  span.className = 'brand-text';
  span.append(text);
  brandLink.append(span);
}

export function decorateNavSection(section) {
  section.classList.add('main-nav-section');
  const navContent = section.querySelector('.default-content');
  const navList = section.querySelector('ul');
  if (!navList) return;
  navList.classList.add('main-nav-list');

  const nav = document.createElement('nav');
  nav.append(navList);
  if (section.dataset.label) nav.ariaLabel = section.dataset.label;
  navContent.append(nav);

  // drawer "back" label: authored as [Main Menu](/tools/widgets/back), English fallback
  const authoredBack = section.querySelector(`[href*="${BACK_PATH}"]`);
  const backText = document.createElement('span');
  backText.textContent = authoredBack?.textContent || BACK_FALLBACK;
  if (!authoredBack) backText.lang = 'en';
  authoredBack?.closest('p')?.remove();

  const mainNavItems = section.querySelectorAll('nav > ul > li');
  for (const navItem of mainNavItems) {
    decorateNavItem(navItem, backText.cloneNode(true));
  }
  nav.addEventListener('keydown', menuKeydown);
  nav.addEventListener('focusout', menuFocusout);
}

function decorateActionSection(section) {
  section.classList.add('actions-section');
}

export function decorateHeaderContent(header) {
  decorateSkipLink(header);
  const sections = header.querySelectorAll(':scope > .section, :scope > .header-content > .section');
  if (sections[0]) decorateBrandSection(sections[0]);
  if (sections[1]) decorateNavSection(sections[1]);
  if (sections[2]) decorateActionSection(sections[2]);
  // nav + actions share one container that fills the bar after the brand
  const main = document.createElement('div');
  main.className = 'header-main';
  sections[1]?.before(main);
  main.append(...[sections[1], sections[2]].filter(Boolean));

  for (const action of HEADER_ACTIONS) {
    decorateAction(header, action);
  }

  syncDrawerState(header);
  new ResizeObserver(() => syncDrawerState(header)).observe(header);
}

/**
 * loads and decorates the header
 * @param {Element} el The header element
 */
export default async function init(el) {
  const headerMeta = getMetadata('header-source');
  const path = headerMeta || HEADER_PATH;
  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    fragment.classList.add('header-content');
    el.append(fragment);
    decorateHeaderContent(el);
  } catch (e) {
    throw Error(e);
  }
}
