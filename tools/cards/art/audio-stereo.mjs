// Stereo: two speakers facing each other, sound waves meeting in the middle. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const speaker = (x) => {
    rect(x, 3, 9, 19, 5)
    rect(x, 3, 9, 1, 6)
    rect(x, 3, 1, 19, 6)
    // tweeter
    rect(x + 3, 5, 3, 3, 0), px(x + 4, 6, 6)
    // woofer
    rect(x + 2, 11, 5, 7, 0), rect(x + 1, 12, 7, 5, 0)
    rect(x + 3, 12, 3, 5, 13), rect(x + 2, 13, 5, 3, 13)
    rect(x + 3, 13, 3, 3, 1), px(x + 4, 14, 6)
    rect(x + 1, 22, 7, 1, 1) // shadow
  }
  speaker(1)
  speaker(22)
  // waves travelling out of each speaker towards the middle
  const wave = (pts, c) => { for (const [x, y] of pts) px(x, y, c), px(31 - x, y, c) }
  wave([[10, 11], [11, 12], [11, 13], [11, 14], [11, 15], [10, 16]], 12)
  wave([[11, 8], [12, 9], [12, 10], [13, 11], [13, 12], [13, 13], [13, 14], [13, 15], [13, 16], [12, 17], [12, 18], [11, 19]], 7)
  // a note bouncing between them
  rect(14, 14, 2, 2, 10), rect(16, 9, 1, 6, 10), px(17, 10, 10)
  // L and R channel lights
  px(2, 20, 11), px(30, 20, 8)
}
