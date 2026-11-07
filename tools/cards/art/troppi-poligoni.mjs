// Too many polygons: the graphics card bursts into flames, spitting triangles everywhere,
// the fans spin red-hot and the board drips. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // smoke rolling up behind the fire
  p.ellipse(18, 6, 7, 4, 5), p.ellipse(30, 3, 8, 4, 5), p.ellipse(44, 5, 7, 4, 5)
  p.ellipse(16, 5, 4, 2, 13), p.ellipse(28, 2, 4, 2, 13)

  // flames: one column at a time, red outside, then orange, yellow and a white-hot base
  for (let x = 7; x <= 57; x++) {
    const h = Math.round(11 + 4 * Math.sin(x * 0.55) + 3 * Math.sin(x * 1.3 + 1) + 2 * Math.cos(x * 0.21) - (x < 11 || x > 53 ? 5 : 0))
    const base = 24
    p.vline(x, base - h, h, 8)
    p.vline(x, base - Math.round(h * 0.72), Math.round(h * 0.72), 9)
    p.vline(x, base - Math.round(h * 0.45), Math.round(h * 0.45), 10)
    if (x > 12 && x < 52) p.vline(x, base - Math.round(h * 0.18), Math.round(h * 0.18), 7)
  }
  // a few loose embers
  for (const [x, y, c] of [[9, 6, 9], [55, 7, 9], [24, 4, 10], [40, 3, 8], [50, 10, 10], [13, 11, 8]]) p.px(x, y, c)

  // flying triangles, lit edge top-left, some only wireframe
  const tri = (pts, c, d) => {
    p.poly(pts, c)
    p.line(...pts[0], ...pts[1], 7)
    if (d >= 0) p.line(...pts[1], ...pts[2], d), p.line(...pts[2], ...pts[0], d)
  }
  tri([[2, 9], [7, 4], [8, 11]], 12, 1)
  tri([[56, 2], [62, 4], [58, 9]], 11, 3)
  tri([[3, 20], [6, 15], [9, 21]], 14, 2)
  tri([[58, 14], [63, 12], [62, 19]], 13, 1)
  tri([[20, 1], [24, 0], [22, 4]], 12, 1)
  tri([[36, 8], [40, 6], [39, 11]], 11, 3)
  tri([[46, 1], [50, 0], [49, 3]], 14, 2)
  const wire = (pts, c) => { p.line(...pts[0], ...pts[1], c), p.line(...pts[1], ...pts[2], c), p.line(...pts[2], ...pts[0], c) }
  wire([[11, 1], [16, 2], [12, 6]], 12)
  wire([[54, 21], [61, 23], [56, 26]], 11)
  wire([[0, 27], [4, 24], [5, 30]], 13)

  // the card: dark shroud, lit top edge, outlined bottom
  p.rect(6, 23, 52, 16, 5)
  p.hline(6, 23, 52, 6), p.hline(7, 24, 50, 13)
  p.rect(6, 38, 52, 1, 0), p.vline(57, 23, 16, 0)
  p.rect(9, 36, 47, 2, 0)
  // stripes on the shroud
  p.line(30, 25, 34, 36, 9), p.line(31, 25, 35, 36, 9)
  // two fans spinning red-hot
  for (const cx of [19, 45]) {
    p.disc(cx, 30.5, 6, 0)
    p.disc(cx, 30.5, 5, 2)
    for (let a = 0; a < 6; a++) {
      const t = a * Math.PI / 3
      for (let r = 1.5; r < 5; r += 0.5) {
        const u = t + r * 0.3
        p.px(Math.round(cx + r * Math.cos(u)), Math.round(30.5 + r * Math.sin(u)), r < 3 ? 9 : 8)
      }
    }
    p.disc(cx, 30.5, 1.5, 10), p.px(cx, 30, 7)
    p.px(cx - 4, 26, 6), p.px(cx - 5, 27, 6) // rim catching the light
  }
  // bracket on the left with vents
  p.rect(2, 21, 4, 20, 6)
  p.vline(2, 21, 20, 7), p.vline(5, 22, 19, 5)
  for (let y = 25; y < 37; y += 3) p.hline(3, y, 2, 0)
  p.rect(1, 21, 2, 2, 6)
  // green board and gold contacts
  p.rect(9, 39, 46, 3, 3), p.hline(9, 39, 46, 11)
  for (let x = 12; x < 52; x += 2) p.vline(x, 42, 2, x < 30 ? 10 : 9)
  p.hline(9, 41, 46, 1)
  // molten drips off the bottom edge
  p.vline(46, 39, 5, 9), p.px(46, 44, 10), p.vline(50, 39, 3, 9), p.px(50, 42, 10)
  p.vline(22, 39, 3, 9), p.px(22, 42, 10)
  // ground shadow
  p.dither(8, 46, 50, 2, 1, -1)
}
