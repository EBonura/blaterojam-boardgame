// Sudden crash: the blue crash screen with a big X, useless text and a stuck progress bar, while the programmer,
// seen from behind, clutches their head. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // desk
  p.rect(0, 38, 64, 10, 4)
  p.hline(0, 38, 64, 9)
  p.rect(0, 42, 64, 6, 2)

  // monitor
  p.rect(17, 1, 46, 33, 0)
  p.rect(17, 1, 45, 32, 6)
  p.hline(17, 1, 45, 7), p.vline(17, 1, 32, 7)
  p.vline(61, 2, 31, 5), p.hline(18, 32, 44, 5)
  p.rect(36, 34, 8, 3, 5), p.rect(31, 36, 18, 2, 6), p.hline(31, 36, 18, 7)
  // the blue screen
  p.rect(20, 4, 39, 26, 12)
  p.hline(20, 4, 39, 7)
  // a big white X in a circle
  p.disc(27, 13, 6, 7)
  p.disc(27, 13, 5, 12)
  p.line(24, 10, 30, 16, 7), p.line(25, 10, 30, 15, 7)
  p.line(30, 10, 24, 16, 7), p.line(29, 10, 24, 15, 7)
  p.px(31, 18, 13), p.px(32, 17, 13) // shadow side of the ring
  // lines of nothing useful
  p.hline(37, 9, 18, 7), p.hline(37, 12, 13, 7), p.hline(37, 15, 16, 7)
  p.hline(24, 21, 12, 13), p.hline(24, 23, 30, 13), p.hline(40, 21, 10, 13)
  // progress stuck at the start
  p.rect(24, 26, 31, 3, 1), p.rect(24, 26, 3, 3, 7), p.px(27, 27, 13)
  // screen glow on the desk
  p.dither(20, 38, 40, 1, 12, -1)

  // a cold coffee and a sticky note
  p.rect(53, 31, 6, 7, 7), p.vline(58, 31, 7, 6), p.hline(53, 31, 6, 4), p.hline(54, 32, 4, 2)
  p.ring(60, 34, 1, 1.5, 6)
  p.rect(18, 3, 5, 5, 10), p.hline(18, 3, 5, 7), p.vline(22, 4, 4, 9), p.hline(19, 5, 3, 4)

  // the programmer from behind: hoodie, brown hair, both hands clutching it
  p.poly([[0, 48], [1, 40], [5, 36], [19, 36], [24, 40], [26, 48]], 6)
  p.poly([[16, 37], [22, 39], [26, 48], [16, 48]], 5)
  p.line(1, 40, 5, 36, 7)
  p.ellipse(12, 37, 8, 3, 5) // hood down on the shoulders
  p.ellipse(12, 37, 6, 1.5, 0)
  p.ellipse(12, 28, 7.5, 8.5, 0)
  p.ellipse(12, 28, 7, 8, 4)
  p.ellipse(11, 26, 5, 5.5, 9)
  p.ellipse(13, 30, 5, 5, 4)
  for (const [x, y] of [[8, 22], [11, 21], [14, 22], [7, 26], [10, 25], [16, 25]]) p.px(x, y, 2) // strands
  p.vline(19, 25, 7, 12), p.vline(20, 28, 3, 12) // screen light on the right side
  p.px(4, 30, 15), p.px(4, 31, 15), p.px(20, 32, 15) // ears
  // hands clutching the hair
  const hand = (x, flip) => p.sprite(x, 20, ['f.f.f', 'fffff', 'fffff', '4fff4', '.444.'], { f: 15 }, { flip })
  hand(2, false), hand(17, true)
  p.rect(2, 25, 4, 6, 6), p.rect(18, 25, 4, 6, 5) // sleeves

  // alarm: a red shock burst by the head
  p.line(1, 14, 3, 17, 8), p.line(6, 12, 7, 16, 8), p.line(12, 11, 12, 15, 8), p.line(18, 13, 16, 16, 8)
}
