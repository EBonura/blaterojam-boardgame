// "Just one tweak": the artist's brush dabs one brick at the base and the whole tidy tower
// buckles and comes down. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // a faint level-editor grid behind
  for (let y = 2; y < 40; y += 4) for (let x = 2; x < 64; x += 4) p.px(x, y, 1)

  // floor
  p.rect(0, 41, 64, 7, 5)
  p.hline(0, 41, 64, 6)
  p.dither(0, 44, 64, 4, 0, -1)

  // a brick of size w x h, centred on (cx, cy), turned by ang radians: brown with an orange lit top-left edge, plum shadow, grey mortar on the bottom and right
  const brick = (cx, cy, ang = 0, w = 9, h = 4) => {
    const c = Math.cos(ang), s = Math.sin(ang), R = Math.ceil(Math.hypot(w, h) / 2) + 1
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
      const u = (x * c + y * s) + w / 2, v = (-x * s + y * c) + h / 2
      if (u < 0 || u >= w || v < 0 || v >= h) continue
      let col = 4
      if (v >= h - 1 || u >= w - 1) col = 5 // mortar
      else if (v >= h - 2 || u >= w - 2) col = 2
      else if (v < 1 || u < 1) col = 9
      p.px(cx + x, cy + y, col)
    }
  }

  // the tower: courses of brickwork, bottom up. The lowest three stand tidy; above them the wall
  // pivots on its left foot and leans away, gaps opening, the top bricks flying off.
  const W = 10, X0 = 15, PX = 15, PY = 29
  for (let i = 0; i < 8; i++) {
    const top = 37 - i * 4
    const pieces = i % 2 ? [[0, 5], [5, 10], [15, 5]] : [[0, 10], [10, 10]]
    for (const [x, w] of pieces) {
      if (i === 0 && x === 10) continue // the touched brick, drawn later
      let cx = X0 + x + w / 2, cy = top + 2, ang = 0
      if (i >= 3) {
        const k = i - 3
        ang = -0.28 - 0.07 * k
        const dx = cx - PX, dy = cy - PY - k * 0.9
        cx = PX + dx * Math.cos(ang) - dy * Math.sin(ang) - k * k * 0.35
        cy = PY + dx * Math.sin(ang) + dy * Math.cos(ang)
        if (x > 0) cx += 0.5 * k, cy += 0.3 * k // bricks drifting apart
      }
      brick(cx, cy, ang, w)
    }
  }

  // the touched brick, with the one pink pixel on its corner
  brick(30, 39, 0, 10)
  p.px(34, 37, 14), p.px(34, 38, 8)
  p.px(36, 35, 7), p.px(37, 36, 10), p.px(35, 34, 10)

  // crack running up from the dab and the gap opening above the third course
  p.line(33, 36, 32, 34, 0), p.line(32, 34, 34, 31, 0), p.line(34, 31, 33, 29, 0)
  p.poly([[20, 29], [35, 29], [35, 25]], 0)
  p.px(31, 33, 7)

  // flying bricks and their motion lines
  brick(5, 5, -0.9), brick(15, 2, -0.5, 5)
  p.line(8, 9, 11, 12, 7), p.line(10, 7, 12, 9, 6)
  p.line(19, 4, 22, 6, 7), p.line(18, 6, 20, 8, 6)
  p.line(1, 12, 2, 15, 6)

  // dust puffs at the foot of the tower
  p.ellipse(9, 39, 3, 2, 6), p.ellipse(6, 38, 2.5, 2, 7), p.px(11, 36, 7), p.px(3, 39, 6)
  p.px(13, 35, 6), p.px(4, 35, 6)

  // the brush, held by the artist (striped sleeve), dabbing the brick
  p.line(43, 29, 58, 18, 8), p.line(44, 29, 59, 18, 8), p.line(44, 30, 59, 19, 2)
  p.line(43, 28, 57, 18, 14)
  p.rect(39, 30, 4, 3, 6), p.hline(39, 30, 4, 7), p.px(42, 32, 5), p.px(41, 33, 5)
  p.poly([[39, 32], [37, 34], [35, 36], [36, 37], [38, 35], [40, 33]], 4)
  p.px(35, 36, 14), p.px(36, 37, 14)
  // hand and sleeve coming in from the top right
  p.rect(56, 15, 5, 5, 15), p.vline(60, 16, 4, 4), p.hline(56, 19, 5, 4)
  p.px(57, 17, 4)
  p.poly([[59, 11], [64, 7], [64, 16], [61, 17]], 7)
  p.line(60, 11, 64, 9, 12), p.line(61, 14, 64, 12, 12), p.line(62, 16, 64, 15, 12)

  // oops: a little alarm burst by the brush
  p.poly([[49, 31], [51, 27], [53, 31], [58, 29], [55, 33], [58, 37], [53, 36], [51, 40], [49, 36], [45, 37], [47, 33], [44, 30]], 10)
  p.poly([[50, 31], [52, 30], [54, 33], [52, 36], [49, 35], [48, 33]], 8)
  p.vline(51, 31, 3, 7), p.px(51, 35, 7)
}
