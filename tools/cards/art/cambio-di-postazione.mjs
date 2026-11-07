// Swap desks: the art screen and the audio screen trade places, and the artist's beret and the
// composer's headphones fly across to the other chair. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // desk
  p.rect(0, 37, 64, 11, 4)
  p.hline(0, 37, 64, 9)
  p.rect(0, 40, 64, 8, 2)

  const monitor = (x) => {
    p.rect(x, 15, 25, 18, 0)
    p.rect(x, 15, 24, 17, 6)
    p.hline(x, 15, 24, 7), p.vline(x, 15, 17, 7)
    p.vline(x + 23, 16, 16, 5), p.hline(x + 1, 31, 23, 5)
    p.rect(x + 10, 33, 5, 2, 5), p.rect(x + 7, 35, 11, 2, 6), p.hline(x + 7, 35, 11, 7)
  }

  // left screen: a painting (graphics)
  monitor(2)
  p.rect(4, 17, 20, 13, 12)
  p.rect(4, 17, 20, 4, 13)
  p.disc(19, 21, 2, 10), p.px(18, 20, 7)
  p.poly([[4, 29], [4, 24], [9, 21], [14, 25], [18, 23], [23, 27], [23, 29]], 3)
  p.line(4, 24, 9, 21, 11), p.line(14, 25, 18, 23, 11)
  p.hline(4, 29, 20, 11)
  p.line(7, 19, 12, 18, 7) // cloud stroke

  // right screen: a song (audio)
  monitor(38)
  p.rect(40, 17, 20, 13, 2)
  for (let x = 40; x < 60; x++) {
    const h = Math.round(1 + 2.5 * Math.abs(Math.sin(x * 0.9) * Math.cos(x * 0.35)))
    p.vline(x, 26 - h, 2 * h + 1, 14)
  }
  p.hline(40, 26, 20, 8)
  p.vline(46, 18, 5, 7), p.rect(46, 18, 3, 1, 7), p.px(48, 19, 7), p.rect(44, 21, 3, 2, 7) // a note
  p.vline(54, 19, 4, 7), p.hline(54, 19, 3, 7), p.vline(56, 19, 4, 7), p.rect(52, 22, 3, 2, 7), p.rect(55, 22, 2, 1, 7) // two notes

  // arrows: over the top to the right, across the desk to the left
  for (let t = 0; t <= Math.PI; t += 0.02) {
    const x = Math.round(32 - 19 * Math.cos(t)), y = Math.round(15 - 5 * Math.sin(t))
    p.px(x, y, 10), p.px(x, y + 1, 9)
  }
  p.poly([[47, 12], [55, 12], [51, 17]], 10), p.line(51, 17, 55, 12, 9)
  p.hline(10, 43, 44, 9), p.hline(10, 44, 44, 4)
  p.poly([[13, 39], [13, 47], [8, 43]], 9), p.line(8, 43, 13, 47, 4)

  // the beret flying right, tilted, with its little stalk
  p.ellipse(32, 5, 7.5, 3.5, 0)
  p.ellipse(32, 5, 7, 3, 8)
  p.ellipse(33, 6.5, 6, 1.5, 2)
  p.hline(28, 2, 5, 14), p.hline(26, 3, 3, 14), p.px(25, 4, 14)
  p.rect(33, 0, 2, 2, 2), p.px(33, 0, 8)
  p.hline(25, 9, 15, 0), p.hline(26, 8, 13, 2) // band
  p.hline(18, 3, 4, 7), p.hline(17, 6, 4, 6) // motion

  // the headphones flying left along the desk
  for (let t = Math.PI; t <= 2 * Math.PI; t += 0.05) {
    p.px(Math.round(34 + 5 * Math.cos(t)), Math.round(42 + 5 * Math.sin(t)), 5)
    p.px(Math.round(34 + 4 * Math.cos(t)), Math.round(42 + 4 * Math.sin(t)), 6)
  }
  p.rect(28, 41, 3, 5, 5), p.vline(28, 41, 4, 6), p.px(29, 45, 0)
  p.rect(38, 41, 3, 5, 5), p.vline(40, 41, 5, 0), p.px(38, 41, 6)
  p.rect(30, 42, 1, 3, 14), p.rect(38, 42, 1, 3, 14)
  p.px(44, 39, 7), p.px(45, 42, 7) // motion
}
