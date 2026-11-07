// A bug crawling over a code editor. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // editor window
  rect(2, 2, 28, 20, 0)
  rect(2, 2, 28, 2, 5)
  px(3, 2, 8), px(5, 2, 9), px(7, 2, 11)
  // code lines
  const lines = [[4, 6, 6, 12], [11, 6, 8, 6], [6, 8, 10, 14], [6, 10, 5, 11], [12, 10, 9, 6], [6, 12, 7, 12], [4, 14, 4, 6], [4, 17, 9, 13], [14, 17, 6, 6], [6, 19, 11, 12]]
  for (const [x, y, w, c] of lines) rect(x, y, w, 1, c)
  // red squiggle under the broken line
  for (let x = 6; x < 16; x++) px(x, 15 + (x % 2), 8)
  // the bug: rounded red shell split down the middle, dark head, light legs
  const shell = [[20, 9, 4], [19, 10, 6], [18, 11, 8], [18, 12, 8], [18, 13, 8], [18, 14, 8], [19, 15, 6], [20, 16, 4]]
  for (const [x, y, w] of shell) rect(x, y, w, 1, 8)
  rect(21, 10, 1, 7, 2) // wing split
  px(19, 12, 2), px(24, 13, 2), px(20, 14, 2) // spots
  px(23, 10, 14), px(24, 11, 14) // shine
  rect(20, 7, 4, 2, 2) // head
  px(20, 7, 7), px(23, 7, 7) // eyes
  px(19, 6, 6), px(18, 5, 6), px(24, 6, 6), px(25, 5, 6) // antennae
  for (const y of [11, 13, 15]) px(17, y, 6), px(16, y + 1, 6), px(26, y, 6), px(27, y + 1, 6)
}
