// Stereo: two speakers facing each other, left and right channel waves meeting in the middle
// around a note; a mug of coffee on one speaker shivers with the bass. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

// Wave arcs bulging towards the middle: radius r around (cx, cy), on the side given by dir.
function arc(p, cx, cy, r, dir, c, span = 0.75) {
  for (let a = -span; a <= span; a += 0.02) p.px(cx + dir * Math.cos(a) * r, cy + Math.sin(a) * r * 1.15, c)
}

export default function draw({ px }) {
  const p = pen(px)

  // floor
  p.rect(0, 43, 64, 5, 1)
  p.hline(0, 43, 64, 5)
  // a cable between the two speakers, along the floor
  p.hline(10, 45, 44, 0), p.px(9, 44, 0), p.px(54, 44, 0)

  const speaker = (x, led) => {
    const s = layer()
    s.rect(x, 8, 16, 35, 5)
    s.hline(x, 8, 16, 6), s.vline(x, 8, 35, 6)
    s.vline(x + 15, 9, 34, 0), s.hline(x + 1, 42, 15, 0)
    s.rect(x + 2, 10, 12, 31, 0)
    s.rect(x + 2, 10, 12, 31, 1)
    s.hline(x + 2, 10, 12, 5)
    // tweeter
    s.disc(x + 8, 16, 3, 5), s.ring(x + 8, 16, 3, 3, 6), s.disc(x + 8, 16, 1, 13), s.px(x + 7, 15, 7)
    // woofer
    s.disc(x + 8, 30, 6, 0)
    s.ring(x + 8, 30, 6, 6, 6)
    s.disc(x + 8, 30, 4.5, 5)
    s.disc(x + 8, 30, 2.5, 13)
    s.disc(x + 7, 29, 1, 6), s.px(x + 6, 28, 7)
    s.ring(x + 8, 30, 4.5, 4.5, 0)
    // channel light and a little port
    s.rect(x + 3, 38, 2, 1, led), s.hline(x + 10, 38, 3, 0)
    s.outline(0)
    s.stamp(px)
    p.hline(x + 1, 44, 16, 0)
  }
  speaker(1, 11)
  speaker(47, 8)

  // waves: blue from the left, pink from the right, meeting in the middle
  for (const [r, c] of [[4, 12], [7, 12], [10, 13]]) arc(p, 16, 28, r, 1, c, 0.65)
  for (const [r, c] of [[4, 14], [7, 14], [10, 8]]) arc(p, 47, 28, r, -1, c, 0.65)

  // the note in the middle, where the two channels meet
  const n = layer()
  n.vline(33, 15, 13, 10), n.vline(34, 15, 2, 10)
  n.line(35, 16, 37, 19, 10), n.line(35, 17, 37, 20, 9), n.px(37, 21, 9)
  n.ellipse(30.5, 28, 3, 2, 10)
  n.px(29, 27, 7), n.px(30, 27, 7)
  n.hline(30, 30, 3, 9), n.px(33, 29, 9)
  n.outline(0)
  n.stamp(px)
  p.px(27, 16, 7), p.px(38, 13, 10), p.px(26, 33, 10), p.px(39, 30, 7)
  p.hline(28, 34, 6, 1) // its shadow

  // a mug on the left speaker, shivering with the bass
  p.rect(5, 2, 6, 6, 7), p.vline(9, 2, 6, 6), p.vline(10, 2, 6, 6)
  p.hline(5, 2, 6, 6), p.hline(6, 3, 4, 4)
  p.vline(11, 3, 3, 6), p.px(12, 4, 6)
  p.rect(6, 5, 2, 2, 8)
  p.px(3, 3, 6), p.px(3, 5, 6), p.px(13, 2, 6), p.px(13, 6, 6)
}
