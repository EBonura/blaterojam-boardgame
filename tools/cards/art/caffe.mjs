// 32x24 pixel art, PICO-8 palette indexes (see palette.mjs).
export default function draw({ rect, px }) {
  // steam
  for (const [x, y] of [[12, 1], [11, 2], [11, 3], [12, 4], [12, 5], [11, 6], [18, 2], [17, 3], [17, 4], [18, 5], [18, 6], [17, 7]]) px(x, y, 6)
  // saucer
  rect(5, 19, 22, 2, 6)
  rect(7, 21, 18, 1, 13)
  // cup body with shading
  rect(8, 9, 16, 10, 7)
  rect(20, 9, 4, 10, 6)
  rect(9, 18, 14, 1, 6)
  // coffee surface
  rect(9, 9, 14, 2, 4)
  rect(11, 9, 4, 1, 9)
  // rim
  rect(8, 8, 16, 1, 7)
  // handle
  rect(24, 11, 3, 1, 6)
  rect(26, 12, 1, 4, 6)
  rect(24, 16, 3, 1, 6)
  // heart doodle on the mug
  for (const [x, y] of [[12, 13], [14, 13], [11, 14], [12, 14], [13, 14], [14, 14], [15, 14], [12, 15], [13, 15], [14, 15], [13, 16]]) px(x, y, 8)
}
