// A code editor: two big curly braces with the text cursor blinking between them, waiting for the
// first line; tabs (one unsaved), line numbers, a minimap, and a tiny bug already crawling in. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

const BRACE = [
  '.....eee',
  '....eeee',
  '...eee..',
  '...ee...',
  '...ee...',
  '...ee...',
  '...ee...',
  '...ee...',
  '...ee...',
  '...ee...',
  '..eee...',
  '.eee....',
  'eee.....',
  '.eee....',
  '..eee...',
  '...ee...',
  '...ee...',
  '...ee...',
  '...ee...',
  '...ee...',
  '...ee...',
  '...ee...',
  '...eee..',
  '....eeee',
  '.....eee',
]

export default function draw({ px }) {
  const p = pen(px)

  // window frame and tab bar
  p.rect(1, 1, 62, 46, 13)
  p.hline(1, 1, 62, 6), p.vline(1, 1, 46, 6)
  p.hline(1, 46, 62, 5), p.vline(62, 1, 46, 5)
  p.rect(2, 2, 60, 5, 5)
  p.rect(2, 3, 20, 4, 1), p.hline(2, 3, 20, 12)
  p.hline(5, 5, 9, 6), p.disc(18, 5, 1, 7)
  p.rect(23, 3, 15, 4, 5), p.hline(23, 3, 15, 13), p.hline(26, 5, 8, 13)
  p.hline(56, 4, 4, 6), p.px(56, 3, 6)
  // editor body, gutter, minimap
  p.rect(2, 7, 60, 35, 1)
  p.rect(2, 7, 7, 35, 0)
  for (let y = 9; y < 41; y += 3) p.hline(4, y, 3, 5)
  p.hline(4, 24, 3, 7)
  p.rect(54, 7, 8, 35, 0)
  for (const [y, w, c] of [[9, 4, 12], [10, 5, 6], [12, 3, 14], [13, 5, 6], [14, 2, 6], [16, 4, 12], [17, 3, 11]]) p.hline(56, y, w, c)
  p.rect(55, 22, 6, 6, 5), p.rect(56, 23, 4, 4, 1), p.hline(57, 24, 2, 14), p.hline(57, 25, 2, 14)
  // status bar
  p.rect(2, 42, 60, 4, 12)
  p.hline(2, 42, 60, 7)
  p.hline(4, 44, 6, 1), p.hline(12, 44, 3, 1)
  p.sprite(55, 43, ['...7', '7.7.', '.7..'])

  // the braces: pink, lit top-left, shaded bottom-right
  const b = layer()
  b.sprite(12, 12, BRACE, { e: 14 })
  b.sprite(44, 12, BRACE, { e: 14 }, { flip: true })
  const g = b.grid
  for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) {
    if (g[y][x] === 14 && (g[y][x + 1] < 0 || g[y + 1]?.[x] < 0)) b.px(x, y, 8)
  }
  for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) {
    if (g[y][x] === 14 && g[y][x - 1] < 0 && g[y - 1]?.[x] < 0) b.px(x, y, 7)
  }
  b.outline(2)
  b.stamp(px)
  // the text cursor (an I-beam) waiting between them
  p.vline(32, 15, 19, 7)
  p.hline(30, 14, 2, 7), p.hline(33, 14, 2, 7)
  p.hline(30, 34, 2, 7), p.hline(33, 34, 2, 7)
  p.vline(33, 16, 18, 6)

  // a tiny bug, already crawling in
  p.sprite(24, 37, ['0.0.0', '.888.', '88780', '.888.', '0.0.0'])
}
