// One tiny brush touch and the whole tower comes down. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  const block = (x, y) => {
    rect(x, y, 6, 3, 9), rect(x, y + 2, 6, 1, 4), rect(x + 5, y, 1, 3, 4), px(x, y, 15)
  }
  // ground
  rect(1, 21, 30, 2, 5)
  rect(1, 21, 30, 1, 6)
  // the tower, leaning further left the higher it goes
  block(6, 18), block(12, 18)
  block(5, 15), block(11, 15)
  block(3, 12), block(9, 12)
  block(1, 9)
  // blocks already falling off
  block(7, 5), block(0, 2)
  px(14, 6, 7), px(15, 7, 7), px(14, 3, 7), px(7, 1, 7), px(8, 2, 7) // motion
  // dust at the base
  for (const [x, y] of [[3, 20], [4, 19], [2, 19]]) px(x, y, 6)
  // crack running up from the touched block
  px(15, 18, 0), px(14, 19, 0), px(15, 20, 0), px(13, 17, 0)
  // the brush: red handle, grey ferrule, bristles with a pink dab
  for (let i = 0; i < 8; i++) rect(24 + i, 15 - i, 2, 1, 8)
  for (let i = 0; i < 7; i++) px(25 + i, 15 - i, 2)
  rect(22, 15, 2, 2, 6), px(22, 15, 7)
  rect(20, 17, 2, 2, 15), px(19, 19, 15), px(20, 19, 14), px(19, 18, 14)
  px(18, 19, 14), px(17, 19, 14), px(17, 20, 14) // the tiny tweak
  px(19, 16, 7), px(18, 17, 10), px(20, 15, 10) // sparkle
}
