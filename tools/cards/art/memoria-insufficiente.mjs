// A RAM stick under a memory bar so full it bursts out of its frame. 32x24, PICO-8 palette indexes.
export default function draw({ rect, px }) {
  // memory bar
  rect(1, 2, 23, 7, 7)
  rect(2, 3, 21, 5, 0)
  rect(2, 3, 21, 5, 8)
  rect(2, 3, 21, 1, 14)
  // the fill punches through the end of the frame
  rect(23, 3, 4, 5, 8), rect(23, 3, 4, 1, 14)
  rect(27, 4, 2, 3, 8), px(29, 5, 8)
  px(24, 2, 7), px(25, 1, 7), px(24, 9, 7), px(26, 10, 7), px(30, 3, 8), px(30, 8, 8), px(31, 6, 2)
  // RAM stick
  rect(1, 12, 30, 8, 3)
  rect(1, 12, 30, 1, 11)
  for (const x of [3, 10, 17, 24]) rect(x, 14, 5, 4, 0), px(x, 14, 5), rect(x + 1, 17, 3, 1, 5)
  // gold contacts with the notch
  for (let x = 2; x < 30; x += 2) if (x !== 14) rect(x, 20, 1, 2, 10)
  rect(1, 20, 13, 1, 3), rect(16, 20, 15, 1, 3)
  // the stick is overheating
  px(6, 11, 9), px(13, 10, 9), px(21, 11, 9), px(27, 10, 9)
}
