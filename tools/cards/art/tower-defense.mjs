// Tower Defense: a wave of creeps with little health bars marching down a winding sandy path toward the base gate,
// while a crystal tower zaps one with lightning, a cannon tower lobs a shell and an archer tower fires; a beaten creep
// drops a coin. Lives and wave pips in the corner.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // dark meadow with tufts and pebbles
  p.rect(0, 0, 64, 48, 3)
  for (let y = 1; y < 48; y += 5) for (let x = (y * 7) % 9; x < 64; x += 9) p.px(x, y, 11), p.px(x + 1, y - 1, 11)
  for (const [x, y] of [[44, 3], [6, 44], [58, 30], [20, 25]]) p.px(x, y, 6), p.px(x + 1, y, 5)

  // the path: in from the top left, across, down the right, back left, out at the bottom to the gate
  const path = [[-2, 7], [42, 7], [42, 22], [14, 22], [14, 37], [48, 37], [48, 48]]
  const W = 3 // half width
  for (let i = 0; i + 1 < path.length; i++) {
    const [x0, y0] = path[i], [x1, y1] = path[i + 1]
    const x = Math.min(x0, x1) - W, y = Math.min(y0, y1) - W
    p.rect(x, y, Math.abs(x1 - x0) + 2 * W + 1, Math.abs(y1 - y0) + 2 * W + 1, 15)
  }
  // path edges: lit top-left, worn darker bottom-right
  for (let i = 0; i + 1 < path.length; i++) {
    const [x0, y0] = path[i], [x1, y1] = path[i + 1]
    if (y0 === y1) {
      const a = Math.min(x0, x1) - W, b = Math.max(x0, x1) + W
      p.hline(a, y0 + W, b - a + 1, 9)
      for (let x = a + 2; x < b; x += 5) p.px(x, y0 - 1, 9), p.px(x + 2, y0 + 1, 9)
    } else {
      const a = Math.min(y0, y1) - W, b = Math.max(y0, y1) + W
      p.vline(x0 + W, a, b - a + 1, 9)
      for (let y = a + 2; y < b; y += 5) p.px(x0 - 1, y, 9), p.px(x0 + 1, y + 2, 9)
    }
  }
  // shadow line on the grass along the lower edges of the path
  p.hline(0, 11, 39, 1), p.hline(18, 26, 21, 1), p.hline(18, 41, 27, 1)
  p.vline(46, 11, 15, 1), p.vline(52, 41, 7, 1)

  // the base gate at the bottom: stone arch with a red banner
  p.rect(41, 43, 15, 5, 6)
  p.hline(41, 43, 15, 7)
  for (let x = 41; x < 56; x += 3) p.px(x, 42, 6)
  p.rect(45, 44, 7, 4, 0)
  p.rect(53, 39, 1, 5, 5), p.rect(54, 39, 3, 2, 8), p.px(54, 41, 2)

  // creep: a round blob with eyes and a health bar
  const creep = (x, y, body, dark, hp) => {
    p.sprite(x, y, ['.bb.', 'bbbb', 'b7b7', 'bbbd', 'd.dd'], { b: body, d: dark })
    p.hline(x, y - 2, 4, 0)
    p.hline(x, y - 2, hp, hp > 2 ? 11 : 8)
  }
  creep(2, 5, 8, 2, 4)
  creep(10, 5, 8, 2, 4)
  creep(20, 5, 14, 2, 3)
  creep(40, 13, 13, 1, 2)
  creep(30, 20, 8, 2, 1)
  creep(20, 20, 14, 2, 4)

  // tower: round stone body lit top-left, crenellated top, a coloured crown
  const tower = (x, y, top, topDark) => {
    p.ellipse(x + 3, y + 10, 4, 1, 1)
    p.rect(x, y + 3, 7, 7, 6)
    p.rect(x + 5, y + 3, 2, 7, 5)
    p.vline(x, y + 3, 7, 7)
    p.hline(x, y + 6, 7, 5), p.px(x + 3, y + 8, 0)
    p.rect(x - 1, y + 1, 9, 2, 6), p.hline(x - 1, y + 1, 9, 7)
    for (let i = 0; i < 9; i += 2) p.px(x - 1 + i, y, 6)
    p.rect(x + 2, y - 3, 3, 3, top), p.px(x + 2, y - 3, 7), p.vline(x + 4, y - 2, 2, topDark)
  }
  // crystal tower zapping the lead creep on the right turn
  tower(51, 13, 12, 13)
  p.line(53, 10, 49, 13, 7), p.line(49, 13, 47, 12, 12), p.line(47, 12, 44, 15, 7)
  p.px(43, 14, 7), p.px(45, 17, 12), p.px(42, 12, 12)
  // cannon tower in the bend, shell arcing to the left creeps
  tower(22, 23, 5, 0)
  for (const [x, y] of [[26, 18], [28, 17]]) p.px(x, y, 6)
  p.sprite(29, 18, ['.9.', '9a9', '.9.'], { a: 10 })
  p.px(33, 19, 8), p.px(28, 21, 8)
  // archer tower at the top, arrows flying at the first creeps
  tower(30, 8, 8, 2)
  p.line(25, 5, 29, 6, 4), p.px(24, 5, 7)
  p.line(15, 6, 19, 7, 4), p.px(14, 6, 7)
  // a beaten creep dropping a coin
  p.sprite(32, 31, ['.aa.', 'a7a9', 'aa94', '.94.'], { a: 10 })
  p.px(31, 30, 7), p.px(36, 30, 7)
  for (const [x, y] of [[30, 34], [37, 33]]) p.px(x, y, 5)

  // HUD: hearts and wave pips
  for (const x of [1, 6, 11]) p.sprite(x, 41, ['8.8', '888', '.8.'], { 8: x < 11 ? 8 : 5 })
  for (let i = 0; i < 5; i++) p.rect(57 + (i % 3) * 2, 1 + Math.floor(i / 3) * 2, 1, 1, i < 3 ? 10 : 5)
}
