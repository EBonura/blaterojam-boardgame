// A .zip file squeezed in a bench vice on a workbench: bulging, sweating, spilling data crumbs. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]
const G = {
  '.': ['.', '.', '.', '.', '#'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
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
  // pegboard wall behind the bench
  p.rect(0, 0, 64, 36, 1)
  for (let y = 3; y < 34; y += 4) for (let x = 1; x < 64; x += 4) p.px(x, y, 0)
  // workbench: lit top edge, wood grain, dark front
  p.rect(0, 36, 64, 5, 4)
  p.hline(0, 36, 64, 9)
  p.hline(3, 38, 14, 2), p.hline(36, 39, 20, 2), p.hline(22, 40, 9, 2)
  p.rect(0, 41, 64, 7, 2)
  p.hline(0, 41, 64, 0)
  for (const x of [15, 40]) p.vline(x, 42, 6, 0)
  // vice base with its cast shadow on the bench
  p.rect(8, 36, 50, 2, 2)
  p.rect(5, 31, 51, 5, 5)
  p.hline(5, 31, 51, 6), p.vline(5, 31, 5, 6), p.hline(5, 35, 51, 0), p.vline(55, 31, 5, 0)
  for (const x of [9, 50]) p.rect(x, 33, 2, 1, 0), p.px(x, 32, 6)
  // fixed jaw on the left
  p.rect(2, 9, 12, 22, 6)
  p.hline(2, 9, 12, 7), p.vline(2, 9, 22, 7)
  p.vline(13, 10, 21, 5), p.hline(3, 30, 11, 5)
  p.rect(5, 13, 2, 2, 5), p.px(5, 13, 7), p.rect(5, 24, 2, 2, 5), p.px(5, 24, 7)
  // moving jaw on the right, a step darker, with the screw and T handle
  p.rect(47, 9, 10, 22, 6)
  p.hline(47, 9, 10, 7)
  p.rect(55, 10, 2, 21, 5), p.vline(57, 9, 22, 0), p.hline(47, 30, 10, 5)
  p.rect(51, 13, 2, 2, 5), p.px(51, 13, 7), p.rect(51, 24, 2, 2, 5), p.px(51, 24, 7)
  p.rect(58, 18, 3, 3, 6), p.hline(58, 18, 3, 7), p.hline(58, 20, 3, 5)
  p.rect(60, 7, 2, 26, 6), p.vline(61, 7, 26, 5)
  p.rect(59, 5, 4, 3, 6), p.px(59, 5, 7), p.hline(59, 7, 4, 5)
  p.rect(59, 32, 4, 3, 6), p.px(59, 32, 7), p.hline(59, 34, 4, 5)
  // serrated jaw plates
  p.rect(14, 10, 2, 20, 5), p.rect(45, 10, 2, 20, 5)
  for (let y = 10; y < 30; y += 2) p.px(14, y, 6), p.px(46, y, 6)
  // the squeezed file: pinched by the jaws, bulging up, a folded corner on the top right
  const top = (x) => 11 - Math.round(8 * Math.sin((Math.PI * (x - 16)) / 28))
  for (let x = 16; x <= 44; x++) {
    let t = top(x)
    if (x >= 37) t += Math.max(0, x - 36 - (top(36) - top(x)))
    for (let y = t; y <= 30; y++) p.px(x, y, x >= 43 || y >= 29 ? 6 : 7)
  }
  for (let x = 16; x <= 44; x++) p.px(x, 30, 13)
  for (let y = 9; y < 30; y++) p.px(44, y, 13)
  // folded corner
  p.poly([[37, top(37)], [37, 9], [41, 9]], 6)
  p.line(37, top(37), 41, 9, 13)
  // creases where the jaws bite
  for (const [x, y] of [[16, 13], [17, 14], [16, 20], [17, 21], [16, 26], [43, 14], [42, 15], [43, 22], [42, 23]]) p.px(x, y, 6)
  // zipper down from the top of the bulge, with its pull tab
  for (let y = top(29); y < 14; y++) p.px(29, y, y % 2 ? 5 : 6), p.px(30, y, y % 2 ? 6 : 5)
  p.rect(28, 13, 4, 4, 6), p.hline(28, 13, 4, 7), p.px(29, 15, 5), p.px(30, 15, 5), p.hline(28, 17, 4, 5)
  // .ZIP in red with a dark drop shadow
  text(p, '.ZIP', 18, 19, 2, 2)
  text(p, '.ZIP', 17, 18, 8, 2)
  // strain: sweat drops and red stress marks
  for (const [x, y] of [[19, 3], [41, 2]]) p.sprite(x, y, ['.c.', 'cc7', 'ccc', '.1.'], { c: 12 })
  for (const [x0, y0, x1, y1] of [[23, 0, 24, 2], [36, 0, 35, 2], [29, 0, 30, 0]]) p.line(x0, y0, x1, y1, 8)
  // data crumbs squeezed out onto the bench
  for (const [x, y, c] of [[20, 33, 7], [24, 34, 6], [33, 32, 7], [38, 34, 6], [41, 33, 7], [27, 33, 6]]) p.px(x, y, c)
}
