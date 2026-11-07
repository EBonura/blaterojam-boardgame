// Puzzle Game: a falling-gem puzzle well. Round and faceted gems in five colours stacked high, a row of three greens
// sparkling as it clears, a vertical trio falling with its ghost below; the next box shows the three yellows that would
// clear the deep slot (of course they come next). Score, level and a warning light on the side.
import { pen } from './_pix.mjs'
export const size = [64, 48]

const RAMP = { r: [14, 8, 2], b: [7, 12, 13], y: [7, 10, 9], g: [7, 11, 3], p: [7, 13, 2], w: [7, 7, 6] }
const ROUND = ['.lbb.', 'l7bbd', 'bbbbd', 'bbbdd', '.ddd.']
const FACET = ['..l..', '.l7b.', 'lbbbd', '.bdd.', '..d..']

export default function draw({ px }) {
  const p = pen(px)

  // backdrop: deep navy with a soft diamond pattern
  p.rect(0, 0, 64, 48, 1)
  for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) if ((x + y) % 8 === 0 || (x - y + 64) % 8 === 0) if ((x + y) % 2 === 0) px(x, y, 2)

  // gem: round for red, green and purple, faceted for blue and yellow; lit top-left
  const gem = (x, y, k) => {
    const [l, base, d] = RAMP[k]
    p.sprite(x, y, 'by'.includes(k) ? FACET : ROUND, { l, b: base, d })
  }

  // the well: 6 columns of 5 px, dark inside with faint grid
  const WX = 5, WY = 3
  p.rect(WX - 2, WY - 1, 36, 46, 6)
  p.vline(WX - 2, WY - 1, 46, 7)
  p.vline(WX + 33, WY - 1, 46, 5), p.hline(WX - 2, WY + 44, 36, 5)
  p.rect(WX, WY - 1, 32, 45, 0)
  for (let y = WY + 2; y < WY + 44; y += 5) for (let x = WX + 3; x < WX + 31; x += 5) px(x, y, 1)

  // the stack (6 columns of 5 px), a deep slot in the right column lined with yellows
  const at = (i, j) => [WX + 1 + i * 5, WY + j * 5]
  const stack = [
    '......',
    '......',
    '......',
    '......',
    'y.....',
    'b.....',
    'r.ggg.',
    'b.ryy.',
    'pgbyy.',
  ]
  stack.forEach((row, j) => [...row].forEach((k, i) => k !== '.' && gem(...at(i, j), k)))
  // the three greens in a row are clearing: flashing white with sparkles
  for (let i = 2; i <= 4; i++) gem(...at(i, 6), 'w')
  for (const [x, y] of [[WX + 12, WY + 28], [WX + 19, WY + 27], [WX + 25, WY + 28]]) p.sprite(x - 1, y - 1, ['.a.', 'a7a', '.a.'], { a: 11 })
  p.px(WX + 11, WY + 34, 7), p.px(WX + 26, WY + 35, 7)

  // falling trio (red, blue, green) and its ghost where it will land
  ;['r', 'b', 'g'].forEach((k, j) => gem(...at(1, j), k))
  for (let j = 5; j < 8; j++) p.sprite(...at(1, j), ['.555.', '5...5', '5...5', '5...5', '.555.'])
  // the empty slot glows faintly: the place the three yellows should go
  for (let y = WY + 31; y < WY + 45; y += 2) p.px(WX + 28, y, 10)

  // side panel: next box with the long bar, score dots, level bar
  const box = (x, y, w, h) => {
    p.rect(x, y, w, h, 0)
    p.hline(x, y, w, 6), p.vline(x, y, h, 6)
    p.hline(x, y + h - 1, w, 5), p.vline(x + w - 1, y, h, 5)
  }
  box(42, 2, 20, 19)
  p.hline(44, 4, 4, 6)
  for (let j = 0; j < 3; j++) gem(49, 4 + j * 5, 'y')
  p.px(61, 1, 10), p.px(62, 2, 10), p.px(60, 0, 7)

  box(42, 23, 20, 8)
  for (let i = 0; i < 5; i++) p.rect(44 + i * 3, 25, 2, 2, 7)
  for (let i = 0; i < 3; i++) p.rect(44 + i * 3, 28, 2, 1, 10)

  box(42, 33, 20, 5)
  p.rect(44, 35, 16, 1, 1)
  p.rect(44, 35, 11, 1, 11)

  // a stack-height warning light blinking red
  p.disc(52, 42, 3, 2)
  p.disc(52, 42, 2, 8)
  p.px(51, 41, 14), p.px(51, 40, 7)
}
