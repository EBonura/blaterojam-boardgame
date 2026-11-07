// The missing-texture cube, magenta and black checkers on every face, next to a crude stick-figure
// placeholder hero waving on a bare floor. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]
export default function draw({ px }) {
  const p = pen(px)
  // bare dark floor with a horizon line
  p.rect(0, 40, 64, 8, 1)
  p.hline(0, 40, 64, 5)
  p.dither(0, 44, 64, 4, 0)
  const X0 = 6, Y0 = 13, S = 26, D = 9 // front face corner, size, depth
  const C = 6.5 // checker size on the front
  // cast shadow on the floor, down and to the right
  p.poly([[X0 + 3, Y0 + S], [X0 + S + D + 4, Y0 + S - 2], [X0 + S + D + 6, Y0 + S + 2], [X0 + 6, Y0 + S + 2]], 0)
  // front face
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) p.px(X0 + x, Y0 + y, (Math.floor(x / C) + Math.floor(y / C)) % 2 ? 0 : 14)
  // top face, sheared up and to the right, lit: pink with dark grey squares
  for (let i = 1; i <= D; i++)
    for (let x = 0; x < S; x++) {
      const row = Math.floor(((i - 1) * 2) / D)
      p.px(X0 + x + i, Y0 - i, (Math.floor(x / C) + row) % 2 ? 1 : 14)
    }
  // side face in shadow: plum with black squares
  for (let i = 1; i <= D; i++)
    for (let y = 0; y < S; y++) {
      const col = Math.floor(((i - 1) * 2) / D)
      p.px(X0 + S - 1 + i, Y0 + y - i, (Math.floor(y / C) + col) % 2 ? 0 : 2)
    }
  // edges: bright along the lit top, dark along the shadow side
  p.hline(X0 + D + 1, Y0 - D - 1, S, 7)
  for (let i = 0; i <= D; i++) p.px(X0 + i, Y0 - i, 7), p.px(X0 + S + i, Y0 - i - 1, i === 0 ? 7 : 15)
  p.hline(X0, Y0, S, 15), p.px(X0, Y0, 7)
  p.vline(X0 - 1, Y0, S, 14), p.vline(X0, Y0, S, 15)
  for (let y = 0; y < S; y++) if ((Math.floor(y / C)) % 2) p.px(X0, Y0 + y, 13)
  p.vline(X0 + S + D, Y0 - D, S, 0)
  for (let i = 0; i <= D; i++) p.px(X0 + S + i - 1, Y0 + S - i, 0)
  p.hline(X0, Y0 + S, S, 0)
  // placeholder hero: a wobbly stick figure in programmer-art white, waving
  p.ring(51, 18, 3.5, 3.5, 7)
  p.px(50, 17, 7), p.px(53, 17, 7), p.line(49, 20, 53, 20, 7), p.px(48, 19, 7), p.px(54, 19, 7)
  p.line(51, 23, 50, 32, 7)
  p.line(50, 26, 45, 29, 7)
  p.line(51, 25, 56, 21, 7), p.line(56, 21, 58, 17, 7)
  p.line(50, 32, 46, 39, 7), p.line(50, 32, 55, 39, 7)
  p.hline(44, 39, 3, 7), p.hline(55, 39, 3, 7)
  // wave marks
  p.px(60, 15, 6), p.px(61, 17, 6), p.px(60, 19, 6)
  // shadow of the stick figure
  p.hline(46, 41, 12, 0)
}
