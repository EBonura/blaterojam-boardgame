// A film strip of four frames: a ball dropping, stretching, squashing on the ground and bouncing back up,
// with onion skins of the previous pose and a pencil lying across the strip. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]
export default function draw({ px }) {
  const p = pen(px)
  // the strip: dark film, lit top edge, light shining through the sprocket holes
  p.rect(0, 4, 64, 37, 0)
  p.hline(0, 4, 64, 5), p.hline(0, 40, 64, 1)
  for (let x = 2; x < 64; x += 5) p.rect(x, 6, 3, 3, 6), p.hline(x, 6, 3, 7), p.rect(x, 36, 3, 3, 6), p.hline(x, 36, 3, 7)
  // four frames on peach paper, each with a ground strip
  const F = [1, 17, 33, 49], W = 14, T = 11, B = 34
  for (const x0 of F) {
    p.rect(x0, T, W, B - T + 1, 15)
    p.hline(x0, T, W, 7)
    p.rect(x0, 30, W, 5, 4), p.hline(x0, 30, W, 9), p.dither(x0, 32, W, 3, 2, -1)
  }
  // ball helper: red with a highlight and a shaded lower right
  const ball = (cx, cy, rx, ry) => {
    p.ellipse(cx, cy, rx, ry, 8)
    p.ellipse(cx + 1, cy + 1, rx - 1, ry - 1, 8)
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const u = (x - cx) / (rx + 0.5), v = (y - cy) / (ry + 0.5)
        if (u * u + v * v <= 1 && u + v > 0.7) p.px(x, y, 2)
      }
    p.px(cx - rx + 1, cy - ry + 1, 14), p.px(cx - rx + 2, cy - ry + 1, 7)
  }
  const shadow = (cx, w) => p.hline(cx - (w >> 1), 30, w, 2)
  // frame 1: ball high up, small shadow
  shadow(8, 4), ball(8, 15, 3, 3)
  // frame 2: onion skin of frame 1, ball falling and stretched, speed marks
  p.ellipse(24, 15, 3, 3, 14)
  p.vline(21, 18, 3, 13), p.vline(27, 19, 2, 13)
  shadow(24, 6), ball(24, 24, 2, 4)
  // frame 3: squashed flat on the ground, dust puffs
  p.ellipse(40, 24, 2, 4, 14)
  ball(40, 28, 5, 2)
  p.px(34, 28, 6), p.px(35, 27, 6), p.px(46, 28, 6), p.px(45, 27, 6)
  // frame 4: bounced back up, round again, motion lines below
  p.ellipse(56, 28, 5, 2, 14)
  shadow(56, 6), ball(56, 18, 3, 3)
  p.vline(54, 23, 3, 13), p.vline(58, 23, 2, 13)
  // pencil lying across the bottom of the strip
  p.line(14, 46, 50, 41, 10)
  p.line(14, 47, 50, 42, 9)
  p.line(15, 45, 49, 40, 10)
  p.line(16, 44, 47, 40, 7)
  p.sprite(50, 39, ['44..', '4f4.', 'f4ff', '.f00', '..00'].map((r) => r), { f: 15 })
  p.sprite(10, 45, ['.ee', 'eee', 'e2.'], { e: 14 })
  p.px(13, 45, 6), p.px(13, 46, 6), p.px(13, 47, 5)
}
