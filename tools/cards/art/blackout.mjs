// Blackout: a sneaker snags the cable, the plug jumps out of the socket in a shower of sparks,
// the monitor dies to one dot and worried eyes blink in the dark. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // a dark room: wall, skirting and floor in the dimmest tones
  p.rect(0, 0, 64, 38, 0)
  // the only light: the sparks glowing on the wall
  for (let y = 0; y < 38; y++) for (let x = 0; x < 64; x++) {
    const d = Math.hypot(x - 44, (y - 21) * 1.2)
    if (d < 14 || (d < 16 && (x + y) % 2)) p.px(x, y, 1)
    if (d < 6) p.px(x, y, 2)
  }
  p.rect(0, 38, 64, 10, 0)
  p.hline(0, 38, 64, 5)

  // the dead monitor on the left, one last dot fading on the glass
  p.rect(2, 8, 22, 17, 5)
  p.hline(2, 8, 22, 13), p.vline(2, 8, 17, 13)
  p.vline(23, 9, 16, 1), p.hline(3, 24, 21, 1)
  p.rect(4, 10, 18, 13, 0)
  p.px(13, 16, 7), p.px(12, 16, 13), p.px(14, 16, 13), p.px(13, 15, 13), p.px(13, 17, 13)
  p.rect(11, 25, 4, 3, 5), p.rect(8, 28, 10, 1, 5)
  p.rect(0, 29, 30, 2, 5), p.hline(0, 29, 30, 13) // desk edge

  // eyes in the dark under the desk: three pairs, wide open, one sweating
  const eyes = (x, y) => { p.rect(x, y, 2, 2, 7), p.rect(x + 4, y, 2, 2, 7), p.px(x + 1, y + 1, 0), p.px(x + 5, y + 1, 0) }
  eyes(3, 33), eyes(17, 34), eyes(55, 3)
  p.px(25, 33, 12), p.px(25, 32, 12) // sweat drop

  // wall socket on the right, lit by the sparks
  p.rect(46, 14, 13, 17, 5)
  p.rect(47, 15, 11, 15, 6)
  p.hline(47, 15, 11, 7), p.vline(47, 15, 15, 7)
  p.vline(57, 16, 14, 5), p.hline(48, 29, 10, 5)
  p.rect(50, 19, 2, 4, 0), p.rect(54, 19, 2, 4, 0)
  p.disc(52.5, 26, 1, 0)
  p.px(48, 17, 10), p.px(48, 18, 9) // glow on the plate

  // the plug, jumped out mid-air, prongs still glowing
  p.rect(30, 17, 8, 9, 5)
  p.hline(30, 17, 8, 6), p.vline(30, 17, 9, 6)
  p.vline(37, 18, 8, 0), p.hline(31, 25, 7, 0)
  p.hline(32, 20, 4, 0), p.hline(32, 22, 4, 0) // grip ridges
  p.rect(38, 18, 4, 2, 6), p.rect(38, 23, 4, 2, 6)
  p.px(41, 18, 9), p.px(41, 23, 9), p.px(40, 19, 5), p.px(40, 24, 5)

  // sparks between the plug and the socket
  p.poly([[42, 16], [44, 19], [47, 17], [45, 21], [48, 24], [44, 23], [43, 27], [42, 23], [39, 21], [43, 20]], 10)
  p.poly([[43, 19], [45, 20], [44, 23], [42, 21]], 7)
  for (const [x, y, c] of [[40, 14, 9], [46, 12, 10], [49, 13, 9], [45, 28, 9], [39, 27, 10], [48, 26, 10], [38, 12, 10]]) p.px(x, y, c)
  p.line(41, 13, 42, 15, 9), p.line(47, 26, 48, 28, 9)

  // the cable looping down to the floor, round the culprit's sneaker
  p.line(30, 22, 27, 25, 13), p.line(27, 25, 27, 33, 13), p.line(27, 33, 32, 41, 13)
  p.line(32, 41, 40, 42, 13), p.line(40, 42, 44, 39, 13), p.line(44, 39, 46, 44, 13)
  p.line(46, 44, 63, 44, 13)
  p.px(28, 30, 6), p.px(30, 38, 6)
  // the sneaker, mid-trip, and its leg
  p.rect(43, 34, 5, 6, 12), p.vline(47, 34, 6, 1), p.vline(43, 34, 6, 6) // jeans
  p.poly([[40, 40], [48, 39], [52, 41], [52, 43], [40, 43]], 7)
  p.hline(40, 43, 13, 8), p.hline(40, 44, 13, 2)
  p.line(41, 40, 47, 39, 6)
  p.px(44, 41, 8), p.px(46, 41, 8), p.px(48, 41, 8) // laces
  p.line(35, 34, 37, 36, 10), p.line(38, 32, 39, 34, 10) // trip lines
}
