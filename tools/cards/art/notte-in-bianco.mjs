// All-nighter: the programmer propped on one hand, yawning in the laptop glow, moon in the window,
// the clock past four and the empty cans stacked into a pyramid. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // night wall
  p.rect(0, 0, 64, 38, 1)

  // window: grey frame lit top-left, black sky, crescent moon, stars
  p.rect(1, 2, 19, 20, 5)
  p.hline(1, 2, 19, 6), p.vline(1, 2, 20, 6)
  p.rect(3, 4, 15, 16, 0)
  p.disc(8, 9, 3.5, 10)
  p.disc(10, 8, 3, 0)
  p.px(5, 8, 7), p.px(5, 9, 7), p.px(6, 11, 7) // lit rim of the moon
  p.px(7, 12, 9), p.px(8, 12, 9)
  for (const [x, y] of [[15, 6], [13, 15], [5, 17], [16, 12], [11, 5]]) p.px(x, y, 7)
  p.px(14, 9, 13), p.px(8, 16, 13)
  p.vline(10, 4, 16, 5), p.hline(3, 12, 15, 5) // window bars
  p.rect(0, 22, 21, 2, 6), p.hline(0, 23, 21, 5) // sill

  // wall clock, past four
  p.disc(53, 9, 6, 0)
  p.disc(53, 9, 5, 7)
  p.ring(53, 9, 5, 5, 6)
  p.px(57, 12, 6), p.px(56, 13, 6), p.px(58, 11, 6)
  for (const [x, y] of [[53, 5], [57, 9], [53, 13], [49, 9]]) p.px(x, y, 5)
  p.line(53, 9, 53, 5, 0) // minutes: on the hour
  p.line(53, 9, 56, 11, 0) // hours: four
  p.line(53, 9, 50, 11, 8) // seconds ticking on
  p.px(53, 9, 2)

  // hoodie body
  p.poly([[12, 38], [14, 31], [19, 27], [35, 27], [40, 31], [42, 38]], 6)
  p.poly([[33, 28], [37, 28], [40, 31], [42, 38], [34, 38]], 5)
  p.line(14, 31, 12, 37, 7), p.line(15, 30, 18, 28, 7)

  // hood up around the head, lit top-left
  p.ellipse(27, 19, 9, 9, 0)
  p.ellipse(27, 19, 8.5, 8.5, 6)
  p.ellipse(28.5, 20.5, 7.5, 7.5, 5)
  p.ellipse(26.5, 18, 7.5, 7.5, 6)
  p.px(21, 13, 7), p.px(22, 12, 7), p.px(23, 11, 7), p.px(20, 15, 7), p.px(24, 11, 7)
  // face opening
  p.ellipse(27, 21, 6.5, 6.5, 5)
  p.ellipse(27, 21.5, 5.5, 5.5, 15)
  // messy brown fringe
  p.rect(21, 15, 13, 3, 4)
  p.px(22, 18, 4), p.px(24, 18, 4), p.px(25, 18, 4), p.px(28, 18, 4), p.px(31, 18, 4), p.px(32, 18, 4)
  p.px(23, 15, 9), p.px(24, 15, 9), p.px(22, 16, 9)
  p.hline(29, 15, 4, 2)
  // glasses pushed up on the fringe, still catching the screen
  p.rect(22, 13, 4, 3, 0), p.rect(28, 13, 4, 3, 0)
  p.rect(23, 14, 2, 1, 12), p.rect(29, 14, 2, 1, 12)
  p.px(23, 14, 7), p.px(29, 14, 7)
  p.hline(26, 14, 2, 0)
  p.rect(32, 19, 1, 6, 4) // shadow side of the face
  // heavy eyelids, bags under the eyes
  p.hline(23, 20, 3, 4), p.hline(28, 20, 3, 4)
  p.hline(23, 21, 3, 0), p.hline(28, 21, 3, 0)
  p.hline(23, 22, 3, 13), p.hline(28, 22, 3, 13)
  p.px(26, 23, 4)
  // big yawn
  p.sprite(25, 23, ['.00.', '0220', '0880', '.00.'])
  p.px(22, 24, 14)
  // screen light under the chin
  p.hline(24, 27, 6, 13)

  // fist under the chin, forearm down to the elbow on the desk
  p.poly([[31, 28], [36, 27], [42, 37], [36, 38]], 6)
  p.line(36, 27, 42, 37, 5), p.line(36, 28, 41, 37, 5)
  p.line(31, 28, 35, 37, 7)
  p.rect(30, 23, 5, 5, 15)
  p.vline(34, 23, 5, 4), p.hline(30, 27, 5, 4)
  p.hline(31, 24, 3, 4), p.hline(31, 26, 3, 4)
  p.vline(35, 24, 4, 0), p.px(34, 28, 0)

  // laptop seen from behind, its glow lighting him from below
  p.rect(15, 31, 18, 8, 6)
  p.hline(15, 31, 18, 7), p.vline(15, 31, 8, 7)
  p.vline(32, 32, 7, 5)
  p.rect(22, 33, 3, 3, 11), p.px(22, 33, 3), p.px(24, 35, 3) // a sticker
  p.hline(14, 30, 20, 12) // screen light over the lid
  p.hline(17, 29, 13, 13)

  // desk
  p.rect(0, 38, 64, 10, 4)
  p.hline(0, 38, 64, 9)
  p.rect(0, 41, 64, 7, 2)
  p.hline(0, 41, 64, 0)
  p.hline(4, 44, 12, 4), p.hline(40, 45, 14, 4)

  // the can pyramid
  const can = (x, y, c, d) => {
    p.rect(x, y, 4, 6, c)
    p.vline(x + 3, y, 6, d)
    p.vline(x, y + 1, 4, 7)
    p.hline(x, y, 4, 6), p.px(x + 3, y, 5)
    p.hline(x, y + 3, 4, 10)
  }
  can(45, 32, 8, 2), can(50, 32, 11, 3), can(55, 32, 12, 1)
  can(47, 26, 12, 1), can(52, 26, 8, 2)
  can(50, 20, 11, 3)
  // one more rolled over, and a cold coffee
  p.rect(37, 35, 6, 3, 8), p.hline(37, 37, 6, 2), p.vline(42, 35, 3, 6), p.hline(37, 35, 5, 14)
  p.rect(4, 32, 6, 6, 7), p.vline(9, 32, 6, 6), p.hline(4, 32, 6, 4), p.hline(5, 33, 4, 2)
  p.ring(11, 34, 1, 1.5, 6)
  p.px(2, 37, 4), p.px(12, 37, 9) // crumbs
}
