const isImage = (cell) => cell.querySelector('picture') && !cell.textContent.trim();

export default function init(el) {
  for (const row of [...el.querySelectorAll(':scope > div')]) {
    row.classList.add('columns-image-text-row');
    const cells = [...row.children];
    cells.forEach((cell) => cell.classList.add(isImage(cell) ? 'columns-image-text-image' : 'columns-image-text-text'));
    if (isImage(cells[0])) row.classList.add('image-start');
    else if (cells.length > 1 && isImage(cells.at(-1))) row.classList.add('image-end');
  }
}
