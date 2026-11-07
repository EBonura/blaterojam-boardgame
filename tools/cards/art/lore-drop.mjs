// A lore drop: an ancient tome open on the table, a glowing rune rising out of its pages,
// sparks drifting up, a candle burning low behind it. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // soft glow behind the rune and a cone of light rising from the pages
  p.poly([[27, 31], [37, 31], [42, 16], [22, 16]], 1)
  p.ellipse(32, 14, 13, 11, 1)
  p.ring(32, 14, 13, 11, 13)
  p.dither(19, 3, 27, 23, -1, 1)
  for (const [x, y, h] of [[29, 22, 3], [35, 21, 4], [31, 26, 3], [33, 24, 2], [27, 18, 2], [37, 17, 2]]) p.vline(x, y, h, 12)

  // table
  p.rect(0, 41, 64, 7, 4)
  p.hline(0, 41, 64, 9)
  p.hline(0, 42, 64, 2)
  p.rect(0, 46, 64, 2, 2)
  for (const [x, y, w] of [[4, 44, 7], [22, 45, 9], [44, 44, 6], [57, 45, 5]]) p.hline(x, y, w, 2)

  // a candle behind the book, burned low, wax dripping down
  p.rect(2, 20, 6, 14, 7)
  p.rect(6, 20, 2, 14, 6)
  p.hline(2, 20, 6, 6), p.px(3, 20, 7)
  p.vline(2, 21, 4, 6), p.px(4, 21, 6), p.vline(4, 22, 3, 7)
  p.vline(5, 18, 2, 0)
  p.rect(4, 13, 3, 5, 9), p.vline(5, 12, 6, 10), p.px(5, 11, 10), p.px(5, 17, 7)

  // the tome
  const b = layer()
  // cover (dark red leather) under the pages, gold corners
  b.poly([[4, 39], [32, 41], [60, 39], [60, 42], [32, 44], [4, 42]], 2)
  b.hline(4, 39, 2, 10), b.px(4, 40, 10), b.hline(59, 39, 2, 10), b.px(60, 40, 10)
  b.px(5, 42, 9), b.px(59, 42, 9)
  // page stacks
  b.poly([[6, 30], [31, 33], [31, 41], [6, 39]], 6)
  b.poly([[58, 30], [33, 33], [33, 41], [58, 39]], 6)
  for (const y of [38, 36]) b.line(6, y, 31, y + 2, 7), b.line(33, y + 2, 58, y, 7)
  // the open pages, curving down into the spine
  b.poly([[6, 28], [14, 26], [24, 27], [31, 31], [31, 37], [24, 33], [14, 32], [6, 34]], 15)
  b.poly([[58, 28], [50, 26], [40, 27], [33, 31], [33, 37], [40, 33], [50, 32], [58, 34]], 15)
  b.line(27, 30, 31, 33, 9), b.line(28, 32, 31, 36, 9), b.line(33, 33, 37, 30, 9), b.line(33, 36, 36, 32, 9)
  b.vline(32, 31, 9, 4)
  b.line(14, 26, 6, 28, 7), b.line(24, 27, 14, 26, 7)
  // lines of lore
  for (const [x0, y0, x1, y1] of [[9, 29, 23, 29], [9, 31, 25, 31], [9, 33, 18, 33], [41, 29, 54, 29], [40, 31, 55, 31], [44, 33, 55, 33]]) b.line(x0, y0, x1, y1, 4)
  b.rect(10, 28, 2, 2, 8) // an illuminated capital
  // ribbon bookmark hanging over the front
  b.vline(33, 37, 8, 8), b.vline(34, 38, 6, 2), b.px(33, 45, 8), b.px(34, 44, 8)
  b.outline(0)
  b.stamp(px)

  // the rune, glowing
  const r = layer()
  const strokes = [[32, 6, 32, 22], [32, 13, 26, 7], [32, 13, 38, 7], [32, 18, 27, 22], [32, 18, 37, 22]]
  for (const [x0, y0, x1, y1] of strokes) r.line(x0, y0, x1, y1, 12), r.line(x0 + 1, y0, x1 + 1, y1, 12)
  r.outline(13)
  for (const [x0, y0, x1, y1] of strokes.slice(0, 3)) r.line(x0, y0 + 1, x1, y1 + 1, 7)
  r.stamp(px)

  // sparks drifting up
  for (const [x, y, c] of [[22, 10, 10], [43, 6, 7], [40, 20, 10], [24, 19, 7], [19, 4, 12], [46, 13, 12], [27, 2, 7], [38, 2, 10]]) p.px(x, y, c)
  p.px(43, 5, 13), p.px(43, 7, 13), p.px(42, 6, 13), p.px(44, 6, 13)
}
