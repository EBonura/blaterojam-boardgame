// Quiz Game: a TV quiz-show screen. A big golden 3D question mark on a plum sunburst under a row of marquee bulbs,
// a countdown clock running out, and four coloured answer buttons; the player's cursor hovers over one.
import { pen, layer } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // plum sunburst behind the question mark
  p.rect(0, 0, 64, 30, 2)
  const CX = 30, CY = 15
  for (let y = 0; y < 30; y++) for (let x = 0; x < 64; x++) {
    const a = Math.atan2(y - CY, x - CX)
    if (Math.floor(((a + Math.PI) / (2 * Math.PI)) * 16) % 2 === 0) px(x, y, 8)
  }
  // a darker vignette toward the corners
  for (let y = 0; y < 30; y++) for (let x = 0; x < 64; x++) {
    const d = Math.hypot((x - CX) / 1.6, y - CY)
    if (d > 20 && (x + y) % 2) px(x, y, 2)
    if (d > 24) px(x, y, 2)
  }
  // marquee bulbs along the top
  p.hline(0, 0, 64, 1)
  for (let x = 1; x < 64; x += 4) p.px(x, 0, x % 8 === 1 ? 10 : 7)

  // the 3D question mark: extrusion first (down-right), then the face
  const q = [
    '..aaaaaa..',
    '.aaaaaaaa.',
    'aaa....aaa',
    'aaa....aaa',
    '......aaa.',
    '.....aaa..',
    '....aaa...',
    '....aaa...',
    '..........',
    '....aaa...',
    '....aaa...',
  ]
  const big = layer()
  q.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === 'a') big.rect(i * 2, j * 2, 2, 2, 0)
  }))
  const qx = 20, qy = 4
  for (let k = 3; k >= 1; k--) big.stamp((x, y) => px(x, y, k === 3 ? 2 : 4), qx + k, qy + k)
  big.stamp((x, y) => px(x, y, 10), qx, qy)
  // face shading: lower-right of each stroke in orange, a white glint top-left
  q.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch !== 'a') return
    const below = q[j + 1]?.[i] === 'a', right = row[i + 1] === 'a'
    if (!below) p.hline(qx + i * 2, qy + j * 2 + 1, 2, 9)
    if (!right) p.vline(qx + i * 2 + 1, qy + j * 2, below ? 2 : 1, 9)
  }))
  p.rect(qx + 3, qy + 1, 3, 1, 7), p.px(qx + 2, qy + 2, 7)
  p.px(qx + 8, qy + 18, 7)
  // sparkles
  for (const [x, y] of [[12, 6], [47, 4], [45, 22]]) p.sprite(x - 1, y - 1, ['.a.', 'a7a', '.a.'], { a: 10 })

  // countdown clock, top right: most of it gone, last slice red
  p.disc(55, 9, 6, 1)
  p.disc(55, 9, 5, 7)
  for (let y = 4; y <= 14; y++) for (let x = 50; x <= 60; x++) {
    const d = Math.hypot(x - 55, y - 9)
    if (d > 5.4) continue
    const a = (Math.atan2(x - 55, -(y - 9)) + 2 * Math.PI) % (2 * Math.PI)
    if (a < 1.2) px(x, y, 8)
    else if (a > 5.9) px(x, y, 14)
  }
  p.line(55, 9, 55, 5, 0), p.px(55, 9, 0)
  p.vline(55, 2, 1, 6), p.hline(54, 2, 3, 6)

  // stage floor
  p.rect(0, 30, 64, 18, 1)
  p.hline(0, 30, 64, 13)

  // four answer buttons with bevels and text dashes
  const button = (x, y, lit, base, dark, text) => {
    p.rect(x, y, 29, 7, base)
    p.hline(x, y, 29, lit)
    p.vline(x, y, 7, lit)
    p.hline(x + 1, y + 7, 29, 0)
    p.vline(x + 29, y + 1, 7, 0)
    p.hline(x + 1, y + 6, 28, dark)
    p.rect(x + 2, y + 2, 3, 3, dark)
    p.px(x + 2, y + 2, lit)
    p.hline(x + 7, y + 3, text, 7)
  }
  button(2, 32, 14, 8, 2, 14)
  button(33, 32, 6, 12, 13, 10)
  button(2, 40, 7, 10, 9, 12)
  button(33, 40, 7, 11, 3, 16)
  // the chosen answer glows, the cursor hand clicks it
  p.rect(32, 39, 31, 1, 7), p.rect(32, 47, 31, 1, 7)
  p.sprite(52, 41, [
    '.0....',
    '070...',
    '0770..',
    '07770.',
    '077770',
    '07700.',
    '0.070.',
  ])
}
