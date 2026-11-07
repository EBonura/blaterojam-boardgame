// Code autocomplete: a half-typed word and a suggestion popup with the top pick highlighted. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // editor
  rect(1, 1, 30, 22, 0)
  rect(1, 1, 3, 22, 1)
  for (const y of [3, 5, 7, 9, 11, 13, 15, 17, 19]) px(2, y, 5)
  rect(5, 3, 5, 1, 12), rect(11, 3, 8, 1, 6)
  rect(7, 5, 10, 1, 11)
  rect(7, 7, 4, 1, 7) // half-typed word
  rect(11, 6, 1, 3, 10) // cursor
  // suggestion popup
  rect(8, 9, 22, 14, 5)
  rect(9, 10, 20, 12, 6)
  const rows = [[10, 9, 12], [14, 8, 9], [18, 11, 6]]
  rows.forEach(([y, c, w], i) => {
    if (i === 0) rect(9, y, 20, 4, 12)
    rect(10, y + 1, 2, 2, c)
    rect(13, y + 1, w, 1, i === 0 ? 7 : 5)
    rect(13, y + 2, w - 4, 1, i === 0 ? 7 : 13)
  })
  rect(27, 14, 1, 7, 13) // scrollbar
  // sparkle on the top pick
  px(25, 11, 10), px(24, 12, 10), px(26, 12, 10), px(25, 13, 10), px(25, 12, 7)
}
