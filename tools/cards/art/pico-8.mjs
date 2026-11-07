// A tiny fantasy-console handheld smiling on its screen, over its 16-colour palette. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // body with rounded corners: highlight top left, shadow bottom right
  rect(4, 1, 24, 17, 8)
  rect(3, 2, 26, 15, 8)
  rect(4, 1, 23, 1, 14), rect(3, 2, 1, 14, 14)
  rect(4, 17, 24, 1, 2), rect(28, 2, 1, 15, 2), px(27, 16, 2)
  // screen bezel and screen
  rect(9, 3, 14, 11, 5)
  rect(10, 4, 12, 9, 1)
  // a friendly face on the screen
  rect(12, 6, 2, 2, 7), rect(18, 6, 2, 2, 7)
  px(12, 6, 12), px(18, 6, 12)
  px(11, 9, 14), px(20, 9, 14)
  px(14, 9, 11), px(15, 10, 11), px(16, 10, 11), px(17, 9, 11)
  // d-pad
  rect(4, 8, 4, 2, 0), rect(5, 7, 2, 4, 0), px(5, 8, 5)
  // buttons
  rect(24, 9, 2, 2, 12), rect(26, 6, 2, 2, 11)
  px(24, 9, 7), px(26, 6, 7)
  // speaker slits
  for (const x of [11, 13, 15]) rect(x, 15, 1, 1, 2)
  // the 16-colour palette strip on light rails
  rect(0, 19, 32, 1, 6), rect(0, 23, 32, 1, 6)
  for (let c = 0; c < 16; c++) rect(c * 2, 20, 2, 3, c)
}
