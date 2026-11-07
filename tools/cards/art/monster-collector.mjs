// Monster Collector: a wild encounter in a sunny forest clearing. A round lavender critter with leaf-sprout ears pops
// out of the tall grass ("!"), and a glass capture orb full of stars comes arcing in from the right.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // forest backdrop: pale sky gap, layered tree crowns, light shafts
  p.rect(0, 0, 64, 48, 3)
  p.rect(14, 0, 36, 14, 12)
  p.hline(14, 13, 36, 6)
  p.hline(22, 4, 8, 7), p.hline(24, 3, 4, 7), p.hline(21, 5, 10, 6)
  const crown = (cx, cy, r, base, lit) => {
    p.disc(cx, cy, r, base)
    p.disc(cx - 1, cy - 1, r - 2, lit === 11 ? 3 : base)
    for (let i = 0; i < r; i += 2) p.px(cx - r + 2 + i, cy - r + 1 + (i % 4 ? 1 : 0), lit)
  }
  crown(4, 6, 9, 1, 3)
  crown(60, 5, 10, 1, 3)
  crown(14, 12, 7, 3, 11)
  crown(50, 12, 8, 3, 11)
  crown(31, 15, 5, 3, 11)
  p.rect(9, 14, 2, 10, 4), p.vline(10, 14, 10, 2)
  p.rect(54, 16, 2, 9, 4), p.vline(55, 16, 9, 2)
  // clearing: sunlit grass
  p.rect(0, 22, 64, 26, 11)
  p.hline(0, 22, 64, 3)
  p.dither(0, 23, 64, 2, 3, 11)
  for (const [x, y] of [[6, 30], [44, 27], [56, 33], [20, 28], [35, 30]]) p.sprite(x, y, ['3.3', '.3.'])
  for (const [x, y, c] of [[3, 27, 10], [48, 30, 14], [60, 28, 7], [26, 26, 7]]) p.px(x, y, c), p.px(x, y + 1, 3)

  // critter shadow
  p.ellipse(22, 40, 11, 2, 3)

  // the critter: round lavender body, cream belly, leaf ears, big shiny eyes
  const c = layer()
  c.ellipse(13, 19, 11, 10, 13)
  // shading: right and bottom side darker, top-left highlight
  for (let y = 0; y < 34; y++) for (let x = 0; x < 30; x++) {
    if (c.grid[y]?.[x] !== 13) continue
    const u = (x - 13) / 11.5, v = (y - 19) / 10.5
    const k = u * 0.7 + v * 0.7
    if (k > 0.88) c.px(x, y, 5)
    else if (k < -0.9) c.px(x, y, 6)
  }
  c.ellipse(13, 23, 6, 5, 15)
  c.hline(10, 28, 7, 4)
  // leaf ears on little stalks
  c.sprite(1, 2, ['bb....', 'bbbb..', '.bbbb.', '..bb3.', '....3.'], { b: 11 })
  c.sprite(19, 2, ['....bb', '..bbb3', '.bbb3.', '.33...', '.3....'], { b: 11 })
  c.px(1, 2, 7), c.px(2, 3, 7), c.px(23, 2, 7)
  // eyes
  for (const ex of [8, 16]) {
    c.rect(ex, 14, 3, 4, 0)
    c.px(ex, 14, 7), c.px(ex + 1, 14, 7), c.px(ex, 15, 7)
    c.px(ex + 2, 17, 12)
  }
  c.rect(5, 19, 2, 1, 14), c.rect(20, 19, 2, 1, 14)
  // smile with a tiny fang
  c.hline(12, 19, 3, 0), c.px(11, 18, 0), c.px(15, 18, 0), c.px(14, 20, 7)
  // stubby feet
  c.rect(6, 28, 4, 2, 13), c.rect(17, 28, 4, 2, 13), c.hline(7, 29, 3, 5), c.hline(18, 29, 3, 5)
  // highlight glints on the lit top-left of the body
  c.px(6, 12, 7), c.px(7, 11, 7), c.px(5, 13, 6), c.px(8, 10, 6)
  c.outline(1)
  c.stamp(px, 9, 11)

  // tall grass in front, rustling
  for (const [x, h] of [[3, 9], [6, 12], [9, 6], [34, 6], [37, 10], [40, 7], [1, 7]]) {
    p.line(x, 47, x - 1, 47 - h, 3)
    p.line(x + 1, 47, x + 1, 48 - h, 11)
  }
  p.px(38, 34, 11), p.px(40, 33, 11), p.px(2, 36, 11)

  // "!" encounter bubble
  p.sprite(32, 5, ['.777.', '77877', '77877', '77877', '77777', '77877', '.777.'])
  p.hline(33, 12, 3, 6)

  // the capture orb flying in: glass sphere with stars inside, gold ring, motion arc
  for (const [x, y] of [[62, 20], [60, 18], [58, 17], [56, 17]]) p.px(x, y, 7)
  const o = layer()
  o.disc(6, 6, 6, 12)
  o.ellipse(7, 7, 5, 5, 13)
  o.ellipse(5, 5, 4, 4, 12)
  o.hline(0, 6, 13, 10), o.hline(1, 7, 11, 9)
  o.px(0, 6, 9), o.px(12, 6, 4)
  o.sprite(5, 2, ['.a.', 'a7a', '.a.'], { a: 10 })
  o.px(9, 9, 10), o.px(4, 9, 7), o.px(8, 4, 7)
  o.rect(2, 2, 2, 1, 7), o.px(2, 3, 7)
  o.outline(1)
  o.stamp(px, 44, 17)
  // sparkles around the orb
  for (const [x, y] of [[42, 16], [59, 27], [55, 14]]) p.sprite(x - 1, y - 1, ['.7.', '7a7', '.7.'], { a: 10 })
}
