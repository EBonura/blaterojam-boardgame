// The programmer, hood up, behind a laptop late at night: round glasses full of blue screen glare,
// tired eyes, a rubber duck for debugging and a mug of coffee on the desk. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // night window behind, low contrast
  p.rect(3, 3, 15, 15, 1)
  p.rect(4, 4, 13, 13, 0)
  p.vline(10, 4, 13, 1), p.hline(4, 10, 13, 1)
  p.disc(14, 7, 1.5, 6), p.px(13, 6, 7), p.px(15, 8, 13)
  p.px(6, 6, 13), p.px(8, 13, 5), p.px(15, 14, 5)
  p.hline(2, 18, 17, 5)

  // the programmer
  const b = layer()
  // shoulders and body of the hoodie
  b.poly([[9, 41], [14, 27], [21, 23], [43, 23], [50, 27], [55, 41]], 6)
  b.poly([[36, 23], [43, 23], [50, 27], [55, 41], [40, 41]], 5)
  b.line(14, 28, 10, 40, 7)
  b.line(15, 27, 20, 24, 7)
  // hood
  b.ellipse(32, 14, 12, 12, 6)
  for (let y = 2; y < 27; y++) for (let x = 33; x < 45; x++) if (b.grid[y][x] === 6 && x + y > 48) b.px(x, y, 5)
  for (const [x, y] of [[22, 8], [21, 10], [21, 12], [21, 14], [22, 6], [24, 4], [26, 3]]) b.px(x, y, 7)
  // dark inside of the hood
  b.ellipse(32, 15, 8, 9, 0)
  // face
  b.ellipse(32, 16, 6.5, 7, 15)
  for (let y = 9; y < 24; y++) for (let x = 35; x < 40; x++) if (b.grid[y][x] === 15 && x - 35 > (y < 12 || y > 20 ? 1 : 2)) b.px(x, y, 4)
  // hair fringe under the hood
  b.sprite(25, 8, [
    '..44444444444.',
    '.4949444444442',
    '.44.4444.44.42',
  ])
  // round glasses with screen glare
  b.ring(29, 15, 2, 2, 0)
  b.ring(35, 15, 2, 2, 0)
  b.rect(28, 14, 3, 3, 12), b.rect(34, 14, 3, 3, 12)
  b.px(28, 14, 7), b.px(34, 14, 7)
  b.px(30, 16, 13), b.px(36, 16, 13)
  b.hline(32, 15, 1, 0)
  // tired bags under the eyes, flat mouth, a bit of stubble
  b.hline(28, 18, 3, 13), b.hline(34, 18, 3, 13)
  b.hline(31, 21, 3, 4)
  // hoodie strings
  b.vline(28, 24, 5, 7), b.px(28, 29, 6)
  b.vline(36, 24, 5, 6), b.px(36, 29, 5)
  // hands on the keyboard
  b.rect(13, 37, 4, 3, 15), b.hline(13, 39, 4, 4)
  b.rect(47, 37, 4, 3, 15), b.hline(47, 39, 4, 4)
  b.outline(0)
  b.stamp(px)

  // laptop lid seen from behind, a </> sticker and a small bug sticker
  p.rect(17, 28, 30, 13, 6)
  p.hline(17, 28, 30, 7)
  p.vline(17, 28, 13, 7)
  p.rect(43, 29, 4, 12, 5)
  p.hline(17, 40, 30, 5)
  p.sprite(21, 31, [
    '..c.....c...c..',
    '.c.....c.....c.',
    'c.....c.......c',
    '.c...c.......c.',
    '..c.c.......c..',
  ], { c: 12 })
  p.sprite(37, 34, ['5.5', '888', '828', '.8.'])

  // desk
  p.rect(0, 41, 64, 7, 4)
  p.hline(0, 41, 64, 9)
  p.hline(0, 43, 64, 2)
  p.rect(0, 44, 64, 4, 4)
  p.hline(0, 47, 64, 2)
  p.hline(18, 42, 30, 2) // laptop shadow

  // rubber duck, for debugging
  p.sprite(2, 32, [
    '...aaa....',
    '..aa0aa...',
    '..aaaa99..',
    '..aaaa....',
    'aaaaaaaa..',
    'a9aaaaa9..',
    '.a9999a...',
    '..9999....',
  ], { a: 10 })
  p.hline(3, 40, 7, 2)

  // mug of coffee with steam
  p.rect(53, 32, 7, 9, 7)
  p.rect(58, 32, 2, 9, 6)
  p.hline(53, 32, 7, 6)
  p.hline(54, 33, 5, 4)
  p.vline(53, 33, 7, 7)
  p.rect(60, 34, 2, 1, 6), p.vline(61, 35, 3, 6), p.hline(60, 38, 2, 6)
  p.rect(54, 36, 3, 2, 12)
  p.hline(53, 40, 7, 5)
  for (const [x, y] of [[55, 30], [56, 29], [56, 28], [55, 27], [55, 26], [56, 25], [58, 29], [59, 28], [58, 27]]) p.px(x, y, 5)
}
