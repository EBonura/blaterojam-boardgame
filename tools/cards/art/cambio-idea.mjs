// The old design doc goes in the bin (well, near it), a brand new idea lights up. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const ball = (x, y) => {
    const s = [' 776 ', '77676', '67777', '77767', ' 676 ']
    s.forEach((row, j) => [...row].forEach((ch, i) => ch !== ' ' && px(x + i, y + j, +ch)))
  }
  // bin: open dark mouth, ribbed body
  rect(2, 11, 15, 3, 6)
  rect(3, 12, 13, 1, 0)
  rect(2, 11, 15, 1, 7)
  for (let y = 14; y < 22; y++) {
    const inset = (y - 14) >> 2
    rect(3 + inset, y, 13 - 2 * inset, 1, 5)
  }
  for (const x of [6, 9, 12]) rect(x, 14, 1, 7, 6)
  rect(3, 14, 13, 1, 0)
  // crumpled pages: one inside, one missed the bin, one on the way
  ball(7, 8)
  rect(7, 12, 5, 1, 0) // its bottom hidden in the mouth
  ball(17, 18), px(18, 19, 12), px(19, 20, 12)
  ball(3, 1), px(4, 2, 12), px(5, 3, 12)
  px(9, 3, 6), px(11, 5, 6), px(12, 7, 6)
  // the new idea
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (dx * dx + dy * dy <= 18) px(25 + dx, 7 + dy, 10)
  px(22, 5, 7), px(23, 4, 7), px(22, 6, 7)
  px(27, 9, 9), px(28, 8, 9), px(28, 6, 9)
  px(24, 9, 9), px(25, 8, 9), px(26, 9, 9) // filament
  rect(23, 12, 5, 1, 10)
  rect(23, 13, 5, 4, 6)
  rect(23, 14, 5, 1, 5), rect(23, 16, 5, 1, 5)
  rect(24, 17, 3, 1, 5)
  // rays
  for (const [x, y] of [[25, 0], [18, 7], [19, 7], [31, 7], [20, 2], [30, 2], [20, 12], [30, 12], [19, 1], [31, 1], [19, 13], [31, 13]]) px(x, y, 9)
}
