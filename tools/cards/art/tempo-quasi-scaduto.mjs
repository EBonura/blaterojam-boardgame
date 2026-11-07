// Time almost up: a wooden hourglass down to its last grains, sweating bullets, against a red
// alarm glow. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // alarm rays behind
  for (let i = 0; i < 16; i++) {
    if (i % 2) continue
    const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 1) / 16) * Math.PI * 2
    p.poly([[32, 24], [Math.round(32 + 50 * Math.cos(a0)), Math.round(24 + 50 * Math.sin(a0))], [Math.round(32 + 50 * Math.cos(a1)), Math.round(24 + 50 * Math.sin(a1))]], 2)
  }
  p.disc(32, 24, 14, 1)

  // glass bulbs: two round bulbs meeting at a narrow neck on row 24
  const half = (y) => {
    const c = y < 24 ? 15 : 33
    const u = (y - c) / 9.5
    return Math.max(1, Math.round(11 * Math.sqrt(Math.max(0, 1 - u * u))))
  }
  for (let y = 7; y <= 41; y++) {
    const w = half(y)
    p.hline(32 - w, y, 2 * w + 1, 1)
  }
  for (let y = 7; y <= 41; y++) { // rims, so the edge stays connected where the width jumps
    const w = half(y), wn = half(Math.min(41, y + 1))
    for (let x = Math.min(w, wn); x <= Math.max(w, wn); x++) p.px(32 - x - 1, y, 6), p.px(32 + x + 1, y, 5)
    p.px(32 - w - 1, y, 6), p.px(32 + w + 1, y, 5)
  }
  // the last sand in the top bulb
  for (let y = 19; y <= 23; y++) { const w = Math.min(half(y), y - 18); p.hline(32 - w, y, 2 * w + 1, y === 19 ? 10 : 9) }
  // the falling stream
  p.vline(32, 24, 11, 10), p.px(32, 28, 7)
  // the full pile below
  for (let y = 35; y <= 41; y++) {
    const w = Math.min(half(y), Math.round((y - 34) * 2.2))
    p.hline(32 - w, y, 2 * w + 1, 9)
    p.hline(32 - w, y, Math.max(1, w - 1), 10)
    p.px(32 + w, y, 4)
  }
  p.px(32, 35, 10), p.px(31, 36, 7)
  // glass shine on the left of each bulb
  p.vline(25, 10, 5, 7), p.px(26, 9, 7), p.vline(25, 30, 3, 7), p.px(26, 29, 7)
  p.px(38, 12, 13), p.px(39, 13, 13)

  // wooden caps and posts, lit top-left
  const cap = (y) => {
    p.rect(17, y, 30, 4, 4)
    p.hline(17, y, 30, 9), p.vline(17, y, 4, 9)
    p.hline(18, y + 3, 29, 2), p.vline(46, y + 1, 3, 2)
    p.rect(16, y + 1, 1, 2, 0), p.rect(47, y + 1, 1, 2, 0)
  }
  cap(3), cap(42)
  for (const x of [18, 44]) {
    p.rect(x, 7, 2, 35, 4)
    p.vline(x, 7, 35, 9)
    p.vline(x + 2, 7, 35, 2)
  }
  p.px(19, 22, 9), p.px(45, 25, 2) // knots

  // sweat flying off
  const drop = (x, y, flip) => {
    p.sprite(x, y, ['.c.', 'cc7', 'ccc', '.d.'], { c: 12, d: 13 }, { flip })
  }
  drop(9, 9, false), drop(5, 20, false), drop(10, 31, false)
  drop(52, 11, true), drop(56, 22, true), drop(51, 33, true)
  p.line(12, 14, 14, 16, 7), p.line(51, 16, 49, 18, 7) // fling lines

  // alarm marks at the corners
  p.vline(3, 2, 5, 8), p.px(3, 8, 8)
  p.vline(60, 38, 5, 8), p.px(60, 44, 8)
  p.vline(5, 39, 4, 10), p.px(5, 44, 10)
  p.vline(58, 2, 4, 10), p.px(58, 7, 10)
}
