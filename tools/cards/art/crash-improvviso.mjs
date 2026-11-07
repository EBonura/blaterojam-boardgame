// The blue screen: a sad face and lines of nothing useful. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // monitor and stand
  rect(1, 1, 30, 19, 5)
  rect(1, 1, 30, 1, 6)
  rect(2, 2, 28, 16, 12)
  rect(13, 20, 6, 2, 5), rect(10, 22, 12, 1, 6)
  px(28, 18, 8) // power light
  // sad face  :(
  rect(5, 4, 2, 2, 7), rect(5, 9, 2, 2, 7)
  rect(10, 5, 1, 5, 7), px(11, 4, 7), px(11, 10, 7), px(12, 3, 7), px(12, 11, 7)
  // lines of "text"
  rect(16, 5, 11, 1, 7), rect(16, 7, 8, 1, 7), rect(16, 9, 10, 1, 7)
  rect(5, 13, 14, 1, 7), rect(5, 15, 9, 1, 13)
  // the little QR code
  rect(21, 12, 5, 5, 7)
  rect(22, 13, 1, 1, 12), rect(24, 13, 1, 2, 12), rect(22, 15, 2, 1, 12)
}
