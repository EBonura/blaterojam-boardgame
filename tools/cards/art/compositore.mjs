// A composer in headphones playing a synth, notes floating up. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // notes
  rect(3, 6, 2, 2, 10), rect(5, 2, 1, 5, 10), px(6, 3, 10), px(7, 4, 10)
  rect(9, 8, 2, 2, 7), rect(14, 7, 2, 2, 7), rect(11, 4, 1, 5, 7), rect(16, 3, 1, 5, 7), rect(11, 3, 6, 1, 7)
  // synth on an X stand
  for (let i = 0; i < 5; i++) px(3 + i, 18 + i, 5), px(7 - i, 18 + i, 5), px(12 + i, 18 + i, 5), px(16 - i, 18 + i, 5)
  rect(0, 12, 20, 6, 5)
  rect(0, 12, 20, 1, 6)
  rect(1, 14, 18, 3, 7)
  for (const x of [2, 4, 8, 10, 12, 16]) rect(x, 14, 1, 2, 0)
  px(2, 13, 8), px(4, 13, 11), rect(7, 13, 4, 1, 12)
  // the composer, seated, facing the keys
  rect(22, 3, 6, 7, 15) // head
  rect(22, 2, 7, 2, 4) // hair
  rect(27, 4, 2, 6, 4)
  px(23, 6, 0)
  rect(21, 1, 8, 1, 8) // headphone band
  px(21, 2, 8), px(28, 2, 8)
  rect(26, 4, 3, 4, 8) // ear cup
  px(26, 5, 2)
  rect(22, 10, 7, 7, 13) // shirt
  rect(27, 10, 2, 7, 2)
  rect(17, 12, 6, 2, 13) // arm
  rect(16, 13, 2, 1, 15) // hand on the keys
  rect(19, 17, 9, 2, 5) // thighs
  rect(19, 19, 2, 3, 5)
  rect(18, 22, 4, 1, 4)
  rect(23, 19, 6, 1, 4) // stool
  rect(25, 20, 2, 3, 4)
  rect(17, 23, 13, 1, 1)
}
