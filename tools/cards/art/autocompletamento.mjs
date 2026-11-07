// Code autocomplete: a half-typed word, the rest of it ghosted in after the cursor, a suggestion
// popup with the top pick highlighted and sparkling, and a big Tab key ready to accept it. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // editor window
  p.rect(1, 1, 62, 46, 5)
  p.hline(1, 1, 62, 6), p.vline(1, 1, 46, 6)
  p.rect(2, 5, 60, 41, 0)
  p.hline(2, 2, 59, 5)
  p.px(4, 3, 8), p.px(6, 3, 10), p.px(8, 3, 11)
  p.rect(12, 2, 14, 3, 1), p.hline(14, 3, 8, 6)
  // gutter with line numbers
  p.rect(2, 5, 6, 41, 1)
  for (let y = 7; y < 46; y += 4) p.hline(4, y, 2, 5)
  p.hline(4, 15, 2, 6)
  // code: coloured dashes
  const code = [
    [7, [[10, 4, 12], [15, 9, 6], [25, 2, 7]]],
    [11, [[13, 5, 12], [19, 6, 6], [26, 1, 7], [28, 7, 11], [36, 1, 7]]],
    [19, [[13, 3, 13], [17, 10, 6]]],
    [23, [[10, 1, 7]]],
    [27, [[10, 4, 12], [15, 5, 6], [21, 3, 14]]],
    [31, [[13, 8, 6], [22, 6, 11]]],
    [35, [[13, 2, 12], [16, 9, 6]]],
    [39, [[10, 1, 7]]],
    [43, [[10, 6, 13], [17, 4, 6]]],
  ]
  for (const [y, runs] of code) for (const [x, w, c] of runs) p.hline(x, y, w, c)
  // current line, highlighted: typed part, the cursor, the ghost of the rest
  p.rect(8, 14, 54, 3, 1)
  p.hline(13, 15, 5, 12)
  p.hline(19, 15, 4, 7)
  p.vline(23, 13, 5, 7)
  p.hline(24, 15, 9, 5)

  // suggestion popup
  const s = layer()
  s.rect(17, 18, 31, 22, 6)
  s.hline(17, 18, 31, 7), s.vline(17, 18, 22, 7)
  s.hline(17, 39, 31, 5), s.vline(47, 19, 21, 5)
  // highlighted top pick
  s.rect(18, 19, 26, 6, 12)
  s.hline(18, 19, 26, 7)
  s.rect(20, 21, 3, 3, 10), s.px(20, 21, 7)
  s.hline(25, 22, 4, 7), s.hline(29, 22, 9, 7)
  // other picks
  const rows = [[26, 14], [31, 11], [36, 3]]
  for (const [y, c] of rows) s.rect(20, y + 1, 3, 3, c), s.hline(25, y + 2, 4, 1), s.hline(29, y + 2, 5 + (y % 4) * 2, 5)
  // scrollbar
  s.rect(45, 20, 2, 18, 5), s.rect(45, 20, 2, 7, 13)
  s.outline(0)
  for (let y = 19; y < 41; y++) p.px(49, y, 1)
  p.hline(18, 41, 32, 1)
  s.stamp(px)
  // sparkle on the top pick
  p.sprite(38, 15, ['..a..', '..a..', 'aa7aa', '..a..', '..a..'], { a: 10 })

  // the Tab key, ready to be pressed
  const k = layer()
  k.rect(48, 34, 14, 11, 5)
  k.rect(48, 34, 14, 9, 6)
  k.rect(49, 35, 12, 7, 7)
  k.vline(60, 35, 7, 6), k.hline(49, 41, 12, 6)
  k.sprite(50, 36, ['.....0..0', '......0.0', '0000000.0', '......0.0', '.....0..0'])
  k.outline(0)
  k.stamp(px)
}
