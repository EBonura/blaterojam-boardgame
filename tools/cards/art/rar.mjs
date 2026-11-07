// A .rar file flattened under a hydraulic press. 32x24, PICO-8 palette indexes.
const GLYPHS = {
  '.': ['.', '.', '.', '.', '#'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
}
function text(px, str, x, y, c) {
  for (const ch of str) {
    const g = GLYPHS[ch]
    g.forEach((row, j) => [...row].forEach((v, i) => v === '#' && px(x + i, y + j, c)))
    x += g[0].length + 1
  }
}
export default function draw({ rect, px }) {
  // press frame
  rect(0, 0, 32, 3, 5), rect(0, 0, 32, 1, 6), rect(0, 2, 32, 1, 0)
  rect(0, 3, 3, 16, 5), rect(29, 3, 3, 16, 5)
  rect(0, 0, 1, 19, 6), rect(29, 3, 1, 16, 6)
  // piston and plate with hazard stripes
  rect(13, 3, 6, 5, 6), rect(13, 3, 2, 5, 7), rect(18, 3, 1, 5, 5)
  rect(5, 8, 22, 3, 10)
  for (let y = 8; y < 11; y++) for (let x = 5; x < 27; x++) if ((x + y) % 4 < 2) px(x, y, 0)
  rect(5, 11, 22, 1, 4)
  // the flattened file, splayed out sideways
  rect(4, 12, 24, 6, 7)
  rect(3, 13, 1, 4, 7), rect(28, 13, 1, 4, 7)
  rect(4, 18, 24, 1, 6), rect(3, 17, 1, 1, 6), rect(28, 17, 1, 1, 6)
  text(px, '.RAR', 10, 13, 8)
  // crumbs squeezed out
  for (const [x, y, c] of [[4, 11, 7], [27, 11, 6], [6, 10, 6], [26, 10, 7]]) px(x, y, c)
  // bed
  rect(0, 19, 32, 3, 5), rect(0, 19, 32, 1, 6)
  rect(2, 22, 28, 1, 1)
  // motion lines beside the piston
  px(11, 3, 7), px(11, 5, 7), px(20, 4, 7), px(20, 6, 7)
}
