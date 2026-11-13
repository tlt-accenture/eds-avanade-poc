export default function init(el) {
  [...el.querySelectorAll(':scope > div')].forEach((row, i) => {
    const [title, body] = row.children;
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.open = i === 0;
    const summary = document.createElement('summary');
    summary.className = 'accordion-title';
    // unwrap a lone paragraph so the summary holds the title text, not a block
    const lone = title.children.length === 1 && title.querySelector(':scope > p');
    summary.append(...(lone || title).childNodes);
    body.className = 'accordion-body';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
