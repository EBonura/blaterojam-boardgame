// A graphic artist in a beret and striped shirt, sizing up the subject with a raised pencil. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // striped shirt
  rect(8, 13, 16, 11, 7)
  for (const y of [14, 16, 18, 20, 22]) rect(8, y, 16, 1, 12)
  rect(14, 12, 4, 1, 15) // neck
  // face
  rect(11, 4, 10, 8, 15)
  rect(11, 4, 1, 4, 4), rect(20, 4, 1, 4, 4) // hair at the sides
  px(13, 6, 0), px(13, 7, 0) // open eye
  rect(17, 7, 2, 1, 4) // squinting eye
  rect(13, 9, 6, 1, 0) // moustache
  px(12, 8, 0), px(19, 8, 0)
  // beret
  rect(10, 2, 12, 2, 8)
  rect(11, 1, 9, 1, 8)
  rect(10, 3, 12, 1, 2)
  px(15, 0, 8)
  // raised arm with pencil held at arm's length
  rect(22, 12, 3, 3, 7)
  rect(24, 9, 3, 3, 7)
  rect(24, 6, 3, 3, 15)
  rect(25, 1, 1, 5, 10)
  px(25, 0, 15)
  px(26, 2, 9)
  // palette
  rect(1, 16, 9, 5, 9)
  rect(2, 15, 6, 1, 9)
  rect(2, 21, 7, 1, 4)
  px(3, 16, 8), px(5, 16, 12), px(7, 17, 11), px(3, 18, 10), px(5, 19, 14)
  px(8, 19, 4) // thumb hole
  rect(9, 18, 2, 2, 15) // thumb
}
