// Pixel art: a slime sprite zoomed up on a pixel editor's transparency checkerboard, the pencil
// placing its last pixel (an eye); palette swatches and a tiny 1:1 preview on the side. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

const SLIME = [
  '............',
  '....3333....',
  '...3bbbb3...',
  '..3b77bbb3..',
  '.3b7bbbbbb3.',
  '.3bbbbbbbb3.',
  '3bbb0bbb.bb3',
  '3bbbbb22bbb3',
  '3bbbbbbbbb33',
  '.33333333331',
]
const COL = { b: 11, 3: 3, 7: 7, 0: 0, 2: 2, 1: 1 }
const LAST = [8, 6] // the empty cell the pencil is filling in

export default function draw({ px }) {
  const p = pen(px)

  // editor window
  p.rect(0, 0, 64, 48, 5)
  p.hline(0, 0, 64, 6)
  for (const [x, c] of [[2, 6], [6, 6], [10, 7], [14, 6]]) p.rect(x, 1, 3, 2, c) // toolbar, pencil tool picked
  p.rect(10, 1, 3, 2, 12)
  // the canvas: 4-pixel cells, checkerboard where transparent
  const X = 2, Y = 5
  p.rect(X + 1, Y + 1, 48, 40, 0) // canvas shadow
  SLIME.forEach((row, j) => [...row].forEach((ch, i) => {
    const c = ch === '.' ? ((i + j) % 2 ? 6 : 7) : COL[ch]
    p.rect(X + i * 4, Y + j * 4, 4, 4, c)
  }))
  // the new pixel, highlighted
  const [lx, ly] = LAST
  p.rect(X + lx * 4, Y + ly * 4, 4, 4, 0)
  p.hline(X + lx * 4 - 1, Y + ly * 4 - 1, 6, 7), p.hline(X + lx * 4 - 1, Y + ly * 4 + 4, 6, 7)
  p.vline(X + lx * 4 - 1, Y + ly * 4, 4, 7), p.vline(X + lx * 4 + 4, Y + ly * 4, 4, 7)

  // side panel: palette swatches (black picked), and a 1:1 preview
  p.rect(52, 5, 11, 40, 1)
  const sw = [[0, 7], [11, 3], [8, 2], [10, 9], [12, 13], [14, 15]]
  sw.forEach(([a, b], j) => { p.rect(53, 6 + j * 5, 4, 4, a), p.rect(58, 6 + j * 5, 4, 4, b) })
  p.rect(52, 5, 6, 6, 7), p.rect(53, 6, 4, 4, 0)
  p.rect(53, 36, 9, 8, 6)
  SLIME.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch !== '.' && i % 1 === 0) p.px(52 + Math.round(i * 0.84), 35 + Math.round(j * 0.9), COL[ch])
  }))

  // the pencil, tip on the new pixel
  const q = layer()
  const tx = X + lx * 4 + 3, ty = Y + ly * 4 + 1
  for (let i = 4; i < 20; i++) {
    q.px(tx + i, ty - i - 1, 10), q.px(tx + i + 1, ty - i - 1, 10)
    q.px(tx + i + 1, ty - i, 9), q.px(tx + i, ty - i - 2, 7)
  }
  for (let i = 1; i < 4; i++) q.px(tx + i, ty - i, 15), q.px(tx + i + 1, ty - i, 4), q.px(tx + i, ty - i - 1, 15)
  q.px(tx, ty, 0), q.px(tx + 1, ty - 1, 0)
  for (let i = 20; i < 22; i++) q.px(tx + i, ty - i - 1, 6), q.px(tx + i + 1, ty - i - 1, 6), q.px(tx + i + 1, ty - i, 5), q.px(tx + i, ty - i - 2, 7)
  for (let i = 22; i < 25; i++) q.px(tx + i, ty - i - 1, 14), q.px(tx + i + 1, ty - i - 1, 14), q.px(tx + i + 1, ty - i, 8), q.px(tx + i, ty - i - 2, 14)
  q.outline(0)
  q.stamp(px)
}
