// Taglio di scope: a long feature list with checkboxes, cut across by a pair of scissors; the bottom part,
// full of features nobody will make, drops away. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)
  // dark desk with a lighter edge
  p.rect(0, 0, 64, 48, 1)
  for (let y = 0; y < 48; y += 4) p.hline(0, y, 64, 0)
  // the kept top of the list
  const sheet = (x, y, w, h, rows, ticks) => {
    p.rect(x + 1, y + 1, w, h, 0)
    p.rect(x, y, w, h, 7)
    p.vline(x + w - 1, y, h, 6)
    rows.forEach((lw, k) => {
      const ry = y + 3 + k * 4
      p.rect(x + 2, ry, 3, 3, 6), p.rect(x + 3, ry + 1, 1, 1, 7)
      if (ticks[k]) p.px(x + 2, ry + 1, 3), p.px(x + 3, ry + 2, 3), p.px(x + 4, ry, 3), p.px(x + 4, ry + 1, 11)
      p.hline(x + 7, ry + 1, lw, ticks[k] ? 5 : 13)
    })
  }
  sheet(10, 2, 24, 22, [12, 15, 10, 14, 9], [1, 1, 0, 0, 0])
  // zigzag cut edge on the kept part
  for (let x = 10; x < 34; x++) p.px(x, 23 + (x % 2), 1)
  // the cut-off part, tilted and dropping
  const drop = layer()
  drop.poly([[12, 30], [35, 27], [38, 46], [15, 49]], 7)
  for (let k = 0; k < 4; k++) {
    const y0 = 33 + k * 4, x0 = 16 + Math.round(k * 0.5)
    drop.rect(x0, y0 - Math.round((x0 - 12) * 0.13), 3, 3, 6)
    drop.line(x0 + 5, y0 + 1 - Math.round((x0 - 12) * 0.13), x0 + 17, y0 - 1 - Math.round((x0 - 12) * 0.13), 13)
  }
  drop.outline(0)
  drop.stamp(px)
  // falling motion lines
  for (const [x, y] of [[40, 31], [42, 35], [40, 39]]) p.hline(x, y, 4, 5)
  // the scissors, open, cutting across from the right
  const s = layer()
  // blades
  s.poly([[24, 25], [52, 18], [53, 20], [27, 27]], 6)
  s.poly([[24, 25], [52, 31], [51, 33], [27, 26]], 6)
  s.line(26, 25, 51, 19, 7), s.line(26, 26, 50, 32, 5)
  // pivot screw
  s.disc(40, 25, 2, 5), s.px(40, 25, 7)
  // handles
  s.ring(56, 14, 5, 4, 8), s.ring(56, 14, 4, 3, 8)
  s.ring(55, 37, 5, 4, 8), s.ring(55, 37, 4, 3, 8)
  s.line(48, 21, 52, 17, 8), s.line(49, 21, 53, 18, 8)
  s.line(47, 29, 51, 34, 8), s.line(48, 29, 52, 34, 8)
  s.outline(0)
  s.stamp(px)
  p.px(54, 12, 14), p.px(53, 35, 14)
}
