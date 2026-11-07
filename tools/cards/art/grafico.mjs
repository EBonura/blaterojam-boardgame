// The artist: red beret, striped shirt, curly moustache, one eye shut, sizing up the subject with a
// pencil held at arm's length; palette and brush in the other hand, paint on his cheek. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // studio wall: a canvas on an easel behind him, low contrast, a sunset blocked in
  p.vline(4, 6, 42, 5), p.vline(13, 6, 42, 5), p.vline(9, 2, 6, 5)
  p.rect(1, 6, 16, 14, 13)
  p.rect(2, 7, 14, 12, 5)
  p.rect(2, 7, 14, 6, 13)
  p.disc(8, 13, 3, 9)
  p.rect(2, 13, 14, 6, 1)
  p.hline(2, 13, 14, 2)
  p.hline(0, 20, 18, 4)

  const b = layer()
  // shirt: white and blue stripes, shaded on the right
  b.poly([[13, 47], [15, 31], [20, 27], [36, 27], [41, 31], [43, 47]], 7)
  for (let y = 28; y < 48; y++) for (let x = 12; x < 44; x++) {
    if (b.grid[y][x] !== 7) continue
    const blue = y % 4 < 2
    const shade = x > 35 + (y - 28) / 4
    b.px(x, y, blue ? (shade ? 13 : 12) : (shade ? 6 : 7))
  }
  // neck
  b.rect(25, 24, 6, 4, 15), b.rect(29, 24, 2, 4, 4)
  b.hline(25, 27, 6, 4)
  // raised arm, striped sleeve, fist with thumb up
  b.poly([[36, 30], [41, 28], [50, 16], [45, 13], [37, 25]], 7)
  for (let y = 13; y < 31; y++) for (let x = 35; x < 51; x++) {
    if (b.grid[y][x] !== 7) continue
    if (((x - y) % 4 + 4) % 4 < 2) b.px(x, y, x + y > 66 ? 13 : 12)
    else if (x + y > 66) b.px(x, y, 6)
  }
  b.rect(45, 11, 5, 5, 15), b.vline(49, 11, 5, 4), b.hline(45, 15, 4, 4)
  b.vline(50, 12, 2, 15)
  // the pencil, tip up, held at arm's length
  b.rect(46, 2, 2, 9, 10), b.vline(47, 2, 9, 9)
  b.hline(46, 1, 2, 15), b.px(46, 0, 5)
  b.rect(46, 16, 2, 1, 6), b.rect(46, 17, 2, 2, 14)
  // head
  b.ellipse(28, 16, 8.5, 8.5, 15)
  // a thin shadow crescent on the lower right of the face
  for (let y = 12; y < 26; y++) for (let x = 29; x < 38; x++) {
    if (b.grid[y][x] !== 15) continue
    const edge = b.grid[y][x + 1] !== 15 || b.grid[y + 1][x] !== 15 || b.grid[y + 1][x + 1] !== 15
    if (edge) b.px(x, y, 4)
  }
  b.rect(19, 14, 2, 5, 15), b.vline(19, 15, 3, 4) // left ear
  b.rect(37, 14, 2, 5, 15), b.vline(38, 14, 5, 4) // right ear
  // sideburns
  b.rect(20, 11, 2, 3, 4), b.rect(35, 11, 2, 3, 2)
  // beret, tilted, with its stalk
  b.ellipse(28, 8, 11, 3.5, 8)
  b.ellipse(26, 6, 8, 3, 8)
  b.hline(19, 11, 19, 2), b.hline(30, 10, 9, 2)
  b.hline(21, 5, 6, 14), b.px(20, 6, 14)
  b.px(27, 2, 2), b.px(28, 2, 8)
  // a brush tucked behind the ear
  b.line(38, 9, 41, 6, 4), b.px(42, 5, 12)
  // face: one eye open, one squinting, raised brow, curly moustache, blush
  b.hline(22, 13, 3, 4), b.px(21, 14, 4)
  b.rect(23, 15, 2, 2, 0), b.px(23, 15, 7)
  b.hline(30, 14, 4, 4)
  b.hline(30, 17, 4, 0), b.px(29, 16, 0)
  b.px(27, 19, 4), b.px(28, 19, 4)
  b.sprite(21, 19, [
    '0.........0',
    '00.00000.00',
    '.000000000.',
  ])
  b.hline(26, 23, 3, 8)
  b.px(21, 19, 14), b.px(34, 19, 14)
  // palette in the left hand, a brush on it
  b.ellipse(8, 36, 8, 5, 9)
  b.ellipse(10, 38, 6, 3, 4)
  b.ellipse(8, 35, 7, 4, 9)
  b.hline(3, 32, 6, 10)
  b.px(4, 34, 8), b.px(5, 34, 8)
  b.px(8, 33, 12), b.px(9, 33, 12)
  b.px(12, 34, 11), b.px(12, 35, 11)
  b.px(5, 37, 7), b.px(6, 37, 7)
  b.px(9, 37, 14), b.px(10, 37, 14)
  b.rect(13, 37, 2, 2, -1)
  b.rect(13, 35, 3, 3, 15), b.px(15, 37, 4)
  b.line(2, 28, 7, 36, 4), b.px(1, 27, 8), b.px(2, 27, 8)
  b.outline(0)
  b.stamp(px)
}
