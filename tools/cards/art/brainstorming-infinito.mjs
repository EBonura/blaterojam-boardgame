// Endless brainstorming: a whiteboard spiral that never ends, drowning under sticky notes, and the
// game designer buried in the pile on the floor with only an arm and a marker sticking out. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // whiteboard on legs
  p.rect(5, 40, 2, 6, 5), p.rect(57, 40, 2, 6, 5)
  p.rect(3, 2, 58, 37, 5)
  p.rect(3, 2, 57, 36, 6)
  p.hline(3, 2, 57, 7), p.vline(3, 2, 36, 7)
  p.rect(5, 4, 53, 32, 7)
  p.dither(40, 4, 18, 32, 6, -1) // faint smudge of old ideas wiped away
  p.rect(5, 4, 53, 32, 7)
  p.rect(4, 38, 56, 2, 5), p.hline(4, 38, 56, 6) // tray
  p.rect(10, 37, 4, 1, 8), p.rect(16, 37, 4, 1, 12)

  // the endless spiral in blue marker
  for (let t = 0.6; t < 26; t += 0.03) {
    const r = 0.52 * t
    p.px(Math.round(31 + r * Math.cos(t)), Math.round(20 + 0.95 * r * Math.sin(t)), 12)
  }
  p.px(31, 20, 1)

  // sticky notes: coloured square, darker fold corner, a scribble
  const dark = { 10: 9, 14: 8, 11: 3, 12: 13, 9: 4 }
  const note = (x, y, c) => {
    p.rect(x, y, 6, 6, c)
    p.hline(x, y, 6, 7)
    p.vline(x + 5, y + 1, 5, dark[c])
    p.px(x + 4, y + 5, dark[c]), p.px(x + 5, y + 5, 5)
    p.hline(x + 1, y + 2, 3, dark[c]), p.hline(x + 1, y + 4, 2, dark[c])
  }
  const notes = [[6, 5, 10], [13, 4, 14], [44, 5, 11], [51, 7, 9], [7, 13, 11], [50, 15, 10], [6, 22, 14], [51, 23, 14],
    [14, 27, 9], [42, 27, 12], [21, 5, 9], [36, 4, 10], [24, 29, 11], [33, 30, 14], [45, 14, 12], [14, 15, 12]]
  for (const [x, y, c] of notes) note(x, y, c)
  // red arrows linking ideas to more ideas
  p.line(12, 8, 13, 8, 8), p.line(19, 10, 21, 13, 8), p.px(21, 12, 8), p.px(20, 13, 8)
  p.line(50, 12, 46, 14, 8), p.line(12, 26, 14, 28, 8)

  // the pile on the floor
  p.rect(0, 46, 64, 2, 1)
  const pile = [[0, 42, 14], [5, 40, 10], [10, 42, 11], [15, 41, 9], [20, 42, 12], [25, 40, 10], [30, 42, 14],
    [35, 41, 11], [40, 42, 10], [45, 40, 9], [50, 42, 14], [55, 41, 12], [59, 42, 11], [8, 44, 9], [18, 44, 14], [28, 44, 11], [38, 44, 12], [48, 44, 10], [2, 45, 12], [56, 45, 10]]
  for (const [x, y, c] of pile) note(x, y, c)
  // the designer's arm sticking out of the pile, marker in hand
  p.rect(36, 31, 4, 9, 9), p.vline(39, 31, 9, 4), p.vline(36, 31, 9, 10) // orange sleeve
  p.rect(36, 30, 4, 1, 4)
  p.rect(35, 26, 5, 4, 15), p.vline(39, 26, 4, 4), p.px(35, 26, 4)
  p.rect(36, 21, 2, 5, 0), p.px(36, 21, 5), p.rect(36, 24, 2, 1, 8) // marker
  // notes still drifting down
  p.rect(27, 36, 5, 4, 10), p.hline(27, 36, 5, 7), p.px(31, 39, 9)
  p.rect(50, 32, 4, 4, 14), p.px(53, 35, 8)
}
