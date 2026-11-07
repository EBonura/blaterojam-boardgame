// Audio mono: an old wooden radio with one small speaker and a lone sound wave. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // antenna
  for (let i = 0; i < 7; i++) px(22 + i, 7 - i, 6)
  px(29, 0, 7)
  // carry handle
  rect(10, 4, 10, 1, 4), px(9, 5, 4), px(20, 5, 4)
  // wooden case
  rect(4, 6, 22, 15, 4)
  rect(5, 7, 20, 1, 9)
  rect(4, 20, 22, 1, 2)
  rect(5, 21, 3, 1, 5), rect(22, 21, 3, 1, 5) // feet
  // grille
  rect(6, 9, 10, 9, 15)
  for (const y of [10, 12, 14, 16]) rect(7, y, 8, 1, 4)
  // tuning dial and knobs
  rect(18, 9, 6, 4, 7)
  rect(18, 12, 6, 1, 6)
  for (const x of [19, 21, 23]) px(x, 9, 5)
  rect(21, 9, 1, 3, 8) // needle
  rect(18, 15, 2, 2, 6), rect(22, 15, 2, 2, 6)
  px(18, 15, 7), px(22, 15, 7)
  // one lonely wave
  rect(1, 11, 1, 5, 12), px(2, 10, 12), px(2, 16, 12)
}
