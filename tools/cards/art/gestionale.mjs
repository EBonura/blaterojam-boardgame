// Management sim: a tiny town on a grid, with fields, roads and a money bar with a rising graph. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // land
  rect(0, 5, 32, 19, 3)
  for (const [x, y] of [[1, 7], [9, 6], [27, 22], [13, 21], [24, 7], [29, 12], [2, 21]]) px(x, y, 11)
  // roads
  rect(0, 13, 32, 2, 5)
  rect(14, 5, 2, 19, 5)
  for (let x = 1; x < 32; x += 3) px(x, 13, 6)
  for (let y = 6; y < 24; y += 3) px(14, y, 6)
  // houses top left
  const house = (x, y, roof) => {
    rect(x, y, 5, 2, roof)
    rect(x + 1, y - 1, 3, 1, roof)
    rect(x, y + 2, 5, 3, 7)
    rect(x + 4, y + 2, 1, 3, 6)
    px(x + 2, y + 4, 4)
  }
  house(1, 7, 8)
  house(8, 7, 12)
  // tower blocks top right
  rect(18, 6, 5, 7, 6), rect(22, 6, 1, 7, 5)
  for (let y = 7; y < 12; y += 2) px(19, y, 10), px(21, y, 12)
  rect(25, 8, 5, 5, 13), rect(29, 8, 1, 5, 2)
  for (let y = 9; y < 12; y += 2) px(26, y, 10), px(28, y, 10)
  // crop field bottom left
  rect(1, 16, 12, 7, 4)
  for (let y = 16; y < 23; y += 2) rect(1, y, 12, 1, y % 4 === 0 ? 10 : 11)
  // trees and a factory bottom right
  for (const [x, y] of [[18, 17], [21, 20]]) rect(x, y, 2, 2, 11), px(x + 1, y + 1, 3), px(x, y + 2, 4)
  rect(24, 18, 7, 5, 6), rect(24, 22, 7, 1, 5)
  rect(28, 15, 2, 3, 5)
  px(29, 13, 6), px(30, 12, 6), px(30, 11, 7)
  rect(25, 19, 2, 2, 12)
  // HUD: coin, money digits and a rising bar graph
  rect(0, 0, 32, 5, 0)
  rect(1, 1, 3, 3, 10), px(2, 2, 9), px(1, 1, 9), px(3, 3, 9)
  for (let x = 6; x < 15; x += 2) rect(x, 1, 1, 3, 7)
  const bars = [1, 2, 2, 3, 4]
  bars.forEach((h, i) => rect(20 + i * 2, 4 - h, 1, h, 11))
  px(29, 0, 11), px(30, 1, 11), px(28, 1, 11)
}
