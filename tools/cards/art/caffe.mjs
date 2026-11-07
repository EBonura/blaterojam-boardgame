// Un caffè: an espresso cup on its saucer, a heart drawn in the crema, steam curling up, a spoon
// and a sugar cube, and the moka pot it came from waiting behind. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // table with a checked cloth, toned down
  p.rect(0, 38, 64, 10, 15)
  for (let y = 38; y < 48; y++) for (let x = 0; x < 64; x++) {
    const a = Math.floor(x / 4) % 2, b = Math.floor((y - 38) / 3) % 2
    if (a && b) p.px(x, y, 14)
    else if (a || b) p.px(x, y, y % 2 ? 14 : 15)
  }
  p.hline(0, 38, 64, 7)

  // moka pot behind, on the left
  const m = layer()
  m.poly([[5, 22], [17, 22], [19, 37], [3, 37]], 6) // bottom chamber
  m.poly([[6, 9], [16, 9], [18, 20], [4, 20]], 6) // top jug
  m.rect(4, 20, 15, 2, 5) // waist
  m.poly([[9, 6], [13, 6], [15, 9], [7, 9]], 5) // lid
  m.rect(10, 4, 2, 2, 0)
  m.vline(6, 10, 10, 7), m.vline(5, 23, 13, 7)
  m.vline(15, 10, 10, 5), m.vline(16, 23, 14, 5)
  m.line(3, 9, 6, 12, 6) // spout
  m.px(2, 8, 6)
  m.poly([[18, 11], [22, 12], [22, 19], [18, 18]], 0) // handle
  m.vline(21, 12, 7, 5)
  m.hline(4, 37, 15, 5)
  m.outline(0)
  m.stamp(px)
  p.hline(3, 38, 17, 2)

  // saucer
  p.ellipse(37, 39, 21, 4, 0)
  p.ellipse(37, 38, 20, 3.5, 7)
  p.ellipse(39, 39, 17, 2.5, 6)
  p.ellipse(37, 38, 13, 1.8, 6)
  p.hline(18, 38, 6, 7)
  // spoon resting on the saucer
  p.line(51, 37, 58, 39, 5), p.line(51, 36, 58, 38, 6), p.ellipse(49, 36, 2, 1, 6), p.px(48, 35, 7)
  // sugar cube
  p.rect(54, 31, 6, 5, 7), p.hline(54, 31, 6, 7), p.vline(59, 31, 5, 6), p.hline(54, 35, 6, 6)
  p.px(55, 33, 6), p.px(57, 32, 6)
  p.hline(54, 36, 7, 0), p.vline(60, 31, 5, 0)

  // the cup
  const c = layer()
  c.poly([[26, 23], [48, 23], [47, 31], [44, 35], [30, 35], [27, 31]], 7)
  for (let y = 23; y < 36; y++) for (let x = 26; x < 49; x++) if (c.grid[y][x] === 7 && x > 41 - (y - 23) / 4) c.px(x, y, 6)
  for (let y = 23; y < 36; y++) for (let x = 26; x < 49; x++) if (c.grid[y][x] === 6 && x > 46 - (y - 23) / 3) c.px(x, y, 5)
  c.vline(28, 25, 7, 7)
  // handle
  c.ring(50.5, 27, 2.5, 3, 6)
  c.px(52, 27, 5), c.px(52, 28, 5), c.px(51, 30, 5)
  // rim, the coffee, a heart drawn in the crema
  c.ellipse(37, 22, 11.5, 4, 7)
  c.ellipse(37, 22, 10, 3, 9)
  c.ellipse(37, 22.5, 9, 2.4, 4)
  c.hline(30, 19, 8, 7)
  c.sprite(34, 21, ['.77.77.', '7777777', '.77777.', '..777..', '...7...'])
  c.px(35, 21, 15)
  c.outline(0)
  c.stamp(px)

  // steam
  for (const [x0, ph] of [[31, 0], [38, 2], [44, 1]]) {
    for (let y = 3; y < 16; y++) {
      const x = x0 + Math.round(Math.sin((y + ph * 2) / 2.2) * 1.5)
      p.px(x, y, y < 8 ? 5 : 6)
      if (y > 11 && y % 2) p.px(x + 1, y, 7)
    }
  }
}
