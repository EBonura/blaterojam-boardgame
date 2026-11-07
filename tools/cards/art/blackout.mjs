// Someone pulled the plug: a spark, a socket, and two eyes in the dark. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // wall socket
  rect(20, 5, 9, 13, 6)
  rect(28, 5, 1, 13, 5), rect(20, 17, 9, 1, 5)
  rect(20, 5, 8, 1, 7)
  rect(22, 9, 1, 3, 0), rect(26, 9, 1, 3, 0), px(24, 14, 0)
  // plug, pulled out, with its cable
  rect(7, 8, 5, 9, 6)
  rect(7, 8, 1, 9, 7), rect(11, 8, 1, 9, 5)
  rect(12, 10, 3, 1, 6), rect(12, 14, 3, 1, 6)
  rect(3, 11, 4, 2, 5), rect(3, 13, 2, 9, 5), rect(3, 21, 6, 1, 5)
  // spark between plug and socket
  for (const [x, y] of [[16, 9], [17, 10], [16, 11], [17, 12], [18, 13], [17, 14], [18, 15]]) px(x, y, 10)
  px(17, 11, 7), px(17, 13, 7)
  px(19, 8, 9), px(15, 16, 9), px(19, 12, 9), px(15, 12, 9)
  // two scared eyes in the dark, and a sweat drop
  rect(2, 2, 2, 2, 7), rect(6, 2, 2, 2, 7)
  px(3, 3, 0), px(7, 3, 0)
  px(9, 1, 12), px(9, 2, 12)
}
