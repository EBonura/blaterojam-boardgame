// The composer: pink-red hair, big headphones, lavender top,
// eyes closed and lost in the music, notes floating up from the keys. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // floor
  p.rect(0, 45, 64, 3, 1)
  p.hline(0, 45, 64, 5)

  // notes floating up from the keys
  const note8 = (x, y, c, d) => { p.rect(x, y + 5, 3, 2, c), p.px(x + 2, y + 5, d), p.vline(x + 2, y, 5, c), p.px(x + 3, y + 1, c), p.px(x + 4, y + 2, c), p.px(x + 4, y + 3, c) }
  note8(5, 11, 10, 9)
  p.rect(14, 8, 3, 2, 7), p.rect(21, 7, 3, 2, 7), p.vline(16, 3, 6, 7), p.vline(23, 2, 6, 7)
  p.hline(16, 2, 8, 7), p.hline(16, 3, 8, 6), p.px(16, 9, 6), p.px(23, 8, 6)
  note8(28, 13, 14, 8)
  p.px(11, 6, 10), p.px(26, 9, 7), p.px(3, 4, 14), p.px(33, 6, 10)

  // synth on an X stand
  for (let i = 0; i < 13; i++) {
    p.px(6 + i, 32 + i, 5), p.px(18 - i, 32 + i, 6)
    p.px(22 + i, 32 + i, 5), p.px(34 - i, 32 + i, 6)
  }
  p.hline(5, 45, 3, 0), p.hline(17, 45, 3, 0), p.hline(21, 45, 3, 0), p.hline(33, 45, 3, 0)
  const s = layer()
  s.rect(1, 22, 37, 10, 5)
  s.hline(1, 22, 37, 6)
  s.vline(1, 22, 10, 6)
  s.rect(1, 31, 37, 1, 0)
  // control panel: a little screen with a waveform, knobs, a red LED
  s.rect(3, 23, 9, 3, 1), s.sprite(4, 24, ['b.b.b.b', '.b.b.b.'], { b: 11 })
  for (const x of [14, 18, 22]) s.rect(x, 23, 2, 2, 6), s.px(x, 23, 7), s.px(x + 1, 24, 0)
  s.px(26, 24, 8), s.px(28, 24, 11)
  s.rect(30, 23, 6, 2, 0), s.hline(30, 23, 4, 12)
  // keys
  s.rect(2, 27, 35, 4, 7)
  s.hline(2, 30, 35, 6)
  for (let x = 2; x < 37; x += 3) s.vline(x, 27, 4, 6)
  for (const x of [4, 7, 13, 16, 19, 25, 28, 34]) s.rect(x, 27, 2, 2, 0)
  s.outline(0)
  s.stamp(px)

  // the composer on a stool
  const c = layer()
  // stool
  c.rect(43, 33, 13, 2, 4), c.hline(43, 33, 13, 9)
  c.vline(45, 35, 10, 4), c.vline(53, 35, 10, 2), c.hline(45, 40, 9, 2)
  // legs: thighs forward, shins down
  c.rect(34, 30, 14, 4, 2)
  c.hline(34, 30, 13, 13)
  c.rect(34, 33, 4, 10, 2), c.vline(34, 33, 10, 13)
  c.rect(32, 42, 6, 3, 0), c.hline(32, 42, 5, 5)
  // body, lavender top
  c.poly([[40, 20], [49, 20], [52, 24], [51, 32], [40, 32], [39, 24]], 13)
  c.poly([[47, 20], [49, 20], [52, 24], [51, 32], [47, 32]], 5)
  c.vline(40, 21, 10, 6)
  // arms reaching to the keys
  c.poly([[41, 22], [44, 22], [38, 28], [35, 27]], 13)
  c.line(43, 24, 38, 28, 5)
  c.rect(32, 25, 4, 2, 15), c.px(32, 26, 4)
  c.poly([[46, 23], [49, 24], [41, 29], [39, 28]], 5)
  c.rect(37, 28, 3, 2, 15)
  // hair falling down the back
  c.rect(46, 9, 6, 14, 8), c.rect(50, 11, 2, 12, 2), c.vline(46, 17, 6, 2)
  // head and face (profile, facing the synth)
  c.ellipse(44, 12, 6, 6.5, 8)
  c.ellipse(42, 13, 4.5, 5, 15)
  c.vline(46, 11, 6, 4)
  c.sprite(37, 5, [
    '...88888.....',
    '..8ee88888...',
    '.8e88888888..',
    '.888888888...',
    '.88.88.......',
  ])
  // eye closed, smiling, blush
  c.hline(40, 12, 2, 0)
  c.px(39, 11, 0)
  c.px(41, 16, 2), c.px(40, 16, 2), c.px(42, 15, 2)
  c.px(42, 14, 14)
  // headphones: band over the head, a big cup over the ear
  c.hline(42, 2, 6, 6), c.hline(42, 3, 6, 5)
  c.rect(40, 3, 2, 3, 5), c.px(40, 3, 6), c.px(41, 2, 6)
  c.rect(48, 3, 2, 5, 5), c.px(48, 3, 6)
  c.px(43, 2, 7), c.px(44, 2, 7)
  c.rect(45, 8, 6, 8, 5)
  c.vline(45, 8, 8, 6), c.hline(45, 8, 6, 6)
  c.rect(47, 10, 2, 4, 0)
  c.px(46, 9, 7)
  c.outline(0)
  c.stamp(px)

}
