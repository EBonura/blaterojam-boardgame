// A game designer sketching a platformer level on a whiteboard. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // whiteboard on legs
  rect(3, 17, 1, 6, 5)
  rect(17, 17, 1, 6, 5)
  rect(1, 2, 19, 15, 6)
  rect(2, 3, 17, 13, 7)
  rect(2, 15, 17, 1, 6)
  rect(1, 17, 19, 1, 5) // marker tray
  px(4, 16, 8), px(5, 16, 8), px(7, 16, 12), px(8, 16, 12)
  // the level sketch: ground, a floating platform with a coin, a spike pit, a goal flag
  rect(3, 12, 5, 2, 12)
  rect(13, 12, 5, 2, 12)
  rect(8, 8, 5, 1, 12)
  for (const [x, y] of [[8, 13], [9, 12], [10, 13], [11, 12], [12, 13]]) px(x, y, 8)
  rect(4, 10, 2, 2, 8) // the hero
  for (const [x, y] of [[6, 8], [7, 6], [9, 5], [13, 6], [14, 8]]) px(x, y, 13) // jump arc
  px(10, 6, 10) // coin
  rect(15, 5, 1, 7, 5) // flag pole
  rect(16, 5, 2, 2, 11)
  // the designer, facing the board, marker in hand
  rect(23, 2, 4, 1, 4) // hair
  rect(22, 3, 6, 2, 4)
  rect(26, 5, 2, 3, 4)
  rect(22, 5, 4, 4, 15) // face
  px(23, 6, 0)
  px(26, 6, 15) // ear
  rect(24, 9, 2, 1, 15) // neck
  rect(21, 10, 8, 8, 9) // shirt
  rect(27, 10, 2, 8, 4)
  rect(18, 11, 4, 2, 9) // arm
  rect(17, 10, 2, 2, 15) // hand
  px(16, 9, 8) // marker tip
  rect(22, 18, 2, 4, 5) // legs
  rect(25, 18, 2, 4, 5)
  rect(21, 22, 3, 1, 4)
  rect(25, 22, 3, 1, 4)
  rect(20, 23, 10, 1, 1) // ground shadow
}
