// A code editor: giant curly braces and a big text cursor waiting between them. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // window
  rect(1, 1, 30, 22, 13)
  rect(2, 5, 28, 17, 1)
  rect(3, 2, 7, 3, 1) // active tab
  rect(4, 3, 4, 1, 12)
  px(27, 2, 6), px(28, 3, 6), px(29, 2, 6), px(27, 4, 6), px(29, 4, 6) // close
  // gutter line numbers
  for (const y of [7, 9, 11, 13, 15, 17, 19]) px(3, y, 5)
  // opening brace
  const brace = [[7, 10, 3], [8, 9, 2], [9, 9, 2], [10, 9, 2], [11, 9, 2], [12, 8, 2], [13, 6, 3], [14, 8, 2], [15, 9, 2], [16, 9, 2], [17, 9, 2], [18, 9, 2], [19, 10, 3]]
  for (const [y, x, w] of brace) {
    rect(x, y, w, 1, 14)
    rect(32 - x - w, y, w, 1, 14) // mirrored closing brace
  }
  px(10, 7, 7), px(21, 7, 7)
  // cursor
  rect(15, 8, 2, 11, 7)
  rect(14, 8, 4, 1, 7), rect(14, 18, 4, 1, 7)
}
