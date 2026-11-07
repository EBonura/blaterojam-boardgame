// Platform 2D: side-scrolling screenshot. An original hero (scarf, spiky hair) mid-jump between two floating
// grass islands, reaching for an arc of coins; a spiky slime patrols the ground; parallax hills and clouds behind.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // sky: blue, paler band near the horizon
  p.rect(0, 0, 64, 48, 12)
  p.hline(0, 22, 64, 6)
  p.rect(0, 25, 64, 9, 6)

  // clouds (lit top-left, grey belly)
  const cloud = (x, y, w) => {
    p.rect(x + 2, y, w - 4, 1, 7)
    p.rect(x, y + 1, w, 2, 7)
    p.rect(x + 1, y + 3, w - 2, 1, 6)
    p.rect(x + 3, y - 1, 3, 1, 7)
  }
  cloud(3, 5, 12)
  cloud(46, 3, 9)
  cloud(30, 12, 7)

  // far parallax: lavender mountains, lit left faces
  const ridge = [[0, 30], [6, 24], [11, 27], [18, 19], [25, 26], [31, 22], [38, 27], [45, 18], [53, 25], [58, 21], [64, 26], [64, 34], [0, 34]]
  p.poly(ridge, 13)
  for (const [x, y] of [[6, 24], [18, 19], [31, 22], [45, 18], [58, 21]]) {
    p.line(x, y, x - 3, y + 3, 6)
  }
  // mid parallax: round dark-green bushes with a lit rim
  const bush = (cx, r) => {
    p.disc(cx, 36, r, 3)
    p.ring(cx - 1, 35, r - 1, r - 1, 3)
    p.px(cx - 2, 36 - r + 1, 11), p.px(cx - 3, 36 - r + 2, 11)
  }
  for (const [cx, r] of [[4, 5], [13, 4], [22, 6], [33, 4], [41, 5], [52, 6], [61, 4]]) bush(cx, r)
  p.rect(0, 36, 64, 4, 3)

  // ground: grass lip, dirt with stones and a buried bone
  p.rect(0, 40, 64, 8, 4)
  p.rect(0, 40, 64, 1, 11)
  p.rect(0, 41, 64, 1, 3)
  for (let x = 1; x < 64; x += 4) p.px(x, 40, 3), p.px(x + 2, 39, 11)
  for (const [x, y] of [[5, 44], [17, 46], [29, 43], [39, 45], [55, 44], [61, 46], [10, 47]]) p.px(x, y, 2), p.px(x + 1, y, 2)
  for (const [x, y] of [[23, 45], [49, 46]]) p.px(x, y, 6), p.px(x + 1, y, 5)
  p.rect(33, 45, 4, 1, 15), p.px(32, 44, 15), p.px(32, 46, 15), p.px(37, 44, 15), p.px(37, 46, 15)

  // floating islands: grass top, earth underside, hanging roots
  const island = (x, y, w) => {
    p.rect(x, y, w, 2, 11)
    p.rect(x, y + 1, w, 1, 3)
    for (let i = 0; i < w; i += 3) p.px(x + i + 1, y - 1, 11)
    p.rect(x + 1, y + 2, w - 2, 2, 4)
    p.rect(x + 3, y + 4, w - 6, 1, 4)
    p.rect(x + 1, y + 3, w - 2, 1, 2)
    p.rect(x + 5, y + 5, w - 10, 1, 2)
    p.px(x + 2, y + 2, 9), p.px(x + 4, y + 2, 9)
    for (const i of [3, Math.floor(w / 2), w - 4]) p.vline(x + i, y + 5, 2, 3)
  }
  island(1, 26, 16)
  island(40, 21, 20)

  // gem on the high island, sparkling
  p.sprite(51, 14, ['..2..', '.2e2.', '2e782', '.282.', '..2..'], { e: 14 })
  p.px(56, 13, 7), p.px(49, 15, 7)

  // coin arc from the low island to the high one
  const coin = (x, y) => p.sprite(x, y, ['.aa.', 'a7a9', 'aa94', '.94.'], { a: 10 })
  coin(24, 7)
  coin(31, 4)
  coin(38, 7)
  // one coin just collected: sparkle
  p.px(19, 13, 7), p.px(17, 13, 10), p.px(21, 13, 10), p.px(19, 11, 10), p.px(19, 15, 10)

  // hero, mid-jump, one fist up toward the coins
  const h = layer()
  h.sprite(0, 0, [
    '.....2..2....',
    '....24224...s',
    '...2444442..s',
    '..244444442.o',
    '..24ff4ff42.o',
    '...f0ff0f..oo',
    '...fffffe.oo.',
    '..88ffff8oo..',
    '.888ooooooo..',
    '88.oooooo5...',
    '8..oooooo....',
    '...4455.44...',
    '...44...44...',
    '..44.....44..',
  ], { f: 15, e: 14, s: 15, o: 9 })
  h.rect(4, 9, 1, 3, 4)
  h.outline(1)
  h.stamp(px, 26, 11)
  // scarf tail flutters behind (left), speed lines
  p.px(26, 21, 8), p.px(25, 22, 2)
  for (const [x, y, w] of [[19, 19, 4], [21, 22, 3], [18, 25, 3]]) p.hline(x, y, w, 7)
  // dust puff left on the low island edge
  p.sprite(14, 23, ['.7.', '767', '.6.'])

  // spiky slime enemy on the ground, heading for the hero
  const s = layer()
  s.sprite(0, 0, [
    '..e...e..',
    '..ee.ee..',
    '.eeeeeee.',
    'ee70e70ee',
    'eee0ee0e8',
    'eeeeeeee8',
    '8e8e8e882',
  ], { e: 14 })
  s.outline(2)
  s.stamp(px, 46, 33)
  p.hline(46, 41, 10, 3)

  // HUD: hearts, coin counter
  const heart = (x, full) => p.sprite(x, 1, ['8.8', '888', '.8.'], { 8: full ? 8 : 5 })
  heart(1, true), heart(5, true), heart(9, false)
  p.px(2, 1, 14), p.px(6, 1, 14)
  coin(53, 0)
  for (const x of [58, 60, 62]) p.vline(x, 1, 3, 7)
}
