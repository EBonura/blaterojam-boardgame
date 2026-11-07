// Open World RPG: a caped hero seen from behind on a grassy hilltop, looking across a huge valley at dawn: snowy
// mountain ranges, forests, a lake, a village, a road winding all the way to a far castle with a quest marker over it.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // dawn sky: blue fading to peach at the horizon, pale sun top left
  p.rect(0, 0, 64, 14, 12)
  p.hline(0, 14, 64, 6)
  p.dither(0, 15, 64, 1, 15, 6)
  p.rect(0, 16, 64, 11, 15)
  p.hline(0, 11, 64, 12)
  p.disc(9, 7, 3, 7)
  p.px(8, 5, 10), p.px(7, 6, 10)
  // long thin clouds
  p.hline(18, 4, 10, 7), p.hline(21, 5, 9, 6)
  p.hline(45, 8, 12, 7), p.hline(48, 9, 8, 6)
  p.hline(2, 13, 8, 7)
  // birds
  for (const [x, y] of [[30, 9], [34, 7], [37, 10]]) p.sprite(x, y, ['1.1', '.1.'])

  // far range: one lavender silhouette, lit left faces, snow caps
  const ridge = [[0, 20], [6, 13], [10, 17], [17, 8], [24, 16], [29, 12], [35, 19], [41, 4], [49, 16], [55, 10], [60, 16], [64, 12]]
  p.poly([...ridge, [64, 28], [0, 28]], 13)
  for (let i = 1; i < ridge.length; i++) {
    const [x, y] = ridge[i], [lx, ly] = ridge[i - 1]
    if (y >= ly) continue
    p.poly([[x, y], [lx, ly], [x, ly + 4]], 6)
    const sn = Math.max(2, Math.round((ly - y) * 0.35))
    for (let j = 0; j < sn; j++) {
      p.hline(x - j, y + j, j + 1, 7)
      p.hline(x + 1, y + j, Math.max(0, j - 1), 6)
    }
    p.line(x + 1, y + sn, x + 3, ly + 5, 5)
  }
  // foothills in blue-green haze
  p.poly([[0, 28], [0, 25], [8, 23], [16, 25], [25, 22], [34, 25], [42, 22], [50, 21], [58, 24], [64, 22], [64, 28]], 3)
  p.line(0, 25, 8, 23, 11), p.line(25, 22, 30, 24, 11), p.line(42, 22, 50, 21, 11)
  // far castle on a ridge, quest marker floating over it
  p.poly([[38, 26], [44, 22], [52, 22], [58, 26]], 3)
  p.rect(43, 18, 9, 5, 6)
  p.rect(43, 18, 6, 5, 7)
  p.rect(42, 15, 3, 8, 7), p.rect(50, 16, 3, 7, 6)
  p.rect(46, 13, 3, 6, 7), p.px(48, 13, 6)
  for (const x of [42, 44, 50, 52]) p.px(x, x < 46 ? 14 : 15, x < 46 ? 7 : 6)
  p.px(47, 12, 5), p.px(47, 11, 5), p.px(48, 11, 8), p.px(49, 11, 8)
  p.px(47, 16, 1), p.px(43, 18, 1), p.px(51, 18, 1), p.rect(47, 20, 1, 2, 1)
  // quest marker: a bobbing yellow diamond with a glint
  p.sprite(46, 3, ['.a.', 'aa9', '.9.'], { a: 10 })
  p.px(46, 3, 7)
  p.px(47, 7, 10), p.px(47, 9, 9)

  // valley floor
  p.rect(0, 26, 64, 22, 11)
  p.dither(0, 26, 64, 2, 3, 11)
  // patchwork fields
  p.poly([[34, 31], [44, 30], [46, 33], [36, 34]], 10)
  p.poly([[46, 33], [56, 32], [59, 35], [48, 36]], 9)
  p.line(36, 32, 45, 31, 9), p.line(49, 34, 57, 33, 4)
  // lake with glints
  p.ellipse(22, 31, 8, 2, 12)
  p.hline(16, 30, 8, 7)
  p.hline(20, 32, 6, 13)
  // forests: round clumps of dark trees, lit top-left, shadowed underneath
  const clump = (cx, cy, rx, ry) => {
    p.ellipse(cx, cy, rx, ry, 3)
    p.hline(cx - rx + 1, cy + ry, rx * 2 - 1, 1)
    for (let x = cx - rx + 1; x < cx + rx; x += 2) p.px(x, cy - ry + ((x * 3) % 2), 11)
    p.px(cx - rx + 1, cy - ry + 1, 11)
  }
  clump(30, 29, 5, 1)
  clump(39, 28, 3, 1)
  clump(58, 30, 6, 2)
  clump(36, 38, 5, 2)
  clump(28, 41, 3, 1)
  clump(60, 44, 5, 2)
  clump(50, 46, 3, 1)
  p.poly([[33, 44], [40, 43], [41, 47], [32, 48]], 9)
  p.line(34, 45, 40, 44, 10), p.line(33, 47, 40, 46, 4)
  for (const [x, y] of [[57, 41], [62, 40], [45, 45]]) p.px(x, y, 3), p.px(x + 1, y, 3)
  for (const [x, y] of [[44, 29], [53, 33], [61, 37], [33, 33]]) p.sprite(x, y, ['.3.', '333', '.4.'])
  // village by the road: little houses with red roofs
  const house = (x, y) => p.sprite(x, y, ['.88.', '8882', '7f6f', '7f1f'], { f: 15 })
  house(48, 37), house(53, 38), house(57, 36)
  p.px(52, 36, 5), p.px(52, 35, 6) // chimney smoke
  // the road, winding from the bottom up to the castle, narrowing with distance
  const road = [[38, 48, 5], [40, 46, 4], [43, 44, 4], [46, 42, 3], [47, 40, 3], [45, 38, 2], [42, 36, 2], [41, 35, 2], [43, 34, 1], [46, 33, 1], [48, 32, 1], [50, 31, 1], [49, 30, 1], [47, 29, 1], [46, 28, 1], [47, 27, 1], [48, 26, 1], [48, 25, 1], [47, 24, 1], [47, 23, 1]]
  for (let i = 0; i + 1 < road.length; i++) {
    const [x0, y0, w] = road[i], [x1, y1] = road[i + 1]
    for (let y = y1; y <= y0; y++) {
      const x = Math.round(x0 + ((x1 - x0) * (y0 - y)) / (y0 - y1 || 1))
      p.hline(x - Math.floor(w / 2), y, w, 15)
      if (w > 2) p.px(x + Math.ceil(w / 2) - 1, y, 9)
    }
  }

  // foreground hill on the left, darker green, lit crest
  const hill = [[0, 38], [5, 36], [12, 35], [19, 37], [26, 41], [31, 48], [0, 48]]
  p.poly(hill, 3)
  for (let i = 0; i < 3; i++) p.line(...hill[i], ...hill[i + 1], 11)
  for (let i = 3; i < 5; i++) p.line(...hill[i], ...hill[i + 1], 1)
  p.dither(2, 37, 16, 2, 11)
  // flowers, a rock and grass tufts on the hill
  for (const [x, y, c] of [[4, 42, 14], [9, 45, 10], [17, 41, 14], [21, 45, 7], [13, 47, 10]]) p.px(x, y, c), p.px(x, y + 1, 11)
  p.sprite(20, 39, ['.66.', '6655', '5551'])
  for (const [x, y] of [[2, 45], [24, 46]]) p.sprite(x, y, ['b.b', 'bbb'], { b: 11 })

  // the hero from behind: brown hair, red cape blowing right, sword over the shoulder
  const h = layer()
  h.sprite(0, 0, [
    '.9........',
    '.6.44.....',
    '..4444....',
    '..4444....',
    '..2442....',
    '.889988...',
    '.e888882..',
    '.e8888822.',
    '.88888222.',
    '.888882222',
    '..88822222',
    '..5..52...',
    '..4..4....',
  ], { e: 14 })
  h.outline(1)
  h.stamp(px, 8, 23)
}
