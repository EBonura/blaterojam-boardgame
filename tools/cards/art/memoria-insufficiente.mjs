// Out of memory: the usage bar is so full it bursts out of its frame, while the RAM stick below
// sweats, steams and pops a chip. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // memory bar: grey frame, red fill pushing through the cracked right end
  p.rect(2, 3, 52, 13, 0)
  p.rect(2, 3, 51, 12, 6)
  p.hline(2, 3, 51, 7), p.vline(2, 3, 12, 7)
  p.rect(4, 5, 47, 8, 0)
  p.rect(4, 5, 50, 8, 8)
  p.hline(4, 5, 50, 14), p.px(5, 6, 7), p.px(6, 6, 7)
  p.rect(4, 11, 50, 2, 2)
  for (let x = 9; x < 50; x += 7) p.line(x, 6, x - 2, 10, 14) // stripes
  // the end of the frame broken off and flying
  p.rect(51, 3, 4, 13, -1)
  p.poly([[52, 1], [57, 2], [56, 5], [53, 4]], 6), p.line(52, 1, 57, 2, 7)
  p.poly([[56, 15], [60, 17], [58, 20], [55, 18]], 6), p.line(58, 20, 60, 17, 5)
  // red spill gushing out
  p.poly([[51, 5], [56, 4], [60, 6], [63, 5], [62, 9], [64, 12], [59, 12], [56, 14], [51, 12]], 8)
  p.line(56, 4, 60, 6, 14), p.line(60, 6, 63, 5, 14)
  p.poly([[54, 11], [59, 12], [56, 14]], 2)
  p.px(62, 2, 8), p.px(60, 1, 14), p.px(63, 14, 8), p.px(58, 15, 2)
  // crack across the bar frame
  p.line(36, 3, 38, 6, 0), p.line(38, 6, 37, 8, 0)
  // a warning sign hung on the bar
  p.poly([[8, 20], [13, 12], [18, 20]], 10)
  p.line(8, 20, 13, 12, 7), p.line(13, 12, 18, 20, 9), p.hline(8, 20, 11, 4)
  p.vline(13, 15, 3, 0), p.px(13, 19, 0)

  // the RAM stick: green board lit along the top, black chips, gold contacts
  p.rect(4, 25, 56, 15, 3)
  p.hline(4, 25, 56, 11), p.vline(4, 25, 15, 11)
  p.vline(59, 26, 14, 1), p.hline(5, 39, 55, 1)
  p.rect(25, 39, 2, 2, -1) // notch
  for (const x of [8, 20, 32, 44]) {
    const popped = x === 32
    const y = popped ? 19 : 28
    if (popped) p.rect(x, 28, 9, 7, 1), p.px(x + 2, 29, 10), p.px(x + 6, 29, 10)
    p.rect(x, y, 9, 7, 0)
    p.hline(x, y, 9, 5), p.vline(x, y, 7, 5)
    p.px(x + 1, y + 1, 6)
    for (let i = 1; i < 9; i += 2) p.px(x + i, y + 7, 6), p.px(x + i, y - 1, 6)
  }
  // the popped chip tilts up with spring lines
  p.vline(31, 21, 3, 7), p.vline(42, 21, 3, 7), p.vline(30, 24, 2, 6), p.vline(43, 24, 2, 6)
  p.px(33, 17, 7), p.px(40, 16, 7)
  // gold contacts
  for (let x = 6; x < 58; x += 2) if (x < 24 || x > 27) p.vline(x, 41, 3, x % 4 ? 10 : 9)
  p.rect(5, 40, 54, 1, 3)
  // sweat and steam
  p.px(18, 27, 12), p.px(18, 28, 12), p.px(30, 31, 12), p.px(55, 28, 12), p.px(55, 29, 12), p.px(54, 30, 7)
  for (const [x, y] of [[12, 22], [24, 21], [50, 21]]) {
    p.px(x, y, 6), p.px(x + 1, y - 1, 6), p.px(x, y - 2, 13)
  }
}
