// An energy drink can fizzing over, lightning bolt on the label. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // fizz spraying out of the top
  for (const [x, y, c] of [[15, 0, 7], [12, 1, 12], [19, 1, 7], [10, 3, 7], [21, 2, 12], [14, 2, 7], [17, 1, 12], [23, 4, 7], [8, 2, 12], [24, 1, 7]]) px(x, y, c)
  // can body
  rect(10, 6, 12, 15, 2)
  rect(11, 5, 10, 1, 6)
  rect(10, 6, 12, 1, 6)
  rect(11, 21, 10, 1, 6)
  rect(11, 4, 10, 1, 7) // lid
  rect(14, 4, 3, 1, 5) // opening
  px(18, 3, 6), px(19, 3, 6) // tab
  rect(12, 7, 1, 14, 13) // highlight
  rect(19, 7, 2, 14, 1) // shadow side
  // lightning bolt
  for (const [x, y, w] of [[17, 8, 2], [16, 9, 2], [15, 10, 2], [14, 11, 5], [16, 12, 2], [15, 13, 2], [14, 14, 2], [13, 15, 2], [13, 16, 1]]) rect(x, y, w, 1, 10)
  px(17, 8, 7), px(14, 11, 7)
  // drips and a puddle
  px(21, 8, 12), px(21, 9, 12)
  rect(8, 22, 16, 1, 1)
  rect(22, 21, 4, 1, 12)
  // sparks around the can
  for (const [x, y] of [[6, 10], [25, 12], [7, 16], [26, 7]]) px(x, y, 10), px(x - 1, y, 9), px(x + 1, y, 9), px(x, y - 1, 9), px(x, y + 1, 9)
}
