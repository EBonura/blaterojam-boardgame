// A cute fantasy-console handheld with a cartridge in its top, smiling on its screen, standing on its 16-colour palette strip.
// No logos. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]
export default function draw({ px }) {
  const p = pen(px)
  // cartridge sticking out of the top slot
  p.rect(22, 0, 20, 7, 6)
  p.vline(22, 0, 7, 7), p.rect(39, 0, 3, 7, 5), p.vline(42, 0, 7, 0)
  p.rect(25, 1, 12, 4, 1)
  for (const [x, c] of [[26, 8], [29, 9], [32, 11], [35, 12]]) p.rect(x, 2, 2, 2, c)
  // shadow cast on the palette strip
  p.rect(10, 37, 48, 2, 0)
  // body: rounded, coral red, lit from the top left
  p.rect(9, 6, 46, 31, 8)
  p.rect(8, 7, 48, 29, 8)
  p.hline(9, 6, 45, 14), p.vline(8, 7, 28, 14), p.px(9, 7, 7), p.px(10, 7, 14)
  p.hline(9, 36, 46, 2), p.vline(55, 7, 29, 2), p.px(54, 35, 2)
  p.vline(54, 8, 27, 2), p.hline(10, 35, 44, 2)
  // screen bezel and screen
  p.rect(18, 9, 28, 20, 0)
  p.hline(18, 28, 28, 14), p.vline(45, 9, 20, 14)
  p.rect(20, 11, 24, 16, 1)
  p.rect(20, 25, 24, 2, 0), p.dither(20, 24, 24, 1, 0, -1)
  // a friendly face on the screen
  p.sprite(24, 15, ['777.', '7c77', '7777', '.77.'], { c: 12 })
  p.sprite(36, 15, ['777.', '7c77', '7777', '.77.'], { c: 12 })
  p.rect(23, 21, 2, 1, 14), p.rect(39, 21, 2, 1, 14)
  p.sprite(28, 20, ['b......b', '.b....b.', '..bbbb..'], { b: 11 })
  // screen glare
  p.px(21, 12, 7), p.px(22, 12, 6), p.px(21, 13, 6)
  // d-pad
  p.rect(10, 17, 7, 3, 0), p.rect(12, 15, 3, 7, 0)
  p.hline(10, 17, 7, 5), p.vline(12, 15, 2, 5), p.px(13, 18, 5)
  p.px(15, 20, 2), p.px(17, 19, 2)
  // two round buttons
  p.disc(49, 20, 1.5, 12), p.px(48, 19, 7), p.px(50, 21, 13)
  p.disc(51, 15, 1.5, 11), p.px(50, 14, 7), p.px(52, 16, 3)
  // speaker holes and a small power light
  for (const [x, y] of [[47, 30], [49, 30], [51, 30], [48, 32], [50, 32]]) p.px(x, y, 2)
  p.px(12, 11, 11), p.px(13, 11, 3)
  p.rect(26, 31, 3, 2, 2), p.rect(35, 31, 3, 2, 2)
  // the 16-colour palette strip on light rails
  p.rect(0, 39, 64, 1, 7), p.rect(0, 46, 64, 1, 5), p.rect(0, 47, 64, 1, 0)
  for (let c = 0; c < 16; c++) p.rect(c * 4, 40, 4, 6, c)
  for (let c = 0; c < 16; c++) p.px(c * 4, 40, c === 7 ? 6 : 7)
  p.rect(0, 40, 4, 6, 0), p.px(0, 40, 5)
  // the console's own shadow over the top of the swatches
  p.dither(10, 40, 46, 1, 0, -1)
}
