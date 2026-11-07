// A .zip file squeezed in a bench vice, bulging and sweating. 32x24, PICO-8 palette indexes.
const GLYPHS = {
  '.': ['.', '.', '.', '.', '#'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
}
function text(px, str, x, y, c) {
  for (const ch of str) {
    const g = GLYPHS[ch]
    g.forEach((row, j) => [...row].forEach((v, i) => v === '#' && px(x + i, y + j, c)))
    x += g[0].length + 1
  }
}
export default function draw({ rect, px }) {
  // bench and vice base
  rect(0, 19, 32, 3, 5)
  rect(0, 19, 32, 1, 6)
  rect(2, 22, 28, 1, 1)
  // screw and T handle
  rect(28, 12, 2, 2, 6), rect(28, 13, 2, 1, 5)
  rect(30, 6, 2, 13, 6), rect(31, 6, 1, 13, 13)
  px(30, 5, 7), px(30, 19, 13)
  // jaws: heavy dark blocks with bright faces
  rect(1, 6, 6, 13, 5), rect(1, 6, 6, 1, 6), rect(1, 6, 1, 13, 6)
  rect(6, 7, 1, 12, 13)
  rect(23, 6, 5, 13, 5), rect(23, 6, 5, 1, 6)
  rect(23, 7, 1, 12, 13)
  for (const y of [8, 10, 12, 14, 16]) px(6, y, 6), px(23, y, 6) // serrated faces
  // the squeezed file, pinched at the sides and bulging up and down
  rect(7, 6, 16, 13, 7)
  rect(9, 4, 12, 2, 7), rect(11, 3, 8, 1, 7)
  rect(9, 19, 12, 1, 7)
  rect(20, 6, 3, 13, 6), rect(18, 4, 3, 2, 6), rect(18, 19, 3, 1, 6) // shade
  rect(17, 3, 2, 2, 13), px(18, 3, 0) // folded corner
  // zipper down the top of the file
  for (let y = 3; y < 9; y++) px(y % 2 ? 14 : 15, y, 5)
  rect(14, 9, 2, 1, 6)
  text(px, '.ZIP', 9, 11, 8)
  // strain: sweat drops and stress marks
  px(8, 2, 12), px(7, 3, 12)
  px(22, 2, 12), px(23, 3, 12)
  for (const [x, y] of [[12, 0], [12, 1], [18, 0], [18, 1]]) px(x, y, 8)
}
