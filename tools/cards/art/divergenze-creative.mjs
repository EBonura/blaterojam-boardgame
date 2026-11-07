// Creative differences: the designer pitches a cute pastel platformer, the programmer a grim
// shooter, the two bubbles clash in a spark and the design sheet tears in half. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // a pen that only paints inside an ellipse, to keep each scene within its bubble
  const clip = (cx, cy, rx, ry) => pen((x, y, c) => {
    const u = (x - cx) / rx, v = (y - cy) / ry
    if (u * u + v * v <= 1) px(x, y, c)
  })

  // left bubble: round, white rim, a pastel platformer inside
  p.ellipse(15, 11.5, 14.5, 11, 0)
  p.ellipse(15, 11.5, 13.5, 10, 7)
  p.poly([[11, 20], [16, 20], [12, 27]], 7)
  p.line(10, 21, 12, 27, 0), p.line(17, 21, 12, 27, 0)
  const l = clip(15, 11.5, 12.6, 9.2)
  l.rect(0, 0, 31, 24, 14) // pink sky fading to peach
  l.rect(0, 0, 31, 6, 15)
  l.dither(0, 6, 31, 2, 15, -1)
  for (const [r, c] of [[9, 8], [8, 9], [7, 10], [6, 11], [5, 12]]) // rainbow
    for (let a = 0; a <= Math.PI; a += 0.04) l.px(Math.round(19 + r * Math.cos(a)), Math.round(18 - r * 0.85 * Math.sin(a)), c)
  l.ellipse(8, 7, 3, 1.5, 7), l.ellipse(11, 6, 2, 1.5, 7), l.hline(6, 8, 7, 6) // cloud
  l.rect(2, 17, 11, 6, 11), l.hline(2, 17, 11, 7), l.rect(2, 19, 11, 4, 3) // grassy ground
  l.rect(18, 14, 8, 2, 11), l.hline(18, 14, 8, 7), l.hline(18, 16, 8, 3) // floating platform
  // a round bunny mid-jump, and a heart to collect
  l.ellipse(9, 13.5, 2, 2, 7), l.px(8, 13, 0), l.px(10, 13, 0), l.px(9, 14, 14), l.px(10, 15, 6)
  l.vline(8, 9, 3, 7), l.vline(10, 9, 3, 7), l.px(8, 10, 14), l.px(10, 10, 14)
  l.sprite(21, 10, ['8.8', '888', '.8.'])
  l.px(5, 15, 7), l.px(14, 12, 7) // sparkles
  p.px(4, 7, 7), p.px(5, 6, 7), p.px(6, 5, 7), p.px(3, 9, 7) // rim shine

  // right bubble: spiky red shout, a grim shooter inside
  const spikes = []
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    const r = i % 2 ? 1 : 1.22
    spikes.push([Math.round(49 + 13 * r * Math.cos(a)), Math.round(11.5 + 9.5 * r * Math.sin(a))])
  }
  p.poly(spikes, 8)
  p.poly(spikes.map(([x, y]) => [Math.round(49 + (x - 49) * 0.82), Math.round(11.5 + (y - 11.5) * 0.82)]), 9)
  p.poly([[50, 19], [56, 19], [55, 27]], 8)
  p.ellipse(49, 11.5, 12, 8.5, 0)
  const r = clip(49, 11.5, 11.4, 8)
  r.rect(36, 0, 28, 24, 2) // blood sky
  r.rect(36, 0, 28, 6, 0)
  r.dither(36, 6, 28, 2, 0, -1)
  r.disc(56, 7, 2.5, 8), r.px(55, 6, 14) // red moon
  // ruined skyline
  r.rect(38, 12, 4, 9, 5), r.rect(43, 9, 4, 12, 5), r.rect(47, 14, 3, 7, 5), r.rect(51, 11, 4, 10, 5), r.rect(56, 14, 5, 7, 5)
  r.px(43, 8, 5), r.px(46, 8, 5), r.px(51, 10, 5), r.px(38, 11, 5)
  r.px(44, 11, 10), r.px(45, 14, 9), r.px(52, 13, 10), r.px(57, 16, 9) // burning windows
  r.rect(36, 18, 28, 4, 0)
  // a skull in the crosshair
  r.ellipse(49, 11, 2.5, 2, 7), r.rect(48, 13, 3, 1, 6)
  r.px(48, 11, 0), r.px(50, 11, 0), r.px(49, 13, 0), r.px(47, 10, 7)
  r.ring(49, 11.5, 4.5, 4.5, 8)
  r.vline(49, 3, 3, 8), r.vline(49, 18, 3, 8), r.hline(41, 11, 3, 8), r.hline(55, 11, 3, 8)

  // clash spark where the bubbles collide
  p.poly([[32, 2], [34, 8], [37, 6], [35, 12], [38, 13], [33, 20], [33, 14], [29, 15], [31, 9], [28, 8]], 10)
  p.poly([[32, 6], [33, 10], [35, 11], [33, 15], [31, 13], [30, 10]], 7)
  p.px(28, 1, 9), p.px(38, 2, 9), p.px(27, 18, 9), p.px(39, 18, 9)

  // the design sheet, torn down the middle
  p.poly([[23, 37], [30, 36], [29, 39], [31, 41], [29, 44], [24, 46]], 7)
  p.line(29, 39, 31, 41, 6), p.line(31, 41, 29, 44, 6), p.line(24, 46, 29, 44, 6)
  p.line(25, 39, 28, 39, 14), p.line(25, 41, 27, 42, 14), p.px(26, 43, 11)
  p.poly([[34, 36], [41, 37], [40, 46], [35, 44], [33, 41], [35, 39]], 6)
  p.line(34, 36, 41, 37, 7), p.line(35, 39, 33, 41, 7)
  p.line(36, 40, 39, 39, 5), p.line(36, 42, 39, 43, 5), p.px(37, 44, 8)
  p.px(32, 38, 7), p.px(32, 43, 6) // scraps

  // designer: short brown hair, orange sweater, facing right
  p.poly([[1, 48], [3, 41], [7, 38], [15, 38], [19, 40], [21, 47]], 9)
  p.poly([[15, 39], [19, 40], [21, 47], [14, 47]], 4)
  p.line(3, 41, 6, 38, 10)
  p.poly([[16, 40], [24, 39], [24, 42], [17, 43]], 9) // arm out to the sheet
  p.hline(17, 43, 7, 4)
  p.rect(23, 38, 3, 4, 15), p.vline(25, 39, 3, 4)
  p.ellipse(11, 31, 6, 6, 0)
  p.ellipse(11, 31, 5.5, 5.5, 4)
  p.ellipse(12.5, 32.5, 4.5, 4.5, 15)
  p.rect(7, 26, 10, 3, 4), p.px(16, 29, 4), p.px(13, 29, 4)
  p.px(8, 26, 9), p.px(9, 26, 9), p.px(7, 27, 9) // hair shine
  p.px(17, 33, 15), p.px(17, 32, 15) // nose
  p.line(13, 29, 15, 30, 0) // angry brow
  p.px(15, 31, 0), p.px(14, 31, 7)
  p.rect(15, 34, 3, 2, 0), p.px(16, 35, 8) // shouting
  p.px(8, 32, 4), p.px(8, 33, 4) // ear
  p.vline(16, 34, 2, 4), p.hline(10, 36, 5, 4) // jaw shadow
  p.sprite(5, 24, ['8.8', '.8.', '8.8']) // anger mark

  // programmer: grey hoodie, round glasses, brown hair, facing left
  p.poly([[63, 48], [61, 41], [57, 38], [49, 38], [45, 40], [43, 47]], 6)
  p.poly([[57, 38], [61, 41], [63, 48], [56, 47]], 5)
  p.line(45, 40, 49, 38, 7)
  p.ellipse(53, 38.5, 5, 1.5, 5) // hood
  p.poly([[48, 40], [40, 39], [40, 42], [47, 43]], 6)
  p.hline(40, 43, 8, 5)
  p.rect(38, 38, 3, 4, 15), p.vline(40, 39, 3, 4)
  p.px(48, 41, 7), p.px(48, 42, 7) // drawstring
  p.ellipse(53, 31, 6, 6, 0)
  p.ellipse(53, 31, 5.5, 5.5, 4)
  p.ellipse(51.5, 32.5, 4.5, 4.5, 15)
  p.rect(47, 26, 10, 3, 4), p.px(47, 29, 4), p.px(50, 29, 4), p.px(56, 25, 4), p.px(58, 26, 4)
  p.px(49, 26, 9), p.px(50, 26, 9), p.px(52, 25, 9)
  p.px(47, 33, 15), p.px(47, 32, 15) // nose
  p.rect(48, 30, 4, 3, 0), p.rect(49, 31, 2, 1, 12), p.px(49, 31, 7) // glasses
  p.hline(52, 31, 3, 0)
  p.line(48, 29, 50, 30, 0)
  p.rect(46, 34, 3, 2, 0), p.px(47, 35, 8)
  p.vline(56, 32, 2, 4) // ear
  p.vline(57, 30, 5, 2), p.hline(50, 36, 5, 4)
  p.sprite(57, 22, ['8.8', '.8.', '8.8'])
}
