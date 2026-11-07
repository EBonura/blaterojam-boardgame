// A graphics tablet on the desk, the artist's striped sleeve and hand drawing on it with the stylus:
// the stroke appears under the pen tip and, bigger, on the monitor behind, where a smiling sun is
// nearly finished. A cable runs from the tablet to the monitor. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

// The drawing, in monitor pixels: a sun whose outline is being finished.
const SUN = [
  [0, -4], [1, -4], [2, -3], [3, -2], [4, -1], [4, 0], [4, 1], [3, 2], [2, 3], [1, 4], [0, 4], [-1, 4], [-2, 3], [-3, 2], [-4, 1], [-4, 0], [-4, -1], [-3, -2],
]

export default function draw({ px }) {
  const p = pen(px)

  // the monitor behind
  p.rect(10, 1, 36, 23, 5)
  p.hline(10, 1, 36, 6), p.vline(10, 1, 23, 6)
  p.rect(12, 3, 32, 18, 7)
  p.rect(12, 3, 32, 2, 6)
  p.px(14, 4, 8), p.px(16, 4, 10), p.px(18, 4, 11)
  p.rect(12, 5, 4, 16, 6)
  for (const [y, c] of [[7, 0], [10, 12], [13, 8], [16, 11]]) p.rect(13, y, 2, 2, c)
  p.vline(26, 24, 3, 5), p.rect(21, 27, 11, 1, 5), p.hline(21, 26, 11, 6)
  p.hline(11, 24, 35, 0)
  // the drawing on screen: the sun, its last stroke still being drawn
  const cx = 30, cy = 12
  for (let i = 0; i < SUN.length; i++) p.rect(cx + SUN[i][0] * 2, cy + SUN[i][1] * 2, 2, 2, 9)
  for (const [x, y] of [[-3, 0], [0, -1], [-1, 1]]) p.rect(cx + x * 2 + 1, cy + y * 2 + 1, 1, 1, 10)
  p.rect(cx - 3, cy - 2, 6, 5, 10), p.rect(cx - 2, cy - 1, 1, 2, 0), p.rect(cx + 2, cy - 1, 1, 2, 0)
  p.hline(cx - 2, cy + 2, 5, 4)
  for (const [x0, y0, x1, y1] of [[cx, cy - 12, cx, cy - 10], [cx + 11, cy, cx + 13, cy], [cx - 13, cy, cx - 11, cy], [cx + 8, cy - 8, cx + 9, cy - 9], [cx - 8, cy - 8, cx - 9, cy - 9], [cx + 8, cy + 7, cx + 9, cy + 8]]) p.line(x0, y0, x1, y1, 9)
  // the brush cursor on screen, where the stroke is being drawn
  const [ex, ey] = SUN[SUN.length - 1]
  p.ring(cx + ex * 2 + 0.5, cy + ey * 2 + 0.5, 2, 2, 5)

  // cable from the tablet to the monitor
  p.line(5, 30, 5, 22, 0), p.line(6, 21, 9, 18, 0)

  // desk
  p.rect(0, 30, 64, 18, 4)
  p.hline(0, 30, 64, 9)
  for (const [x, y, w] of [[2, 34, 8], [48, 33, 10], [56, 42, 6], [1, 45, 9]]) p.hline(x, y, w, 2)

  // the tablet, lying flat
  const t = layer()
  t.poly([[3, 33], [49, 33], [53, 44], [0, 44]], 5)
  t.line(3, 33, 49, 33, 6)
  t.line(3, 33, 0, 44, 6)
  t.hline(0, 45, 54, 0)
  t.hline(1, 44, 52, 1)
  // express keys
  for (const y of [35, 38, 41]) t.hline(4 - Math.floor((y - 33) / 4), y, 3, 6)
  // active area
  t.poly([[10, 35], [46, 35], [48, 42], [8, 42]], 1)
  t.line(10, 35, 8, 42, 0), t.hline(10, 35, 37, 0)
  t.px(11, 36, 13), t.px(45, 36, 13), t.px(9, 41, 13), t.px(47, 41, 13)
  t.outline(0)
  t.stamp(px)
  // the stroke on the tablet, the same sun squashed by perspective, ending under the pen tip
  const tcx = 28, tcy = 38.5
  for (let i = 0; i < SUN.length; i++) {
    const x = tcx + SUN[i][0] * 1.6, y = tcy + SUN[i][1] * 0.75
    p.px(x, y, 12), p.px(x + 1, y, 12)
  }
  p.px(tcx - 1, tcy - 1, 12), p.px(tcx + 2, tcy - 1, 12), p.hline(tcx - 1, tcy + 1, 4, 12)
  // glint where the nib touches
  const nx = Math.round(tcx + SUN[SUN.length - 1][0] * 1.6), ny = Math.round(tcy + SUN[SUN.length - 1][1] * 0.75)

  // the artist's striped sleeve and hand, holding the stylus, coming in from the right
  const h = layer()
  h.poly([[33, 27], [64, 23], [64, 37], [35, 34]], 7)
  for (let y = 20; y < 42; y++) for (let x = 33; x < 64; x++) {
    if (h.grid[y][x] !== 7) continue
    const shade = h.grid[y + 2]?.[x] !== 7 && h.grid[y + 2]?.[x] !== 12
    if ((x + Math.floor(y / 3)) % 4 < 2) h.px(x, y, shade ? 13 : 12)
    else if (shade) h.px(x, y, 6)
  }
  // stylus: from the nib up and to the right, past the hand
  h.line(nx + 1, ny - 2, 45, 15, 6)
  h.line(nx + 1, ny - 1, 46, 15, 5)
  h.line(nx + 2, ny - 1, 46, 16, 0)
  h.line(nx + 6, ny - 6, nx + 9, ny - 9, 13)
  h.px(45, 14, 7), h.px(46, 14, 6)
  h.px(nx, ny, 6), h.px(nx + 1, ny - 1, 6)
  // hand
  h.ellipse(31, 30, 4.5, 3.5, 15)
  h.line(28, 33, 33, 33, 4), h.line(34, 32, 35, 30, 4)
  h.rect(25, 32, 3, 2, 15), h.px(27, 33, 4) // fingers on the pen
  h.px(29, 28, 7), h.px(30, 28, 7)
  h.outline(0)
  h.stamp(px)
  p.px(nx, ny, 7)
}
