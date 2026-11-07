// A flat sprite kid in red/blue 3D glasses, with anaglyph fringes, a fake blob shadow and a "3D" glyph popping out. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]
const G = {
  3: ['###', '..#', '.##', '..#', '###'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
}
export default function draw({ px }) {
  const p = pen(px)
  // floor: dark stage with a faint grid
  p.rect(0, 40, 64, 8, 1)
  for (const x of [4, 14, 24, 34, 44, 54]) p.line(x, 40, x + Math.round((x - 29) / 3), 47, 0)
  p.hline(0, 43, 64, 0)
  // blob shadow under the sprite
  p.ellipse(28, 42, 12, 2, 0)
  // the sprite, drawn on a layer so its silhouette can be shifted for the anaglyph fringes
  const L = layer()
  // legs and shoes
  L.rect(21, 33, 6, 6, 13), L.rect(29, 33, 6, 6, 13)
  L.rect(29, 33, 2, 6, 5), L.rect(33, 33, 2, 6, 5)
  L.rect(20, 38, 7, 3, 4), L.rect(29, 38, 7, 3, 4), L.hline(20, 40, 7, 2), L.hline(29, 40, 7, 2)
  // arms
  L.rect(15, 23, 4, 8, 3), L.vline(15, 23, 8, 11), L.rect(15, 31, 4, 3, 15)
  L.rect(37, 23, 4, 8, 3), L.vline(40, 23, 8, 1), L.rect(37, 31, 4, 3, 15), L.vline(40, 31, 3, 4)
  // tunic with a belt
  L.rect(19, 22, 18, 11, 3)
  L.hline(19, 22, 18, 11), L.vline(19, 22, 11, 11), L.rect(34, 23, 3, 10, 1)
  L.rect(19, 31, 18, 2, 4), L.hline(19, 31, 18, 9), L.rect(26, 31, 4, 2, 10)
  L.rect(25, 22, 6, 2, 15), L.px(28, 23, 4)
  // head: hair and face
  L.ellipse(28, 10, 10, 8, 4)
  L.rect(19, 9, 18, 13, 15)
  L.rect(35, 10, 2, 11, 4)
  L.px(19, 21, -1), L.px(36, 21, -1)
  L.rect(18, 4, 20, 6, 4)
  L.hline(20, 2, 14, 4), L.hline(22, 1, 10, 4)
  L.line(21, 3, 26, 2, 9), L.line(20, 5, 24, 4, 9), L.px(29, 2, 9)
  L.rect(18, 9, 2, 5, 4), L.rect(36, 9, 2, 5, 2)
  L.rect(17, 14, 2, 3, 15), L.rect(37, 14, 2, 3, 4)
  // mouth and blush
  L.hline(26, 19, 4, 2), L.px(25, 18, 2), L.px(30, 18, 2)
  L.px(21, 18, 14), L.px(34, 18, 14)
  // the 3D glasses: white frame, red and blue lenses
  L.rect(18, 11, 20, 7, 7)
  L.rect(20, 12, 7, 5, 8), L.hline(20, 16, 7, 2), L.px(20, 12, 14), L.px(21, 12, 14)
  L.rect(29, 12, 7, 5, 12), L.hline(29, 16, 7, 13), L.px(29, 12, 7), L.px(30, 12, 7)
  L.hline(18, 17, 20, 6)
  // anaglyph fringes: the silhouette in red to the left, blue to the right
  const g = L.grid
  for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) if (g[y][x] >= 0) p.px(x - 2, y, 8)
  for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) if (g[y][x] >= 0) p.px(x + 2, y, 12)
  L.outline(0)
  L.stamp(px)
  // "3D" glyph popping off the card, in anaglyph colours
  const glyph = (x, y, c) => {
    for (const ch of '3D') {
      G[ch].forEach((row, j) => [...row].forEach((v, i) => v === '#' && p.rect(x + i * 2, y + j * 2, 2, 2, c)))
      x += 8
    }
  }
  glyph(46, 5, 8), glyph(48, 5, 12), glyph(47, 5, 7)
  // sparkles of depth
  for (const [x, y] of [[8, 8], [10, 20], [56, 24], [6, 30]]) p.px(x, y, 13)
}
