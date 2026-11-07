// Merge conflict: two git branches split from one commit and smash back together in a burst
// that sprays conflict markers (<<< === >>>) and scraps of code. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // faint graph grid
  for (let y = 4; y < 48; y += 8) for (let x = 0; x < 64; x += 2) p.px(x, y, 1)

  // branch lines, two pixels thick with a darker underside
  const path = (pts, c, d) => {
    for (let i = 0; i + 1 < pts.length; i++) {
      p.line(...pts[i], ...pts[i + 1], c)
      p.line(pts[i][0], pts[i][1] + 1, pts[i + 1][0], pts[i + 1][1] + 1, d)
    }
  }
  path([[6, 24], [12, 12], [22, 8], [32, 10], [40, 20]], 12, 1)
  path([[6, 24], [12, 36], [22, 40], [32, 38], [40, 28]], 9, 4)
  path([[0, 24], [6, 24]], 6, 5)

  // commit nodes: dark rim, coloured ring, light centre
  const node = (x, y, c, d) => {
    p.disc(x, y, 3.5, 0)
    p.disc(x, y, 3, c)
    p.disc(x, y, 1.5, 7)
    p.px(x - 2, y - 2, 7), p.px(x + 2, y + 2, d), p.px(x + 1, y + 2, d), p.px(x + 2, y + 1, d)
  }
  node(6, 24, 6, 5)
  node(12, 12, 12, 1), node(22, 8, 12, 1), node(32, 10, 12, 1)
  node(12, 36, 9, 4), node(22, 40, 9, 4), node(32, 38, 9, 4)

  // the collision burst
  const star = (cx, cy, r0, r1, n, c) => {
    const pts = []
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 + 0.2
      const r = i % 2 ? r0 : r1
      pts.push([Math.round(cx + r * Math.cos(a)), Math.round(cy + r * 0.9 * Math.sin(a))])
    }
    p.poly(pts, c)
  }
  star(45, 24, 9, 17, 9, 8)
  star(45, 24, 7, 12, 9, 9)
  star(45, 24, 4, 8, 8, 10)
  p.disc(45, 24, 3, 7)

  // conflict markers flying out: <<< in blue, >>> in orange, === in white
  const lt = (x, y, c) => { p.px(x + 2, y, c), p.px(x + 1, y + 1, c), p.px(x, y + 2, c), p.px(x + 1, y + 3, c), p.px(x + 2, y + 4, c) }
  const gt = (x, y, c) => { p.px(x, y, c), p.px(x + 1, y + 1, c), p.px(x + 2, y + 2, c), p.px(x + 1, y + 3, c), p.px(x, y + 4, c) }
  for (let i = 0; i < 3; i++) lt(46 + i * 3, 1, 12)
  for (let i = 0; i < 3; i++) gt(48 + i * 3, 42, 9)
  p.hline(56, 16, 7, 7), p.hline(56, 18, 7, 7)
  // scraps of code flung out
  p.hline(57, 8, 5, 11), p.hline(58, 30, 5, 14), p.hline(56, 33, 3, 12), p.hline(26, 23, 4, 11), p.hline(28, 26, 3, 14)
  p.px(36, 5, 10), p.px(60, 25, 10), p.px(38, 44, 10), p.px(31, 30, 9)
}
