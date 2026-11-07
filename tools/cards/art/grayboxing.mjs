// A level blocked out in grey boxes: a ramp, a step, a tall block with a placeholder goal sphere,
// and a lone orange player capsule with its planned jump traced in dots. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]
export default function draw({ px }) {
  const p = pen(px)
  // a box in oblique view: front face with a faint grid, lit top shifted up-right, shadowed right side
  const box = (x, yb, w, h, d) => {
    const y = yb - h + 1
    p.rect(x, y, w, h, 6)
    for (let gx = x + 4; gx < x + w; gx += 4) p.vline(gx, y + 1, h - 1, 13)
    for (let gy = yb - 4; gy > y; gy -= 4) p.hline(x, gy, w, 13)
    for (let i = 1; i <= d; i++) p.vline(x + w - 1 + i, y - i + 1, h, 5)
    for (let i = 1; i <= d; i++) p.hline(x + i, y - i, w, 7)
    p.hline(x, y, w, 15)
    p.px(x + d, y - d, 7)
    for (let i = 1; i <= d; i++) p.px(x + w - 1 + i, yb - i + 1, 0)
    p.vline(x + w - 1 + d + 1, y - d, h, 0)
  }
  // floor slab: dark grey top with a grid, darker front
  const FD = 7
  for (let i = 0; i < FD; i++) p.hline(i, 38 - i, 56, 5)
  for (let x = 2; x < 64; x += 6) for (let i = 0; i < FD; i++) p.px(x + i, 38 - i, 13)
  for (let i = 1; i < FD; i += 3) p.hline(i, 38 - i, 56, 13)
  p.rect(0, 39, 56, 5, 13), p.rect(0, 41, 56, 3, 5), p.hline(0, 44, 56, 0)
  for (let i = 1; i <= FD; i++) p.vline(55 + i, 39 - i, 5, i === FD ? 0 : 1)
  // tall block on the left
  box(3, 36, 12, 26, 5)
  // ramp up to the step: sloped top in the light
  p.poly([[17, 36], [27, 36], [27, 27]], 6)
  for (let i = 1; i <= 4; i++) p.line(17 + i, 36 - i, 27 + i, 27 - i, 7)
  p.line(17, 36, 27, 27, 15)
  for (let i = 1; i <= 4; i++) p.vline(27 + i, 27 - i, 10, 5)
  p.vline(32, 23, 10, 0)
  // the step the player stands on
  box(28, 36, 10, 10, 4)
  // a wider mid block on the right
  box(43, 35, 12, 17, 5)
  // placeholder goal sphere on top of the tall block
  p.disc(11, 4, 3, 10), p.px(10, 3, 7), p.px(9, 4, 7), p.px(13, 6, 9), p.px(12, 7, 9), p.px(14, 5, 9)
  // player capsule on the step, with its planned jump traced in dots
  p.sprite(31, 14, [
    '.00000.',
    '0999990',
    '0f99940',
    '0f99940',
    '0999940',
    '0999940',
    '0999940',
    '0999440',
    '.00000.',
  ], { f: 15 })
  p.hline(31, 23, 7, 5)
  for (const [x, y] of [[38, 12], [40, 9], [43, 7], [46, 6], [49, 7], [51, 9], [52, 12]]) p.px(x, y, 10)
  p.sprite(51, 13, ['a.a', '.a.'], { a: 10 })
}
