// A graphics tablet lying flat, the stylus drawing a stroke on it. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // tablet top surface in slight perspective
  for (let y = 7; y < 20; y++) {
    const inset = Math.floor((19 - y) / 5)
    rect(1 + inset, y, 30 - 2 * inset, 1, 5)
  }
  rect(3, 7, 26, 1, 6) // far edge catching light
  rect(1, 20, 30, 2, 0) // front edge
  rect(1, 20, 30, 1, 13)
  rect(4, 22, 24, 1, 1) // shadow
  // active area
  for (let y = 9; y < 19; y++) {
    const inset = Math.floor((19 - y) / 5)
    rect(9 + inset, y, 19 - 2 * inset, 1, 0)
  }
  px(10, 9, 6), px(26, 9, 6), px(9, 18, 6), px(27, 18, 6) // corner marks
  // express keys
  for (const y of [9, 12, 15]) rect(4, y, 3, 2, 6)
  rect(4, 18, 3, 1, 12)
  // stroke being drawn
  for (const [x, y] of [[11, 17], [12, 16], [13, 15], [14, 15], [15, 16], [16, 16], [17, 15], [18, 14], [19, 14]]) px(x, y, 12)
  // stylus
  for (let i = 0; i < 12; i++) rect(20 + i, 13 - i, 2, 2, 6), px(20 + i, 14 - i, 13)
  for (let i = 3; i < 6; i++) rect(20 + i, 13 - i, 2, 2, 5) // rubber grip
  px(24, 10, 12) // side button
  px(19, 14, 7), px(20, 14, 6) // nib
  // its shadow on the tablet
  for (let i = 2; i < 6; i++) px(21 + i, 16 - i, 1)
}
