// Change of idea: the old design doc, crumpled, sails toward a bin already overflowing with
// earlier ideas (a few missed), while a brand new idea lights up. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // floor
  p.rect(0, 40, 64, 8, 1)
  p.hline(0, 40, 64, 13)
  p.dither(0, 44, 64, 4, 0, -1)

  // a crumpled paper ball, lit top-left
  const ball = (cx, cy, r = 3) => {
    p.disc(cx, cy, r, 6)
    p.disc(cx - 0.6, cy - 0.6, r - 0.8, 7)
    p.px(cx + 1, cy, 13), p.px(cx - 1, cy + 1, 6), p.px(cx, cy - 1, 6), p.px(cx + r - 1, cy + r - 2, 5)
  }

  // the bin: metal slats, tapered, dark shadow side
  p.poly([[5, 21], [27, 21], [24, 41], [8, 41]], 5)
  p.poly([[6, 22], [24, 22], [21, 40], [9, 40]], 6)
  for (const x of [10, 14, 18, 22]) p.line(x, 24, Math.round(x - (x - 16) * 0.15), 39, 5)
  p.line(6, 22, 9, 40, 7)
  p.poly([[22, 22], [26, 22], [23, 40], [20, 40]], 5)
  p.rect(4, 20, 24, 2, 7), p.hline(4, 21, 24, 6), p.px(27, 21, 5)
  // overflowing with earlier ideas
  ball(9, 17), ball(15, 16), ball(21, 17), ball(12, 12), ball(19, 11, 2.5), ball(25, 18, 2.5)
  // one sheet sticking out: a sketched level with a crossed-out idea
  p.poly([[5, 9], [11, 6], [14, 15], [8, 18]], 7)
  p.line(11, 6, 14, 15, 6)
  p.line(7, 11, 10, 9, 12), p.line(8, 13, 11, 12, 12)
  p.line(7, 10, 12, 15, 8), p.line(11, 9, 8, 15, 8)
  // missed shots on the floor
  ball(31, 41, 2.5), ball(2, 42, 2)
  p.hline(29, 44, 5, 0), p.hline(5, 44, 6, 0), p.hline(9, 42, 15, 0) // shadows

  // the old design doc, crumpled, mid-flight with its arc
  ball(30, 9, 3.5)
  for (const [x, y] of [[36, 6], [39, 5], [42, 5]]) p.px(x, y, 13)
  p.px(34, 7, 6)

  // the new idea: a lightbulb blazing
  // rays
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.95 + i * 0.14)
    const x0 = Math.round(50 + 12 * Math.cos(a)), y0 = Math.round(16 + 12 * Math.sin(a))
    const x1 = Math.round(50 + 15 * Math.cos(a)), y1 = Math.round(16 + 15 * Math.sin(a))
    p.line(x0, y0, x1, y1, i % 2 ? 9 : 10)
  }
  p.line(61, 9, 63, 8, 10), p.line(61, 23, 63, 24, 9)
  // glass
  p.disc(50, 15, 10, 4)
  p.disc(50, 15, 9, 10)
  p.poly([[44, 22], [56, 22], [54, 29], [46, 29]], 10)
  p.line(44, 22, 46, 29, 4), p.line(56, 22, 54, 29, 4)
  p.ellipse(53, 18, 5, 6, 9)
  p.ellipse(49, 14, 6, 6.5, 10)
  p.poly([[50, 23], [54, 22], [53, 28], [50, 28]], 9)
  p.ellipse(45.5, 10.5, 2, 3, 7), p.px(47, 7, 7), p.px(44, 14, 7) // shine
  // filament
  p.line(47, 25, 47, 18, 4), p.line(53, 25, 53, 18, 4)
  for (let x = 47; x <= 53; x++) p.px(x, 17 + (x % 2), 7)
  p.px(48, 16, 7), p.px(50, 16, 7), p.px(52, 16, 7)
  // screw base
  p.rect(45, 29, 10, 8, 6)
  for (let y = 30; y < 37; y += 2) p.hline(45, y, 10, 5)
  p.vline(45, 29, 8, 7), p.vline(54, 29, 8, 5)
  p.rect(47, 37, 6, 2, 5), p.rect(48, 39, 4, 1, 0)
  p.hline(42, 41, 16, 0) // shadow on the floor
}
