// Swap desks: the art screen and the audio screen trade places. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const monitor = (x) => {
    rect(x, 7, 12, 9, 6), rect(x, 7, 12, 1, 7)
    rect(x + 1, 8, 10, 7, 0)
    rect(x + 5, 16, 2, 2, 5), rect(x + 3, 18, 6, 1, 6)
  }
  // left screen: a picture (graphics)
  monitor(1)
  rect(2, 8, 10, 7, 12)
  px(9, 9, 10), rect(8, 10, 3, 1, 10), px(9, 11, 10)
  for (let i = 0; i < 4; i++) rect(4 - i, 11 + i, 2 + 2 * i, 1, 3)
  rect(2, 14, 10, 1, 3)
  px(4, 11, 7)
  // right screen: a music note (audio)
  monitor(19)
  rect(20, 8, 10, 7, 2)
  rect(25, 9, 1, 5, 7), rect(26, 9, 2, 1, 7), px(27, 10, 7)
  rect(23, 13, 3, 2, 7)
  px(21, 10, 14), px(28, 13, 14)
  // swap arrows: over the top to the right, under the bottom to the left
  rect(7, 3, 18, 2, 10), rect(6, 4, 2, 3, 10)
  rect(24, 1, 1, 6, 10), rect(25, 2, 1, 4, 10), rect(26, 3, 1, 2, 10)
  rect(6, 21, 19, 2, 9), rect(23, 19, 2, 2, 9)
  rect(5, 19, 1, 6, 9), rect(4, 20, 1, 4, 9), rect(3, 21, 1, 2, 9)
}
