// A .rar file flattened under a hydraulic press, its gauge in the red. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]
const G = {
  '.': ['.', '.', '.', '.', '#'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
}
function text(p, str, x, y, c, s) {
  for (const ch of str) {
    const g = G[ch]
    g.forEach((row, j) => [...row].forEach((v, i) => v === '#' && p.rect(x + i * s, y + j * s, s, s, c)))
    x += (g[0].length + 1) * s
  }
}
export default function draw({ px }) {
  const p = pen(px)
  // workshop floor
  p.rect(0, 41, 64, 7, 1)
  p.hline(0, 41, 64, 5)
  p.dither(0, 44, 64, 4, 0)
  // press columns: lit left edges, shadowed right edges
  for (const x of [3, 54]) {
    p.rect(x, 7, 7, 34, 6)
    p.vline(x, 7, 34, 7), p.rect(x + 5, 7, 2, 34, 5), p.vline(x + 7, 7, 34, 0)
    for (let y = 12; y < 40; y += 6) p.hline(x + 1, y, 4, 5)
  }
  // crossbeam with bolts and a pressure gauge pinned in the red
  p.rect(1, 0, 62, 7, 6)
  p.hline(1, 0, 62, 7), p.hline(1, 5, 62, 5), p.hline(1, 6, 62, 0)
  for (const x of [5, 57]) p.rect(x, 2, 2, 2, 5), p.px(x, 2, 7)
  p.disc(46, 3, 3, 0), p.disc(46, 3, 2, 7), p.px(45, 2, 6)
  p.line(46, 3, 48, 4, 8), p.px(44, 4, 11), p.px(48, 2, 8)
  // hydraulic piston, shiny
  p.rect(25, 7, 14, 9, 6)
  p.vline(25, 7, 9, 5), p.rect(27, 7, 2, 9, 7), p.rect(36, 7, 3, 9, 5), p.vline(38, 7, 9, 0)
  p.hline(25, 11, 14, 5)
  // motion streaks beside the piston
  for (const [x, y] of [[21, 8], [21, 11], [42, 9], [42, 12]]) p.vline(x, y, 2, 13)
  // press plate with hazard stripes
  p.rect(10, 16, 44, 5, 10)
  for (let y = 16; y < 21; y++) for (let x = 10; x < 54; x++) if ((x + y) % 6 < 3) p.px(x, y, 0)
  p.hline(10, 16, 44, 7)
  p.hline(10, 21, 44, 4)
  // the flattened file, splayed out sideways past the columns
  p.rect(10, 22, 44, 12, 7)
  p.poly([[2, 26], [10, 22], [10, 33], [3, 32]], 7)
  p.poly([[61, 26], [53, 22], [53, 33], [60, 32]], 6)
  p.rect(10, 31, 44, 2, 6)
  p.hline(3, 33, 58, 13)
  p.line(2, 26, 9, 22, 6)
  // .RAR in red with a dark drop shadow
  text(p, '.RAR', 20, 23, 2, 2)
  text(p, '.RAR', 19, 22, 8, 2)
  // bed and base under the file
  p.rect(1, 34, 62, 5, 5)
  p.hline(1, 34, 62, 6), p.hline(1, 38, 62, 0), p.vline(62, 34, 5, 0)
  p.rect(4, 39, 8, 2, 5), p.rect(52, 39, 8, 2, 5), p.hline(4, 40, 8, 0), p.hline(52, 40, 8, 0)
  // bits squirting out of the sides
  for (const [x, y, c] of [[0, 23, 7], [1, 21, 6], [3, 19, 7], [62, 22, 6], [63, 24, 7], [60, 20, 7], [0, 29, 6], [63, 29, 7]]) p.px(x, y, c)
}
