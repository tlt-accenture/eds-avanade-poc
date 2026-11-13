const isImage = (cell) => cell.querySelector('picture') && !cell.textContent.trim();

export default function init(el) {
  for (const row of el.querySelectorAll(':scope > div')) {
    row.className = 'contact-row';
    for (const cell of row.children) cell.className = isImage(cell) ? 'contact-image' : 'contact-text';
  }
}
