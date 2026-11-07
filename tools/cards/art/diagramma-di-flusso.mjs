// A flowchart on a dotted diagram canvas: a start pill, a decision diamond with a question mark,
// "yes" leads to a tick and a trophy, "no" to a red cross whose dashed arrow loops back to the start. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // the canvas: a faint dot grid
  for (let y = 1; y < 48; y += 4) for (let x = 1; x < 64; x += 4) p.px(x, y, 1)

  // connectors (white) with arrow heads
  const down = (x, y) => { p.hline(x - 2, y - 2, 5, 7), p.hline(x - 1, y - 1, 3, 7), p.px(x, y, 7) }
  p.vline(32, 9, 3, 7), down(32, 13)
  p.hline(11, 21, 12, 7), p.vline(11, 21, 4, 7), down(11, 26)
  p.hline(42, 21, 11, 7), p.vline(53, 21, 4, 7), down(53, 26)
  p.vline(11, 37, 1, 7), down(11, 40)
  // the "no" loop: dashed, back up to the start
  for (let y = 31; y > 4; y -= 3) p.vline(61, y - 1, 2, 6)
  for (let x = 60; x > 43; x -= 3) p.hline(x - 1, 5, 2, 6)
  p.px(43, 4, 6), p.px(42, 5, 6), p.px(43, 6, 6)
  p.hline(59, 31, 2, 6)

  const s = layer()
  // start pill, a play triangle inside
  s.rect(24, 2, 17, 7, 11)
  s.vline(23, 3, 5, 11), s.vline(41, 3, 5, 11)
  s.hline(24, 8, 17, 3), s.vline(41, 4, 4, 3), s.px(40, 7, 3)
  s.hline(25, 2, 10, 7), s.px(24, 3, 7)
  s.sprite(31, 3, ['7..', '77.', '777', '77.', '7..'])
  // decision diamond with a question mark
  s.poly([[32, 13], [41, 21], [32, 29], [23, 21]], 10)
  s.poly([[41, 21], [32, 29], [32, 28], [40, 21]], 9)
  s.line(36, 25, 32, 28, 9), s.line(40, 22, 33, 28, 9)
  s.line(24, 20, 31, 14, 7)
  s.sprite(30, 17, ['.444.', '4...4', '...4.', '..4..', '.....', '..4..'])
  // yes: a blue box with a tick
  s.rect(3, 27, 17, 10, 12)
  s.hline(3, 27, 17, 7), s.vline(3, 27, 10, 7)
  s.hline(3, 36, 17, 13), s.vline(19, 28, 9, 13)
  s.sprite(7, 29, ['.......77', '......77.', '77...77..', '.77.77...', '..777....'])
  // no: a red box with a cross
  s.rect(45, 27, 17, 10, 8)
  s.hline(45, 27, 17, 14), s.vline(45, 27, 10, 14)
  s.hline(45, 36, 17, 2), s.vline(61, 28, 9, 2)
  s.sprite(50, 29, ['77...77', '.77.77.', '..777..', '.77.77.', '77...77'])
  // the goal: a trophy
  s.sprite(5, 41, [
    '.aaaaaaaaa.',
    'a77aaaaa9.a',
    'a.7aaaaa9.a',
    '.a.aaaa9.a.',
    '....a99....',
    '.....9.....',
    '...44444...',
  ], { a: 10 })
  s.outline(0)
  // drop shadows down-right
  const g = s.grid
  for (let y = 47; y >= 0; y--) for (let x = 63; x >= 0; x--) if (g[y][x] >= 0 && x + 1 < 64 && y + 1 < 48 && g[y + 1]?.[x + 1] < 0) p.px(x + 1, y + 1, 1)
  s.stamp(px)
}
