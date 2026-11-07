// A lit idea bulb glowing in front of a corkboard of sticky notes tied together with red string. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]
export default function draw({ px }) {
  const p = pen(px)
  // corkboard with a wooden frame
  p.rect(0, 0, 64, 48, 4)
  for (let y = 1; y < 47; y++) for (let x = 1; x < 63; x++) {
    const h = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1
    if (h < 0.14) p.px(x, y, 2)
    else if (h > 0.96) p.px(x, y, 9)
  }
  p.rect(0, 0, 64, 1, 9), p.rect(0, 0, 1, 48, 9)
  p.rect(0, 47, 64, 1, 0), p.rect(63, 0, 1, 48, 0)
  // sticky notes: colour, shade, scribble, position, pinned
  const notes = [
    [3, 3, 14, 8, 2], [50, 2, 11, 3, 1], [2, 30, 12, 13, 1], [51, 29, 15, 4, 2], [4, 16, 10, 9, 4],
  ]
  // red string linking the notes, behind the bulb
  const pins = notes.map(([x, y]) => [x + 5, y + 1])
  for (const [a, b] of [[0, 1], [0, 4], [4, 2], [1, 3], [2, 3]]) p.line(...pins[a], ...pins[b], 8)
  for (const [x, y, c, s, ink] of notes) {
    p.rect(x + 1, y + 1, 11, 11, 0) // shadow down-right
    p.rect(x, y, 11, 11, c)
    p.hline(x, y, 11, 7), p.vline(x + 10, y + 1, 10, s), p.hline(x, y + 10, 11, s)
    p.hline(x + 2, y + 4, 7, ink), p.hline(x + 2, y + 6, 5, ink), p.hline(x + 2, y + 8, 6, ink)
    p.px(x + 5, y + 1, 8), p.px(x + 5, y, 2)
  }
  // the green note has a little arrow doodle, the peach one a heart
  p.rect(52, 6, 6, 5, 11), p.line(53, 9, 57, 6, 1), p.px(56, 6, 1), p.px(57, 7, 1)
  p.rect(53, 33, 7, 6, 15), p.sprite(54, 34, ['22.22', '22222', '.222.', '..2..'])
  // glow around the bulb
  for (let y = 0; y < 48; y++)
    for (let x = 14; x < 50; x++) {
      const d = Math.hypot(x + 0.5 - 32, y + 0.5 - 17)
      if (d < 16 && d > 12.5 && (x + y) % 2 === 0) p.px(x, y, 9)
    }
  // rays
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k - 4.5) * 0.42
    for (let r = 15; r <= 18; r++) p.px(32 + r * Math.cos(a) * 1.1, 17 + r * Math.sin(a), r < 17 ? 10 : 9)
  }
  // glass bulb: yellow, orange on the lower right, white highlight top left
  for (let y = 4; y < 32; y++)
    for (let x = 18; x < 47; x++) {
      const dx = x + 0.5 - 32, dy = y + 0.5 - 16, d = Math.hypot(dx, dy)
      if (d <= 11.6) px(x, y, dx + dy > 11 ? 4 : dx + dy > 5 ? 9 : 10)
      else if (d <= 12.6 && dx + dy > 4) px(x, y, 2)
    }
  p.rect(27, 26, 10, 3, 10), p.rect(33, 26, 4, 3, 9), p.rect(36, 26, 1, 3, 4)
  p.rect(28, 29, 8, 1, 10), p.rect(33, 29, 3, 1, 9)
  p.sprite(24, 8, ['..77', '.77.', '77..', '7...'])
  p.px(23, 13, 7), p.px(23, 14, 7)
  // filament glowing white-hot
  for (const [x, y] of [[29, 28], [29, 26], [29, 24], [29, 22], [30, 20], [31, 19], [32, 20], [33, 19], [34, 20], [35, 22], [35, 24], [35, 26], [35, 28]]) p.px(x, y, 4)
  for (const [x, y] of [[29, 27], [29, 25], [29, 23], [35, 23], [35, 25], [35, 27]]) p.px(x, y, 4)
  for (const [x, y] of [[30, 20], [31, 19], [32, 20], [33, 19], [34, 20]]) p.px(x, y, 7)
  // screw base
  for (let j = 0; j < 7; j++) {
    p.rect(27, 30 + j, 10, 1, j % 2 ? 5 : 6)
    p.px(27, 30 + j, j % 2 ? 6 : 7), p.px(36, 30 + j, 5)
  }
  p.rect(29, 37, 6, 2, 5), p.hline(29, 37, 6, 6), p.rect(31, 39, 2, 1, 0)
}
