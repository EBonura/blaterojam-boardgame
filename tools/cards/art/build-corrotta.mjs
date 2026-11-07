// Corrupted build: the game on the monitor comes out sliced into shifted bands, colours swapped,
// a missing-texture checkerboard and stray garbage blocks; a sticky note on the bezel. 64x48, PICO-8 palette indexes.
import { pen } from './_pix.mjs'
export const size = [64, 48]

export default function draw({ px }) {
  const p = pen(px)

  // desk
  p.rect(0, 41, 64, 7, 4)
  p.hline(0, 41, 64, 9)
  p.rect(0, 44, 64, 4, 2)

  // monitor: grey bezel lit top-left, stand
  p.rect(3, 2, 58, 36, 5)
  p.rect(3, 2, 57, 35, 6)
  p.hline(3, 2, 57, 7), p.vline(3, 2, 35, 7)
  p.vline(60, 3, 35, 0), p.hline(4, 37, 57, 0)
  p.rect(28, 38, 8, 3, 5), p.rect(23, 40, 18, 2, 6), p.hline(23, 40, 18, 7)
  p.px(57, 34, 8) // power light

  // the clean game scene, as a function of screen position (screen is 52 x 30 at 6, 5)
  const scene = (x, y) => {
    if (y >= 24) return y === 24 ? 11 : (x + y) % 5 === 0 ? 4 : 3 // grass and dirt
    if (x >= 30 && x < 42 && y >= 15 && y < 17) return y === 15 ? 9 : 4 // floating platform
    if ((x - 10) ** 2 / 16 + (y - 5) ** 2 / 4 <= 1 || (x - 14) ** 2 / 9 + (y - 4) ** 2 / 4 <= 1) return 7 // cloud
    if ((x - 44) ** 2 + (y - 6) ** 2 <= 9) return 10 // sun
    if (x >= 20 && x < 24 && y >= 18 && y < 24) return y < 20 ? 15 : y < 22 ? 8 : 12 // hero
    if ((x - 35) ** 2 + (y - 12) ** 2 <= 1) return 10 // coin
    if (x >= 46 && x < 50 && y >= 19 && y < 24) return y === 19 ? 11 : 3 // bush
    return y < 9 ? 12 : y < 16 ? 12 : 13
  }
  // the corruption: each band of rows shifted sideways, some with their colours scrambled
  const shift = (y) => [0, 0, 7, 7, 0, -9, -9, -9, 0, 0, 0, 12, 12, 0, 0, 0, 0, -6, -6, 0, 0, 10, 10, 10, 0, 0, 0, -5, 0, 0][y] ?? 0
  const swap = { 12: 14, 13: 2, 7: 11, 10: 8, 3: 12, 11: 10, 4: 1, 15: 11, 8: 9, 9: 7 }
  for (let y = 0; y < 30; y++) for (let x = 0; x < 52; x++) {
    let c = scene((x - shift(y) + 52) % 52, y)
    if ((y >= 11 && y < 13) || (y >= 21 && y < 24)) c = swap[c] ?? c
    if (y === 17 || y === 18) { const h = (x * 37 + y * 101) % 11; c = [0, 7, 8, 11, 14, 12, 0, 6, 10, 0, 13][h] } // static
    p.px(6 + x, 5 + y, c)
  }
  // missing texture checkerboard
  for (let y = 0; y < 6; y++) for (let x = 0; x < 8; x++) p.px(40 + x, 25 + y, (Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? 0 : 14)
  // the hero smeared sideways
  for (let i = 0; i < 4; i++) p.vline(24 + i * 2, 23, 1, 8), p.px(25 + i * 2, 22, 15)
  // garbage blocks
  for (const [x, y, w, h, c] of [[8, 14, 3, 2, 8], [50, 9, 4, 1, 11], [14, 27, 5, 1, 14], [28, 7, 2, 3, 0], [54, 22, 2, 2, 10], [10, 31, 2, 1, 7], [36, 20, 6, 1, 0]])
    p.rect(x, y, w, h, c)
  // dead pixel column
  p.vline(33, 5, 30, 14)
  // screen glass shine
  p.px(7, 6, 7), p.px(8, 6, 7), p.px(7, 7, 7)

  // sticky note on the bezel with a sad face
  p.rect(50, 31, 8, 7, 10)
  p.hline(50, 31, 8, 7), p.vline(57, 32, 6, 9), p.hline(51, 37, 7, 9)
  p.px(52, 33, 0), p.px(55, 33, 0), p.hline(53, 35, 2, 0), p.px(52, 36, 0), p.px(55, 36, 0)
}
