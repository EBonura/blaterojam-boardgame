// The game designer at the whiteboard, marker in hand, finishing a platformer level plan:
// ground, a spike pit, a jump arc, an enemy, the goal flag, sticky notes. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // floor
  p.rect(0, 44, 64, 4, 1)
  p.hline(0, 44, 64, 5)
  p.hline(0, 47, 64, 0)

  // whiteboard legs and their shadows
  for (const x of [5, 35]) {
    p.rect(x, 35, 2, 10, 5)
    p.vline(x, 35, 10, 6)
    p.hline(x - 1, 45, 4, 0)
  }
  // frame: lit top-left, shaded bottom-right
  p.rect(1, 2, 40, 33, 6)
  p.hline(1, 2, 40, 7)
  p.vline(1, 2, 33, 7)
  p.hline(1, 34, 40, 5)
  p.vline(40, 2, 33, 5)
  // board surface with a little shading and an old eraser smudge
  p.rect(3, 4, 36, 29, 7)
  p.dither(28, 6, 6, 2, 6)
  // marker tray, markers and eraser
  p.rect(1, 35, 40, 2, 5)
  p.hline(1, 35, 40, 6)
  p.hline(5, 34, 4, 12), p.px(8, 34, 7)
  p.hline(10, 34, 4, 3), p.px(13, 34, 7)
  p.rect(27, 33, 6, 2, 4), p.hline(27, 33, 6, 9)

  // ---- the level plan, in blue marker ----
  const ground = (x, y, w) => {
    p.hline(x, y, w, 12)
    for (let i = 0; i < w; i++) for (let j = 2; j < 32 - y; j += 2) if ((i + j) % 4 === 0) p.px(x + i, y + j, 13)
  }
  ground(4, 27, 10)
  p.vline(13, 27, 5, 12)
  ground(20, 27, 8)
  p.vline(20, 27, 5, 12)
  ground(28, 22, 10)
  p.vline(28, 22, 10, 12)
  // spike pit (red)
  for (let x = 14; x < 20; x++) p.px(x, x % 2 ? 30 : 31, 8)
  p.hline(14, 31, 6, 8)
  // floating platform with two coins
  p.hline(15, 18, 8, 12)
  p.hline(16, 19, 6, 13)
  p.rect(17, 15, 2, 2, 9), p.rect(21, 15, 2, 2, 9)
  // the hero (a little red blob) at the start
  p.rect(6, 24, 3, 3, 8), p.px(7, 23, 8), p.px(8, 25, 7)
  // dotted jump arc over the pit onto the platform, with an arrow head
  for (const [x, y] of [[9, 21], [10, 19], [11, 17], [12, 15], [14, 14], [16, 13], [18, 13], [20, 13]]) p.px(x, y, 8)
  p.px(19, 12, 8), p.px(19, 14, 8)
  // enemy patrolling the middle ground, with a patrol arrow
  p.rect(22, 24, 4, 3, 2), p.hline(23, 23, 2, 2), p.px(23, 25, 7), p.px(25, 25, 7)
  p.hline(21, 21, 6, 5), p.px(26, 20, 5), p.px(26, 22, 5)
  // goal flag, still being drawn
  p.vline(32, 11, 11, 5)
  p.rect(33, 11, 3, 3, 11), p.hline(33, 14, 2, 11), p.px(35, 13, 3)

  // sticky notes (with a dash of scribble and a soft shadow)
  const note = (x, y, c, dark, lines) => {
    p.rect(x + 1, y + 1, 7, 6, 6)
    p.rect(x, y, 7, 6, c)
    p.hline(x, y + 5, 7, dark)
    p.px(x + 6, y + 5, 6)
    for (const [lx, ly, w] of lines) p.hline(x + lx, y + ly, w, dark === 9 ? 4 : 2)
  }
  note(4, 6, 10, 9, [[1, 1, 4], [1, 3, 3]])
  note(12, 5, 14, 8, [[1, 2, 2], [4, 2, 1]])
  note(22, 8, 10, 9, [[1, 1, 5], [1, 3, 2]])
  // the "?" note points at the enemy
  for (let y = 15; y < 21; y += 2) p.px(25, y, 5)

  // ---- the designer, facing the board ----
  const d = layer()
  // trousers
  d.rect(46, 33, 10, 4, 5)
  d.rect(46, 37, 4, 7, 5)
  d.rect(52, 37, 4, 7, 5)
  d.vline(46, 33, 11, 6)
  d.vline(55, 33, 11, 0), d.vline(49, 37, 7, 0)
  // shoes
  d.rect(44, 43, 6, 2, 4), d.hline(44, 43, 5, 9)
  d.rect(51, 43, 6, 2, 4), d.hline(51, 43, 5, 9)
  // sweater body
  d.rect(44, 20, 14, 14, 9)
  d.hline(45, 19, 12, 9)
  d.rect(55, 20, 3, 14, 4)
  d.hline(44, 33, 14, 4)
  d.vline(44, 20, 13, 10)
  d.rect(49, 19, 4, 2, 4) // neckline
  // back arm hanging, holding a pad of sticky notes
  d.rect(56, 22, 3, 9, 4)
  d.rect(56, 31, 3, 2, 15)
  d.rect(57, 30, 4, 4, 10), d.hline(57, 33, 4, 9)
  // raised arm reaching to the board
  d.poly([[44, 21], [48, 21], [42, 13], [39, 15]], 9)
  d.line(47, 22, 42, 16, 4)
  d.line(44, 20, 40, 15, 10)
  d.rect(39, 12, 3, 3, 15), d.px(41, 14, 4) // hand
  d.line(37, 12, 39, 14, 7) // marker barrel
  d.px(36, 12, 3) // green tip on the flag
  // neck and head
  d.rect(49, 17, 4, 3, 15), d.vline(52, 17, 3, 4)
  d.sprite(44, 5, [
    '...44444442.',
    '..4999444442',
    '.49944444442',
    '.44444444422',
    '.444f4f44422',
    '.4ffffff4f42',
    '.f0ff0ff4f42',
    '.f0ff0fff442',
    '.ffffffff42.',
    '.efffffef4..',
    '.ff22ffff4..',
    '..ffffff4...',
  ])
  d.outline(0)
  d.stamp(px)
  // the stroke the marker just left on the flag
  // floor shadow under the designer
  p.hline(43, 45, 18, 0)
}
