// A plate of spaghetti that is also code: syntax-coloured noodles tangled like cables, curly-brace noodles,
// plugs on the loose ends, a fork twirling, a mouse cursor and a bug on the rim. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]
export default function draw({ px }) {
  const p = pen(px)
  // checked tablecloth, kept dark
  for (let y = 30; y < 48; y++) for (let x = 0; x < 64; x++) p.px(x, y, (Math.floor(x / 6) + Math.floor((y - 30) / 4)) % 2 ? 1 : 2)
  p.hline(0, 30, 64, 2)
  // plate: white rim, grey well, lavender underside
  p.ellipse(32, 38, 30, 8, 13)
  p.ellipse(32, 37, 30, 8, 7)
  p.ellipse(32, 37, 22, 5, 6)
  p.ellipse(33, 38, 20, 3.5, 6)
  for (let x = 4; x < 60; x++) if (x > 40) p.px(x, 44 - Math.round(Math.max(0, x - 52) / 3), 6)
  // noodle pile: a tangle of curves, shadowed down-right
  const inPile = (x, y) => ((x - 32) / 19) ** 2 + ((y - 28) / (y < 28 ? 13 : 8)) ** 2 <= 1 && y < 38
  // seeded random so the tangle is the same on every build
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const curl = (cx, cy, r, a0, sweep, c, sh) => {
    const pts = []
    for (let a = a0; a < a0 + sweep; a += 0.08) pts.push([Math.round(cx + r * 1.4 * Math.cos(a)), Math.round(cy + r * Math.sin(a))])
    for (const [x, y] of pts) if (inPile(x, y)) p.px(x + 1, y + 1, sh)
    for (const [x, y] of pts) if (inPile(x, y)) p.px(x, y, c)
  }
  // base of the pile: deep orange in the gaps, darker toward the bottom right
  for (let y = 15; y < 38; y++) for (let x = 13; x < 52; x++) if (inPile(x, y)) p.px(x, y, (x - 32) / 19 + (y - 28) / 9 > 0.7 ? 4 : 9)
  // curls of spaghetti, back to front
  for (let k = 0; k < 46; k++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd())
    curl(32 + 16 * d * Math.cos(a), 26 + 8 * d * Math.sin(a), 1.5 + rnd() * 3, rnd() * 6.3, 3 + rnd() * 2.5, 10, 4)
  }
  // a few syntax-highlighted strands woven through
  curl(24, 27, 4, 0.3, 3.5, 14, 2)
  curl(38, 30, 4.5, 3.4, 3.2, 12, 1)
  curl(31, 22, 3, 1.0, 3.6, 11, 3)
  // highlights on the top of the pile
  for (const [x, y] of [[24, 17], [25, 17], [30, 16], [36, 18], [21, 21], [29, 20]]) p.px(x, y, 7)
  // curly braces made of noodle on each side of the pile
  const brace = ['.aa', '.a.', '.a.', 'a..', '.a.', '.a.', '.aa']
  const braceAt = (x0, y0, flip) => brace.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch !== 'a') return
    const x = x0 + (flip ? 2 - i : i) * 2
    p.rect(x + 1, y0 + j * 2 + 1, 2, 2, 4), p.rect(x, y0 + j * 2, 2, 2, 10), p.px(x, y0 + j * 2, 7)
  }))
  braceAt(3, 15, false), braceAt(55, 15, true)
  // loose noodle ends hanging over the rim as cables with plugs
  for (const [x, y] of [[16, 34], [15, 35], [14, 36], [13, 37], [12, 38], [12, 39], [11, 40], [11, 41]]) p.px(x, y, 10), p.px(x + 1, y, 9)
  p.rect(9, 42, 4, 3, 6), p.px(9, 42, 7), p.hline(9, 44, 4, 5), p.vline(10, 45, 2, 10), p.vline(12, 45, 2, 10)
  for (const [x, y] of [[44, 35], [46, 36], [47, 37], [49, 38], [50, 39], [51, 40]]) p.px(x, y, 12), p.px(x - 1, y, 12), p.px(x, y + 1, 1)
  p.rect(51, 41, 5, 3, 6), p.px(51, 41, 7), p.hline(51, 43, 5, 5), p.rect(56, 42, 2, 1, 5)
  // meatball with sauce on top
  p.rect(28, 14, 10, 2, 8), p.rect(27, 15, 12, 1, 2)
  p.disc(33, 12, 3.5, 4), p.px(31, 10, 9), p.px(32, 10, 9), p.px(31, 11, 15), p.px(35, 14, 2), p.px(36, 13, 2)
  // fork stuck in the pile, twirling noodles
  p.line(58, 1, 46, 13, 5)
  p.line(57, 1, 45, 13, 6)
  p.line(56, 1, 44, 13, 7)
  p.rect(41, 13, 5, 2, 6), p.hline(41, 13, 5, 7)
  for (const x of [41, 43, 45]) p.vline(x, 15, 3, 6)
  p.hline(40, 16, 7, 10), p.hline(41, 17, 6, 9), p.px(40, 18, 10)
  // mouse cursor hovering over the pile
  p.sprite(13, 3, [
    '0.......',
    '00......',
    '070.....',
    '0770....',
    '07770...',
    '077770..',
    '0777770.',
    '077700..',
    '0700.0..',
    '00..070.',
    '.....00.',
  ])
  // a little bug crawling on the rim
  p.sprite(54, 33, ['3.3', '.b.', '3b3', '.b.'], { b: 11 })
}
