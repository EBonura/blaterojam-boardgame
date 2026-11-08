// Refactoring: an editor split in two, a tangle of messy code lines on the left goes through a big arrow
// and comes out short, tidy and aligned on the right, with a green check. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)
  // window frame and title bar
  p.rect(1, 1, 62, 46, 13)
  p.hline(1, 1, 62, 6), p.vline(1, 1, 46, 6)
  p.hline(1, 46, 62, 5), p.vline(62, 1, 46, 5)
  p.rect(2, 2, 60, 5, 5)
  p.disc(5, 4, 1, 8), p.disc(9, 4, 1, 9), p.disc(13, 4, 1, 11)
  p.hline(24, 4, 16, 6)
  // two panes
  p.rect(2, 7, 29, 38, 1)
  p.rect(33, 7, 29, 38, 1)
  p.vline(31, 7, 38, 0), p.vline(32, 7, 38, 5)
  // left: messy, crooked lines at random indents, crossing each other, a red squiggle under one
  const messy = [[4, 9, 18, 12], [7, 12, 21, 14], [3, 15, 9, 6], [12, 15, 14, 11], [6, 18, 22, 8], [4, 21, 13, 12], [9, 24, 18, 14],
    [3, 27, 24, 6], [11, 30, 16, 11], [5, 33, 20, 12], [8, 36, 12, 8], [4, 39, 23, 14], [14, 42, 14, 6]]
  for (const [x, y, w, c] of messy) p.hline(x, y, Math.min(w, 30 - x), c)
  p.line(6, 10, 25, 26, 9), p.line(24, 11, 8, 31, 14)
  for (let x = 6; x < 26; x += 2) p.px(x, 22, 8), p.px(x + 1, 23, 8)
  // right: tidy, aligned, short lines in two blocks
  const tidy = [[36, 10, 12, 12], [38, 13, 16, 6], [38, 16, 10, 11], [36, 19, 6, 12],
    [36, 24, 14, 12], [38, 27, 12, 6], [38, 30, 15, 11], [36, 33, 6, 12]]
  for (const [x, y, w, c] of tidy) p.hline(x, y, w, c)
  // the big arrow from left to right, over the divider, with a dark outline
  const a = layer()
  a.poly([[22, 22], [36, 22], [36, 17], [45, 25], [36, 33], [36, 28], [22, 28]], 10)
  a.hline(23, 23, 13, 7)
  a.outline(0)
  a.stamp(px)
  p.poly([[37, 27], [43, 25], [36, 32]], 9)
  // green check, bottom right
  const c = layer()
  c.line(46, 39, 49, 42, 11), c.line(46, 38, 49, 41, 11), c.line(49, 42, 57, 34, 11), c.line(49, 41, 57, 33, 11)
  c.outline(3)
  c.stamp(px)
}
