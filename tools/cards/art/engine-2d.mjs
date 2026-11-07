// A 2D engine: an editor window with a side-scrolling scene in parallax layers, a tile grid,
// a selected hero with move arrows, and a big gear driving it all. 64x48, PICO-8 palette indexes.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]
export default function draw({ px }) {
  const p = pen(px)
  const X0 = 19, Y0 = 6, X1 = 61, Y1 = 38 // scene viewport, inclusive
  // window frame and title bar
  p.rect(8, 1, 55, 40, 5)
  p.hline(8, 1, 55, 6), p.vline(8, 1, 40, 6)
  p.rect(9, 2, 53, 3, 13), p.hline(9, 2, 53, 6)
  for (const [x, c] of [[11, 8], [14, 10], [17, 11]]) p.px(x, 3, c)
  p.vline(63, 2, 40, 0), p.hline(9, 41, 55, 0)
  // tile palette on the left
  p.rect(9, 6, 9, 33, 1)
  const tiles = [[3, 11], [4, 9], [12, 7], [6, 5]]
  tiles.forEach(([a, b], k) => {
    const y = 8 + k * 7
    p.rect(10, y, 6, 5, a), p.hline(10, y, 6, b)
  })
  p.rect(10, 15, 6, 5, 4), p.rect(10, 15, 6, 2, 11), p.px(11, 16, 3), p.px(14, 16, 3), p.px(12, 18, 6), p.px(14, 19, 2)
  for (let x = 10; x < 17; x++) for (const y of [14, 20]) p.px(x, y, (x % 2) ? 10 : 1)
  for (let y = 14; y <= 20; y++) for (const x of [9, 16]) p.px(x, y, (y % 2) ? 10 : 1)
  // scene: sky with a soft band
  p.rect(X0, Y0, X1 - X0 + 1, Y1 - Y0 + 1, 12)
  p.dither(X0, Y0 + 9, X1 - X0 + 1, 2, 6, -1)
  p.rect(X0, Y0 + 11, X1 - X0 + 1, 14, 6)
  // far layer: lavender mountains
  for (let x = X0; x <= X1; x++) {
    const h = 6 + Math.round(5 * Math.abs(Math.sin((x - X0) * 0.16)) + 2 * Math.sin(x * 0.5))
    for (let y = 25 - h; y <= 30; y++) p.px(x, y, y === 25 - h ? 6 : 13)
  }
  // clouds
  p.sprite(23, 9, ['.77.', '7777', '6666'])
  p.sprite(46, 8, ['..77..', '.7777.', '666666'])
  // middle layer: green hills
  for (let x = X0; x <= X1; x++) {
    const h = 4 + Math.round(3 * Math.sin((x - X0) * 0.22 + 1))
    for (let y = 30 - h; y <= 31; y++) p.px(x, y, y === 30 - h ? 11 : 3)
  }
  // near layer: grass-topped earth with round stones bedded in it
  p.rect(X0, 33, X1 - X0 + 1, 6, 4)
  p.rect(X0, 37, X1 - X0 + 1, 2, 2)
  p.rect(X0, 32, X1 - X0 + 1, 2, 11)
  for (let x = X0; x <= X1; x++) if (x % 3 === 0) p.px(x, 34, 3)
  for (let x = X0 + 1; x <= X1; x += 4) p.px(x, 31, 11)
  for (const [x, y] of [[21, 35], [30, 36], [40, 35], [48, 36], [56, 35]]) p.sprite(x, y, ['.66.', '6765', '.55.'])
  // a floating platform of wooden planks
  p.rect(43, 20, 12, 3, 4)
  p.hline(43, 20, 12, 9), p.hline(43, 22, 12, 2)
  for (const x of [46, 50]) p.vline(x, 20, 3, 2)
  p.px(44, 21, 0), p.px(53, 21, 0)
  // a gem floating over the platform
  p.sprite(47, 12, ['.0000.', '0e77e0', '0e7ee80', '.0e880', '..080.', '...0..'].map((r) => r.slice(0, 6)), { e: 14 })
  // tile grid overlay, kept light: a dot at each 8 px corner
  for (let x = X0 + 8; x < X1; x += 8) for (let y = Y0 + 4; y <= Y1; y += 8) p.px(x, y, 7)
  p.rect(X1 + 1, Y0, 1, Y1 - Y0 + 1, 5)
  // hero: a little blob knight, selected with a dashed box and move arrows
  p.sprite(27, 24, [
    '..0000..',
    '.0cccc0.',
    '0c7cc7c0',
    '0c0cc0c0',
    '0cccccc0',
    '.0d00d0.',
    '.00..00.',
  ], { c: 12, d: 13 })
  for (let x = 25; x <= 36; x++) if (x % 2) p.px(x, 22, 7), p.px(x, 32, 7)
  for (let y = 22; y <= 32; y++) if (y % 2) p.px(25, y, 7), p.px(36, y, 7)
  p.hline(31, 27, 9, 8), p.sprite(39, 25, ['8.', '88', '8.'].map((r) => r)), p.px(40, 27, 8)
  p.vline(31, 14, 9, 11), p.sprite(30, 13, ['.b.', 'bbb'], { b: 11 })
  // the engine: a big gear biting into the window corner, outlined so its teeth read
  const L = layer()
  const gx = 10, gy = 38
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI * 2) / 8 + 0.15
    for (let r = 7; r <= 11; r += 0.5)
      for (let w = -1.5; w <= 1.5; w += 0.5) L.px(gx + r * Math.cos(a) - w * Math.sin(a), gy + r * Math.sin(a) + w * Math.cos(a), 6)
  }
  L.disc(gx, gy, 8.5, 6)
  L.outline(0)
  L.grid.forEach((row, y) => row.forEach((c, x) => {
    if (c !== 6) return
    const dx = x + 0.5 - gx, dy = y + 0.5 - gy, d = Math.hypot(dx, dy), lit = -(dx + dy) / (d || 1)
    row[x] = d > 8.5 ? (lit > 0.2 ? 7 : lit > -0.5 ? 6 : 5) : d > 4.5 ? (lit > 0.4 ? 6 : 5) : d > 3 ? (lit > 0 ? 5 : 6) : 0
  }))
  L.stamp(px)
  p.px(gx - 6, gy - 3, 7), p.px(gx - 5, gy - 5, 7)
}
