// A speedometer reading "60", needle in the red, speed lines and a puff of steam. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]
const DIG = {
  6: ['.##.', '#...', '###.', '#..#', '#..#', '.##.'],
  0: ['.##.', '#..#', '#..#', '#..#', '#..#', '.##.'],
}
export default function draw({ px }) {
  const p = pen(px)
  const cx = 37, cy = 24
  // speed lines streaming off to the left
  for (const [x, y, w, c] of [[0, 8, 12, 12], [4, 13, 10, 7], [0, 18, 13, 13], [2, 24, 12, 12], [0, 29, 11, 7], [5, 34, 9, 13], [1, 39, 10, 12]]) {
    p.hline(x, y, w, c), p.px(x, y, c === 7 ? 6 : 1)
  }
  // dial: chrome rim lit from the top left, dark bezel, black face
  for (let y = 0; y < 48; y++)
    for (let x = 0; x < 64; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy)
      if (d > 22.5) continue
      const lit = -(dx + dy) / d
      if (d > 21.5) px(x, y, lit > 0.3 ? 6 : lit > -0.5 ? 5 : 0)
      else if (d > 19.5) px(x, y, lit > 0.55 ? 7 : lit > -0.3 ? 6 : 5)
      else if (d > 18.5) px(x, y, lit > 0 ? 5 : 1)
      else px(x, y, 0)
    }
  // glass glint on the top left of the face
  for (let a = 125; a <= 160; a += 4) {
    const r = (a * Math.PI) / 180
    p.px(cx + 16 * Math.cos(r), cy - 16 * Math.sin(r), a < 140 ? 6 : 5)
  }
  p.px(cx - 9, cy - 11, 7)
  // tick marks around a 270 degree sweep: green, yellow, red
  const major = [11, 11, 11, 11, 10, 10, 8, 8, 8]
  for (let k = 0; k < 33; k++) {
    const deg = 225 - k * (270 / 32), r = (deg * Math.PI) / 180, c = major[Math.round(k / 4)]
    const big = k % 4 === 0
    for (let rr = big ? 14.5 : 16.5; rr <= 17.6; rr += 0.5) p.px(cx + rr * Math.cos(r), cy - rr * Math.sin(r), big ? c : 5)
  }
  // red zone band
  for (let deg = -45; deg <= 22; deg += 2) {
    const r = (deg * Math.PI) / 180
    p.px(cx + 18 * Math.cos(r), cy - 18 * Math.sin(r), 8)
  }
  // needle pushed into the red, with a dark shadow
  const na = (28 * Math.PI) / 180
  for (let rr = 0; rr <= 15.5; rr += 0.5) p.px(cx + rr * Math.cos(na) + 1, cy - rr * Math.sin(na) + 1, 2)
  for (let rr = -3; rr <= 15.5; rr += 0.5) p.px(cx + rr * Math.cos(na), cy - rr * Math.sin(na), 8)
  p.disc(cx, cy, 2, 5), p.rect(cx - 1, cy - 1, 2, 2, 6), p.px(cx - 1, cy - 1, 7)
  // "60" in big frame-counter green
  const big = (g, x0, y0, c) => g.forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && p.rect(x0 + 2 * i, y0 + 2 * j, 2, 2, c)))
  for (const [d, x] of [[6, 28], [0, 38]]) big(DIG[d], x + 1, 29, 3), big(DIG[d], x, 28, 11)
  // the engine is straining: a puff of steam off the top right
  p.sprite(54, 0, ['..677.', '.67776', '666776', '.6666.'])
  p.sprite(59, 5, ['.67', '666', '.6.'])
}
