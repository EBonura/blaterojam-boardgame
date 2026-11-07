// MMORPG: a raid in a lava cavern. A huge horned demon boss with glowing eyes towers over a crowd of tiny adventurers
// (knights, mages, a healer, an archer, one player AFK with a "z"), spells flying; the boss bar on top has barely
// moved, party chat scrolls in the corner.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // cavern: dark rock, lava glow at the back, cracks of lava in the floor
  p.rect(0, 0, 64, 48, 1)
  p.rect(0, 6, 64, 18, 2)
  p.dither(0, 6, 64, 2, 1, 2)
  p.dither(0, 20, 64, 4, 4, 2)
  p.rect(0, 24, 64, 3, 9)
  p.hline(0, 24, 64, 10)
  p.dither(0, 26, 64, 1, 4, 9)
  // stalactites
  for (const [x, h] of [[3, 8], [10, 5], [52, 7], [59, 10], [46, 4], [17, 3]]) p.poly([[x - 2, 6], [x + 2, 6], [x, 6 + h]], 1)
  // floor
  p.rect(0, 27, 64, 21, 5)
  p.hline(0, 27, 64, 4)
  p.dither(0, 28, 64, 2, 4, 5)
  for (const [x0, y0, x1, y1] of [[2, 33, 9, 36], [9, 36, 12, 41], [52, 31, 58, 35], [58, 35, 63, 34], [26, 44, 34, 46]]) {
    p.line(x0, y0, x1, y1, 9)
    p.line(x0, y0 + 1, x1, y1 + 1, 2)
  }

  // the boss: horned red demon, lit from top-left, glowing yellow eyes, open maw
  const b = layer()
  b.ellipse(17, 16, 13, 12, 8)
  b.rect(5, 16, 25, 12, 8)
  // horns
  b.poly([[6, 8], [1, 0], [3, 0], [10, 6]], 7)
  b.poly([[28, 8], [33, 0], [31, 0], [24, 6]], 6)
  b.line(2, 1, 6, 6, 6), b.line(32, 1, 28, 6, 5)
  // shading: right side plum, top-left pink highlight
  for (let y = 0; y < 30; y++) for (let x = 0; x < 36; x++) {
    if (b.grid[y]?.[x] !== 8) continue
    if (x - 17 + (y - 14) * 0.4 > 7) b.px(x, y, 2)
    else if (x - 17 + (y - 14) * 0.6 < -9 && y < 18) b.px(x, y, 14)
  }
  // brow, eyes, maw with teeth
  b.hline(9, 11, 6, 2), b.hline(20, 11, 6, 2)
  b.rect(10, 12, 4, 2, 10), b.rect(21, 12, 4, 2, 10)
  b.px(10, 12, 7), b.px(21, 12, 7)
  b.rect(11, 17, 13, 6, 0)
  for (let x = 12; x < 23; x += 2) b.px(x, 17, 7), b.px(x + 1, 22, 7)
  b.hline(12, 20, 11, 2)
  // claws reaching forward
  b.rect(0, 22, 5, 5, 8), b.rect(30, 22, 5, 5, 2)
  b.sprite(0, 27, ['7.7.7'])
  b.sprite(30, 27, ['6.6.6'])
  b.outline(0)
  b.stamp(px, 14, 4)
  // eye glow
  p.px(23, 15, 10), p.px(37, 15, 10)

  // boss health bar, barely moved
  p.rect(6, 0, 52, 4, 0)
  p.rect(7, 1, 50, 2, 2)
  p.rect(7, 1, 47, 2, 8)
  p.hline(7, 1, 47, 14)
  p.px(4, 1, 8), p.px(5, 2, 8), p.px(4, 2, 2)

  // tiny adventurers: helmet/hat, face, body; each with a name bar
  const hero = (x, y, hat, body, tag) => {
    p.sprite(x, y, ['hhh', '.f.', 'bbb', 'b.b'], { h: hat, f: 15, b: body })
    p.hline(x, y - 2, 3, tag)
  }
  const party = [
    [5, 37, 6, 12, 11], [12, 41, 6, 6, 11], [20, 43, 13, 13, 12], [28, 44, 7, 7, 11],
    [37, 43, 3, 3, 11], [45, 42, 9, 4, 12], [52, 39, 6, 12, 11], [58, 34, 13, 2, 12], [2, 30, 11, 3, 11],
  ]
  for (const [x, y, h, bd, t] of party) hero(x, y, h, bd, t)
  // the AFK one sitting at the back, snoozing
  p.sprite(60, 42, ['eee', '.f.', 'eee'], { e: 14, f: 15 })
  p.px(61, 40, 7), p.px(62, 39, 6)

  // spells: a fireball, a frost bolt, arrows, a heal beam
  p.line(9, 35, 16, 30, 12), p.px(17, 29, 7)
  p.sprite(23, 36, ['.a.', 'a9a', '.8.'], { a: 10 }), p.px(24, 40, 9)
  p.line(39, 41, 41, 35, 4), p.px(41, 34, 7)
  p.line(53, 37, 47, 31, 13), p.px(46, 30, 7)
  for (const [x, y] of [[28, 41], [30, 40], [26, 39], [29, 38]]) p.px(x, y, 11)
  // hit sparks on the boss
  for (const [x, y] of [[18, 28], [44, 26], [33, 32]]) p.sprite(x - 1, y - 1, ['.7.', '7a7', '.7.'], { a: 10 })

  // party chat box
  p.rect(0, 43, 15, 5, 0)
  p.hline(1, 44, 5, 12), p.hline(7, 44, 6, 7)
  p.hline(1, 46, 4, 11), p.hline(6, 46, 8, 6)
}
