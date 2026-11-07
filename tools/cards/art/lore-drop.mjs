// A lore drop: an ancient open tome with a glowing rune rising out of it. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // light rising from the pages
  for (let y = 2; y < 15; y++) if (y % 2 === 0) px(11, y, 13), px(20, y, 13)
  for (let y = 1; y < 15; y++) if (y % 2 === 1) px(9, y + 2, 1), px(22, y + 2, 1)
  // the rune (algiz), two pixels thick, with a white core
  rect(15, 4, 2, 9, 12)
  for (let i = 0; i < 4; i++) rect(14 - i, 7 - i, 1, 2, 12), rect(17 + i, 7 - i, 1, 2, 12)
  rect(15, 5, 1, 7, 7)
  px(14, 7, 7), px(13, 6, 7), px(17, 7, 7), px(18, 6, 7)
  // sparkles
  for (const [x, y, c] of [[8, 4, 7], [24, 6, 10], [6, 10, 10], [26, 11, 7], [13, 1, 10], [19, 13, 7]]) px(x, y, c)
  px(24, 5, 9), px(24, 7, 9), px(23, 6, 9), px(25, 6, 9)
  // the tome: cover, page stack, two curved pages
  rect(2, 20, 28, 2, 2)
  rect(3, 22, 26, 1, 4)
  rect(3, 19, 26, 1, 7)
  rect(4, 15, 12, 4, 15), rect(6, 14, 9, 1, 15)
  rect(16, 15, 12, 4, 15), rect(17, 14, 9, 1, 15)
  rect(15, 14, 2, 5, 9) // gutter shadow
  rect(15, 18, 2, 1, 4)
  // faded lore lines
  for (const y of [16, 18]) rect(6, y, 7, 1, 4), rect(18, y, 7, 1, 4)
  rect(6, 14, 1, 1, 9), rect(25, 14, 1, 1, 9)
  px(4, 15, 9), px(27, 15, 9)
}
