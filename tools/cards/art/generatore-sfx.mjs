// A retro synth on a desk blasting a "pew" burst, a patch cable dangling over the edge. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]
export default function draw({ px }) {
  const p = pen(px)
  const inPoly = (pts, x, y) => {
    let inside = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
    }
    return inside
  }
  const star = (cx, cy, ro, ri, n, rot) =>
    Array.from({ length: n * 2 }, (_, k) => {
      const r = k % 2 ? ri : ro, a = rot + (k * Math.PI) / n
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
    })
  // desk
  p.rect(0, 38, 64, 4, 4)
  p.hline(0, 38, 64, 9)
  p.hline(4, 40, 10, 2), p.hline(50, 39, 9, 2)
  p.rect(0, 42, 64, 6, 2), p.hline(0, 42, 64, 0)
  // the burst: orange rim, yellow body, white core, sparks around it
  const outer = star(50, 11, 13, 6.5, 10, 0.2), mid = star(50, 11, 10.5, 5.2, 10, 0.2), core = star(50, 11, 6, 3.2, 10, 0.5)
  for (let y = 0; y < 48; y++)
    for (let x = 0; x < 64; x++) {
      const q = [x + 0.5, y + 0.5]
      if (inPoly(core, ...q)) px(x, y, 7)
      else if (inPoly(mid, ...q)) px(x, y, 10)
      else if (inPoly(outer, ...q)) px(x, y, 9)
    }
  for (const [x, y] of [[34, 2], [62, 26], [37, 22], [63, 2], [44, 0]]) p.px(x, y, 10)
  // sound waves leaving the synth toward the burst
  for (const [r, c] of [[3, 12], [6, 13]]) {
    for (let a = 0; a <= 90; a += 3) {
      const t = (a * Math.PI) / 180
      p.px(35 + r * Math.cos(t), 17 - r * Math.sin(t), c)
    }
  }
  // cast shadow of the synth on the desk
  p.rect(6, 38, 42, 2, 2)
  // synth body: wooden cheeks, grey panel
  p.rect(7, 19, 36, 19, 5)
  p.hline(7, 19, 36, 6)
  p.rect(3, 18, 4, 20, 4), p.vline(3, 18, 20, 9), p.vline(6, 18, 20, 2), p.hline(3, 18, 4, 9)
  p.rect(43, 18, 4, 20, 4), p.vline(43, 18, 20, 9), p.rect(45, 18, 2, 20, 2), p.vline(47, 18, 20, 0), p.hline(43, 18, 3, 9)
  p.hline(7, 37, 36, 0)
  // knobs with white pointers
  for (const [x, c, d] of [[11, 8, 2], [17, 10, 9], [23, 12, 13]]) {
    p.disc(x, 23, 2, c)
    p.px(x + 1, 25, d), p.px(x + 2, 24, d), p.px(x + 2, 23, d), p.px(x, 25, d)
    p.px(x - 1, 22, 7), p.px(x, 21, 7)
    p.px(x + 1, 26, 0), p.px(x + 3, 24, 0)
  }
  // sliders
  for (const [x, y] of [[29, 24], [32, 22]]) p.vline(x, 21, 6, 0), p.rect(x - 1, y, 3, 2, 6), p.hline(x - 1, y, 3, 7)
  // waveform screen
  p.rect(35, 20, 7, 7, 0)
  p.hline(35, 20, 7, 1)
  for (const [x, y] of [[35, 25], [36, 25], [36, 24], [36, 23], [36, 22], [37, 22], [38, 22], [38, 23], [38, 24], [38, 25], [39, 25], [40, 25], [40, 24], [40, 23], [40, 22], [41, 22]]) p.px(x, y, 11)
  // keyboard: white keys with grey gaps, black keys with a glint
  p.rect(8, 29, 34, 8, 7)
  p.hline(8, 36, 34, 6)
  for (let x = 12; x < 42; x += 4) p.vline(x, 29, 8, 6)
  for (const x of [10, 15, 22, 27, 31, 38]) p.rect(x, 29, 3, 5, 0), p.px(x, 29, 5)
  // patch cable from a jack, looping over the desk edge
  p.rect(41, 27, 2, 2, 0)
  for (const [x, y] of [[43, 28], [44, 29], [45, 30], [48, 31], [49, 32], [50, 33], [51, 34], [51, 35], [52, 36], [52, 37], [53, 38], [53, 39], [54, 40], [54, 41], [55, 42], [55, 43], [56, 44], [57, 45], [58, 45], [59, 44]]) p.px(x, y, 8)
  for (const [x, y] of [[46, 30], [47, 31]]) p.px(x, y, 8)
  p.rect(58, 42, 3, 3, 6), p.px(58, 42, 7), p.hline(59, 41, 1, 5)
}
