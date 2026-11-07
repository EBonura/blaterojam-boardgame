// A programmer in a hoodie behind a laptop, face lit by the screen. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // hoodie
  rect(10, 1, 12, 11, 5)
  rect(11, 0, 10, 1, 5)
  rect(5, 11, 22, 9, 5)
  rect(7, 10, 18, 1, 5)
  rect(10, 1, 1, 10, 6), rect(5, 11, 1, 8, 6) // rim light on the hood and shoulder
  // face, lit blue-white from the screen
  rect(12, 3, 8, 8, 15)
  rect(12, 3, 8, 1, 4) // fringe
  px(12, 4, 4), px(19, 4, 4)
  rect(13, 6, 2, 2, 12), rect(17, 6, 2, 2, 12) // glasses reflecting code
  px(15, 6, 0), px(16, 6, 0)
  px(13, 6, 7), px(17, 6, 7)
  rect(15, 9, 2, 1, 4) // mouth
  // hoodie strings
  px(14, 11, 6), px(14, 12, 6), px(17, 11, 6), px(17, 12, 6)
  // laptop lid, seen from behind, with a </> sticker
  rect(8, 12, 16, 7, 6)
  rect(8, 12, 16, 1, 7)
  rect(8, 18, 16, 1, 13)
  px(12, 14, 12), px(11, 15, 12), px(12, 16, 12)
  px(17, 13, 12), px(16, 14, 12), px(16, 15, 12), px(15, 16, 12)
  px(19, 14, 12), px(20, 15, 12), px(19, 16, 12)
  // hands on the keys either side of the lid
  rect(6, 17, 2, 2, 15)
  rect(24, 17, 2, 2, 15)
  // desk
  rect(0, 19, 32, 5, 4)
  rect(0, 19, 32, 1, 9)
}
