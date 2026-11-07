// Audio mono: an old wooden radio with one round speaker, a tuning dial and two knobs, sending out
// one lonely wave; a cobweb by the handle says it has not been switched on for years. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // shelf
  p.rect(0, 42, 64, 6, 4)
  p.hline(0, 42, 64, 9)
  p.hline(0, 44, 64, 2)
  p.hline(0, 47, 64, 2)
  p.hline(12, 43, 46, 2) // radio shadow

  const r = layer()
  // antenna, telescopic
  r.line(49, 13, 60, 2, 6), r.line(50, 13, 61, 2, 5)
  r.px(57, 5, 7), r.px(54, 8, 7)
  r.disc(61, 1, 1, 6)
  // carry handle
  r.rect(21, 3, 22, 2, 4), r.hline(21, 3, 22, 9)
  r.vline(21, 4, 8, 4), r.vline(42, 4, 8, 2)
  // wooden case with rounded top corners
  r.rect(8, 12, 48, 30, 4)
  r.rect(10, 11, 44, 1, 4)
  r.hline(10, 11, 44, 9), r.vline(8, 13, 28, 9), r.px(9, 12, 9)
  r.vline(55, 13, 29, 2), r.hline(9, 41, 47, 2)
  for (const [x, y, w] of [[14, 13, 10], [30, 39, 12], [44, 14, 8], [11, 37, 6]]) r.hline(x, y, w, 2) // grain
  // front panel trim
  r.rect(11, 15, 42, 23, 2)
  r.rect(12, 16, 40, 21, 9)
  r.hline(12, 16, 40, 10)
  // the one speaker: cloth behind a round grille
  r.disc(23, 26, 9, 2)
  r.disc(23, 26, 8, 15)
  for (let y = 18; y < 35; y++) for (let x = 15; x < 32; x++) if (r.grid[y][x] === 15 && (x + y) % 2) r.px(x, y, 9)
  for (let y = 18; y < 35; y += 3) for (let x = 15; x < 32; x++) if (r.grid[y][x] === 15 || r.grid[y][x] === 9) r.px(x, y, 4)
  r.ring(23, 26, 8, 8, 4)
  for (let y = 18; y < 35; y++) for (let x = 15; x < 32; x++) if ((r.grid[y][x] === 15 || r.grid[y][x] === 9) && x + y > 54) r.px(x, y, r.grid[y][x] === 15 ? 9 : 4)
  // tuning dial with a red needle
  r.rect(36, 19, 14, 8, 2)
  r.rect(37, 20, 12, 6, 15)
  r.hline(37, 20, 12, 7)
  for (const x of [38, 40, 42, 44, 46, 48]) r.vline(x, 21, x % 4 ? 1 : 2, 4)
  r.vline(43, 21, 5, 8)
  // knobs
  for (const x of [40, 47]) {
    r.disc(x, 32, 2.5, 5)
    r.disc(x - 0.5, 31.5, 1.5, 6)
    r.px(x - 1, 31, 7)
    r.px(x, 30, 0)
  }
  // feet
  r.rect(11, 42, 4, 1, 0), r.rect(49, 42, 4, 1, 0)
  r.outline(0)
  r.stamp(px)

  // a cobweb in the corner between the handle and the case
  p.line(10, 10, 20, 4, 6) // outer thread, from the case to the handle post
  p.line(20, 10, 13, 8, 6), p.line(20, 10, 17, 5, 6) // radials
  p.line(15, 10, 19, 7, 13) // cross thread
  p.px(16, 7, 7)

  // one lonely wave, and a single small note
  for (let a = -0.8; a <= 0.8; a += 0.03) p.px(9 - Math.cos(a) * 4 - 2, 26 + Math.sin(a) * 9, 12)
  p.sprite(1, 6, ['..77', '..7.7', '..7..', '777..', '777..'].map((s) => s.padEnd(5, '.')))
}
