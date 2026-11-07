// An energy drink can fizzing over, a lightning bolt on the label, drops of condensation, a puddle
// on the desk and the crushed empty from the last one lying beside it. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // desk
  p.rect(0, 40, 64, 8, 4)
  p.hline(0, 40, 64, 9)
  p.hline(0, 41, 64, 2)
  for (const [x, y, w] of [[3, 44, 9], [40, 45, 12], [20, 46, 7]]) p.hline(x, y, w, 2)
  // green puddle of fizz on the desk
  p.ellipse(31, 42, 15, 2, 3)
  p.ellipse(28, 42, 9, 1, 11)

  // the can
  const c = layer()
  c.rect(20, 12, 22, 29, 8)
  // cylinder shading: bright band left of centre, dark on the right
  c.rect(20, 12, 2, 29, 2)
  c.rect(23, 12, 3, 29, 14)
  c.vline(24, 12, 29, 7)
  c.rect(35, 12, 4, 29, 2)
  c.rect(39, 12, 3, 29, 0)
  c.vline(39, 12, 29, 2)
  // metal top and bottom rims
  c.rect(20, 10, 22, 2, 6), c.hline(21, 9, 20, 6)
  c.hline(20, 10, 4, 7), c.rect(37, 9, 5, 3, 5)
  c.rect(21, 40, 20, 1, 6), c.hline(35, 40, 6, 5)
  c.hline(21, 39, 20, 5)
  // the bolt on the label
  c.poly([[32, 14], [26, 26], [30, 26], [27, 37], [36, 22], [31, 22], [35, 14]], 10)
  c.line(32, 14, 26, 26, 7), c.line(30, 27, 27, 36, 9)
  c.line(35, 15, 32, 21, 9)
  // condensation drops
  for (const [x, y] of [[22, 30], [37, 17], [36, 33], [23, 18]]) c.px(x, y, 7), c.px(x, y + 1, 6)
  c.outline(0)
  c.stamp(px)

  // fizz foaming over the top and down the side
  p.ellipse(31, 8, 9, 3, 7)
  p.ellipse(28, 6, 5, 3, 7)
  p.ellipse(35, 6, 4, 2, 7)
  p.ellipse(33, 9, 7, 1.5, 6)
  for (const [x, y] of [[24, 6], [27, 4], [31, 5], [36, 4], [38, 7]]) p.px(x, y, 6)
  p.rect(39, 9, 2, 5, 7), p.vline(40, 11, 6, 6), p.px(40, 17, 11)
  p.vline(21, 10, 3, 7), p.px(21, 13, 11)
  for (const [x, y, k] of [[22, 1, 11], [30, 0, 7], [40, 2, 11], [44, 6, 7], [18, 4, 7], [35, 1, 11], [26, 1, 7]]) p.px(x, y, k)
  // energy sparkles
  const spark = (x, y) => p.sprite(x - 2, y - 2, ['..a..', '..a..', 'aa9aa', '..a..', '..a..'], { a: 10 })
  spark(12, 16), spark(51, 12), spark(9, 31), spark(53, 27)

  // the crushed empty from the previous round
  const e = layer()
  e.poly([[45, 36], [56, 33], [58, 38], [47, 40]], 8)
  e.line(45, 36, 56, 33, 14)
  e.poly([[50, 35], [52, 34], [53, 39], [51, 39]], 2)
  e.poly([[56, 33], [59, 32], [61, 37], [58, 38]], 6)
  e.line(59, 32, 61, 37, 5)
  e.px(44, 37, 6), e.px(44, 38, 6)
  e.outline(0)
  e.stamp(px)
}
